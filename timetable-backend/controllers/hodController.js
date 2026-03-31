const Timetable = require("../models/timetable");

// HOD UPDATE SLOT
const handleUpdateSlot = async (req, res) => {
    try {
        const { timetableId, day, time, courseCode, courseName, professorName } = req.body;

        // ✅ Only hods allowed
        if (req.user.role !== "hod") {
            return res.status(403).json({ message: "Access denied" });
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

        // ❌ Case: no department assigned yet
        if (!slot.department) {
            return res.status(400).json({
                message: "Department not assigned to this slot yet"
            });
        }

        // ❌ Case: wrong department
        if (slot.department !== req.user.department) {
            return res.status(403).json({
                message: "You can only edit your department slots"
            });
        }

        // 🔥 FIX: conflict detection for entered professor name (ignore same slot edit)
        const conflict = await Timetable.findOne({
            _id: { $ne: timetableId }, // ignore current timetable
            slots: {
                $elemMatch: {
                    day: day,
                    time: time,
                    professor: professorName
                }
            }
        });

        if (conflict) {
            return res.status(400).json({
                message: "This professor is already assigned in another room at this time"
            });
        }

        // ✅ REMOVE this block (no more "Slot already assigned")
        // if (slot.professor) { ... }

        // ✅ Update / overwrite slot (edit allowed)
        slot.courseCode = courseCode;
        slot.courseName = courseName;
        slot.professor = professorName;

        await timetable.save();

        res.json({
            message: "Slot updated successfully",
            slot
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// HOD CLEAR SLOT
const handleClearSlot = async (req, res) => {
    try {
        const { timetableId, day, time } = req.body;

        // ✅ Only hods allowed
        if (req.user.role !== "hod") {
            return res.status(403).json({ message: "Access denied" });
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

        // ❌ Case: no department assigned yet
        if (!slot.department) {
            return res.status(400).json({
                message: "Department not assigned to this slot yet"
            });
        }

        // ❌ Case: wrong department
        if (slot.department !== req.user.department) {
            return res.status(403).json({
                message: "You can only clear your department slots"
            });
        }

        // ✅ Clear course details (keep department)
        slot.courseCode = null;
        slot.courseName = null;
        slot.professor = null;

        await timetable.save();

        res.json({
            message: "Slot cleared successfully",
            slot
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    handleUpdateSlot,
    handleClearSlot
};