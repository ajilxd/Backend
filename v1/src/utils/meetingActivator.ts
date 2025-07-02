import cron from "node-cron";
import { logger } from "./logger";
import { Meeting } from "../schemas/meetingSchema";

cron.schedule("*/2 * * * *", async () => {
  try {
    // console.log("Tick tick - Checking for meetings to activate");

    const now = new Date();

    const meetingsToActivate = await Meeting.find({
      scheduledDate: { $lte: now },
      status: "upcoming",
    });

    for (const meeting of meetingsToActivate) {
      await Meeting.findByIdAndUpdate(meeting._id, { status: "active" });
      logger.info(`Meeting ${meeting._id} activated.`);
    }
  } catch (err) {
    console.error("❌ Cron job failed", err);
    logger.error("Cron job failed: " + err);
  }
});
