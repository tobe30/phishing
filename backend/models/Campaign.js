import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    trackingToken: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    openedAt: {
      type: Date,
      default: null,
    },
    clickedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    reportedAt: {
      type: Date,
      default: null,
    },
    trainingAssignedAt: {
      type: Date,
      default: null,
    },
    trainingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
      minlength: [2, "Campaign name must contain at least 2 characters"],
      maxlength: [80, "Campaign name cannot exceed 80 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [240, "Description cannot exceed 240 characters"],
      default: "",
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: [true, "Email template is required"],
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
    targetGroup: {
      type: String,
      required: [true, "Target group is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["DRAFT", "RUNNING", "COMPLETED", "CANCELLED"],
        message: "Invalid campaign status",
      },
      default: "DRAFT",
    },
    authorized: {
      type: Boolean,
      default: false,
    },
    trackingOptions: {
      trackOpens: {
        type: Boolean,
        default: true,
      },
      trackClicks: {
        type: Boolean,
        default: true,
      },
      autoTraining: {
        type: Boolean,
        default: true,
      },
    },
    recipients: {
      type: [recipientSchema],
      default: [],
    },
    launchedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
