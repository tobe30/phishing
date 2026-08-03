import mongoose from "mongoose";
import Template from "../models/Template.js";

// Create a template
export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      category,
      subject,
      senderName,
      senderEmail,
      body,
      callToAction,
      color,
    } = req.body;

    if (
      !name ||
      !category ||
      !subject ||
      !senderName ||
      !senderEmail ||
      !body ||
      !callToAction
    ) {
      return res.status(400).json({ message: "All template fields are required" });
    }

    const numberOfTemplates = await Template.countDocuments();

    if (numberOfTemplates >= 5) {
      return res.status(400).json({ message: "Only 5 templates are allowed" });
    }

    const template = await Template.create({
      name,
      category,
      subject,
      senderName,
      senderEmail,
      body,
      callToAction,
      color,
    });

    return res.status(201).json({ success: true, template });
  } catch (error) {
    console.error("Error creating template:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("Error getting templates:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get one template
export const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ success: true, template });
  } catch (error) {
    console.error("Error getting template:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      subject,
      senderName,
      senderEmail,
      body,
      callToAction,
      color,
      isActive,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (name !== undefined) template.name = name;
    if (category !== undefined) template.category = category;
    if (subject !== undefined) template.subject = subject;
    if (senderName !== undefined) template.senderName = senderName;
    if (senderEmail !== undefined) template.senderEmail = senderEmail;
    if (body !== undefined) template.body = body;
    if (callToAction !== undefined) template.callToAction = callToAction;
    if (color !== undefined) template.color = color;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    return res.status(200).json({ success: true, template });
  } catch (error) {
    console.error("Error updating template:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await Template.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
