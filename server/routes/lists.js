const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const { adminAuth, auth } = require("../middleware/auth");
const List = require("../models/List");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only CSV and Excel files are allowed."));
    }
  },
});

// Upload and distribute lists (admin only)
router.post("/upload", adminAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate data format
    const requiredFields = ["FirstName", "Phone", "Notes"];
    const isValidFormat = data.every((row) =>
      requiredFields.every((field) => row[field] !== undefined)
    );

    if (!isValidFormat) {
      return res.status(400).json({
        message:
          "Invalid file format. Required fields: FirstName, Phone, Notes",
      });
    }

    // Get all agents
    const agents = await User.find({ role: "agent" });
    if (agents.length === 0) {
      return res.status(400).json({ message: "No agents available" });
    }

    // Generate batch ID
    const batchId = Date.now().toString();

    // Distribute lists among agents
    const lists = data.map((row, index) => ({
      firstName: row.FirstName,
      phone: row.Phone.toString(),
      notes: row.Notes,
      assignedTo: agents[index % agents.length]._id,
      batchId,
    }));

    // Save lists to database
    await List.insertMany(lists);

    res.status(201).json({
      message: "Lists uploaded and distributed successfully",
      totalLists: lists.length,
      batchId,
    });
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
});

// Get lists for an agent
router.get("/my-lists", auth, async (req, res) => {
  try {
    const lists = await List.find({ assignedTo: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(lists);
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
});

// Get all lists (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const lists = await List.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
});

// Update list status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "in-progress", "completed"].includes(status)) {
      const err = new Error("Invalid status");
      err.status = 400;
      return next(err);
    }

    const list = await List.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    list.status = status;
    await list.save();

    res.json({
      message: "List status updated successfully",
      list,
    });
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
});

// update list data

router.put(
  "/:id",
  [
    adminAuth,
    body("phone")
      .isMobilePhone()
      .withMessage("Invalid phone number format")
      .matches(/^\d+$/)
      .withMessage("Phone number must contain only digits"),
  ],
  async (req, res) => {
    // ✅ Add validation check here
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { firstName, phone, notes } = req.body;

      const list = await List.findById(id);
      if (!list) {
        const err = new Error("List not found");
        err.status = 404;
        return next(err);
      }

      if (
        list.assignedTo.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        const err = new Error("Not authorized to update this list");
        err.status = 403;
        return next(err);
      }

      const updatedList = await List.findByIdAndUpdate(
        id,
        { firstName, phone, notes },
        { new: true }
      ).populate("assignedTo", "name email");

      res.json({
        message: "List updated successfully",
        list: updatedList,
      });
    } catch (error) {
      console.error("Error updating list:", error);
      const err = new Error("Server error");
      err.status = 500;
      next(err);
    }
  }
);

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    res.json({ message: "List deleted successfully" });
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
});

module.exports = router;
