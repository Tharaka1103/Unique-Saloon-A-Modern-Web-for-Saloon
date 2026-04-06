"use client";

import { useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ISettings, NotificationSettings } from "@/types";

interface NotificationConfigProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

/**
 * Notification settings including email alerts, WhatsApp (future),
 * appointment reminders, announcement banner, and message templates
 * with variable preview.
 */
export function NotificationConfig({
  settings,
  onSave,
  isSaving,
}: NotificationConfigProps) {
  const [config, setConfig] = useState<NotificationSettings>({
    ...settings.notifications,
  });
  const [announcementBanner, setAnnouncementBanner] = useState(
    settings.display.announcementBanner
  );
  const [announcementActive, setAnnouncementActive] = useState(
    settings.display.announcementBannerActive
  );

  const updateConfig = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave({
      notifications: config,
      display: {
        ...settings.display,
        announcementBanner,
        announcementBannerActive: announcementActive,
      },
    });
  };

  // Template preview with sample data
  const previewTemplate = (template: string): string => {
    return template
      .replace("{customerName}", "Kumara Perera")
      .replace("{service}", "Keratin Treatment")
      .replace("{date}", "Monday, 15 January 2025")
      .replace("{time}", "10:00 AM")
      .replace("{reference}", "UHS-2025-0042")
      .replace("{phone}", "+94 11 234 5678");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Configure email alerts, reminders, announcement banners, and
          notification templates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin Email Alerts */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Admin Alerts</h3>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <Label className="text-sm font-medium">
                Email Alerts on New Booking
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive an email notification when a new booking is made
              </p>
            </div>
            <Switch
              checked={config.adminEmailAlerts}
              onCheckedChange={(v) => updateConfig("adminEmailAlerts", v)}
            />
          </div>

          {config.adminEmailAlerts && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="admin-email">Admin Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@uniquehairstudio.lk"
                value={config.adminEmail}
                onChange={(e) => updateConfig("adminEmail", e.target.value)}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* WhatsApp (Future Feature) */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border opacity-60">
          <div>
            <Label className="text-sm font-medium">
              WhatsApp Notifications
              <Badge variant="secondary" className="ml-2 text-xs">
                Coming Soon
              </Badge>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Send booking confirmations and reminders via WhatsApp
            </p>
          </div>
          <Switch
            checked={config.whatsappEnabled}
            onCheckedChange={(v) => updateConfig("whatsappEnabled", v)}
            disabled
          />
        </div>

        <Separator />

        {/* Appointment Reminders */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Appointment Reminders</h3>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <Label className="text-sm font-medium">
                Send Reminder Before Appointment
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                How long before the appointment to send a reminder
              </p>
            </div>
            <Select
              value={String(config.reminderHoursBefore)}
              onValueChange={(v) =>
                updateConfig("reminderHoursBefore", Number(v))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Disabled</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Announcement Banner */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Announcement Banner</h3>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <Label className="text-sm font-medium">
                Show Announcement Banner
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Display a banner at the top of the public website
              </p>
            </div>
            <Switch
              checked={announcementActive}
              onCheckedChange={setAnnouncementActive}
            />
          </div>

          {announcementActive && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="announcement-text">Banner Text</Label>
              <Textarea
                id="announcement-text"
                placeholder="e.g., 🎉 20% off all hair treatments this week!"
                value={announcementBanner}
                onChange={(e) => setAnnouncementBanner(e.target.value)}
                rows={2}
              />
              {announcementBanner && (
                <div className="mt-2 p-3 rounded-lg bg-primary text-primary-foreground text-sm text-center">
                  {announcementBanner}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Message Templates */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Message Templates</h3>
          <p className="text-xs text-muted-foreground">
            Available variables: {"{customerName}"}, {"{service}"}, {"{date}"},
            {" {time}"}, {"{reference}"}, {"{phone}"}
          </p>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="confirmation-template">
                Booking Confirmation Template
              </Label>
              <Textarea
                id="confirmation-template"
                value={config.bookingConfirmationTemplate}
                onChange={(e) =>
                  updateConfig("bookingConfirmationTemplate", e.target.value)
                }
                rows={3}
              />
              {config.bookingConfirmationTemplate && (
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Preview:
                  </p>
                  {previewTemplate(config.bookingConfirmationTemplate)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-template">
                Reminder Template
              </Label>
              <Textarea
                id="reminder-template"
                value={config.reminderTemplate}
                onChange={(e) =>
                  updateConfig("reminderTemplate", e.target.value)
                }
                rows={3}
              />
              {config.reminderTemplate && (
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Preview:
                  </p>
                  {previewTemplate(config.reminderTemplate)}
                </div>
              )}
            </div>
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
            Save Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
