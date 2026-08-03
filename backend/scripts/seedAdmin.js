import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const requiredEnvironmentVariables = [
  "ADMIN_FULL_NAME",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ORGANIZATION_NAME",
];

const getMongoUrl = () =>
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

const seedAdmin = async () => {
  const mongoUrl = getMongoUrl();
  const missingVariables = requiredEnvironmentVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (!mongoUrl) {
    throw new Error(
      "Set MONGODB_URL, MONGODB_URI, or MONGO_URI in backend/.env",
    );
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingVariables.join(", ")}`,
    );
  }

  if (process.env.ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters");
  }

  await mongoose.connect(mongoUrl);

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log("Admin already exists. No changes were made.");
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

  await User.create({
    fullName: process.env.ADMIN_FULL_NAME.trim(),
    email,
    password: passwordHash,
    organizationName: process.env.ORGANIZATION_NAME.trim(),
    industry: process.env.ORGANIZATION_INDUSTRY?.trim() || "Other",
  });

  console.log("Admin created successfully.");
};

try {
  await seedAdmin();
} catch (error) {
  console.error(`Unable to seed admin: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
