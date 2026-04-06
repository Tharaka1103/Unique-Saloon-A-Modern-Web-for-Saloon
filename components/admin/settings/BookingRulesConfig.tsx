"use client";

import { useState } from "react";
import { ClipboardList, Loader2, Save } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ISettings, BookingRules } from "@/types";

interface BookingRulesConfigProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

/**
 * Booking rules configuration controlling same-day booking,
 * customer limits, cancellation policy, auto-cancel, and confirmation mode.
 */
export function BookingRulesConfig({
  settings,
  onSave,
  isSaving,
}: BookingRulesConfigProps) {
  const [rules, setRules] = useState<BookingRules>({
    ...settings.bookingRules,
  });

  const updateRule = <K extends keyof BookingRules>(
    key: K,
    value: BookingRules[K]
  ) => {
    setRules((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave({ bookingRules: rules });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-5" />
          Booking Rules
        </CardTitle>
        <CardDescription>
          Control how customers can make and manage their bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confirmation Mode */}
        <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
          <Label className="text-sm font-medium">
            Booking Confirmation Mode
          </Label>
          <Select
            value={rules.bookingConfirmationMode}
            onValueChange={(v) =>
              updateRule(
                "bookingConfirmationMode",
                v as "auto" | "manual"
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                Auto-Confirm All Bookings
              </SelectItem>
              <SelectItem value="manual">
                Manual Confirmation Required
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {rules.bookingConfirmationMode === "auto"
              ? "New bookings are automatically confirmed. Customers receive instant confirmation."
              : "New bookings enter 'Pending' status. Admin must manually confirm each booking."}
          </p>
        </div>

        <Separator />

        {/* Same Day Booking */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="text-sm font-medium">
              Allow Same-Day Booking
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              When disabled, today&apos;s date is blocked in the booking calendar
            </p>
          </div>
          <Switch
            checked={rules.allowSameDayBooking}
            onCheckedChange={(v) => updateRule("allowSameDayBooking", v)}
          />
        </div>

        {/* Max Bookings Per Customer Per Day */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="text-sm font-medium">
              Max Bookings Per Customer Per Day
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Limits how many appointments one customer can make for the same
              day
            </p>
          </div>
          <Input
            type="number"
            min={1}
            max={9}
            value={rules.maxBookingsPerCustomerPerDay}
            onChange={(e) =>
              updateRule(
                "maxBookingsPerCustomerPerDay",
                Number(e.target.value)
              )
            }
            className="w-20 text-center"
          />
        </div>

        <Separator />

        {/* Cancellation Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Cancellation Policy</h3>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <Label className="text-sm font-medium">
                Allow Customer Cancellation
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, customers can cancel from the confirmation page
              </p>
            </div>
            <Switch
              checked={rules.allowCancellationByCustomer}
              onCheckedChange={(v) =>
                updateRule("allowCancellationByCustomer", v)
              }
            />
          </div>

          {rules.allowCancellationByCustomer && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label className="text-sm font-medium">
                  Cancellation Deadline
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer must cancel at least this many hours before the
                  appointment
                </p>
              </div>
              <Select
                value={String(rules.cancellationDeadlineHours)}
                onValueChange={(v) =>
                  updateRule("cancellationDeadlineHours", Number(v))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Auto Cancel */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="text-sm font-medium">
              Auto-Cancel Pending Bookings
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically cancel bookings that remain in &apos;Pending&apos; status
              after this duration (requires cron job)
            </p>
          </div>
          <Select
            value={String(rules.autoCancelAfterMinutes)}
            onValueChange={(v) =>
              updateRule("autoCancelAfterMinutes", Number(v))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Never</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="1440">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Phone Verification (Future) */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border opacity-60">
          <div>
            <Label className="text-sm font-medium">
              Phone Verification
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Coming Soon
              </span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Require phone number verification via OTP before confirming
              booking
            </p>
          </div>
          <Switch
            checked={rules.requirePhoneVerification}
            onCheckedChange={(v) =>
              updateRule("requirePhoneVerification", v)
            }
            disabled
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Booking Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
