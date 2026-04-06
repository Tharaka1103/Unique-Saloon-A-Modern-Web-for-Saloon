"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Scissors, User, Loader2, FileText, Smartphone, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BookingState } from "../BookingMultiStep";

interface BookingSummaryProps {
  state: BookingState;
  onBack: () => void;
  onSuccess: (result: { reference: string; status: string; message?: string }) => void;
}

export function BookingSummary({ state, onBack, onSuccess }: BookingSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorPrompt(null);
    try {
      const payload = {
        serviceId: state.service?._id,
        date: state.date ? format(state.date, "yyyy-MM-dd") : "",
        timeSlot: state.timeSlot,
        customerName: state.customerDetails.customerName,
        customerPhone: state.customerDetails.customerPhone,
        customerEmail: state.customerDetails.customerEmail || undefined,
        notes: state.customerDetails.notes || undefined,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess({
          reference: data.data.bookingReference,
          status: data.data.status,
          message: data.message,
        });
      } else {
        setErrorPrompt(data.error || "Failed to create booking.");
        toast.error("Booking Error", { description: data.error });
      }
    } catch (err) {
      setErrorPrompt("A network error occurred while submitting your booking.");
      toast.error("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime12h = (timeStr?: string | null) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  return (
    <>
      <div className="p-6 border-b border-border/50 bg-muted/20">
        <h2 className="text-xl font-semibold tracking-tight">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please verify your appointment details below before finishing.
        </p>
      </div>

      <CardContent className="p-6 lg:p-8 space-y-8">
        {errorPrompt && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="text-sm font-medium">{errorPrompt}</p>
          </div>
        )}

        {/* Studio & Service Area */}
        <div className="grid sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium border-b border-primary/10 pb-2">
              <CalendarIcon className="size-4" /> Date & Time
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                {state.date ? format(state.date, "EEEE, MMMM do, yyyy") : ""}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Clock className="size-4" />
                {formatTime12h(state.timeSlot)} — {formatTime12h(state.endTime)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium border-b border-primary/10 pb-2">
              <Scissors className="size-4" /> Service
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                {state.service?.name}
              </p>
              <p className="text-muted-foreground">
                {state.service?.duration} mins
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details Summary */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2 px-2">
            <User className="size-5 text-muted-foreground" />
            Your Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-border bg-card">
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-3">
                <User className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium">{state.customerDetails.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium">{state.customerDetails.customerPhone}</p>
                </div>
              </div>
              {state.customerDetails.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-wrap break-all">{state.customerDetails.customerEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {state.customerDetails.notes && (
              <>
                <Separator className="sm:hidden" />
                <div className="flex items-start gap-3 sm:border-l sm:pl-6">
                  <FileText className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requests</p>
                    <p className="text-sm italic text-muted-foreground">"{state.customerDetails.notes}"</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-6 py-4 flex items-center justify-between">
            <span className="font-medium text-foreground">Estimated Total</span>
            <span className="text-xl font-bold">Rs. {state.service?.price.toLocaleString()}</span>
          </div>
          <p className="px-6 py-3 text-xs text-muted-foreground text-center bg-card">
            Payment is not required now. You will pay at the studio after your appointment.
          </p>
        </div>

      </CardContent>

      <CardFooter className="p-6 bg-muted/20 border-t flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="w-full sm:w-auto">
          Edit Details
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="w-full sm:w-auto min-w-[200px] gap-2 font-semibold shadow-md active:scale-95 transition-transform"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Confirming...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" /> Confirm Booking
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );
}
