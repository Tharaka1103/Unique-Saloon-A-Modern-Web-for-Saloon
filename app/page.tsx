import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import Service from "@/models/Service";
import { seedDefaultSettings } from "@/models/Settings";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { AboutSection } from "@/components/home/AboutSection";
import { GallerySection } from "@/components/home/GallerySection";

// Force dynamic to ensure we get latest settings, or revalidate path.
// Standard App Router caching dictates we should specify dynamic if we want real-time updates.
export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();

  // Seed settings if they don't exist
  await seedDefaultSettings();

  // Fetch Settings (using lean for speed)
  const settingsDoc = await Settings.findOne({}).lean();
  const settings = JSON.parse(JSON.stringify(settingsDoc)); // serialize ObjectIds

  // Fetch Featured/Active Services
  const servicesDocs = await Service.find({ isActive: true })
    .sort({ isFeatured: -1, displayOrder: 1, name: 1 })
    .limit(6)
    .lean();

  const services = JSON.parse(JSON.stringify(servicesDocs));

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <PublicNavbar salonName={settings.display.salonName} />

      <main className="flex-1">
        <HeroSection display={settings.display} />
        <FeaturedServices services={services} />
        <AboutSection />
        <GallerySection />
      </main>

      <PublicFooter display={settings.display} />
    </div>
  );
}
