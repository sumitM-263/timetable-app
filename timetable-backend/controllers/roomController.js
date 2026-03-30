const Room = require("../models/room");

const handleGetRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    handleGetRooms
};