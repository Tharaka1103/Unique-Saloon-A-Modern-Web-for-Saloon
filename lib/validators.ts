import { z } from "zod";

/* ═══════════════════════════════════════════════════════════════
   SERVICE VALIDATORS
   ═══════════════════════════════════════════════════════════════ */

export const serviceFormSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name must be under 100 characters")
    .trim(),
  nameLocalized: z
    .string()
    .max(100, "Localized name must be under 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(1_000_000, "Price cannot exceed Rs. 1,000,000"),
  duration: z
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().min(0).max(999).default(0),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

/* ═══════════════════════════════════════════════════════════════
   BOOKING VALIDATORS
   ═══════════════════════════════════════════════════════════════ */

/** Sri Lankan phone number format: 07X-XXXXXXX or 07XXXXXXXXX */
const sriLankanPhoneRegex = /^07[0-9]{8}$/;

export const bookingFormSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),
  customerPhone: z
    .string()
    .regex(sriLankanPhoneRegex, "Enter a valid Sri Lankan phone number (07XXXXXXXX)"),
  customerEmail: z
    .string()
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
  serviceId: z.string().min(1, "Please select a service"),
  stylistPreference: z.string().default("No Preference"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Time slot must be in HH:MM format"),
  notes: z.string().max(500, "Notes must be under 500 characters").optional().or(z.literal("")),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/* ═══════════════════════════════════════════════════════════════
   SETTINGS VALIDATORS
   ═══════════════════════════════════════════════════════════════ */

const dayHoursSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
});

const businessHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

const holidayDateSchema = z.object({
  date: z.coerce.date(),
  reason: z.string().min(1, "Holiday reason is required").max(100),
  isRecurring: z.boolean().default(false),
});

const bookingRulesSchema = z.object({
  allowSameDayBooking: z.boolean(),
  requirePhoneVerification: z.boolean(),
  maxBookingsPerCustomerPerDay: z.number().min(1).max(10),
  autoCancelAfterMinutes: z.number().min(0).max(1440),
  allowCancellationByCustomer: z.boolean(),
  cancellationDeadlineHours: z.number().min(0).max(72),
  bookingConfirmationMode: z.enum(["auto", "manual"]),
});

const notificationSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappApiKey: z.string().optional().or(z.literal("")),
  whatsappNumber: z.string().optional().or(z.literal("")),
  emailEnabled: z.boolean(),
  adminEmailAlerts: z.boolean(),
  adminEmail: z.string().email().optional().or(z.literal("")),
  reminderHoursBefore: z.number().min(0).max(72),
  bookingConfirmationTemplate: z.string().max(1000).optional().or(z.literal("")),
  reminderTemplate: z.string().max(1000).optional().or(z.literal("")),
});

const displaySchema = z.object({
  salonName: z.string().min(1).max(100),
  tagline: z.string().max(200).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  heroHeading: z.string().max(200).optional().or(z.literal("")),
  heroSubheading: z.string().max(500).optional().or(z.literal("")),
  announcementBanner: z.string().max(300).optional().or(z.literal("")),
  announcementBannerActive: z.boolean(),
});

const serviceCategorySchema = z.object({
  name: z.string().min(1).max(50),
  displayOrder: z.number().min(0).max(999),
  isActive: z.boolean(),
});

export const settingsUpdateSchema = z
  .object({
    businessHours: businessHoursSchema,
    slotDurationMinutes: z.number().min(15).max(120),
    bufferBetweenSlots: z.number().min(0).max(60),
    maxAdvanceBookingDays: z.number().min(1).max(90),
    minAdvanceBookingHours: z.number().min(0).max(72),
    maxBookingsPerSlot: z.number().min(1).max(10),
    holidayDates: z.array(holidayDateSchema),
    bookingRules: bookingRulesSchema,
    notifications: notificationSchema,
    display: displaySchema,
    serviceCategories: z.array(serviceCategorySchema),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().max(500),
  })
  .partial();

export type SettingsUpdateValues = z.infer<typeof settingsUpdateSchema>;

/* ═══════════════════════════════════════════════════════════════
   AVAILABILITY VALIDATORS
   ═══════════════════════════════════════════════════════════════ */

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  serviceId: z.string().min(1, "Service ID is required"),
});

/* ═══════════════════════════════════════════════════════════════
   BOOKING STATUS UPDATE VALIDATOR
   ═══════════════════════════════════════════════════════════════ */

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"]),
  adminNotes: z.string().max(500).optional(),
  cancelReason: z.string().max(300).optional(),
});

export type BookingStatusUpdateValues = z.infer<typeof bookingStatusUpdateSchema>;
