/**
 * Core availability slot generation algorithm for Unique Hair Studio.
 * Generates available time slots for a given date and service,
 * factoring in business hours, holidays, existing bookings,
 * buffer time, concurrent booking limits, and advance notice rules.
 */

import { connectToDatabase } from "@/lib/mongodb";
import Settings, { seedDefaultSettings } from "@/models/Settings";
import Service from "@/models/Service";
import Booking from "@/models/Booking";
import {
  getDayOfWeek,
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  todayInColombo,
  daysFromToday,
  isWithinMinAdvance,
  isPastDate,
} from "@/lib/timezone";
import type { AvailabilityResponse, TimeSlot, ISettings, IService, IBooking } from "@/types";

interface SlotGeneratorInput {
  date: string;
  serviceId: string;
}

/**
 * Generates the full availability response for a given date and service.
 * Implements the complete 12-step algorithm from the specification.
 */
export async function generateAvailableSlots(
  input: SlotGeneratorInput
): Promise<AvailabilityResponse> {
  const { date, serviceId } = input;

  await connectToDatabase();

  // Step 1: Fetch settings (seed if first run)
  let settings = await Settings.findOne().lean<ISettings>();
  if (!settings) {
    settings = await seedDefaultSettings();
  }

  const {
    businessHours,
    slotDurationMinutes,
    bufferBetweenSlots,
    holidayDates,
    bookingRules,
    maxAdvanceBookingDays,
    minAdvanceBookingHours,
    maxBookingsPerSlot,
  } = settings;

  // Step 2: Get day of week in Asia/Colombo timezone
  const dayName = getDayOfWeek(date);
  const dayDisplayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  // Check for past dates
  if (isPastDate(date)) {
    return {
      date,
      dayName: dayDisplayName,
      isOpen: false,
      slots: [],
      totalAvailable: 0,
      reason: "PAST_DATE",
    };
  }

  // Step 3: Check if the day is open
  const dayHours = businessHours[dayName];
  if (!dayHours.isOpen) {
    return {
      date,
      dayName: dayDisplayName,
      isOpen: false,
      slots: [],
      totalAvailable: 0,
      reason: "CLOSED",
    };
  }

  // Step 4: Check if the date is a holiday
  const holiday = holidayDates.find((h) => {
    const holidayDateStr = new Date(h.date).toISOString().split("T")[0];
    return holidayDateStr === date;
  });

  if (holiday) {
    return {
      date,
      dayName: dayDisplayName,
      isOpen: false,
      slots: [],
      totalAvailable: 0,
      reason: "HOLIDAY",
      holidayName: holiday.reason,
    };
  }

  // Step 5: Check if date is beyond max advance booking days
  const daysAhead = daysFromToday(date);
  if (daysAhead > maxAdvanceBookingDays) {
    return {
      date,
      dayName: dayDisplayName,
      isOpen: false,
      slots: [],
      totalAvailable: 0,
      reason: "TOO_FAR",
    };
  }

  // Step 6: Check same-day booking rule
  const today = todayInColombo();
  if (!bookingRules.allowSameDayBooking && date === today) {
    return {
      date,
      dayName: dayDisplayName,
      isOpen: false,
      slots: [],
      totalAvailable: 0,
      reason: "SAME_DAY_DISABLED",
    };
  }

  // Step 7: Fetch the service to get its duration
  const service = await Service.findById(serviceId).lean<IService>();
  if (!service) {
    return {
      date,
      dayName: dayDisplayName,
      isOpen: true,
      openTime: dayHours.openTime,
      closeTime: dayHours.closeTime,
      slots: [],
      totalAvailable: 0,
    };
  }

  const serviceDuration = service.duration;

  // Step 8: Generate all possible time slots
  const openMinutes = timeToMinutes(dayHours.openTime);
  const closeMinutes = timeToMinutes(dayHours.closeTime);
  const lastSlotStart = closeMinutes - serviceDuration;

  const possibleSlots: TimeSlot[] = [];

  for (let time = openMinutes; time <= lastSlotStart; time += slotDurationMinutes) {
    const slotTime = minutesToTime(time);
    const endTime = calculateEndTime(slotTime, serviceDuration);

    possibleSlots.push({
      time: slotTime,
      endTime,
      available: true,
      availableCount: maxBookingsPerSlot,
    });
  }

  // Step 9: Fetch existing bookings for that date (exclude cancelled)
  const dateStart = new Date(`${date}T00:00:00+05:30`);
  const dateEnd = new Date(`${date}T23:59:59+05:30`);

  const existingBookings = await Booking.find({
    date: { $gte: dateStart, $lte: dateEnd },
    status: { $nin: ["Cancelled"] },
  })
    .select("timeSlot endTime serviceId")
    .lean<Pick<IBooking, "timeSlot" | "endTime" | "serviceId">[]>();

  // Step 10: Check conflicts for each slot
  for (const slot of possibleSlots) {
    const slotStartMin = timeToMinutes(slot.time);
    const slotEndWithBuffer = slotStartMin + serviceDuration + bufferBetweenSlots;

    let conflictCount = 0;

    for (const booking of existingBookings) {
      const bookingStart = timeToMinutes(booking.timeSlot);
      const bookingEnd = timeToMinutes(booking.endTime);

      // Check if the proposed slot overlaps with existing booking
      // Overlap: slotStart < bookingEnd AND slotEndWithBuffer > bookingStart
      if (slotStartMin < bookingEnd && slotEndWithBuffer > bookingStart) {
        conflictCount++;
      }
    }

    if (conflictCount >= maxBookingsPerSlot) {
      slot.available = false;
      slot.availableCount = 0;
    } else {
      slot.availableCount = maxBookingsPerSlot - conflictCount;
    }
  }

  // Step 11: Apply minimum advance booking hours filter
  for (const slot of possibleSlots) {
    if (slot.available && isWithinMinAdvance(date, slot.time, minAdvanceBookingHours)) {
      slot.available = false;
      slot.availableCount = 0;
    }
  }

  // Step 12: Return the response
  const totalAvailable = possibleSlots.filter((s) => s.available).length;

  return {
    date,
    dayName: dayDisplayName,
    isOpen: true,
    openTime: dayHours.openTime,
    closeTime: dayHours.closeTime,
    slots: possibleSlots,
    totalAvailable,
  };
}

/**
 * Checks if a specific slot is available for booking.
 * Used as a final check before confirming a booking to prevent race conditions.
 */
export async function isSlotAvailable(
  date: string,
  timeSlot: string,
  serviceId: string
): Promise<boolean> {
  const availability = await generateAvailableSlots({ date, serviceId });

  if (!availability.isOpen) {
    return false;
  }

  const slot = availability.slots.find((s) => s.time === timeSlot);
  return slot?.available ?? false;
}
