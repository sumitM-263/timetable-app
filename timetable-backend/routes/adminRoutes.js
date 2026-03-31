const express = require("express");
const router = express.Router();

const {
  handleCreateRoom,
  handleCreateTimetable,
  handleAssignDepartment,
  handleDeleteRoom,
  handleEditRoom,
  handleClearSlot
} = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");

// Only admin should access
router.post("/room", authMiddleware, handleCreateRoom);
router.post("/timetable", authMiddleware, handleCreateTimetable);
router.put("/assign-department", authMiddleware, handleAssignDepartment);
router.put("/clear-slot", authMiddleware, handleClearSlot);
router.put("/room/:roomId", authMiddleware, handleEditRoom);
router.delete("/room/:roomId", authMiddleware, handleDeleteRoom);


module.exports = router;