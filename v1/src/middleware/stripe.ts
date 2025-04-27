import Stripe from "stripe";
import config from "../config";
export const initializeStripe = () => {
  if (!config.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }
  return new Stripe(config.STRIPE_SECRET_KEY);
};
