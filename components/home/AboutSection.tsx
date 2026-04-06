import Image from "next/image";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="size-4" />
              The Unique Experience
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              More than just a haircut. A complete transformation.
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in Colombo, Unique Hair Studio brings world-class styling techniques to the modern professional. 
              We believe that your hair is your most important accessory, and our master stylists are dedicated to ensuring it perfectly reflects your persona.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-6">
              <div className="space-y-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <h4 className="font-bold">Premium Products</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We exclusively use internationally recognized, salon-grade treatments.
                </p>
              </div>
              <div className="space-y-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="size-5 text-primary" />
                </div>
                <h4 className="font-bold">Expert Stylists</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our team undergoes continuous training to master the latest global trends.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Image container with styling */}
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted relative shadow-2xl border border-border/50">
              <Image
                src="/seat1.jpeg"
                alt="Luxury salon chair at Unique Hair Studio"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={80}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgICAQQDAAAAAAAAAAAAAQIDBAARBQYSITFBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABsRAAICAwEAAAAAAAAAAAAAAAECABEDITFB/9oADAMBAAIRAxEAPwC3xnUHI8jwkENu1O0cNlYoklkYhVJ3oAnwMzjqHqjlrmPPG8kkT9r9jRuV0w9jGMTWjYE5lhiJn//Z"
              />
              {/* Elegant gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent z-10" />
              
              {/* Decorative text */}
              <div className="absolute bottom-10 left-10 z-20 text-white">
                <p className="text-4xl font-light italic opacity-90">&ldquo;Perfection</p>
                <p className="text-3xl font-bold ml-8">in every detail.&rdquo;</p>
              </div>
            </div>
            
            {/* Extra abstract geometric element */}
            <div className="absolute -bottom-6 -left-6 z-[-1] w-2/3 aspect-square rounded-3xl border border-primary/20 bg-primary/5 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />
            
            {/* Accent decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-primary/20 rounded-full z-[-1]" />
          </div>

        </div>
      </div>
    </section>
  );
}
