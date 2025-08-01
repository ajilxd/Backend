import { Request, Response } from "express";
import { stripeInstance } from "../index";
import config from "../config";
import { Stripe } from "stripe";

import subscriberService from "../services/implementation/SubscriptionService";
import ownerService from "../services/implementation/OwnerService";
import { sendResponse } from "../utils/sendResponse";

import { logger } from "../utils/logger";
import AppError from "../errors/appError";

import OwnerRepository from "../repositories/implementations/OwnerRepository";
import TransactionService from "../services/implementation/TransactionService";
import OwnerService from "../services/implementation/OwnerService";
import SubscriberService from "../services/implementation/SubscriberService";
import InvoiceRepository from "../repositories/implementations/InvoiceRepository";
import InvoiceService from "../services/implementation/InvoiceService";
const endpointSecret = config.STRIPE_WEBHOOK_SECRET_KEY;

export const handleWebhook = async (
  req: Request | any,
  res: Response
): Promise<any> => {
  const rawBody = req.rawBody;
  const sig = req.headers["stripe-signature"] as string;
  if (!endpointSecret) {
    logger.error("Webhook secret key is not defined in config.");
    return sendResponse(
      res,
      500,
      "Webhook secret key is not defined in config."
    );
  }

  let event: Stripe.Event;

  try {
    if (!sig) {
      throw new Error("Missing Stripe signature header.");
    }

    event = stripeInstance.webhooks.constructEvent(
      rawBody,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    logger.error("Webhook signature verification failed", err.message);
    return sendResponse(res, 500, "Webhook signature verification failed");
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      logger.info("PaymentIntent was successful!");
      break;

    case "customer.created":
      const customer = event.data.object as Stripe.Customer;

      logger.info("Invoice payment failed!", customer);
      break;

    case "product.created":
      const product = event.data.object as Stripe.Product;

      logger.info("Product created!", product);
      break;

    case "product.updated":
      const product2 = event.data.object as Stripe.Product;

      logger.info("Product updated!", product2);
      break;

    case "price.created":
      const price = event.data.object as Stripe.Price;

      logger.info("Price created!", price);
      break;

    case "price.updated":
      const price2 = event.data.object as Stripe.Price;

      logger.info("price updated", price2);
      break;

    case "plan.created":
      const plan = event.data.object as Stripe.Plan;

      logger.info("Plan created!");
      break;

    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const {
        subscriptionId,
        brandName,
        monthly,
        ownerId,
        billingCycleType,
        yearly,
        amount,
        points,
        upgrade,
      } = checkoutSession.metadata as any;
      const isYearly = yearly === "true";
      const { subscription, created } = checkoutSession as any;
      const date = new Date(created * 1000);
      const formattedCreatedDate = date.toLocaleString();
      console.log("Checkout session completed!", checkoutSession);
      console.log("metadat from checkout session", checkoutSession.metadata);
      const subscriptionData = await subscriberService.findSubscriptionById(
        subscriptionId
      );
      if (!subscriptionData) {
        console.log(checkoutSession.metadata);
        throw new AppError("failed to create the subscription", 500);
      }
      const subobj = {
        ...subscriptionData.toObject(),
        status: true,
        subscription_id: subscriptionId,
        stripe_subscription_id: subscription,
        created: formattedCreatedDate,
        spec: subscriptionData.toObject().features,
        validity: isYearly ? "year" : "month",
        amount: +amount,
        expires_at: isYearly
          ? new Date().setFullYear(new Date().getFullYear() + 1)
          : new Date().setMonth(new Date().getMonth() + 1),
        invoice: checkoutSession.invoice,
        points,
        upgrade: upgrade === "true" ? true : false,
      };

      const ownerDb = await ownerService.fetchOwnerById(ownerId);

      //deactivating the previous subs

      if (upgrade === "true") {
        const prevSubscription = await SubscriberService.findByCustomerId(
          ownerId
        );
        if (prevSubscription) {
          await SubscriberService.deactivateSubscriber(ownerId);
        }
      }

      if (subscriptionData && ownerDb) {
        await SubscriberService.createSubscriber({
          customerId: ownerId,
          customerName: ownerDb.name,
          name: subscriptionData.name,
          status: "active",
          subscriptionId: subscriptionId,
          features: subscriptionData.toObject().features,
          billingCycle: isYearly ? "year" : "month",
          amount: +amount,
          expiresAt: isYearly
            ? new Date().setFullYear(new Date().getFullYear() + 1)
            : (new Date().setMonth(new Date().getMonth() + 1) as any),
          points,
          company: ownerDb.company.companyName,
        });
        const owner = await ownerService.updateOwner(ownerId, {
          subscription: subobj,
        });
        if (owner) {
          const transaction = await TransactionService.create({
            customerId: "" + ownerId,
            customerName: owner.name,
            subscriptionName: subscriptionData.name,
            subscribedDate: new Date(),
            amount: +amount,
            expiryDate: isYearly
              ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              : new Date(new Date().setMonth(new Date().getMonth() + 1)),
            companyName: owner.company.companyName,
            status: "success",
            transactionType: "initial",
            stripeCustomerId: owner.stripe_customer_id,
            stripeSubsriptionId: owner.subscription?.stripe_subscription_id,
            billingCycle: yearly ? "year" : "month",
            subscriptionId: "" + subscriptionData._id,
            isInitial: true,
            upgrade: upgrade === "true" ? true : false,
          });
          logger.info("Owner subscription updated successfully!", owner);
          if (transaction) {
            logger.info("Transaction has been recorded");
          }
        }
      }
      console.log(checkoutSession);
      break;

    case "invoice.created":
      const invoiceObject = event.data.object as Stripe.Invoice;

      try {
        const subscriptionData = await stripeInstance.subscriptions.retrieve(
          invoiceObject.subscription as string
        );

        const subscriptionDB = await subscriberService.findSubscriptionById(
          subscriptionData.metadata.subscriptionId
        );
        const { total, customer_email, id } = invoiceObject;

        const ownerData = await OwnerRepository.findByEmail(
          "" + customer_email
        );

        if (!ownerData) {
          throw new Error("No owner data found with this customer id");
        }

        await InvoiceService.createInvoice({
          amount: +total,
          customerEmail: ownerData.email,
          customerId: "" + ownerData._id,
          customerName: ownerData.name,
          currency: "inr",
          subscriptionId: subscriptionData.id,
          subscriptionName: subscriptionDB.name,
          invoiceId: id,
        });

        logger.info(`Succesfully created invoice for ` + ownerData.name);
        if (
          invoiceObject.billing_reason === "subscription_create" ||
          !ownerData ||
          !subscriptionDB
        ) {
          break;
        }

        const transaction = await TransactionService.create({
          customerId: "" + ownerId,
          customerName: ownerData.name,
          subscriptionName: subscriptionDB.name,
          subscribedDate: new Date(),
          amount: +subscriptionData.metadata.amount,
          expiryDate:
            subscriptionData.metadata.yearly === "true"
              ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              : new Date(new Date().setMonth(new Date().getMonth() + 1)),
          companyName: ownerData.company.companyName,
          status: "success",
          transactionType: "initial",
          stripeCustomerId: ownerData.stripe_customer_id,
          stripeSubsriptionId: ownerData.subscription?.stripe_subscription_id,
          billingCycle:
            subscriptionData.metadata.yearly === "true" ? "year" : "month",
          subscriptionId: "" + subscriptionDB._id,
          isInitial: false,
          upgrade: false,
        });
        if (transaction) {
          logger.info(
            `Transaction has been recorded succesfully for the user ` +
              ownerData.name
          );
        }
      } catch (error) {
        console.error("Error handling invoice.created event:", error);
      }

      break;

    case "payment_intent.payment_failed":
      const paymentIntentData = event.data.object as Stripe.PaymentIntent;
      let type = "initial";
      let expiryDate = null;
      let subscribedDate = null;

      if (typeof paymentIntentData.invoice === "string") {
        const invoice = await stripeInstance.invoices.retrieve(
          paymentIntentData.invoice
        );
        const subscriptionId = invoice.subscription;
        if (typeof subscriptionId === "string") {
          const subscription = await stripeInstance.subscriptions.retrieve(
            subscriptionId
          );

          const ownerData = await OwnerService.fetchOwnerById(
            subscription.metadata.ownerId
          );
          const subscriptionData = await subscriberService.findSubscriptionById(
            subscription.metadata.subscriptionId
          );
          if (ownerData && subscriptionData) {
            await TransactionService.create({
              status: "fail",
              customerId: "" + ownerData._id,
              customerName: ownerData.name,
              subscriptionName: subscriptionData.name,
              subscribedDate: subscribedDate || null,
              expiryDate: expiryDate || null,
              amount: +subscription.metadata.amount,
              companyName: ownerData.company.companyName,
              transactionType: type,
              errorMessage: paymentIntentData.last_payment_error?.message,
              stripeCustomerId: ownerData.stripe_customer_id,
              stripeSubsriptionId:
                ownerData.subscription?.stripe_subscription_id,
              billingCycle:
                subscription.metadata.yearly === "true" ? "year" : "month",
              subscriptionId: "" + subscriptionData._id,
              isInitial: true,
              upgrade: false,
            });
          }
        }
      } else {
        console.log("No invoice linked to PaymentIntent");
      }
      break;

    case "invoice.payment_failed":
      console.log(`this is an event object`, event.data.object);
      const invoiceData = event.data.object as Stripe.Invoice;
      if (invoiceData.billing_reason === "subscription_create") {
        break;
      }
      if (typeof invoiceData.subscription === "string") {
        const subscription = await stripeInstance.subscriptions.retrieve(
          invoiceData.subscription
        );
        const { ownerId, subscriptionId } = subscription.metadata;
        const ownerData = await OwnerService.fetchOwnerById(ownerId);
        const subscriptionData = await subscriberService.findSubscriptionById(
          subscriptionId
        );
        if (ownerData && subscriptionData) {
          await TransactionService.create({
            status: "fail",
            customerId: "" + ownerData._id,
            customerName: ownerData.name,
            subscriptionName: subscriptionData.name,
            subscribedDate: ownerData.subscription?.created || null,
            expiryDate: ownerData.subscription?.expires_at || null,
            amount: +subscription.metadata.amount,
            companyName: ownerData.company.companyName,
            transactionType: "recurring",
            errorMessage: "failed to pay the recurring bill",
            billingCycle:
              subscription.metadata.yearly === "true" ? "year" : "month",
            subscriptionId: "" + subscriptionData._id,
            isInitial: false,
            upgrade: false,
          });
        }
      }

    default:
      logger.error(`Unhandled event type ${event.type}`);
  }

  return sendResponse(res, 200, "ok");
};
