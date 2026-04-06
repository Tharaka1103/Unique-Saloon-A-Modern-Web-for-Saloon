import mongoose, { Schema, type Model } from "mongoose";
import type { IService, ServiceCategory } from "@/types";

// Categories are dynamic based on Settings model, so we don't hardcode them here anymore.

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minlength: [2, "Service name must be at least 2 characters"],
      maxlength: [100, "Service name must be under 100 characters"],
    },
    nameLocalized: {
      type: String,
      trim: true,
      maxlength: [100, "Localized name must be under 100 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [1_000_000, "Price cannot exceed 1,000,000"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [15, "Duration must be at least 15 minutes"],
      max: [480, "Duration cannot exceed 8 hours"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be under 500 characters"],
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 999,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ isActive: 1, isFeatured: 1, displayOrder: 1 });
serviceSchema.index({ displayOrder: 1 });

const Service: Model<IService> =
  mongoose.models.Service ?? mongoose.model<IService>("Service", serviceSchema);

export default Service;
