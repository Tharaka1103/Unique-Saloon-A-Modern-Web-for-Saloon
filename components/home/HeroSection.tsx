import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DisplaySettings } from "@/types";

interface HeroSectionProps {
  display: DisplaySettings;
}

export function HeroSection({ display }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background aesthetic blobs/gradients for Luxury Minimalist feel */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-3xl max-h-3xl rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-2xl max-h-2xl rounded-full bg-foreground/5 blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 py-24 md:py-32 lg:py-40 mx-auto flex flex-col items-center text-center">
        
        {/* Announcement Banner mapping */}
        {display.announcementBannerActive && display.announcementBanner && (
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            {display.announcementBanner}
          </div>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
          {display.heroHeading || "Elevate Your Style"}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
          {display.heroSubheading || "Experience the art of premium hair care in the heart of Colombo. Our expert stylists combine modern techniques with personalized vision."}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <Link href="/booking">
            <Button size="lg" className="rounded-full h-14 px-8 text-base font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95">
              Book Appointment <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
          <Link href="#services">
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base font-medium transition-transform hover:scale-105 active:scale-95 bg-background/50 backdrop-blur-sm border-border hover:bg-accent">
              View Services
            </Button>
          </Link>
        </div>

        {/* Floating abstract decorative elements */}
        <div className="absolute top-1/4 left-[10%] hidden md:block w-3 h-3 rounded-full bg-primary/40 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-[15%] hidden lg:block w-4 h-4 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-[20%] hidden lg:block w-2 h-2 rounded-full border border-primary/50" />
      </div>
    </section>
  );
}
