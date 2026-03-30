const Room = require("../models/room");
const Timetable = require("../models/timetable");

// CREATE ROOM
const handleCreateRoom = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const { roomNumber, capacity } = req.body;

        // Prevent duplicate room creation
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists" });
        }

        const room = await Room.create({ roomNumber, capacity });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE TIMETABLE (empty slots)
const handleCreateTimetable = async (req, res) => {
    try {
        const { roomId } = req.body;

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const times = [
            "9-10", "10-11", "11-12",
            "12-1", "1-2", "2-3",
            "3-4", "4-5"
        ];

        const existing = await Timetable.findOne({ room: roomId });

        if (existing) {
            return res.status(400).json({
                message: "Timetable already exists for this room"
            });
        }

        let slots = [];

        days.forEach(day => {
            times.forEach(time => {
                slots.push({
                    day,
                    time,
                    department: null
                });
            });
        });

        const timetable = await Timetable.create({
            room: roomId,
            slots
        });

        res.status(201).json(timetable);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ASSIGN / EDIT DEPARTMENT
const handleAssignDepartment = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const { timetableId, day, time, department } = req.body;

        const validDepartments = ["CSE", "ECE", "ME"];
        if (!validDepartments.includes(department)) {
            return res.status(400).json({ message: "Invalid department" });
        }

        const timetable = await Timetable.findById(timetableId);
        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        const slot = timetable.slots.find(
            s => s.day === day && s.time === time
        );

        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        // 🔥 FIX: allow overwrite (edit anytime)
        slot.department = department;

        await timetable.save();

        res.json({
            message: "Department updated successfully",
            slot
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE ROOM
const handleDeleteRoom = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const { roomId } = req.params;

        // Delete associated timetable first
        await Timetable.findOneAndDelete({ room: roomId });

        // Delete the room
        const room = await Room.findByIdAndDelete(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// EDIT ROOM
const handleEditRoom = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const { roomId } = req.params;
        const { roomNumber, capacity } = req.body;

        // Check if new roomNumber already exists (if changed)
        if (roomNumber) {
            const existingRoom = await Room.findOne({ roomNumber, _id: { $ne: roomId } });
            if (existingRoom) {
                return res.status(400).json({ message: "Room number already exists" });
            }
        }

        const room = await Room.findByIdAndUpdate(
            roomId,
            { roomNumber, capacity },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    handleCreateRoom,
    handleCreateTimetable,
    handleAssignDepartment,
    handleDeleteRoom,
    handleEditRoom
};