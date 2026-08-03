import Campaign from "../models/Campaign.js";
import Employee from "../models/Employee.js";

// Mark an employee's awareness training as completed
export const completeTraining = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const campaign = await Campaign.findOne({
      "recipients.trackingToken": trackingToken,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Training link not found" });
    }

    const recipient = campaign.recipients.find(
      (item) => item.trackingToken === trackingToken,
    );

    if (campaign.trackingOptions?.autoTraining === false) {
      return res.status(400).json({
        message: "Training is disabled for this campaign",
      });
    }

    if (!recipient.trainingAssignedAt && !recipient.clickedAt) {
      return res.status(400).json({
        message: "Training is available only after the simulation link is clicked",
      });
    }

    if (recipient.trainingCompletedAt) {
      return res.status(200).json({
        success: true,
        message: "Training was already completed",
      });
    }

    recipient.trainingCompletedAt = new Date();

    const employee = await Employee.findById(recipient.employee);

    if (employee) {
      employee.trainingDone += 1;
      employee.risk = Math.max(employee.risk - 20, 0);
      await employee.save();
    }

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Training completed successfully",
      completedAt: recipient.trainingCompletedAt,
    });
  } catch (error) {
    console.error("Error completing training:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
