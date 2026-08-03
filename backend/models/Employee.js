import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      minlength: [2, "Employee name must contain at least 2 characters"],
      maxlength: [100, "Employee name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Employee email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [80, "Department cannot exceed 80 characters"],
    },

    risk: {
      type: Number,
      min: [0, "Risk score cannot be lower than 0"],
      max: [100, "Risk score cannot be greater than 100"],
      default: 0,
    },

    lastSimulation: {
      type: String,
      enum: {
        values: ["SAFE", "REPORTED", "CLICKED", "SUBMITTED"],
        message: "Invalid simulation result",
      },
      default: "SAFE",
    },

    trainingDone: {
      type: Number,
      min: [0, "Completed training count cannot be negative"],
      default: 0,
    },
    trainingTotal: {
      type: Number,
      min: [0, "Assigned training count cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.pre("validate", function validateTrainingProgress() {
  if (this.trainingDone > this.trainingTotal) {
    this.invalidate(
      "trainingDone",
      "Completed training cannot exceed assigned training",
    );
  }
});

employeeSchema.index({ department: 1 });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
