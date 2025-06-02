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
    company:{
      companyName:String,
      companyId:String
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Owner,
    },
    subscription: {
      type: {
        name: { type: String, required: false },
        status: { type: String, required: false },
        validity: { type: String, required: false },
        stripe_subscription_id: { type: String, required: false },
        subscription_id: { type: String, required: false },
        next_invoice: { type: Date, required: false },
        cancel_at: { type: Date, required: false },
        canceled_at: { type: Date, required: false },
        created: { type: Date, required: false },
        spec: { type: Object, required: false },
        amount: { type: String, required: false },
        expires_at: { type: Date, required: false },
        invoice: { type: String, required: false },
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
