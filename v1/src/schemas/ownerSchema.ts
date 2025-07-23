import { Schema, model } from "mongoose";
import { IOwner } from "../entities/IOwner";
import bcrypt from "bcryptjs";
import AppError from "../errors/appError";
import { UserRole } from "../utils/JWT";

const OwnerSchema: Schema<IOwner> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    stripe_customer_id: { type: String, required: false },
    refreshToken: { type: String, required: false },
    image: { type: String, required: false },
    company: {
      companyName: String,
      companyId: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Owner,
    },
    subscription: {
      type: {
        name: String,
        status: String,
        validity: String,
        stripe_subscription_id: String,
        subscription_id: String,
        next_invoice: Date,
        cancel_at: Date,
        canceled_at: Date,
        created: Date,
        spec: Object,
        amount: String,
        expires_at: Date,
        invoice: String,
        points: String,
        upgrade: Boolean,
      },
    },
    invoices: {
      type: Array,
      required: false,
    },
    bio: { type: String, required: false },
  },
  { timestamps: true }
);

OwnerSchema.pre<IOwner>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error(error);
    next(new AppError("Internal server error", 500));
  }
});

OwnerSchema.pre<any>("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;

  if (update && update.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    } catch (error) {
      console.error(error);
      next(new AppError("Internal server error", 500));
    }
  }
  next();
});

OwnerSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Owner = model<IOwner>("Owner", OwnerSchema);
