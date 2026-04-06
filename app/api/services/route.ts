import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Service from "@/models/Service";
import { serviceFormSchema } from "@/lib/validators";
import type { IService, ApiResponse } from "@/types";

/**
 * GET /api/services
 * Returns services for both public and admin use.
 * Public: Only active services, sorted by displayOrder.
 * Admin: All services with ?admin=true query param.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IService[]>>> {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {};

    if (!isAdmin) {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    const services = await Service.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean<IService[]>();

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch services";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Creates a new service (admin only).
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IService>>> {
  try {
    await connectToDatabase();

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

    const service = await Service.create(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: service.toObject() as IService,
        message: "Service created successfully",
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
          error: "A service with this name already exists",
        },
        { status: 409 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create service";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
