const express = require("express");
const router = express.Router();

const { handleUpdateSlot } = require("../controllers/hodController");
const authMiddleware = require("../middlewares/authMiddleware");

router.put("/update-slot", authMiddleware, handleUpdateSlot);

module.exports = router;