"use client";

import { useState } from "react";
import { Palette, Loader2, Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { ISettings, DisplaySettings } from "@/types";

interface DisplayConfigProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

/**
 * Display & Branding configuration.
 * Controls text, links, and basic visual elements on the public site.
 */
export function DisplayConfig({ settings, onSave, isSaving }: DisplayConfigProps) {
  const [display, setDisplay] = useState<DisplaySettings>({
    ...settings.display,
  });

  const updateDisplay = <K extends keyof DisplaySettings>(
    key: K,
    value: DisplaySettings[K]
  ) => {
    setDisplay((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave({ display });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5" />
          Display & Branding
        </CardTitle>
        <CardDescription>
          Customize the text, contact information, and social links shown on your public website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="salon-name">Salon Name</Label>
                <Input
                  id="salon-name"
                  value={display.salonName}
                  onChange={(e) => updateDisplay("salonName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={display.tagline}
                  onChange={(e) => updateDisplay("tagline", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Homepage Hero Section</h3>
              <div className="space-y-2">
                <Label htmlFor="hero-heading">Hero Heading</Label>
                <Input
                  id="hero-heading"
                  value={display.heroHeading}
                  onChange={(e) => updateDisplay("heroHeading", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subheading">Hero Subheading</Label>
                <Textarea
                  id="hero-subheading"
                  value={display.heroSubheading}
                  onChange={(e) => updateDisplay("heroSubheading", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Contact & Social Links</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={display.address}
                  onChange={(e) => updateDisplay("address", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={display.phone}
                    onChange={(e) => updateDisplay("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={display.email}
                    onChange={(e) => updateDisplay("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-maps">Google Maps URL</Label>
                <Input
                  id="google-maps"
                  type="url"
                  value={display.googleMapsUrl}
                  onChange={(e) => updateDisplay("googleMapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={display.instagramUrl}
                    onChange={(e) => updateDisplay("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={display.facebookUrl}
                    onChange={(e) => updateDisplay("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Live Preview</h3>
            <div className="border rounded-xl aspect-[9/16] md:aspect-square bg-black text-white p-6 md:p-10 flex flex-col justify-center relative overflow-hidden shadow-xl">
              {/* Fake gradient background for preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black pointer-events-none" />
              
              <div className="relative z-10 space-y-6 text-center">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                  {display.heroHeading || "Elevate Your Style"}
                </h1>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
                  {display.heroSubheading || "Experience the art of premium hair care."}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <div className="bg-white text-black px-6 py-2.5 rounded-md font-medium text-sm w-full sm:w-auto cursor-default">
                    Book Appointment
                  </div>
                  <div className="border border-white/20 px-6 py-2.5 rounded-md font-medium text-sm w-full sm:w-auto cursor-default">
                    View Services
                  </div>
                </div>
              </div>

              {/* Fake header overlay */}
              <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <span className="font-semibold text-sm tracking-tight">{display.salonName}</span>
                <span className="size-6 rounded bg-white/10" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This is an approximation of how your hero section will appear.
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
            Save Display Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
