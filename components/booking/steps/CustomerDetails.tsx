"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BookingState } from "../BookingMultiStep";

interface CustomerDetailsProps {
  state: BookingState;
  updateState: (update: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CustomerDetails({ state, updateState, onNext, onBack }: CustomerDetailsProps) {
  const [details, setDetails] = useState(state.customerDetails);
  const [errors, setErrors] = useState<{ phone?: string; name?: string }>({});

  const validateAndNext = () => {
    const newErrors: { phone?: string; name?: string } = {};

    if (!details.customerName.trim()) {
      newErrors.name = "Name is required.";
    }

    const phoneRegex = /^07[0-9]{8}$/;
    if (!phoneRegex.test(details.customerPhone)) {
      newErrors.phone = "Must be a valid 10-digit Sri Lankan number starting with 07.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateState({ customerDetails: details });
    onNext();
  };

  return (
    <>
      <div className="p-6 border-b border-border/50 bg-muted/20">
        <h2 className="text-xl font-semibold tracking-tight">Your Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please provide your contact information to finalize the booking.
        </p>
      </div>

      <CardContent className="p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <User className="size-5 text-primary" />
            <h3 className="font-medium text-lg">Contact Information</h3>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Kasun Perera"
                value={details.customerName}
                onChange={(e) => {
                  setDetails({ ...details, customerName: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                required
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="07X XXX XXXX"
                value={details.customerPhone}
                onChange={(e) => {
                  setDetails({ ...details, customerPhone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                required
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="kasun@example.com"
                value={details.customerEmail || ""}
                onChange={(e) => setDetails({ ...details, customerEmail: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Special Requests <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Any allergies, specific requests, etc."
                value={details.notes || ""}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-muted/20 border-t flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="size-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={validateAndNext} 
          className="w-full sm:w-auto min-w-[140px] gap-2"
        >
          Review Booking <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </>
  );
}
