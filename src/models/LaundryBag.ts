import mongoose, { Document, Schema } from "mongoose";

export interface ILaundryBag extends Document {
  takenDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  status: "pending" | "returned" | "late";
  clothes: mongoose.Types.ObjectId[];
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LaundryBagSchema = new Schema<ILaundryBag>(
  {
    takenDate: { type: Date, required: true, index: true },
    expectedReturnDate: { type: Date, required: true },
    actualReturnDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "returned", "late"],
      default: "pending",
    },
    clothes: [{ type: Schema.Types.ObjectId, ref: "Clothing" }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// Pre-save middleware to auto-calculate expectedReturnDate if not provided
LaundryBagSchema.pre("validate", function () {
  if (this.takenDate && !this.expectedReturnDate) {
    const expected = new Date(this.takenDate);
    expected.setDate(expected.getDate() + 2);
    this.expectedReturnDate = expected;
  }
});

// Pre-save middleware to determine status
LaundryBagSchema.pre("save", function () {
  if (!this.actualReturnDate) {
    this.status = "pending";
  } else {
    if (this.actualReturnDate <= this.expectedReturnDate) {
      this.status = "returned";
    } else {
      this.status = "late";
    }
  }
});

export default mongoose.models.LaundryBag ||
  mongoose.model<ILaundryBag>("LaundryBag", LaundryBagSchema);
