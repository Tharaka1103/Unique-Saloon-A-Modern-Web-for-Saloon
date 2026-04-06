"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const galleryImages = [
  { src: "/seat1.jpeg", alt: "Luxury salon chair", height: "tall", animationDirection: "up" },
  { src: "/seat2.jpeg", alt: "Premium styling station", height: "normal", animationDirection: "left" },
  { src: "/seatb.jpeg", alt: "Salon interior design", height: "tall", animationDirection: "down" },
  { src: "/welcome.jpeg", alt: "Welcoming atmosphere", height: "normal", animationDirection: "right" },
  { src: "/entry.jpeg", alt: "Elegant entrance", height: "tall", animationDirection: "up" },
  { src: "/about.jpeg", alt: "Professional environment", height: "normal", animationDirection: "left" },
];

// Animation keyframes for slow pan effect
const animationStyles = `
  @keyframes panUp {
    0%, 100% { transform: scale(1.15) translateY(3%); }
    50% { transform: scale(1.15) translateY(-3%); }
  }
  @keyframes panDown {
    0%, 100% { transform: scale(1.15) translateY(-3%); }
    50% { transform: scale(1.15) translateY(3%); }
  }
  @keyframes panLeft {
    0%, 100% { transform: scale(1.15) translateX(3%); }
    50% { transform: scale(1.15) translateX(-3%); }
  }
  @keyframes panRight {
    0%, 100% { transform: scale(1.15) translateX(-3%); }
    50% { transform: scale(1.15) translateX(3%); }
  }
`;

interface GalleryItemProps {
  src: string;
  alt: string;
  height: string;
  index: number;
  animationDirection: string;
}

function GalleryItem({ src, alt, height, index, animationDirection }: GalleryItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the animation based on index
          setTimeout(() => {
            setIsVisible(true);
          }, index * 150);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  // Get animation name based on direction
  const getAnimationName = () => {
    switch (animationDirection) {
      case "up": return "panUp";
      case "down": return "panDown";
      case "left": return "panLeft";
      case "right": return "panRight";
      default: return "panUp";
    }
  };

  // Vary animation duration for more organic feel
  const animationDuration = 15 + (index % 3) * 5; // 15s, 20s, or 25s

  return (
    <div
      ref={itemRef}
      className={`relative overflow-hidden rounded-2xl bg-muted shadow-lg transition-all duration-700 ease-out cursor-pointer group
        ${height === "tall" ? "row-span-2" : "row-span-1"}
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative w-full h-full ${height === "tall" ? "min-h-[400px] md:min-h-[500px]" : "min-h-[200px] md:min-h-[250px]"}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgICAQQDAAAAAAAAAAAAAQIDBAARBQYSITFBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABsRAAICAwEAAAAAAAAAAAAAAAECABEDITFB/9oADAMBAAIRAxEAPwC3xnUHI8jwkENu1O0cNlYoklkYhVJ3oAnwMzjqHqjlrmPPG8kkT9r9jRuV0w9jGMTWjYE5lhiJn//Z"
          style={{
            animationName: isVisible ? getAnimationName() : 'none',
            animationDuration: `${animationDuration}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        />
        
        {/* Dark fade overlay - always present, intensifies on hover */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          isHovered 
            ? "bg-gradient-to-t from-black/80 via-black/40 to-black/20" 
            : "bg-gradient-to-t from-black/60 via-black/30 to-black/10"
        }`} />
        
        {/* Vignette effect for more cinematic look */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
        
        {/* Animated border glow on hover */}
        <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-500 ${
          isHovered ? "border-primary/50 shadow-[inset_0_0_30px_rgba(var(--primary),0.1)]" : "border-transparent"
        }`} />
        
        {/* Caption with fade-in from bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 transition-all duration-500 ${
          isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}>
          <p className="text-white text-sm md:text-base font-medium drop-shadow-lg">{alt}</p>
        </div>
        
        {/* Subtle shimmer effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ${
          isHovered ? "translate-x-full" : "-translate-x-full"
        }`} />
      </div>
    </div>
  );
}

export function GallerySection() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeaderVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Inject animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Camera className="size-4" />
            Our Gallery
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            A Glimpse Into Excellence
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Step inside our world of luxury grooming. Every corner is designed to make you feel special.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
          {galleryImages.map((image, index) => (
            <GalleryItem
              key={image.src}
              src={image.src}
              alt={image.alt}
              height={image.height}
              index={index}
              animationDirection={image.animationDirection}
            />
          ))}
        </div>

        {/* Bottom decorative element */}
        <div className={`flex justify-center mt-12 transition-all duration-1000 delay-700 ${
          isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="w-12 h-px bg-border" />
            <span>Crafted with passion</span>
            <div className="w-12 h-px bg-border" />
          </div>
        </div>
      </div>
    </section>
  );
}
