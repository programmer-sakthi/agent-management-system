const xlsx = require("xlsx");
const List = require("../models/List");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// Upload and distribute lists (admin only)
exports.uploadLists = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

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

    const agents = await User.find({ role: "agent" });
    if (agents.length === 0) {
      return res.status(400).json({ message: "No agents available" });
    }

    const batchId = Date.now().toString();

    const lists = data.map((row, index) => ({
      firstName: row.FirstName,
      phone: row.Phone.toString(),
      notes: row.Notes,
      assignedTo: agents[index % agents.length]._id,
      batchId,
    }));

    await List.insertMany(lists);

    res.status(201).json({
      message: "Lists uploaded and distributed successfully",
      totalLists: lists.length,
      batchId,
    });
  } catch (error) {
    next(new Error("Server error"));
  }
};

// Get lists for an agent
exports.getMyLists = async (req, res, next) => {
  try {
    const lists = await List.find({ assignedTo: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(lists);
  } catch (error) {
    next(new Error("Server error"));
  }
};

// Get all lists (admin only)
exports.getAllLists = async (req, res, next) => {
  try {
    const lists = await List.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    next(new Error("Server error"));
  }
};

// Update list status
exports.updateListStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return next(new Error("Invalid status"));
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
    next(new Error("Server error"));
  }
};

// Update list data
exports.updateList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { firstName, phone, notes } = req.body;

    const list = await List.findById(id);
    if (!list) {
      return next(new Error("List not found"));
    }

    if (
      list.assignedTo.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new Error("Not authorized to update this list"));
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
    next(new Error("Server error"));
  }
};

// Delete a list
exports.deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    res.json({ message: "List deleted successfully" });
  } catch (error) {
    next(new Error("Server error"));
  }
};
