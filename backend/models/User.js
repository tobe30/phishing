import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    department: {
      type: String,
      trim: true,
      default: "General",
    },
    organizationName: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },

    campaignDefaults: {
      senderName: {
        type: String,
        trim: true,
        default: "IT Support",
      },
      senderEmail: {
        type: String,
        lowercase: true,
        trim: true,
        default: "security@example.test",
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please provide a valid sender email address",
        ],
      },
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

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
