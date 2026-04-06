"use client";

import { useState } from "react";
import { Scissors, CalendarPlus, UserCircle, CheckCircle2 } from "lucide-react";
import { ServiceSelection } from "./steps/ServiceSelection";
import { DateTimeSelection } from "./steps/DateTimeSelection";
import { CustomerDetails } from "./steps/CustomerDetails";
import { BookingSummary } from "./steps//BookingSummary";
import { BookingSuccess } from "./steps/BookingSuccess";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IService, BookingFormData } from "@/types";

export type BookingState = {
  service: IService | null;
  date: Date | null;
  timeSlot: string | null;
  endTime: string | null;
  customerDetails: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  };
};

const INITIAL_STATE: BookingState = {
  service: null,
  date: null,
  timeSlot: null,
  endTime: null,
  customerDetails: {
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  },
};

const STEPS = [
  { id: 1, title: "Service", icon: Scissors },
  { id: 2, title: "Date & Time", icon: CalendarPlus },
  { id: 3, title: "Details", icon: UserCircle },
  { id: 4, title: "Confirm", icon: CheckCircle2 },
];

/**
 * Controller component for the multi-step booking process.
 * Manages the shared state and orchestrates transitions between steps.
 */
export function BookingMultiStep() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<BookingState>(INITIAL_STATE);
  const [completedBooking, setCompletedBooking] = useState<{
    reference: string;
    status: string;
    message?: string;
  } | null>(null);

  const updateState = (update: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...update }));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  if (completedBooking) {
    return <BookingSuccess result={completedBooking} state={state} reset={() => {
      setState(INITIAL_STATE);
      setCurrentStep(1);
      setCompletedBooking(null);
    }} />;
  }

  return (
    <div className="space-y-6">
      {/* Stepper Progress */}
      <div className="hidden sm:flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-300 ease-in-out -z-10"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background/80 px-2 backdrop-blur-sm">
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                  isActive ? "border-primary bg-primary text-primary-foreground shadow-md scale-110" :
                    isPast ? "border-primary bg-primary text-primary-foreground" :
                      "border-muted bg-background text-muted-foreground"
                )}
              >
                <step.icon className="size-5" />
              </div>
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden text-center mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </span>
        <h2 className="text-lg font-bold">{STEPS[currentStep - 1].title}</h2>
      </div>

      {/* Step Content Wrapper */}
      <Card className="overflow-hidden border-border/50 shadow-lg shadow-black/5 bg-card/50 backdrop-blur-sm">
        {currentStep === 1 && (
          <ServiceSelection
            state={state}
            updateState={updateState}
            onNext={nextStep}
          />
        )}
        {currentStep === 2 && (
          <DateTimeSelection
            state={state}
            updateState={updateState}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && (
          <CustomerDetails
            state={state}
            updateState={updateState}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <BookingSummary
            state={state}
            onBack={prevStep}
            onSuccess={setCompletedBooking}
          />
        )}
      </Card>
    </div>
  );
}
