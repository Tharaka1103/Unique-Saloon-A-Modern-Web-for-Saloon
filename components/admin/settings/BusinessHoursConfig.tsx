"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ISettings, BusinessHours, DayHours } from "@/types";

interface BusinessHoursConfigProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

/** Generate time options in 30-minute intervals */
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Business hours configuration with toggle switches and time pickers
 * for each day, plus quick-apply buttons.
 */
export function BusinessHoursConfig({
  settings,
  onSave,
  isSaving,
}: BusinessHoursConfigProps) {
  const [hours, setHours] = useState<BusinessHours>({
    ...settings.businessHours,
  });

  const updateDay = (day: keyof BusinessHours, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const applyToWeekdays = () => {
    const monday = hours.monday;
    setHours((prev) => ({
      ...prev,
      tuesday: { ...monday },
      wednesday: { ...monday },
      thursday: { ...monday },
      friday: { ...monday },
    }));
  };

  const applyToWeekends = () => {
    const saturday = hours.saturday;
    setHours((prev) => ({
      ...prev,
      sunday: { ...saturday },
    }));
  };

  const applyToAll = () => {
    const monday = hours.monday;
    const newHours: Record<string, DayHours> = {};
    for (const day of DAYS) {
      newHours[day.key] = { ...monday };
    }
    setHours(newHours as unknown as BusinessHours);
  };

  const handleSave = async () => {
    await onSave({ businessHours: hours });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>
          Set your salon&apos;s opening hours for each day. Closed days are
          disabled in the public booking calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Apply Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={applyToWeekdays}>
            Apply Mon→Fri
          </Button>
          <Button variant="outline" size="sm" onClick={applyToWeekends}>
            Apply Sat→Sun
          </Button>
          <Button variant="outline" size="sm" onClick={applyToAll}>
            Apply All
          </Button>
        </div>

        {/* Hours Table */}
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const day = hours[key];
            return (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={day.isOpen}
                    onCheckedChange={(v) => updateDay(key, "isOpen", v)}
                    id={`switch-${key}`}
                  />
                  <Label
                    htmlFor={`switch-${key}`}
                    className="font-medium text-sm min-w-[90px]"
                  >
                    {label}
                  </Label>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      day.isOpen
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {day.isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                {day.isOpen && (
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Select
                      value={day.openTime}
                      onValueChange={(v) => updateDay(key, "openTime", v)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatTimeLabel(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground text-sm">to</span>
                    <Select
                      value={day.closeTime}
                      onValueChange={(v) => updateDay(key, "closeTime", v)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatTimeLabel(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Business Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
