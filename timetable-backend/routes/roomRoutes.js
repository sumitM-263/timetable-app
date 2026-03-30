const express = require("express");
const router = express.Router();

const { handleGetRooms } = require("../controllers/roomController");
const authMiddleware = require("../middlewares/authMiddleware");

// accessible by both admin & professor
router.get("/", authMiddleware, handleGetRooms);

module.exports = router;