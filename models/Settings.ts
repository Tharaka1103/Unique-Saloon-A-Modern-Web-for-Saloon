import mongoose, { Schema, type Model } from "mongoose";
import type {
  ISettings,
  BusinessHours,
  HolidayDate,
  BookingRules,
  NotificationSettings,
  DisplaySettings,
  ServiceCategoryConfig,
} from "@/types";

/* ═══════════════════════════════════════════════════════════════
   SUB-SCHEMAS
   ═══════════════════════════════════════════════════════════════ */

const dayHoursSchema = new Schema(
  {
    isOpen: { type: Boolean, required: true },
    openTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    closeTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  },
  { _id: false }
);

const businessHoursSchema = new Schema(
  {
    monday: { type: dayHoursSchema, required: true },
    tuesday: { type: dayHoursSchema, required: true },
    wednesday: { type: dayHoursSchema, required: true },
    thursday: { type: dayHoursSchema, required: true },
    friday: { type: dayHoursSchema, required: true },
    saturday: { type: dayHoursSchema, required: true },
    sunday: { type: dayHoursSchema, required: true },
  },
  { _id: false }
);

const holidayDateSchema = new Schema(
  {
    date: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 100 },
    isRecurring: { type: Boolean, default: false },
  },
  { _id: false }
);

const bookingRulesSchema = new Schema(
  {
    allowSameDayBooking: { type: Boolean, default: true },
    requirePhoneVerification: { type: Boolean, default: false },
    maxBookingsPerCustomerPerDay: { type: Number, default: 2, min: 1, max: 10 },
    autoCancelAfterMinutes: { type: Number, default: 0, min: 0 },
    allowCancellationByCustomer: { type: Boolean, default: true },
    cancellationDeadlineHours: { type: Number, default: 2, min: 0 },
    bookingConfirmationMode: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },
  },
  { _id: false }
);

const notificationSchema = new Schema(
  {
    whatsappEnabled: { type: Boolean, default: false },
    whatsappApiKey: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    emailEnabled: { type: Boolean, default: false },
    adminEmailAlerts: { type: Boolean, default: true },
    adminEmail: { type: String, default: "" },
    reminderHoursBefore: { type: Number, default: 2, min: 0 },
    bookingConfirmationTemplate: {
      type: String,
      default:
        "Dear {customerName}, your appointment for {service} on {date} at {time} has been confirmed. Reference: {reference}. Call us at {phone} for any changes.",
    },
    reminderTemplate: {
      type: String,
      default:
        "Hi {customerName}, this is a reminder for your {service} appointment tomorrow at {time}. Reference: {reference}. See you soon!",
    },
  },
  { _id: false }
);

const displaySchema = new Schema(
  {
    salonName: { type: String, default: "Unique Hair Studio" },
    tagline: { type: String, default: "Where Style Meets Elegance" },
    address: {
      type: String,
      default: "123 Galle Road, Colombo 03, Sri Lanka",
    },
    phone: { type: String, default: "+94 11 234 5678" },
    email: { type: String, default: "info@uniquehairstudio.lk" },
    googleMapsUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    heroHeading: {
      type: String,
      default: "Elevate Your Style",
    },
    heroSubheading: {
      type: String,
      default:
        "Experience the art of premium hair care at Colombo's most sought-after studio. Where every cut tells a story.",
    },
    announcementBanner: { type: String, default: "" },
    announcementBannerActive: { type: Boolean, default: false },
  },
  { _id: false }
);

const serviceCategoryConfigSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

/* ═══════════════════════════════════════════════════════════════
   MAIN SETTINGS SCHEMA
   ═══════════════════════════════════════════════════════════════ */

