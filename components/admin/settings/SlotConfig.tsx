"use client";

import { useState, useMemo } from "react";
import { Timer, Loader2, Save, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ISettings } from "@/types";

interface SlotConfigProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

/**
 * Slot configuration with real-time visual timeline preview.
 * Controls slot duration, buffer time, advance booking limits,
 * minimum notice, and concurrent booking capacity.
 */
export function SlotConfig({ settings, onSave, isSaving }: SlotConfigProps) {
  const [slotDuration, setSlotDuration] = useState(
    settings.slotDurationMinutes
  );
  const [buffer, setBuffer] = useState(settings.bufferBetweenSlots);
  const [maxAdvance, setMaxAdvance] = useState(
    settings.maxAdvanceBookingDays
  );
  const [minAdvance, setMinAdvance] = useState(
    settings.minAdvanceBookingHours
  );
  const [maxConcurrent, setMaxConcurrent] = useState(
    settings.maxBookingsPerSlot
  );

  // Generate preview slots based on current settings
  const previewSlots = useMemo(() => {
    const openMinutes = 9 * 60; // 9:00 AM default
    const closeMinutes = 19 * 60; // 7:00 PM default
    const serviceDuration = 60; // 1 hour example

    const slots: { time: string; endTime: string }[] = [];
    const lastSlotStart = closeMinutes - serviceDuration;

    for (let time = openMinutes; time <= lastSlotStart; time += slotDuration) {
      const h = Math.floor(time / 60);
      const m = time % 60;
      const endMin = time + serviceDuration;
      const eh = Math.floor(endMin / 60);
      const em = endMin % 60;

      slots.push({
        time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        endTime: `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`,
      });

      if (slots.length >= 20) break; // Limit preview
    }
    return slots;
  }, [slotDuration]);

  const handleSave = async () => {
    await onSave({
      slotDurationMinutes: slotDuration,
      bufferBetweenSlots: buffer,
      maxAdvanceBookingDays: maxAdvance,
      minAdvanceBookingHours: minAdvance,
      maxBookingsPerSlot: maxConcurrent,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="size-5" />
          Slot Configuration
        </CardTitle>
        <CardDescription>
          Configure how time slots are generated for the booking calendar.
          Changes affect all future bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Settings Column */}
          <div className="space-y-6">
            {/* Slot Duration */}
            <div className="space-y-2">
              <Label>Slot Duration (minutes)</Label>
              <Select
                value={String(slotDuration)}
                onValueChange={(v) => setSlotDuration(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Base interval between available time slots
              </p>
            </div>

            {/* Buffer Between Slots */}
            <div className="space-y-2">
              <Label>Buffer Between Slots: {buffer} min</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={buffer}
                onChange={(e) => setBuffer(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Dead time after each appointment for cleanup/preparation
              </p>
            </div>

            {/* Max Advance Booking */}
            <div className="space-y-3">
              <Label>
                Max Advance Booking: {maxAdvance} day{maxAdvance !== 1 ? "s" : ""}
              </Label>
              <Slider
                value={[maxAdvance]}
                onValueChange={(v) => setMaxAdvance(v[0])}
                min={1}
                max={90}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 day</span>
                <span>90 days</span>
              </div>
            </div>

            {/* Min Advance Notice */}
            <div className="space-y-2">
              <Label>Minimum Advance Notice</Label>
              <Select
                value={String(minAdvance)}
                onValueChange={(v) => setMinAdvance(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No minimum</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Blocks booking slots that are too close to the current time
              </p>
            </div>

            {/* Max Concurrent */}
            <div className="space-y-2">
              <Label>Max Concurrent Bookings Per Slot</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Number of simultaneous bookings allowed for the same time slot
                (for multiple stylists)
              </p>
            </div>
          </div>

          {/* Preview Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">
                Slot Preview (9 AM – 7 PM, 60-min service)
              </h3>
            </div>
            <Separator />
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
              {previewSlots.map((slot, i) => {
                const [h] = slot.time.split(":").map(Number);
                const period = h >= 12 ? "PM" : "AM";
                const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                const [eh] = slot.endTime.split(":").map(Number);
                const ePeriod = eh >= 12 ? "PM" : "AM";
                const eHour12 = eh === 0 ? 12 : eh > 12 ? eh - 12 : eh;
                const eMin = slot.endTime.split(":")[1];

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">
                        {hour12}:{slot.time.split(":")[1]} {period}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      → {eHour12}:{eMin} {ePeriod}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {maxConcurrent} slot{maxConcurrent > 1 ? "s" : ""}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {previewSlots.length} slots generated with {slotDuration}-min
              intervals
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Slot Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
