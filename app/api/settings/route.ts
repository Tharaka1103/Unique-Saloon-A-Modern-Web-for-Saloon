import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Settings, { seedDefaultSettings } from "@/models/Settings";
import { settingsUpdateSchema } from "@/lib/validators";
import type { ISettings, ApiResponse } from "@/types";

/**
 * GET /api/settings
 * Returns the full settings object. Seeds defaults on first call.
 * Used by: Home page, Booking page, Availability API, Admin settings.
 */
export async function GET(): Promise<NextResponse<ApiResponse<ISettings>>> {
  try {
    await connectToDatabase();

    let settings = await Settings.findOne().lean<ISettings>();

    if (!settings) {
      settings = await seedDefaultSettings();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Accepts a partial settings object and deep-merges with existing settings.
 * Validates input with Zod before updating.
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ISettings>>> {
  try {
    await connectToDatabase();

    const body: unknown = await request.json();

    const parsed = settingsUpdateSchema.safeParse(body);
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

    let existing = await Settings.findOne();
    if (!existing) {
      await seedDefaultSettings();
      existing = await Settings.findOne();
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Settings could not be initialized" },
        { status: 500 }
      );
    }

    // Deep merge: update only provided fields
    const updateData = parsed.data;

    if (updateData.businessHours) {
      existing.businessHours = {
        ...existing.businessHours,
        ...updateData.businessHours,
      };
    }

    if (updateData.slotDurationMinutes !== undefined) {
      existing.slotDurationMinutes = updateData.slotDurationMinutes;
    }
    if (updateData.bufferBetweenSlots !== undefined) {
      existing.bufferBetweenSlots = updateData.bufferBetweenSlots;
    }
    if (updateData.maxAdvanceBookingDays !== undefined) {
      existing.maxAdvanceBookingDays = updateData.maxAdvanceBookingDays;
    }
    if (updateData.minAdvanceBookingHours !== undefined) {
      existing.minAdvanceBookingHours = updateData.minAdvanceBookingHours;
    }
    if (updateData.maxBookingsPerSlot !== undefined) {
      existing.maxBookingsPerSlot = updateData.maxBookingsPerSlot;
    }

    if (updateData.holidayDates) {
      existing.holidayDates = updateData.holidayDates;
    }

    if (updateData.bookingRules) {
      existing.bookingRules = {
        ...existing.bookingRules,
        ...updateData.bookingRules,
      };
    }

    if (updateData.notifications) {
      existing.notifications = {
        ...existing.notifications,
        ...updateData.notifications,
      };
    }

    if (updateData.display) {
      existing.display = {
        ...existing.display,
        ...updateData.display,
      };
    }

    if (updateData.serviceCategories) {
      existing.serviceCategories = updateData.serviceCategories;
    }

    if (updateData.maintenanceMode !== undefined) {
      existing.maintenanceMode = updateData.maintenanceMode;
    }
    if (updateData.maintenanceMessage !== undefined) {
      existing.maintenanceMessage = updateData.maintenanceMessage;
    }

    existing.lastUpdatedBy = "admin";

    await existing.save();

    const updated = await Settings.findById(existing._id).lean<ISettings>();

    return NextResponse.json({
      success: true,
      data: updated as ISettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
