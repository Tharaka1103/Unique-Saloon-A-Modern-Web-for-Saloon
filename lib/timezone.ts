/**
 * Asia/Colombo (UTC+5:30) timezone utilities for the Unique Hair Studio.
 * All date/time logic must use these helpers to ensure consistent
 * timezone handling throughout the application.
 */

const TIMEZONE = "Asia/Colombo" as const;
const LOCALE = "en-LK" as const;

/**
 * Returns the current date and time in Asia/Colombo timezone.
 */
export function nowInColombo(): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "0";

  return new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+05:30`
  );
}

/**
 * Returns the current time in Asia/Colombo as hours and minutes.
 */
export function currentColomboTime(): { hours: number; minutes: number } {
  const now = new Date();
  const colomboStr = now.toLocaleString("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const [hours, minutes] = colomboStr.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Returns the current date string in Colombo timezone (YYYY-MM-DD).
 */
export function todayInColombo(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/**
 * Converts a YYYY-MM-DD date string to the day of week name (lowercase).
 * Uses Asia/Colombo timezone for conversion.
 */
export function getDayOfWeek(
  dateStr: string
): "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" {
  const date = new Date(`${dateStr}T12:00:00+05:30`);
  const dayName = date
    .toLocaleDateString("en-US", { weekday: "long", timeZone: TIMEZONE })
    .toLowerCase();

  return dayName as
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

/**
 * Formats a date for public display in Sri Lankan format.
 * Example: "Monday, 15 January 2025"
 */
export function formatDatePublic(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  });
}

/**
 * Formats a date for admin display.
 * Example: "15 Jan 2025"
 */
export function formatDateAdmin(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: TIMEZONE,
  });
}

/**
 * Formats a 24-hour time string to 12-hour format for public display.
 * Example: "09:00" → "9:00 AM", "14:30" → "2:30 PM"
 */
export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Formats a monetary value as Sri Lankan Rupees.
 * Example: 1500 → "Rs. 1,500"
 */
export function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

/**
 * Calculates the end time given a start time (HH:MM) and duration in minutes.
 * Example: calculateEndTime("09:00", 60) → "10:00"
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

/**
 * Converts a time string (HH:MM) to total minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts total minutes since midnight to a time string (HH:MM).
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Checks if a date string (YYYY-MM-DD) is today in Colombo timezone.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayInColombo();
}

/**
 * Checks if a date string (YYYY-MM-DD) is in the past relative to Colombo timezone.
 */
export function isPastDate(dateStr: string): boolean {
  return dateStr < todayInColombo();
}

/**
 * Calculates the number of days between today (Colombo) and a date string.
 * Positive = future, negative = past.
 */
export function daysFromToday(dateStr: string): number {
  const today = new Date(`${todayInColombo()}T00:00:00+05:30`);
  const target = new Date(`${dateStr}T00:00:00+05:30`);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Gets the current total minutes since midnight in Colombo timezone.
 */
export function currentColomboMinutes(): number {
  const { hours, minutes } = currentColomboTime();
  return hours * 60 + minutes;
}

/**
 * Checks whether a given slot time on a given date is within the
 * minimum advance booking hours threshold from now (Colombo time).
 */
export function isWithinMinAdvance(dateStr: string, slotTime: string, minHours: number): boolean {
  const today = todayInColombo();

  if (dateStr > today) {
    const daysDiff = daysFromToday(dateStr);
    if (daysDiff * 24 > minHours) {
      return false;
    }
  }

  if (dateStr < today) {
    return true;
  }

  const slotMinutes = timeToMinutes(slotTime);
  const currentMinutes = currentColomboMinutes();
  const thresholdMinutes = currentMinutes + minHours * 60;

  return slotMinutes < thresholdMinutes;
}
