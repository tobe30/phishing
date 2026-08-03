import User from "../models/User.js";
import  bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not configured");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        organizationName: user.organizationName,
        industry: user.industry,
        lastLogin: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//logout function
export function logout(req, res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}
