import User from "../models/User.js";

// Get settings for the logged-in administrator
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      settings: {
        organizationName: user.organizationName,
        industry: user.industry,
        adminName: user.fullName,
        adminEmail: user.email,
        senderName: user.campaignDefaults.senderName,
        senderEmail: user.campaignDefaults.senderEmail,
        trackOpens: user.campaignDefaults.trackOpens,
        trackClicks: user.campaignDefaults.trackClicks,
        autoTraining: user.campaignDefaults.autoTraining,
      },
    });
  } catch (error) {
    console.error("Error getting user settings:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update organization, admin profile, and campaign defaults
export const updateSettings = async (req, res) => {
  try {
    const {
      organizationName,
      industry,
      adminName,
      adminEmail,
      senderName,
      senderEmail,
      trackOpens,
      trackClicks,
      autoTraining,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (adminEmail !== undefined) {
      const normalizedEmail = adminEmail.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({ message: "Admin email cannot be empty" });
      }

      const emailInUse = await User.exists({
        _id: { $ne: user._id },
        email: normalizedEmail,
      });

      if (emailInUse) {
        return res.status(409).json({
          message: "A user with this email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    if (organizationName !== undefined) {
      user.organizationName = organizationName.trim();
    }

    if (industry !== undefined) user.industry = industry.trim();
    if (adminName !== undefined) user.fullName = adminName.trim();

    if (senderName !== undefined) {
      user.campaignDefaults.senderName = senderName.trim();
    }

    if (senderEmail !== undefined) {
      user.campaignDefaults.senderEmail = senderEmail.trim().toLowerCase();
    }

    if (trackOpens !== undefined) {
      user.campaignDefaults.trackOpens = trackOpens;
    }

    if (trackClicks !== undefined) {
      user.campaignDefaults.trackClicks = trackClicks;
    }

    if (autoTraining !== undefined) {
      user.campaignDefaults.autoTraining = autoTraining;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        organizationName: user.organizationName,
        industry: user.industry,
        adminName: user.fullName,
        adminEmail: user.email,
        senderName: user.campaignDefaults.senderName,
        senderEmail: user.campaignDefaults.senderEmail,
        trackOpens: user.campaignDefaults.trackOpens,
        trackClicks: user.campaignDefaults.trackClicks,
        autoTraining: user.campaignDefaults.autoTraining,
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
