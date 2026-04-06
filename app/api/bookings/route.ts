import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking, { generateBookingReference } from "@/models/Booking";
import Service from "@/models/Service";
import Settings, { seedDefaultSettings } from "@/models/Settings";
import { isSlotAvailable } from "@/lib/slot-generator";
import { calculateEndTime } from "@/lib/timezone";
import { bookingFormSchema } from "@/lib/validators";
import type { IBooking, ISettings, IService, ApiResponse, BookingWithService } from "@/types";

/**
 * POST /api/bookings
 * Creates a new booking from the public booking form.
 * Validates input, checks maintenance mode, enforces booking rules,
 * re-verifies slot availability, and generates a unique reference.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ bookingReference: string; status: string }>>> {
  try {
    await connectToDatabase();

    const body: unknown = await request.json();

    // Step 1: Validate input with Zod
    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      stylistPreference,
      date,
      timeSlot,
      notes,
    } = parsed.data;

    // Step 2: Check maintenance mode
    let settings = await Settings.findOne().lean<ISettings>();
    if (!settings) {
      settings = await seedDefaultSettings();
    }

    if (settings.maintenanceMode) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking is currently unavailable. We are performing maintenance.",
        },
        { status: 503 }
      );
    }

    // Step 3: Fetch booking rules
    const { bookingRules } = settings;

    // Step 4: Check max bookings per customer per day
    const dateStart = new Date(`${date}T00:00:00+05:30`);
    const dateEnd = new Date(`${date}T23:59:59+05:30`);

    const customerBookingsToday = await Booking.countDocuments({
      customerPhone,
      date: { $gte: dateStart, $lte: dateEnd },
      status: { $nin: ["Cancelled"] },
    });

    if (customerBookingsToday >= bookingRules.maxBookingsPerCustomerPerDay) {
      return NextResponse.json(
        {
          success: false,
          error: `You can only book up to ${bookingRules.maxBookingsPerCustomerPerDay} appointment(s) per day.`,
        },
        { status: 409 }
      );
    }

    // Fetch service to get duration and price
    const service = await Service.findById(serviceId).lean<IService>();
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Selected service not found" },
        { status: 404 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        { success: false, error: "Selected service is currently unavailable" },
        { status: 400 }
      );
    }

    // Step 5: Re-verify slot availability (prevent race conditions)
    const slotIsAvailable = await isSlotAvailable(date, timeSlot, serviceId);
    if (!slotIsAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "This time slot is no longer available. Please select a different time.",
        },
        { status: 409 }
      );
    }

    // Step 6: Generate booking reference
    const bookingReference = await generateBookingReference();

    // Step 7: Determine status based on confirmation mode
    const status =
      bookingRules.bookingConfirmationMode === "auto" ? "Confirmed" : "Pending";

    // Calculate end time
    const endTime = calculateEndTime(timeSlot, service.duration);

    // Step 8: Create the booking
    const booking = await Booking.create({
      bookingReference,
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      stylistPreference: stylistPreference || "No Preference",
      date: new Date(`${date}T00:00:00+05:30`),
      timeSlot,
      endTime,
      status,
      totalAmount: service.price,
      notes: notes || "",
      adminNotes: "",
      notificationSent: false,
    });

    // Step 9: Return success
    return NextResponse.json(
      {
        success: true,
        data: {
          bookingReference: booking.bookingReference,
          status: booking.status,
        },
        message:
          status === "Confirmed"
            ? "Your appointment has been confirmed!"
            : "Your booking request has been submitted and is pending confirmation.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "11000"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A duplicate booking was detected. Please try again.",
        },
        { status: 409 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 * Returns bookings for admin. Supports filtering by status, date range,
 * and search by name/phone/reference.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ bookings: BookingWithService[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>>> {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build query filter
    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.$gte = new Date(`${startDate}T00:00:00+05:30`);
      }
      if (endDate) {
        dateFilter.$lte = new Date(`${endDate}T23:59:59+05:30`);
      }
      filter.date = dateFilter;
    }

    if (search) {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { customerName: { $regex: sanitizedSearch, $options: "i" } },
        { customerPhone: { $regex: sanitizedSearch, $options: "i" } },
        { bookingReference: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate<{ serviceId: IService }>("serviceId", "name category duration price")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean<BookingWithService[]>(),
      Booking.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: { 
        bookings, 
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch bookings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
