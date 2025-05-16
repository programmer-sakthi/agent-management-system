const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { adminAuth, auth } = require("../middleware/auth");
const {
  getAllAgents,
  getAgentProfile,
  updateAgent,
  deleteAgent,
} = require("../controller/agentController");

// Get all agents
router.get("/", adminAuth, getAllAgents);

// Get agent profile
router.get("/profile", auth, getAgentProfile);

// Update agent
router.put(
  "/:id",
  [
    adminAuth,
    body("name").optional().notEmpty(),
    body("mobileNumber").optional().notEmpty(),
    body("countryCode").optional().notEmpty(),
  ],
  updateAgent
);

// Delete agent
router.delete("/:id", adminAuth, deleteAgent);

module.exports = router;
