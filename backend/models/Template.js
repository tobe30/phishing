import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      minlength: [2, "Template name must contain at least 2 characters"],
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Template category is required"],
      trim: true,
      maxlength: [60, "Template category cannot exceed 60 characters"],
    },
    subject: {
      type: String,
      required: [true, "Email subject is required"],
      trim: true,
      maxlength: [160, "Email subject cannot exceed 160 characters"],
    },
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
      maxlength: [100, "Sender name cannot exceed 100 characters"],
    },
    senderEmail: {
      type: String,
      required: [true, "Sender email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid sender email address",
      ],
    },
    body: {
      type: String,
      required: [true, "Email body is required"],
      trim: true,
      maxlength: [10000, "Email body cannot exceed 10,000 characters"],
    },
    callToAction: {
      type: String,
      required: [true, "Button text is required"],
      trim: true,
      maxlength: [80, "Button text cannot exceed 80 characters"],
    },
    color: {
      type: String,
      enum: {
        values: ["cyan", "violet", "blue", "amber", "emerald"],
        message: "Invalid template colour",
      },
      default: "cyan",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

templateSchema.index({ name: 1 });
templateSchema.index({ category: 1 });

const Template = mongoose.model("Template", templateSchema);

export default Template;
