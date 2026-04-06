"use client";

import { useState } from "react";
import { Wrench, Loader2, Save, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { formatDateAdmin } from "@/lib/timezone";
import type { ISettings } from "@/types";

interface MaintenanceToggleProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

/**
 * System Settings & Maintenance Mode toggle.
 * Allows administrators to block public access to bookings.
 */
export function MaintenanceToggle({ settings, onSave, isSaving }: MaintenanceToggleProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setConfirmOpen(true);
    } else {
      setMaintenanceMode(false);
    }
  };

  const confirmMaintenanceOn = () => {
    setMaintenanceMode(true);
    setConfirmOpen(false);
  };

  const handleSave = async () => {
    await onSave({
      maintenanceMode,
      maintenanceMessage,
    });
  };

  return (
    <div className="space-y-6">
      <Card className={maintenanceMode ? "border-destructive/50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-5" />
            System & Maintenance
          </CardTitle>
          <CardDescription>
            Control the system status and manage critical operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-6 rounded-xl border ${maintenanceMode ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/20"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  Maintenance Mode
                  {maintenanceMode && (
                    <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">
                  When active, all public booking routes will be redirected to the maintenance page. Existing bookings can still be managed from the admin dashboard.
                </p>
              </div>
              
              <Switch
                checked={maintenanceMode}
                onCheckedChange={handleToggle}
                className="mt-1 data-[state=checked]:bg-destructive"
              />

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="size-5 text-destructive" />
                      Enable Maintenance Mode?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will immediately block all public access to the booking system. Customers will not be able to book new appointments until you disable maintenance mode. Are you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmMaintenanceOn} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Enable Maintenance Mode
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {maintenanceMode && (
              <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="maintenanceMessage" className="text-sm font-medium">
                  Message shown to customers
                </Label>
                <Textarea
                  id="maintenanceMessage"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                  className="bg-background"
                />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Config Update</h4>
              <p className="text-sm">
                {formatDateAdmin(settings.updatedAt)} by <span className="font-medium">{settings.lastUpdatedBy}</span>
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">System Status</h4>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-2 rounded-full bg-green-500" />
                Database Connected
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-6">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Save className="size-4 mr-2" />
              )}
              Save System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
