"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, ArrowLeft, ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";
import type { BookingState } from "../BookingMultiStep";

interface DateTimeSelectionProps {
  state: BookingState;
  updateState: (update: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DateTimeSelection({ state, updateState, onNext, onBack }: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(state.date || undefined);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch slots whenever the selected date or service changes
  useEffect(() => {
    if (!selectedDate || !state.service) return;

    async function fetchAvailability() {
      if (!selectedDate) return;
      setIsLoadingSlots(true);
      setMessage(null);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(`/api/availability?date=${dateStr}&serviceId=${state.service?._id}`);
        const data = await res.json();
        
        if (data.success) {
          setSlots(data.data.slots);
          if (data.data.message) {
             setMessage(data.data.message);
          } else if (data.data.slots.length === 0) {
             setMessage("No available slots for this date.");
          }
        } else {
          setSlots([]);
          setMessage(data.error || "Failed to load availability.");
        }
      } catch (err) {
        setSlots([]);
        setMessage("Network error. Please try again.");
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchAvailability();
  }, [selectedDate, state.service]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    updateState({ date, timeSlot: null, endTime: null }); // explicitly reset selected time when date changes
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    updateState({ timeSlot: slot.time, endTime: slot.endTime });
  };

  const formatTimeBlock = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  // Only allow future dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <div className="p-6 border-b border-border/50 bg-muted/20">
        <h2 className="text-xl font-semibold tracking-tight">Select Date & Time</h2>
        <p className="text-sm text-muted-foreground mt-1">
          When would you like to come in for your <strong className="font-medium text-foreground">{state.service?.name}</strong>?
        </p>
      </div>

      <CardContent className="p-6 max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Calendar Picker */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center border rounded-2xl p-2 bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < today}
              className="rounded-xl pointer-events-auto"
            />
          </div>

          {/* Slots List */}
          <div className="flex-1 w-full min-w-0">
            {/* Header for slots side */}
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="size-5 text-primary" />
              <h3 className="font-medium text-lg">
                {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Select a date to see times"}
              </h3>
            </div>

            {!selectedDate ? (
              <div className="h-[250px] border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-sm bg-muted/20">
                Please select a date from the calendar.
              </div>
            ) : isLoadingSlots ? (
              <div className="h-[250px] border rounded-xl flex flex-col gap-3 items-center justify-center text-muted-foreground bg-muted/10">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span className="text-sm animate-pulse">Checking studio availability...</span>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {message && (
                  <div className="mb-4 p-4 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-sm">
                    {message}
                  </div>
                )}
                
                {slots.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot)}
                        className={cn(
                          "relative p-3 rounded-xl border text-sm font-medium transition-all",
                          state.timeSlot === slot.time
                            ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-1 ring-offset-background"
                            : slot.available
                            ? "border-border hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm bg-card"
                            : "opacity-40 cursor-not-allowed border-dashed bg-muted/50"
                        )}
                        aria-label={slot.available ? `Select ${formatTimeBlock(slot.time)}` : `${formatTimeBlock(slot.time)} unavailable: ${slot.reason}`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className="size-3.5 opacity-70" />
                          {formatTimeBlock(slot.time)}
                        </div>
                        
                        {/* Sold out tooltip-like hint for unavailable */}
                        {!slot.available && (
                          <div className="text-[10px] font-normal opacity-70 truncate mt-0.5 max-w-[80px] mx-auto text-center" title={slot.reason}>
                            Sold out
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-muted/20 border-t flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="size-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!state.timeSlot} 
          className="w-full sm:w-auto min-w-[140px] gap-2"
        >
          Your Details <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </>
  );
}
