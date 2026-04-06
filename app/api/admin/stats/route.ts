import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { todayInColombo } from "@/lib/timezone";
import type {
  DashboardStats,
  BookingTrendData,
  RevenueData,
  StatusDistribution,
  ApiResponse,
} from "@/types";

interface StatsResponse {
  stats: DashboardStats;
  bookingTrend: BookingTrendData[];
  revenueByWeek: RevenueData[];
  statusDistribution: StatusDistribution[];
}

/**
 * GET /api/admin/stats
 * Returns aggregated statistics for the admin dashboard.
 * Includes: today's appointments, monthly revenue, booking trends,
 * revenue by week, and status distribution.
 */
export async function GET(): Promise<NextResponse<ApiResponse<StatsResponse>>> {
  try {
    await connectToDatabase();

    const today = todayInColombo();
    const todayStart = new Date(`${today}T00:00:00+05:30`);
    const todayEnd = new Date(`${today}T23:59:59+05:30`);

    // Current month range
    const monthStart = new Date(`${today.substring(0, 7)}-01T00:00:00+05:30`);
    const monthEnd = todayEnd;

    // Last 30 days range
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Last 8 weeks range
    const eightWeeksAgo = new Date(todayStart);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    // Run all stats queries in parallel
    const [
      todaysAppointments,
      monthlyRevenueResult,
      pendingConfirmations,
      totalActiveServices,
      bookingTrendResult,
      revenueByWeekResult,
      statusDistributionResult,
    ] = await Promise.all([
      // Today's appointments (not cancelled)
      Booking.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $nin: ["Cancelled"] },
      }),

      // Monthly revenue (Confirmed + Completed)
      Booking.aggregate<{ _id: null; total: number }>([
        {
          $match: {
            date: { $gte: monthStart, $lte: monthEnd },
            status: { $in: ["Confirmed", "Completed"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Pending confirmations
      Booking.countDocuments({ status: "Pending" }),

      // Total active services
      Service.countDocuments({ isActive: true }),

      // Booking trend: bookings per day for last 30 days
      Booking.aggregate<{ _id: string; count: number }>([
        {
          $match: {
            date: { $gte: thirtyDaysAgo, $lte: todayEnd },
            status: { $nin: ["Cancelled"] },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Revenue per week for last 8 weeks
      Booking.aggregate<{ _id: string; revenue: number }>([
        {
          $match: {
            date: { $gte: eightWeeksAgo, $lte: todayEnd },
            status: { $in: ["Confirmed", "Completed"] },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-W%V", date: "$date" },
            },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Status distribution
      Booking.aggregate<{ _id: string; count: number }>([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats: DashboardStats = {
      todaysAppointments,
      monthlyRevenue: monthlyRevenueResult[0]?.total ?? 0,
      pendingConfirmations,
      totalActiveServices,
    };

    const bookingTrend: BookingTrendData[] = bookingTrendResult.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    const revenueByWeek: RevenueData[] = revenueByWeekResult.map((item) => ({
      week: item._id,
      revenue: item.revenue,
    }));

    const statusDistribution: StatusDistribution[] =
      statusDistributionResult.map((item) => ({
        status: item._id as StatusDistribution["status"],
        count: item.count,
      }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        bookingTrend,
        revenueByWeek,
        statusDistribution,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch dashboard stats";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
