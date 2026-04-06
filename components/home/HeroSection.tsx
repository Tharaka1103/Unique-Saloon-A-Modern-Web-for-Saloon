import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DisplaySettings } from "@/types";

interface HeroSectionProps {
  display: DisplaySettings;
}

export function HeroSection({ display }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background min-h-[90vh] flex items-center">
      {/* Background Image with Next.js Image optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/homep.jpeg"
          alt="Unique Salon Interior"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgICAQQDAAAAAAAAAAAAAQIDBAARBQYSITFBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABsRAAICAwEAAAAAAAAAAAAAAAECABEDITFB/9oADAMBAAIRAxEAPwC3xnUHI8jwkENu1O0cNlYoklkYhVJ3oAnwMzjqHqjlrmPPG8kkT9r9jRuV0w9jGMTWjYE5lhiJn//Z"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-[1]" />
        {/* Additional vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[2]" />
      </div>
      
      <div className="container relative z-10 px-4 py-24 md:py-32 lg:py-40 mx-auto flex flex-col items-center text-center">
        
        {/* Announcement Banner mapping */}
        {display.announcementBannerActive && display.announcementBanner && (
          <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 text-sm font-medium text-white mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            {display.announcementBanner}
          </div>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl text-white mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both drop-shadow-lg">
          {display.heroHeading || "Elevate Your Style"}
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both drop-shadow-md">
          {display.heroSubheading || "Experience the art of premium hair care in the heart of Colombo. Our expert stylists combine modern techniques with personalized vision."}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <Link href="/booking">
            <Button size="lg" className="rounded-full h-14 px-8 text-base font-semibold shadow-xl transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90">
              Book Appointment <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
          <Link href="#services">
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base font-medium transition-all hover:scale-105 active:scale-95 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50">
              View Services
            </Button>
          </Link>
        </div>

        {/* Floating abstract decorative elements */}
        <div className="absolute top-1/4 left-[10%] hidden md:block w-3 h-3 rounded-full bg-white/40 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-[15%] hidden lg:block w-4 h-4 rounded-full bg-white/30 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-[20%] hidden lg:block w-2 h-2 rounded-full border border-white/50" />
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
