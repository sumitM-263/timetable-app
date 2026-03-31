const express = require("express");
const router = express.Router();

const { handleUpdateSlot, handleClearSlot } = require("../controllers/hodController");
const authMiddleware = require("../middlewares/authMiddleware");

router.put("/update-slot", authMiddleware, handleUpdateSlot);
router.put("/clear-slot", authMiddleware, handleClearSlot);

module.exports = router;