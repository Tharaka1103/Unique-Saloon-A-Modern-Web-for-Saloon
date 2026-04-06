import mongoose, { Schema, type Model } from "mongoose";
import type { IBooking, BookingStatus } from "@/types";

const BOOKING_STATUS_VALUES: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "No-Show",
];

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: [true, "Booking reference is required"],
      unique: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be under 100 characters"],
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
      match: [/^07[0-9]{8}$/, "Enter a valid Sri Lankan phone number"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service selection is required"],
    },
    stylistPreference: {
      type: String,
      trim: true,
      default: "No Preference",
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      match: [/^\d{2}:\d{2}$/, "Time slot must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: BOOKING_STATUS_VALUES,
        message: "{VALUE} is not a valid booking status",
      },
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes must be under 500 characters"],
      default: "",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Admin notes must be under 500 characters"],
      default: "",
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: [300, "Cancel reason must be under 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ date: 1, timeSlot: 1, status: 1 });
bookingSchema.index({ customerPhone: 1, date: 1 });
bookingSchema.index({ status: 1, date: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ serviceId: 1, date: 1 });

/**
 * Generates the next booking reference in the format UHS-YYYY-XXXX.
 * Finds the highest existing reference for the current year and increments.
 */
export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `UHS-${year}-`;

  const lastBooking = await (
    mongoose.models.Booking as Model<IBooking>
  )
    .findOne(
      { bookingReference: { $regex: `^${prefix}` } },
      { bookingReference: 1 },
      { sort: { bookingReference: -1 } }
    )
    .lean();

  let nextNumber = 1;
  if (lastBooking?.bookingReference) {
    const lastNumber = parseInt(lastBooking.bookingReference.replace(prefix, ""), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

const Booking: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
