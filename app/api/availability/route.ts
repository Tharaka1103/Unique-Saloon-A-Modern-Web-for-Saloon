import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateAvailableSlots } from "@/lib/slot-generator";
import { availabilityQuerySchema } from "@/lib/validators";
import type { AvailabilityResponse, ApiResponse } from "@/types";

/**
 * GET /api/availability?date=YYYY-MM-DD&serviceId=xxx
 * Returns available time slots for a given date and service.
 * Implements the full slot generation algorithm.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AvailabilityResponse>>> {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "";
    const serviceId = searchParams.get("serviceId") ?? "";

    const parsed = availabilityQuerySchema.safeParse({ date, serviceId });
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
          error: "Invalid query parameters",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const availability = await generateAvailableSlots({
      date: parsed.data.date,
      serviceId: parsed.data.serviceId,
    });

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check availability";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
