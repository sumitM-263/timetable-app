const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  day: String,
  time: String,

  department: String,

  courseCode: String,
  courseName: String,

  professor: String
});

const timetableSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  slots: [slotSchema]
}, { timestamps: true });

module.exports = mongoose.model("Timetable", timetableSchema);