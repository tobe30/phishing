import mongoose from "mongoose";
import Employee from "../models/Employee.js";

const sendEmployeeError = (res, error, fallbackMessage) => {
  if (error?.code === 11000) {
    return res
      .status(409)
      .json({ message: "Employee with this email already exists" });
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ message: "Internal Server Error" });
};

const validEmployeeId = (id) => mongoose.isValidObjectId(id);

export const createEmployee = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (!name?.trim() || !email?.trim() || !department?.trim()) {
      return res
        .status(400)
        .json({ message: "Name, email, and department are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmployee = await Employee.exists({ email: normalizedEmail });

    if (existingEmployee) {
      return res
        .status(409)
        .json({ message: "Employee with this email already exists" });
    }

    const employee = await Employee.create({
      name: name.trim(),
      email: normalizedEmail,
      department: department.trim(),
    });

    return res.status(201).json({ success: true, employee });
  } catch (error) {
    return sendEmployeeError(res, error, "Create employee error:");
  }
};

export const getEmployees = async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    return sendEmployeeError(res, error, "Get employees error:");
  }
};

export const getEmployee = async (req, res) => {
  try {
    if (!validEmployeeId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return sendEmployeeError(res, error, "Get employee error:");
  }
};

export const updateEmployee = async (req, res) => {
  try {
    if (!validEmployeeId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { name, email, department } = req.body;

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      const emailInUse = await Employee.exists({
        _id: { $ne: employee._id },
        email: normalizedEmail,
      });

      if (emailInUse) {
        return res
          .status(409)
          .json({ message: "Employee with this email already exists" });
      }

      employee.email = normalizedEmail;
    }

    if (name !== undefined) employee.name = name.trim();
    if (department !== undefined) employee.department = department.trim();

    await employee.save();

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return sendEmployeeError(res, error, "Update employee error:");
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    if (!validEmployeeId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return sendEmployeeError(res, error, "Delete employee error:");
  }
};
