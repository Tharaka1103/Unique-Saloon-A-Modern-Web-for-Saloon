"use client";

import { useState } from "react";
import { CalendarOff, Plus, Trash2, Loader2, Save, Import } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { ISettings, HolidayDate } from "@/types";

interface HolidayManagerProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

const SRI_LANKAN_HOLIDAYS_2025: HolidayDate[] = [
  { date: new Date("2025-01-13"), reason: "Duruthu Poya", isRecurring: false },
  { date: new Date("2025-01-15"), reason: "Tamil Thai Pongal", isRecurring: false },
  { date: new Date("2025-02-04"), reason: "Independence Day", isRecurring: true },
  { date: new Date("2025-02-12"), reason: "Navam Poya", isRecurring: false },
  { date: new Date("2025-02-26"), reason: "Maha Shivaratri", isRecurring: false },
  { date: new Date("2025-03-13"), reason: "Medin Poya", isRecurring: false },
  { date: new Date("2025-03-31"), reason: "Id-ul-Fitr", isRecurring: false },
  { date: new Date("2025-04-13"), reason: "Sinhala & Tamil New Year Eve", isRecurring: true },
  { date: new Date("2025-04-14"), reason: "Sinhala & Tamil New Year", isRecurring: true },
  { date: new Date("2025-04-18"), reason: "Good Friday", isRecurring: false },
  { date: new Date("2025-05-01"), reason: "May Day", isRecurring: true },
  { date: new Date("2025-05-12"), reason: "Vesak Poya", isRecurring: false },
  { date: new Date("2025-05-13"), reason: "Day after Vesak", isRecurring: false },
  { date: new Date("2025-06-07"), reason: "Id-ul-Alha", isRecurring: false },
  { date: new Date("2025-06-10"), reason: "Poson Poya", isRecurring: false },
  { date: new Date("2025-07-10"), reason: "Esala Poya", isRecurring: false },
  { date: new Date("2025-08-08"), reason: "Nikini Poya", isRecurring: false },
  { date: new Date("2025-09-05"), reason: "Milad-un-Nabi", isRecurring: false },
  { date: new Date("2025-09-07"), reason: "Binara Poya", isRecurring: false },
  { date: new Date("2025-10-06"), reason: "Vap Poya", isRecurring: false },
  { date: new Date("2025-10-20"), reason: "Deepavali", isRecurring: false },
  { date: new Date("2025-11-05"), reason: "Il Poya", isRecurring: false },
  { date: new Date("2025-12-04"), reason: "Unduvap Poya", isRecurring: false },
  { date: new Date("2025-12-25"), reason: "Christmas Day", isRecurring: true },
];

/**
 * Holiday and blackout date management with calendar view,
 * add/remove holidays, and Sri Lankan public holidays import.
 */
export function HolidayManager({
  settings,
  onSave,
  isSaving,
}: HolidayManagerProps) {
  const [holidays, setHolidays] = useState<HolidayDate[]>(
    settings.holidayDates.map((h) => ({
      ...h,
      date: new Date(h.date),
    }))
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newReason, setNewReason] = useState("");
  const [newRecurring, setNewRecurring] = useState(false);

  const holidayDates = holidays.map((h) =>
    new Date(h.date).toISOString().split("T")[0]
  );

  const addHoliday = () => {
    if (!newDate || !newReason.trim()) return;

    const dateStr = newDate.toISOString().split("T")[0];
    const exists = holidayDates.includes(dateStr);

    if (exists) return;

    setHolidays((prev) => [
      ...prev,
      { date: newDate, reason: newReason.trim(), isRecurring: newRecurring },
    ]);
    setNewDate(undefined);
    setNewReason("");
    setNewRecurring(false);
    setDialogOpen(false);
  };

  const removeHoliday = (index: number) => {
    setHolidays((prev) => prev.filter((_, i) => i !== index));
  };

  const importSriLankanHolidays = () => {
    const existing = new Set(holidayDates);
    const newHolidays = SRI_LANKAN_HOLIDAYS_2025.filter(
      (h) => !existing.has(new Date(h.date).toISOString().split("T")[0])
    );
    setHolidays((prev) => [...prev, ...newHolidays]);
  };

  const handleSave = async () => {
    await onSave({ holidayDates: holidays });
  };

  const sortedHolidays = [...holidays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Dates for highlighting on calendar
  const calendarHighlightDates = holidays.map((h) => new Date(h.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarOff className="size-5" />
          Holidays & Blackout Dates
        </CardTitle>
        <CardDescription>
          Manage holidays and blackout dates. These dates will be blocked in
          the public booking calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-2" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Holiday / Blackout Date</DialogTitle>
                <DialogDescription>
                  Select a date and provide a reason. This date will be blocked
                  in the booking calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-reason">Reason</Label>
                  <Input
                    id="holiday-reason"
                    placeholder="e.g., Poya Day, New Year"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newRecurring}
                    onCheckedChange={setNewRecurring}
                    id="holiday-recurring"
                  />
                  <Label htmlFor="holiday-recurring" className="text-sm">
                    Recurring annually
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={addHoliday}
                  disabled={!newDate || !newReason.trim()}
                >
                  Add Holiday
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Import className="size-4 mr-2" />
                Import Sri Lanka 2025
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import Sri Lankan Holidays?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will add all 2025 Sri Lankan public holidays that
                  aren&apos;t already in your list. Existing holidays won&apos;t
                  be duplicated.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={importSriLankanHolidays}>
                  Import Holidays
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Calendar Preview */}
        <div className="flex justify-center border rounded-lg p-4 bg-muted/30">
          <Calendar
            mode="multiple"
            selected={calendarHighlightDates}
            className="rounded-md"
          />
        </div>

        {/* Holiday List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {sortedHolidays.length} holiday{sortedHolidays.length !== 1 ? "s" : ""} configured
          </h3>
          {sortedHolidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No holidays configured. Add holidays to block dates in the
              booking calendar.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {sortedHolidays.map((holiday, index) => {
                const dateStr = new Date(holiday.date).toLocaleDateString(
                  "en-LK",
                  {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                );
                return (
                  <div
                    key={`${holiday.reason}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-destructive" />
                      <div>
                        <p className="text-sm font-medium">{holiday.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {dateStr}
                        </p>
                      </div>
                      {holiday.isRecurring && (
                        <Badge variant="secondary" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHoliday(index)}
                      aria-label={`Remove ${holiday.reason}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Holidays
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
