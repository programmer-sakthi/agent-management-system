const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body } = require("express-validator");
const { adminAuth, auth } = require("../middleware/auth");
const listController = require("../controller/listController");

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
router.post(
  "/upload",
  adminAuth,
  upload.single("file"),
  listController.uploadLists
);

// Get lists for an agent
router.get("/my-lists", auth, listController.getMyLists);

// Get all lists (admin only)
router.get("/", adminAuth, listController.getAllLists);

// Update list status
router.patch("/:id/status", auth, listController.updateListStatus);

// Update list data (admin only)
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
  listController.updateList
);

// Delete a list (admin only)
router.delete("/:id", adminAuth, listController.deleteList);

module.exports = router;
