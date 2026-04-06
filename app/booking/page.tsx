import type { Metadata } from "next";
import { BookingMultiStep } from "@/components/booking/BookingMultiStep";
import { Scissors } from "lucide-react";

export const metadata: Metadata = {
  title: "Book Appointment | Unique Hair Studio",
  description: "Schedule your next premium hair care appointment with us.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Simple Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 md:px-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Scissors className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">Unique Hair Studio</span>
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <main className="container px-4 py-8 md:py-12 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Book Your Appointment</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Choose a service, find a time that works for you, and confirm your details. 
            We'll handle the rest.
          </p>
        </div>

        {/* Multi-step booking form */}
        <BookingMultiStep />
      </main>
    </div>
  );
}
