const express = require("express");
const router = express.Router();

const { handleGetTimetable } = require("../controllers/timetableController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/:roomId", authMiddleware, handleGetTimetable);

module.exports = router;