const settingsSchema = new Schema<ISettings>(
  {
    businessHours: { type: businessHoursSchema, required: true },
    slotDurationMinutes: { type: Number, default: 30, min: 15, max: 120 },
    bufferBetweenSlots: { type: Number, default: 10, min: 0, max: 60 },
    maxAdvanceBookingDays: { type: Number, default: 30, min: 1, max: 90 },
    minAdvanceBookingHours: { type: Number, default: 2, min: 0, max: 72 },
    maxBookingsPerSlot: { type: Number, default: 2, min: 1, max: 10 },
    holidayDates: { type: [holidayDateSchema], default: [] },
    bookingRules: { type: bookingRulesSchema, required: true },
    notifications: { type: notificationSchema, required: true },
    display: { type: displaySchema, required: true },
    serviceCategories: { type: [serviceCategoryConfigSchema], default: [] },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default:
        "We're currently updating our systems. Please check back shortly or call us directly to book an appointment.",
    },
    isInitialized: { type: Boolean, default: false },
    lastUpdatedBy: { type: String, default: "system" },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ??
  mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT SETTINGS & SEED FUNCTION
   ═══════════════════════════════════════════════════════════════ */

/**
 * Default business hours for Unique Hair Studio.
 * Open Tuesday–Saturday 9 AM–7 PM, Sunday 9 AM–2 PM, closed Monday.
 */
function getDefaultBusinessHours(): BusinessHours {
  const openDay = (open: string, close: string) => ({
    isOpen: true,
    openTime: open,
    closeTime: close,
  });

  const closedDay = () => ({
    isOpen: false,
    openTime: "09:00",
    closeTime: "17:00",
  });

  return {
    monday: closedDay(),
    tuesday: openDay("09:00", "19:00"),
    wednesday: openDay("09:00", "19:00"),
    thursday: openDay("09:00", "19:00"),
    friday: openDay("09:00", "19:00"),
    saturday: openDay("09:00", "19:00"),
    sunday: openDay("09:00", "14:00"),
  };
}

/**
 * Sri Lankan public holidays for 2025.
 * These are pre-seeded into the settings on first initialization.
 */
function getSriLankan2025Holidays(): HolidayDate[] {
  return [
    { date: new Date("2025-01-13"), reason: "Duruthu Poya", isRecurring: false },
    { date: new Date("2025-01-15"), reason: "Tamil Thai Pongal", isRecurring: false },
    { date: new Date("2025-02-04"), reason: "Independence Day", isRecurring: true },
    { date: new Date("2025-02-12"), reason: "Navam Poya", isRecurring: false },
    { date: new Date("2025-02-26"), reason: "Maha Shivaratri", isRecurring: false },
    { date: new Date("2025-03-13"), reason: "Medin Poya", isRecurring: false },
    { date: new Date("2025-03-31"), reason: "Id-ul-Fitr (Ramazan Festival)", isRecurring: false },
    { date: new Date("2025-04-18"), reason: "Good Friday", isRecurring: false },
    { date: new Date("2025-04-13"), reason: "Sinhala & Tamil New Year Eve", isRecurring: true },
    { date: new Date("2025-04-14"), reason: "Sinhala & Tamil New Year", isRecurring: true },
    { date: new Date("2025-04-12"), reason: "Bak Poya", isRecurring: false },
    { date: new Date("2025-05-01"), reason: "May Day", isRecurring: true },
    { date: new Date("2025-05-12"), reason: "Vesak Poya", isRecurring: false },
    { date: new Date("2025-05-13"), reason: "Day after Vesak", isRecurring: false },
    { date: new Date("2025-06-07"), reason: "Id-ul-Alha (Hajj Festival)", isRecurring: false },
    { date: new Date("2025-06-10"), reason: "Poson Poya", isRecurring: false },
    { date: new Date("2025-07-10"), reason: "Esala Poya", isRecurring: false },
    { date: new Date("2025-08-08"), reason: "Nikini Poya", isRecurring: false },
    { date: new Date("2025-09-05"), reason: "Milad-un-Nabi (Prophet's Birthday)", isRecurring: false },
    { date: new Date("2025-09-07"), reason: "Binara Poya", isRecurring: false },
    { date: new Date("2025-10-06"), reason: "Vap Poya", isRecurring: false },
    { date: new Date("2025-10-20"), reason: "Deepavali", isRecurring: false },
    { date: new Date("2025-11-05"), reason: "Il Poya", isRecurring: false },
    { date: new Date("2025-12-04"), reason: "Unduvap Poya", isRecurring: false },
    { date: new Date("2025-12-25"), reason: "Christmas Day", isRecurring: true },
  ];
}

/**
 * Default service categories with display ordering.
 */
function getDefaultServiceCategories(): ServiceCategoryConfig[] {
  return [
    { name: "Hair Cut", displayOrder: 1, isActive: true },
    { name: "Hair Color", displayOrder: 2, isActive: true },
    { name: "Hair Treatment", displayOrder: 3, isActive: true },
    { name: "Styling", displayOrder: 4, isActive: true },
    { name: "Beard & Grooming", displayOrder: 5, isActive: true },
    { name: "Bridal Package", displayOrder: 6, isActive: true },
    { name: "Kids", displayOrder: 7, isActive: true },
    { name: "Other", displayOrder: 8, isActive: true },
  ];
}

/**
 * Default booking rules.
 */
function getDefaultBookingRules(): BookingRules {
  return {
    allowSameDayBooking: true,
    requirePhoneVerification: false,
    maxBookingsPerCustomerPerDay: 2,
    autoCancelAfterMinutes: 0,
    allowCancellationByCustomer: true,
    cancellationDeadlineHours: 2,
    bookingConfirmationMode: "auto",
  };
}

/**
 * Default notification settings.
 */
function getDefaultNotifications(): NotificationSettings {
  return {
    whatsappEnabled: false,
    whatsappApiKey: "",
    whatsappNumber: "",
    emailEnabled: false,
    adminEmailAlerts: true,
    adminEmail: "",
    reminderHoursBefore: 2,
    bookingConfirmationTemplate:
      "Dear {customerName}, your appointment for {service} on {date} at {time} has been confirmed. Reference: {reference}. Call us at {phone} for any changes.",
    reminderTemplate:
      "Hi {customerName}, this is a reminder for your {service} appointment tomorrow at {time}. Reference: {reference}. See you soon!",
  };
}

/**
 * Default display settings for Unique Hair Studio.
 */
function getDefaultDisplay(): DisplaySettings {
  return {
    salonName: "Unique Hair Studio",
    tagline: "Where Style Meets Elegance",
    address: "123 Galle Road, Colombo 03, Sri Lanka",
    phone: "+94 11 234 5678",
    email: "info@uniquehairstudio.lk",
    googleMapsUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    heroHeading: "Elevate Your Style",
    heroSubheading:
      "Experience the art of premium hair care at Colombo's most sought-after studio. Where every cut tells a story.",
    announcementBanner: "",
    announcementBannerActive: false,
  };
}

/**
 * Seeds the default settings into MongoDB if not already initialized.
 * This is idempotent — calling it multiple times is safe.
 *
 * @returns The existing or newly created Settings document
 */
export async function seedDefaultSettings(): Promise<ISettings> {
  const existing = await Settings.findOne().lean<ISettings>();

  if (existing?.isInitialized) {
    return existing;
  }

  const defaults = {
    businessHours: getDefaultBusinessHours(),
    slotDurationMinutes: 30,
    bufferBetweenSlots: 10,
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    maxBookingsPerSlot: 2,
    holidayDates: getSriLankan2025Holidays(),
    bookingRules: getDefaultBookingRules(),
    notifications: getDefaultNotifications(),
    display: getDefaultDisplay(),
    serviceCategories: getDefaultServiceCategories(),
    maintenanceMode: false,
    maintenanceMessage:
      "We're currently updating our systems. Please check back shortly or call us directly to book an appointment.",
    isInitialized: true,
    lastUpdatedBy: "system",
  };

  if (existing) {
    const updated = await Settings.findByIdAndUpdate(
      existing._id,
      { $set: { ...defaults } },
      { new: true, lean: true }
    );
    return updated as ISettings;
  }

  const settings = await Settings.create(defaults);
  return settings.toObject() as ISettings;
}
