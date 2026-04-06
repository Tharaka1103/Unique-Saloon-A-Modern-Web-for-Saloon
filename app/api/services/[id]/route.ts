import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Service from "@/models/Service";
import { serviceFormSchema } from "@/lib/validators";
import type { IService, ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/services/[id]
 * Updates an existing service (admin only).
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse<IService>>> {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    const parsed = serviceFormSchema.safeParse(body);
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

    const updated = await Service.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean<IService>();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Service updated successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update service";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 * Soft-deletes a service by setting isActive to false.
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
        { success: false, error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).lean<IService>();

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      message: "Service has been deactivated",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete service";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
