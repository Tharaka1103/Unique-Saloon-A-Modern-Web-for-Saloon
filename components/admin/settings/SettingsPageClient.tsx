"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CalendarOff,
  Timer,
  ClipboardList,
  Bell,
  Palette,
  FolderTree,
  Wrench,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessHoursConfig } from "@/components/admin/settings/BusinessHoursConfig";
import { HolidayManager } from "@/components/admin/settings/HolidayManager";
import { SlotConfig } from "@/components/admin/settings/SlotConfig";
import { BookingRulesConfig } from "@/components/admin/settings/BookingRulesConfig";
import { NotificationConfig } from "@/components/admin/settings/NotificationConfig";
import { DisplayConfig } from "@/components/admin/settings/DisplayConfig";
import { ServiceCategoryConfig } from "@/components/admin/settings/ServiceCategoryConfig";
import { MaintenanceToggle } from "@/components/admin/settings/MaintenanceToggle";
import type { ISettings } from "@/types";

const TABS = [
  { id: "hours", label: "Business Hours", icon: Clock },
  { id: "holidays", label: "Holidays", icon: CalendarOff },
  { id: "slots", label: "Slot Config", icon: Timer },
  { id: "rules", label: "Booking Rules", icon: ClipboardList },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "display", label: "Display", icon: Palette },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "system", label: "System", icon: Wrench },
] as const;

/**
 * Master settings page client component with 8 tabs.
 * Manages fetching, updating, and distributing settings to tab components.
 */
export function SettingsPageClient() {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        toast.error("Failed to load settings", {
          description: data.error,
        });
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /**
   * Saves a partial settings update to the API.
   * Shows loading state and success/error toast notifications.
   */
  const saveSettings = async (
    update: Partial<ISettings>
  ): Promise<boolean> => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        toast.success("Settings saved", {
          description: "Your changes have been applied successfully.",
        });
        return true;
      } else {
        toast.error("Failed to save settings", {
          description: data.error,
        });
        return false;
      }
    } catch {
      toast.error("Failed to connect to server");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-2xl" />
        <div className="grid gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Wrench className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Settings Unavailable</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Unable to load settings. Please check your database connection.
        </p>
        <button
          onClick={fetchSettings}
          className="text-primary underline text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">Saving...</span>
        </div>
      )}

      <Tabs defaultValue="hours" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:min-w-0 h-auto flex-wrap gap-1 bg-muted p-1 rounded-xl">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-1.5 text-xs md:text-sm px-2.5 py-1.5 rounded-lg"
              >
                <tab.icon className="size-3.5 md:size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="hours">
          <BusinessHoursConfig
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="holidays">
          <HolidayManager
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="slots">
          <SlotConfig
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="rules">
          <BookingRulesConfig
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationConfig
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="display">
          <DisplayConfig
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="categories">
          <ServiceCategoryConfig
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="system">
          <MaintenanceToggle
            settings={settings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
