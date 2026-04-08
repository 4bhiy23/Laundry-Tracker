import mongoose, { Document, Schema } from "mongoose";

export type ClothingStatus = "wardrobe" | "laundry";
export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "innerwear"
  | "accessories"
  | "other";

export interface IClothing extends Document {
  userId: string;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  category: ClothingCategory;
  color?: string;
  status: ClothingStatus;
  expectedReturnDate?: Date;
  isInLaundry: boolean;
  currentLaundryBag?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingSchema = new Schema<IClothing>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    category: {
      type: String,
      enum: ["tops", "bottoms", "dresses", "outerwear", "innerwear", "accessories", "other"],
      default: "other",
    },
    color: { type: String, trim: true },
    status: { type: String, enum: ["wardrobe", "laundry"], default: "wardrobe" },
    expectedReturnDate: { type: Date },
    isInLaundry: { type: Boolean, default: false },
    currentLaundryBag: { type: Schema.Types.ObjectId, ref: "LaundryBag" },
  },
  { timestamps: true }
);

export default mongoose.models.Clothing ||
  mongoose.model<IClothing>("Clothing", ClothingSchema);
