import type { Types } from "mongoose";

/* ═══════════════════════════════════════════════════════════════
   SERVICE TYPES
   ═══════════════════════════════════════════════════════════════ */

// ServiceCategories are dynamic now, so we use string
export type ServiceCategory = string;

export const SERVICE_DURATIONS = [30, 45, 60, 90, 120] as const;
export type ServiceDuration = (typeof SERVICE_DURATIONS)[number];

export interface IService {
  _id: Types.ObjectId;
  name: string;
  nameLocalized?: string;
  price: number;
  duration: number;
  category: ServiceCategory;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFormData {
  name: string;
  nameLocalized?: string;
  price: number;
  duration: number;
  category: ServiceCategory;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

/* ═══════════════════════════════════════════════════════════════
   BOOKING TYPES
   ═══════════════════════════════════════════════════════════════ */

export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "No-Show",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface IBooking {
  _id: Types.ObjectId;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: Types.ObjectId;
  stylistPreference: string;
  date: Date;
  timeSlot: string;
  endTime: string;
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  adminNotes?: string;
  notificationSent: boolean;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  stylistPreference: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export interface BookingWithService extends Omit<IBooking, "serviceId"> {
  serviceId: IService;
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface HolidayDate {
  date: Date;
  reason: string;
  isRecurring: boolean;
}

export interface BookingRules {
  allowSameDayBooking: boolean;
  requirePhoneVerification: boolean;
  maxBookingsPerCustomerPerDay: number;
  autoCancelAfterMinutes: number;
  allowCancellationByCustomer: boolean;
  cancellationDeadlineHours: number;
  bookingConfirmationMode: "auto" | "manual";
}

export interface NotificationSettings {
  whatsappEnabled: boolean;
  whatsappApiKey: string;
  whatsappNumber: string;
  emailEnabled: boolean;
  adminEmailAlerts: boolean;
  adminEmail: string;
  reminderHoursBefore: number;
  bookingConfirmationTemplate: string;
  reminderTemplate: string;
}

export interface DisplaySettings {
  salonName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  heroHeading: string;
  heroSubheading: string;
  announcementBanner: string;
  announcementBannerActive: boolean;
}

export interface ServiceCategoryConfig {
  name: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ISettings {
  _id: Types.ObjectId;
  businessHours: BusinessHours;
  slotDurationMinutes: number;
  bufferBetweenSlots: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  maxBookingsPerSlot: number;
  holidayDates: HolidayDate[];
  bookingRules: BookingRules;
  notifications: NotificationSettings;
  display: DisplaySettings;
  serviceCategories: ServiceCategoryConfig[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
  isInitialized: boolean;
  lastUpdatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ═══════════════════════════════════════════════════════════════
   AVAILABILITY TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  availableCount: number;
}

export type UnavailableReason =
  | "CLOSED"
  | "HOLIDAY"
  | "TOO_FAR"
  | "SAME_DAY_DISABLED"
  | "PAST_DATE";

export interface AvailabilityResponse {
  date: string;
  dayName: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  slots: TimeSlot[];
  totalAvailable: number;
  reason?: UnavailableReason;
  holidayName?: string;
}

/* ═══════════════════════════════════════════════════════════════
   API RESPONSE TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD / STATS TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface DashboardStats {
  todaysAppointments: number;
  monthlyRevenue: number;
  pendingConfirmations: number;
  totalActiveServices: number;
}

export interface BookingTrendData {
  date: string;
  count: number;
}

export interface RevenueData {
  week: string;
  revenue: number;
}

export interface StatusDistribution {
  status: BookingStatus;
  count: number;
}
