import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";

// Get the overall report for all campaigns
export const getReports = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    let totalRecipients = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalSubmitted = 0;
    let totalReported = 0;
    let totalTrainingCompleted = 0;

    const campaignReports = campaigns.map((campaign) => {
      const recipients = campaign.recipients;
      const opened = recipients.filter((item) => item.openedAt).length;
      const clicked = recipients.filter((item) => item.clickedAt).length;
      const submitted = recipients.filter((item) => item.submittedAt).length;
      const reported = recipients.filter((item) => item.reportedAt).length;
      const trainingCompleted = recipients.filter(
        (item) => item.trainingCompletedAt,
      ).length;

      totalRecipients += recipients.length;
      totalOpened += opened;
      totalClicked += clicked;
      totalSubmitted += submitted;
      totalReported += reported;
      totalTrainingCompleted += trainingCompleted;

      return {
        id: campaign._id,
        name: campaign.name,
        date: campaign.launchedAt || campaign.createdAt,
        status: campaign.status,
        recipients: recipients.length,
        opened,
        clicked,
        submitted,
        reported,
        trainingCompleted,
        openRate:
          recipients.length === 0
            ? 0
            : Number(((opened / recipients.length) * 100).toFixed(1)),
        clickRate:
          recipients.length === 0
            ? 0
            : Number(((clicked / recipients.length) * 100).toFixed(1)),
        reportRate:
          recipients.length === 0
            ? 0
            : Number(((reported / recipients.length) * 100).toFixed(1)),
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        campaigns: campaigns.length,
        recipients: totalRecipients,
        opened: totalOpened,
        clicked: totalClicked,
        submitted: totalSubmitted,
        reported: totalReported,
        trainingCompleted: totalTrainingCompleted,
        clickRate:
          totalRecipients === 0
            ? 0
            : Number(((totalClicked / totalRecipients) * 100).toFixed(1)),
        reportRate:
          totalRecipients === 0
            ? 0
            : Number(((totalReported / totalRecipients) * 100).toFixed(1)),
      },
      campaigns: campaignReports,
    });
  } catch (error) {
    console.error("Error getting reports:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get the report for one campaign
export const getCampaignReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(id)
      .populate("template", "name category subject")
      .populate("recipients.employee", "name email department risk");

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const total = campaign.recipients.length;
    const opened = campaign.recipients.filter((item) => item.openedAt).length;
    const clicked = campaign.recipients.filter((item) => item.clickedAt).length;
    const submitted = campaign.recipients.filter(
      (item) => item.submittedAt,
    ).length;
    const reported = campaign.recipients.filter(
      (item) => item.reportedAt,
    ).length;
    const trainingCompleted = campaign.recipients.filter(
      (item) => item.trainingCompletedAt,
    ).length;

    return res.status(200).json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        status: campaign.status,
        template: campaign.template,
        targetGroup: campaign.targetGroup,
        launchedAt: campaign.launchedAt,
      },
      results: {
        total,
        opened,
        clicked,
        submitted,
        reported,
        trainingCompleted,
        openRate:
          total === 0 ? 0 : Number(((opened / total) * 100).toFixed(1)),
        clickRate:
          total === 0 ? 0 : Number(((clicked / total) * 100).toFixed(1)),
        reportRate:
          total === 0 ? 0 : Number(((reported / total) * 100).toFixed(1)),
      },
      recipients: campaign.recipients,
    });
  } catch (error) {
    console.error("Error getting campaign report:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
