import "dotenv/config";
import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Employee from "../models/Employee.js";

const getMongoUrl = () =>
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

const syncEmployeeTraining = async () => {
  const mongoUrl = getMongoUrl();

  if (!mongoUrl) {
    throw new Error(
      "Set MONGODB_URL, MONGODB_URI, or MONGO_URI in backend/.env",
    );
  }

  await mongoose.connect(mongoUrl);

  const employees = await Employee.find().select("_id");
  const campaigns = await Campaign.find().select("recipients");
  const progress = new Map(
    employees.map((employee) => [
      String(employee._id),
      { assigned: 0, completed: 0 },
    ]),
  );

  campaigns.forEach((campaign) => {
    campaign.recipients.forEach((recipient) => {
      const employeeProgress = progress.get(String(recipient.employee));

      if (
        !employeeProgress ||
        (!recipient.trainingAssignedAt && !recipient.clickedAt)
      ) {
        return;
      }

      employeeProgress.assigned += 1;
      if (recipient.trainingCompletedAt) {
        employeeProgress.completed += 1;
      }
    });
  });

  if (employees.length > 0) {
    await Employee.bulkWrite(
      employees.map((employee) => {
        const employeeProgress = progress.get(String(employee._id));

        return {
          updateOne: {
            filter: { _id: employee._id },
            update: {
              $set: {
                trainingDone: employeeProgress.completed,
                trainingTotal: employeeProgress.assigned,
              },
            },
          },
        };
      }),
    );
  }

  console.log(`Training progress synchronized for ${employees.length} employees.`);
};

syncEmployeeTraining()
  .catch((error) => {
    console.error("Unable to synchronize training progress:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
