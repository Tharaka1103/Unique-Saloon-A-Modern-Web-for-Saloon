"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarRange, Search, MoreHorizontal, Loader2, ArrowLeft, ArrowRight, User, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateAdmin } from "@/lib/timezone";
import type { IBooking, BookingWithService, IService } from "@/types";

export function BookingsClient() {
  const [data, setData] = useState<{
    bookings: BookingWithService[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // local input before enter

  // Dialog state
  const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter !== "all") query.append("status", statusFilter);
      if (searchQuery) query.append("search", searchQuery);

      const res = await fetch(`/api/bookings?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error("Failed to load appointments");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Booking marked as ${newStatus}`);
        fetchBookings();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
      setSelectedBooking(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Pending": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Completed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage ongoing and past bookings</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 max-w-sm w-full">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search phone or reference..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                    setPage(1);
                  }
                }}
                className="h-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-4 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : !data || data.bookings.length === 0 ? (
            <div className="text-center py-12 px-4 text-muted-foreground">
              <CalendarRange className="size-10 mx-auto mb-3 opacity-20" />
              No appointments found matching your criteria.
            </div>
          ) : (
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bookings.map((booking) => {
                    const svc = booking.serviceId as IService | null;
                    const bId = booking._id as unknown as string;
                    return (
                      <TableRow key={bId}>
                        <TableCell className="font-mono text-xs">{booking.bookingReference}</TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[150px]">{svc ? svc.name : 'Unknown Service'}</div>
                          <div className="text-xs text-muted-foreground">Rs. {svc?.price.toLocaleString() || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap">{format(new Date(booking.date as unknown as string), "MMM d, yyyy")}</div>
                          <div className="text-xs text-muted-foreground">{booking.timeSlot} — {booking.endTime}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {booking.status === "Pending" && (
                                <DropdownMenuItem onClick={() => updateStatus(bId, "Confirmed")}>
                                  Approve Booking
                                </DropdownMenuItem>
                              )}
                              {booking.status === "Confirmed" && (
                                <DropdownMenuItem onClick={() => updateStatus(bId, "Completed")}>
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              {booking.status !== "Cancelled" && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => updateStatus(bId, "Cancelled")}
                                >
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 py-4 px-6 border-t border-border mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ArrowLeft className="size-4 mr-1" /> Prev
                  </Button>
                  <span className="text-xs font-medium px-2">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail View Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
                <span className="font-mono font-bold">{selectedBooking.bookingReference}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-medium flex items-center gap-1.5"><User className="size-3.5 text-muted-foreground" />{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                  <p className="font-medium flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" />{selectedBooking.customerPhone}</p>
                </div>
              </div>

              <div className="border border-border rounded-lg p-3 space-y-2 bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Service</p>
                <div className="flex justify-between font-medium">
                  <span>{(selectedBooking.serviceId as IService)?.name}</span>
                  <span>Rs. {(selectedBooking.serviceId as IService)?.price.toLocaleString()}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.date as unknown as string), "EEEE, MMM do, yyyy")} <br />
                  {selectedBooking.timeSlot} — {selectedBooking.endTime}
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes / Requests</p>
                  <p className="text-sm bg-muted/20 p-2 rounded border border-border italic text-muted-foreground">"{selectedBooking.notes}"</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center pt-2 border-t mt-4">
                Created: {formatDateAdmin(new Date(selectedBooking.createdAt as unknown as string))}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
