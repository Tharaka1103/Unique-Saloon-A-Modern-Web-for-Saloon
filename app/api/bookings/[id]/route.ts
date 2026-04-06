import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { bookingStatusUpdateSchema } from "@/lib/validators";
import type { IBooking, ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/bookings/[id]
 * Updates a booking's status and optionally adds admin notes or cancel reason.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse<IBooking>>> {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();
    const parsed = bookingStatusUpdateSchema.safeParse(body);

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

    const { status, adminNotes, cancelReason } = parsed.data;

    const updateData: Record<string, unknown> = { status };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (status === "Cancelled") {
      updateData.cancelledAt = new Date();
      if (cancelReason) {
        updateData.cancelReason = cancelReason;
      }
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean<IBooking>();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update booking";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * Soft-deletes a booking by setting status to Cancelled.
 * (In practice, we cancel rather than hard-delete for audit trail.)
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    booking.status = "Cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = "Deleted by admin";
    await booking.save();

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      message: "Booking has been cancelled",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete booking";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
