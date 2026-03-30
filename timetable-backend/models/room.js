const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    default: 80
  }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);