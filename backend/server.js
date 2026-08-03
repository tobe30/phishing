import express from "express";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import templateRoutes from "./routes/template.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import reportRoutes from "./routes/report.routes.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";



const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173", // local dev
    "https://phishinguard-three.vercel.app" // production
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('server is running'));
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // make sure DB is connected first
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
