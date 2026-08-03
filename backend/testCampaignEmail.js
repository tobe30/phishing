import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import Campaign from "./models/Campaign.js";
import "./models/Template.js";
import "./models/Employee.js";
import { sendCampaignEmail } from "./services/campaignEmail.service.js";

try {
  await connectDB();

  const campaign = await Campaign.findOne({
    "recipients.0": { $exists: true },//
  })
    .populate("template")
    .populate("recipients.employee");

  if (!campaign) {
    throw new Error("Create a campaign with at least one recipient first");
  }

  const recipient = campaign.recipients[0];

  const result = await sendCampaignEmail({
    employee: recipient.employee,
    template: campaign.template,
    trackingToken: recipient.trackingToken,
  });

  console.log("Campaign email sent:", result);
} catch (error) {
  console.error("Unable to send campaign email:", error.message);
} finally {
  await mongoose.disconnect();
}
