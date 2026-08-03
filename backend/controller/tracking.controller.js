import Campaign from "../models/Campaign.js";
import Employee from "../models/Employee.js";

// Record when an employee opens a simulation email
export const trackOpen = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const campaign = await Campaign.findOne({
      "recipients.trackingToken": trackingToken,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Tracking link not found" });
    }

    if (campaign.trackingOptions?.trackOpens === false) {
      return res.status(200).json({
        success: true,
        message: "Open tracking is disabled for this campaign",
      });
    }

    const recipient = campaign.recipients.find(
      (item) => item.trackingToken === trackingToken,
    );

    if (!recipient.openedAt) {
      recipient.openedAt = new Date();
      await campaign.save();
    }

    return res.status(200).json({
      success: true,
      message: "Email open recorded",
    });
  } catch (error) {
    console.error("Error tracking email open:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Record when an employee clicks the simulation link
export const trackClick = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const campaign = await Campaign.findOne({
      "recipients.trackingToken": trackingToken,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Tracking link not found" });
    }

    const recipient = campaign.recipients.find(
      (item) => item.trackingToken === trackingToken,
    );

    const clickTime = new Date();
    const trackOpens = campaign.trackingOptions?.trackOpens !== false;
    const trackClicks = campaign.trackingOptions?.trackClicks !== false;
    const autoTraining = campaign.trackingOptions?.autoTraining !== false;
    const trainingAlreadyAssigned = Boolean(
      recipient.trainingAssignedAt || recipient.clickedAt,
    );
    let employee;
    let campaignChanged = false;

    if (trackClicks && !recipient.clickedAt) {
      if (trackOpens && !recipient.openedAt) {
        recipient.openedAt = clickTime;
      }
      recipient.clickedAt = clickTime;
      campaignChanged = true;

      employee = await Employee.findById(recipient.employee);

      if (employee) {
        employee.lastSimulation = "CLICKED";
        employee.risk = Math.min(employee.risk + 20, 100);
      }
    }

    if (autoTraining && !trainingAlreadyAssigned) {
      recipient.trainingAssignedAt = clickTime;
      campaignChanged = true;
      employee = employee || (await Employee.findById(recipient.employee));

      if (employee) {
        employee.trainingTotal += 1;
      }
    }

    if (employee) await employee.save();
    if (campaignChanged) {
      await campaign.save();
    }

    return res.status(200).json({
      success: true,
      message: trackClicks
        ? "Email click recorded"
        : "Click tracking is disabled for this campaign",
      trainingToken: trackingToken,
      autoTraining,
    });
  } catch (error) {
    console.error("Error tracking email click:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Record only that the fake form was submitted
// Passwords and form values must never be stored
export const trackSubmission = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const campaign = await Campaign.findOne({
      "recipients.trackingToken": trackingToken,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Tracking link not found" });
    }

    const recipient = campaign.recipients.find(
      (item) => item.trackingToken === trackingToken,
    );

    if (!recipient.submittedAt) {
      recipient.submittedAt = new Date();

      const employee = await Employee.findById(recipient.employee);

      if (employee) {
        employee.lastSimulation = "SUBMITTED";
        employee.risk = Math.min(employee.risk + 30, 100);
        await employee.save();
      }

      await campaign.save();
    }

    return res.status(200).json({
      success: true,
      message: "Submission event recorded",
    });
  } catch (error) {
    console.error("Error tracking submission:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Record when an employee reports the simulation email
export const trackReport = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const campaign = await Campaign.findOne({
      "recipients.trackingToken": trackingToken,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Tracking link not found" });
    }

    const recipient = campaign.recipients.find(
      (item) => item.trackingToken === trackingToken,
    );

    if (!recipient.reportedAt) {
      recipient.reportedAt = new Date();

      const employee = await Employee.findById(recipient.employee);

      if (employee) {
        employee.lastSimulation = "REPORTED";
        employee.risk = Math.max(employee.risk - 10, 0);
        await employee.save();
      }

      await campaign.save();
    }

    return res.status(200).json({
      success: true,
      message: "Email report recorded",
    });
  } catch (error) {
    console.error("Error tracking email report:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
