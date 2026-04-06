"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Download, Calendar, Clock, Scissors, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import type { BookingState } from "../BookingMultiStep";

interface BookingSuccessProps {
  result: { reference: string; status: string; message?: string };
  state: BookingState;
  reset: () => void;
}

export function BookingSuccess({ result, state, reset }: BookingSuccessProps) {
  const isPending = result.status === "Pending";
  const [os, setOs] = useState<"ios" | "android" | "desktop" | null>(null);

  useEffect(() => {
    // Detect OS for screenshot instructions
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setOs("ios");
    } else if (/android/i.test(ua)) {
      setOs("android");
    } else {
      setOs("android");
    }
  }, []);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(result.reference);
      toast.success("Reference code copied!");
    } catch {
      toast.error("Failed to copy reference");
    }
  };

  return (
    <div className="text-center space-y-8 py-8 animate-in zoom-in-95 duration-500 max-w-lg mx-auto">
      <div className="space-y-4">
        <div className="mx-auto size-20 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
          <CheckCircle2 className="size-10 text-green-600 dark:text-green-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isPending ? "Booking Sent" : "Booking Confirmed"}
          </h2>
          <p className="text-muted-foreground mt-2 px-6">
            {result.message ||
              (isPending
                ? "Your request has been received. Our team will review and confirm your slot shortly."
                : "Your appointment has been successfully scheduled. See you soon!")}
          </p>
        </div>
      </div>

      {/* VISUAL TICKET WRAPPER (Strictly Visual - Canvas does the download payload naturally) */}
      <div className="px-4">
        <div className="relative bg-white text-zinc-900 border border-zinc-200 shadow-md rounded-2xl overflow-hidden mx-auto text-left" style={{ backgroundColor: "#ffffff", color: "#18181b" }}>
          {/* Top Ticket Header */}
          <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between text-white relative overflow-hidden" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
            <div className="relative z-10">
              <h3 className="font-bold tracking-widest uppercase opacity-90 text-[10px]">Unique Hair Studio</h3>
              <p className="font-serif text-2xl mt-1 tracking-tight">Appointment</p>
            </div>
            <Scissors className="size-12 opacity-10 absolute -right-2 top-2 -rotate-12" strokeWidth={1.5} />
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6 relative bg-white" style={{ backgroundColor: "#ffffff" }}>
            <div className="absolute -left-3 -top-3 size-6 bg-[#f8fafc] rounded-full border border-zinc-200 shadow-inner hidden sm:block"></div>
            <div className="absolute -right-3 -top-3 size-6 bg-[#f8fafc] rounded-full border border-zinc-200 shadow-inner hidden sm:block"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Date</p>
                <p className="font-medium mt-1 text-zinc-900 flex items-center gap-1.5"><Calendar className="size-4" />{state.date ? format(state.date, "MMM do, yyyy") : "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Time</p>
                <p className="font-medium mt-1 text-zinc-900 flex items-center gap-1.5"><Clock className="size-4" />{state.timeSlot || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Service</p>
              <div className="flex justify-between items-baseline mt-1 font-medium text-zinc-900">
                <span className="text-lg">{state.service?.name}</span>
                <span className="text-sm border border-zinc-200 rounded-full px-2 py-0.5 bg-zinc-100 text-zinc-700">{state.service?.duration} mins</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Guest</p>
              <p className="font-medium mt-1 text-base text-zinc-900">{state.customerDetails.customerName}</p>
            </div>

            <div className="border-t-2 border-dashed border-zinc-300 w-full relative"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Reference Code</p>
                <p className="font-mono text-xl font-bold tracking-widest mt-1 text-zinc-900">{result.reference}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider flex items-center justify-end gap-1"><MapPin className="size-3" /> Location</p>
                <p className="font-medium mt-1 text-xs text-zinc-500">Main Branch</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 space-y-4">
        <div className="flex justify-center">
          <Button onClick={copyRef} variant="secondary" className="w-full sm:w-auto font-medium shadow-sm hover:shadow transition-all">
            <Copy className="size-4 mr-2" />
            Copy Reference Code
          </Button>
        </div>

        {/* Dynamic OS-based Screenshot Helper */}
        {os && (
          <div className="py-2 pt-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            {os === "desktop" ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full">
                📸 Tip: Use Snipping Tool or PrintScreen to save
              </p>
            ) : (
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                {/* CSS Phone Graphic */}
                <div className="relative w-7 h-14 border-2 border-zinc-800 dark:border-zinc-400 rounded-md bg-white dark:bg-zinc-950 flex justify-center pt-1 shrink-0">
                  {/* Notch */}
                  <div className="w-2.5 h-1 bg-zinc-800 dark:bg-zinc-400 rounded-b-sm"></div>

                  {/* Hardware Buttons - Highlighted based on OS */}
                  {os === "ios" ? (
                    <>
                      {/* iOS: Power (Right), Vol Up (Left Top) */}
                      <div className="absolute -left-1 top-2 w-[2px] h-2 bg-blue-500 rounded-l shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse"></div>
                      <div className="absolute -left-[3px] top-[18px] w-0.5 h-2 bg-zinc-300 rounded-l"></div>
                      <div className="absolute -right-1 top-3 w-[2px] h-3 bg-blue-500 rounded-r shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      {/* Android: Power + Vol Down (usually both on Right) */}
                      <div className="absolute -right-1 top-2 w-[2px] h-2 bg-zinc-300 rounded-r"></div>
                      <div className="absolute -right-1 top-5 w-[2px] h-2 bg-green-500 rounded-r shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse"></div>
                      <div className="absolute -right-1 top-[30px] w-[2px] h-3 bg-green-500 rounded-r shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    </>
                  )}
                </div>

                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Save your ticket!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                    {os === "ios"
                      ? "Press Power + Volume Up simultaneously to screenshot."
                      : "Press Power + Volume Down simultaneously to screenshot."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t mt-2 border-border">
          <Button onClick={reset} variant="ghost" className="w-full sm:w-auto text-muted-foreground mt-2">
            Start a new booking
          </Button>
        </div>
      </div>
    </div>
  );
}
