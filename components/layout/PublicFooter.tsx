import Link from "next/link";
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import type { DisplaySettings } from "@/types";

interface PublicFooterProps {
  display: DisplaySettings;
}

export function PublicFooter({ display }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-muted/30 border-t border-border">
      <div className="container px-4 py-12 md:py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scissors className="size-5 text-primary" />
              <span className="font-semibold tracking-tight text-lg">
                {display.salonName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {display.tagline}
            </p>
            <div className="flex items-center gap-4 pt-2">
              {display.instagramUrl && (
                <Link href={display.instagramUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="size-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {display.facebookUrl && (
                <Link href={display.facebookUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="size-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">
                  {display.address || "Colombo, Sri Lanka"}
                </span>
              </li>
              {display.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="size-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {display.phone}
                  </span>
                </li>
              )}
              {display.email && (
                <li className="flex items-center gap-3">
                  <Mail className="size-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground break-all">
                    {display.email}
                  </span>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {currentYear} {display.salonName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
