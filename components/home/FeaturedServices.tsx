import Link from "next/link";
import { ArrowRight, Scissors, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IService } from "@/types";

interface FeaturedServicesProps {
  services: IService[];
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  // Only show up to 6 featured services
  const featured = services.slice(0, 6);

  return (
    <section id="services" className="py-24 md:py-32 bg-muted/20 border-y border-border">
      <div className="container px-4 mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <Scissors className="size-6 text-primary" />
              Signature Services
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Curated treatments performed by expert stylists using premium products. 
              Discover our most sought-after offerings tailored just for you.
            </p>
          </div>
          
          <Link href="/booking" className="shrink-0">
            <Button variant="outline" className="rounded-full shadow-sm">
              View All Services <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border text-muted-foreground">
            No services currently featured.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((service, index) => (
              <div 
                key={String(service._id)} 
                className="group relative bg-background rounded-2xl p-6 md:p-8 border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                      {service.category}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[60px]">
                      {service.description || "Premium styling service tailored to your unique preferences."}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Starting at</span>
                      <span className="text-lg font-bold">Rs. {service.price.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <Clock className="size-4 mr-1.5 opacity-70" />
                      {service.duration} min
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link href="/booking">
            <Button size="lg" className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 px-8 h-14">
              Book Your Session Now
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
