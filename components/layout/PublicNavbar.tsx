"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PublicNavbarProps {
  salonName: string;
}

/**
 * Public facing sticky navigation bar with glassmorphism effect.
 */
export function PublicNavbar({ salonName }: PublicNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Scissors className="size-5 text-primary" />
          <span className="font-semibold tracking-tight text-lg">{salonName || "Unique Hair Studio"}</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Services
          </Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About Us
          </Link>
          <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/booking">
            <Button size="sm" className="hidden sm:inline-flex rounded-full px-6 font-medium shadow-sm transition-transform active:scale-95">
              Book Appointment
            </Button>
            <Button size="sm" className="sm:hidden rounded-full font-medium transition-transform active:scale-95">
              Book
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
