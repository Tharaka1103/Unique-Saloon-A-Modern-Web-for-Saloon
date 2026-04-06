"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface PublicNavbarProps {
  salonName: string;
}

/**
 * Animated logo component that expands from abbreviation to full name
 */
function AnimatedLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <span className={cn(
      "font-semibold tracking-tight text-lg transition-colors duration-300 flex overflow-hidden",
      isScrolled ? "text-foreground" : "text-white"
    )}>
      {/* U */}
      <span className="inline-block">U</span>
      <span 
        className={cn(
          "inline-block overflow-hidden transition-all duration-500 ease-out",
          isScrolled ? "max-w-[50px] opacity-100" : "max-w-0 opacity-0"
        )}
      >
        nique
      </span>
      
      {/* Space */}
      <span 
        className={cn(
          "inline-block overflow-hidden transition-all duration-500 ease-out delay-75",
          isScrolled ? "w-[0.3em]" : "w-0"
        )}
      >
        &nbsp;
      </span>
      
      {/* H */}
      <span className="inline-block">H</span>
      <span 
        className={cn(
          "inline-block overflow-hidden transition-all duration-500 ease-out delay-100",
          isScrolled ? "max-w-[30px] opacity-100" : "max-w-0 opacity-0"
        )}
      >
        air
      </span>
      
      {/* Space */}
      <span 
        className={cn(
          "inline-block overflow-hidden transition-all duration-500 ease-out delay-150",
          isScrolled ? "w-[0.3em]" : "w-0"
        )}
      >
        &nbsp;
      </span>
      
      {/* S */}
      <span className="inline-block">S</span>
      <span 
        className={cn(
          "inline-block overflow-hidden transition-all duration-500 ease-out delay-200",
          isScrolled ? "max-w-[50px] opacity-100" : "max-w-0 opacity-0"
        )}
      >
        tudio
      </span>
    </span>
  );
}

/**
 * Public facing sticky navigation bar with glassmorphism effect.
 * Transparent by default, adds background on scroll.
 */
export function PublicNavbar({ salonName }: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm" 
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <AnimatedLogo isScrolled={isScrolled} />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="#services" 
            className={cn(
              "text-sm font-medium transition-colors",
              isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
            )}
          >
            Services
          </Link>
          <Link 
            href="#about" 
            className={cn(
              "text-sm font-medium transition-colors",
              isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
            )}
          >
            About Us
          </Link>
          <Link 
            href="#contact" 
            className={cn(
              "text-sm font-medium transition-colors",
              isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
            )}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className={cn(
            "transition-colors duration-300",
            isScrolled ? "" : "[&_button]:text-white [&_button]:hover:bg-white/10"
          )}>
            <ThemeToggle />
          </div>
          <Link href="/booking">
            <Button 
              size="sm" 
              className={cn(
                "hidden sm:inline-flex rounded-full px-6 font-medium shadow-sm transition-all active:scale-95",
                isScrolled ? "" : "bg-white text-black hover:bg-white/90"
              )}
            >
              Book Appointment
            </Button>
            <Button 
              size="sm" 
              className={cn(
                "sm:hidden rounded-full font-medium transition-all active:scale-95",
                isScrolled ? "" : "bg-white text-black hover:bg-white/90"
              )}
            >
              Book
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
