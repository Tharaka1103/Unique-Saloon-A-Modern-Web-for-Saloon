"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarRange, ClipboardList, TrendingUp, Scissors, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats, BookingTrendData, RevenueData, StatusDistribution } from "@/types";

interface FullDashboardData {
  stats: DashboardStats;
  bookingTrend: BookingTrendData[];
  revenueByWeek: RevenueData[];
  statusDistribution: StatusDistribution[];
}

export function DashboardClient() {
  const [stats, setStats] = useState<FullDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          toast.error("Failed to load dashboard stats");
        }
      } catch (err) {
        toast.error("Network error loading stats");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate max values for bar charts
  const maxTrend = Math.max(...stats.bookingTrend.map(t => t.count), 1);
  const maxRevenue = Math.max(...stats.revenueByWeek.map(r => r.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <CalendarRange className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.stats.todaysAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending or Confirmed for today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Action</CardTitle>
            <ClipboardList className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.stats.pendingConfirmations}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting manual confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rs. {stats.stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on Confirmed/Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
            <Scissors className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.stats.totalActiveServices}</div>
            <Link href="/admin/services" className="text-xs text-primary hover:underline mt-1 inline-flex items-center">
              Manage Services <ArrowRight className="ml-1 size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trend (Last 30 Days)</CardTitle>
            <CardDescription>Number of appointments per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-1 mt-4">
              {stats.bookingTrend.map((day, i) => (
                <div key={day.date} className="relative flex flex-col items-center flex-1 group h-full justify-end">
                  <div 
                    className="w-full bg-primary/40 rounded-t-sm group-hover:bg-primary transition-colors min-h-[4px]"
                    style={{ height: `${(day.count / maxTrend) * 100}%` }}
                  />
                  {/* Tooltip trigger */}
                  <div className="hidden group-hover:block absolute -top-8 bg-foreground text-background text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                    {day.count} appts<br/>{format(new Date(day.date), "MMM d")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 8 Weeks)</CardTitle>
            <CardDescription>Generated from Confirmed/Completed bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2 mt-4">
              {stats.revenueByWeek.map((week, i) => (
                <div key={week.week} className="relative flex flex-col items-center flex-1 group h-full justify-end">
                  <div 
                    className="w-full bg-green-500/40 rounded-t-sm group-hover:bg-green-500 transition-colors min-h-[4px]"
                    style={{ height: `${(week.revenue / maxRevenue) * 100}%` }}
                  />
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute -top-8 bg-foreground text-background text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                    Rs. {week.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1 border-t pt-2">
              <span>8 weeks ago</span>
              <span>This week</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
