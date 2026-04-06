"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { IService } from "@/types";
import type { BookingState } from "../BookingMultiStep";

interface ServiceSelectionProps {
  state: BookingState;
  updateState: (update: Partial<BookingState>) => void;
  onNext: () => void;
}

export function ServiceSelection({ state, updateState, onNext }: ServiceSelectionProps) {
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services?activeOnly=true");
        const data = await res.json();
        if (data.success) {
          setServices(data.data);
        } else {
          toast.error("Failed to load services");
        }
      } catch (err) {
        toast.error("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, IService[]>);

  const handleSelect = (service: IService) => {
    updateState({ service, date: null, timeSlot: null, endTime: null }); // Reset time if service changes
  };

  return (
    <>
      <div className="p-6 border-b border-border/50 bg-muted/20">
        <h2 className="text-xl font-semibold tracking-tight">Select a Service</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose the service you'd like to book.</p>
      </div>
      
      <CardContent className="p-6 lg:p-8">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No services currently available for booking online.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-medium border-b pb-2">{category}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categoryServices.map((svc) => (
                    <button
                      key={svc._id as unknown as string}
                      onClick={() => handleSelect(svc)}
                      className={cn(
                        "text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                        state.service?._id === svc._id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                      )}
                    >
                      {/* Active Indicator Strip */}
                      {state.service?._id === svc._id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {svc.name}
                        </span>
                        <span className="font-medium text-sm whitespace-nowrap bg-background px-2 py-0.5 rounded-md border shadow-sm">
                          Rs. {svc.price.toLocaleString()}
                        </span>
                      </div>
                      
                      {svc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {svc.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs font-medium text-muted-foreground mt-auto">
                        <Loader2 className="size-3.5 mr-1" /> {/* Re-using icon for time */}
                        {svc.duration} mins
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 bg-muted/20 border-t flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!state.service} 
          className="w-full sm:w-auto min-w-[140px] gap-2 transition-transform active:scale-95"
        >
          Select Date & Time <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </>
  );
}
