const Timetable = require("../models/Timetable");

const handleGetTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      room: req.params.roomId
    }).populate("slots.professor", "name email");

    if (!timetable) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    handleGetTimetable
};