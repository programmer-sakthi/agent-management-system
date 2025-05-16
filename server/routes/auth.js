const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { login, registerAgent } = require("../controller/authController");
const { adminAuth } = require("../middleware/auth");

// Login route
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  login
);

// Register agent (admin only)
router.post(
  "/register",
  [
    adminAuth,
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
    body("mobileNumber").notEmpty(),
    body("countryCode").notEmpty(),
  ],
  registerAgent
);

module.exports = router;
