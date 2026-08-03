import mongoose from "mongoose";
import { randomUUID } from "crypto";
import Campaign from "../models/Campaign.js";
import Employee from "../models/Employee.js";
import Template from "../models/Template.js";
import { sendCampaignEmail } from "../services/campaignEmail.service.js";

// Create a campaign
export const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      templateId,
      subject,
      senderName,
      senderEmail,
      groupId,
      authorized,
    } = req.body;

    if (
      !name ||
      !templateId ||
      !subject ||
      !senderName ||
      !senderEmail ||
      !groupId
    ) {
      return res.status(400).json({
        message:
          "Name, template, subject, sender details, and target group are required",
      });
    }

    if (!mongoose.isValidObjectId(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (authorized !== true) {
      return res.status(400).json({
        message: "You must confirm that this campaign is authorized",
      });
    }

    let targetEmployees = [];

    if (groupId === "all") {
      targetEmployees = await Employee.find();
    } else if (groupId === "new-hires") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      targetEmployees = await Employee.find({
        createdAt: { $gte: thirtyDaysAgo },
      });
    } else {
      const departmentName =
        groupId.charAt(0).toUpperCase() + groupId.slice(1);

      targetEmployees = await Employee.find({
        department: departmentName,
      });
    }

    if (targetEmployees.length === 0) {
      return res.status(400).json({
        message: "No employees found in the selected target group",
      });
    }

    const recipients = targetEmployees.map((employee) => ({
      employee: employee._id,
      trackingToken: randomUUID(),
      sentAt: null,
    }));

    const launchedAt = new Date();
    const trackingOptions = {
      trackOpens: req.user.campaignDefaults?.trackOpens ?? true,
      trackClicks: req.user.campaignDefaults?.trackClicks ?? true,
      autoTraining: req.user.campaignDefaults?.autoTraining ?? true,
    };

    const campaign = await Campaign.create({
      name,
      description,
      template: templateId,
      subject,
      senderName,
      senderEmail,
      targetGroup: groupId,
      status: "RUNNING",
      authorized,
      trackingOptions,
      recipients,
      launchedAt,
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    const campaignTemplate = {
      subject,
      senderName,
      body: template.body,
      callToAction: template.callToAction,
    };

    for (let index = 0; index < targetEmployees.length; index += 1) {
      const employee = targetEmployees[index];
      const recipient = campaign.recipients[index];

      try {
        const emailResult = await sendCampaignEmail({
          employee,
          template: campaignTemplate,
          trackingToken: recipient.trackingToken,
          trackingOptions,
        });

        if (emailResult.accepted.length > 0) {
          recipient.sentAt = new Date();
          emailsSent += 1;
        } else {
          emailsFailed += 1;
        }
      } catch (emailError) {
        emailsFailed += 1;
        console.error(
          `Unable to send campaign email to ${employee.email}:`,
          emailError.message,
        );
      }
    }

    await campaign.save();

    return res.status(201).json({
      success: true,
      message: "Campaign created and emails processed",
      emailSummary: {
        sent: emailsSent,
        failed: emailsFailed,
      },
      campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("template", "name category subject")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error("Error getting campaigns:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get one campaign
export const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(id)
      .populate("template", "name category subject senderName senderEmail body callToAction")
      .populate(
        "recipients.employee",
        "name email department risk trainingDone trainingTotal",
      );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error getting campaign:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark a running campaign as completed
export const completeCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== "COMPLETED") {
      campaign.status = "COMPLETED";
      campaign.completedAt = new Date();
      await campaign.save();
    }

    return res.status(200).json({
      success: true,
      message: "Campaign marked as completed",
      campaign,
    });
  } catch (error) {
    console.error("Error completing campaign:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
