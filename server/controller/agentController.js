const { validationResult } = require("express-validator");
const User = require("../models/User");

// Get all agents (admin only)
exports.getAllAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: "agent" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
};

// Get agent profile
exports.getAgentProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
};

// Update agent (admin only)
exports.updateAgent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation error");
      err.status = 400;
      err.data = errors.array();
      return next(err);
    }

    const agent = await User.findOne({ _id: req.params.id, role: "agent" });
    if (!agent) {
      const err = new Error("Agent not found");
      err.status = 404;
      return next(err);
    }

    const updates = Object.keys(req.body);
    updates.forEach((update) => {
      agent[update] = req.body[update];
    });
    await agent.save();

    res.json({
      message: "Agent updated successfully",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobileNumber: agent.mobileNumber,
        countryCode: agent.countryCode,
      },
    });
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
};

// Delete agent (admin only)
exports.deleteAgent = async (req, res, next) => {
  try {
    const agent = await User.findOneAndDelete({
      _id: req.params.id,
      role: "agent",
    });

    if (!agent) {
      const err = new Error("Agent not found");
      err.status = 404;
      return next(err);
    }

    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    const err = new Error("Server error");
    err.status = 500;
    next(err);
  }
};
