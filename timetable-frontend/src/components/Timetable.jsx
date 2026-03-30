import { useEffect, useState } from "react";
import API from "../services/api";
import "./Timetable.css";

function Timetable({ roomId }) {
  const [slots, setSlots] = useState([]);
  const [timetableId, setTimetableId] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    department: "",
    courseCode: "",
    courseName: ""
  });

  // 🔥 NEW: message modal state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [saving, setSaving] = useState(false);

  const role = localStorage.getItem("role");
  const userDepartment = localStorage.getItem("department");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await API.get(`/timetable/${roomId}`);
        setSlots(res.data.slots);
        setTimetableId(res.data._id);
      } catch (err) {
        setMessage("Failed to load timetable");
        setMessageType("error");
      }
    };

    fetchTimetable();
  }, [roomId]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5"];

  const updateLocalSlot = (updatedSlot) => {
    setSlots(prev =>
      prev.map(s =>
        s.day === updatedSlot.day && s.time === updatedSlot.time
          ? { ...s, ...updatedSlot }
          : s
      )
    );
  };

  const openModal = (slot) => {
    setSelectedSlot(slot);

    setFormData({
      department: slot.department || "",
      courseCode: slot.courseCode || "",
      courseName: slot.courseName || ""
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (role === "admin") {
        await API.put("/admin/assign-department", {
          timetableId,
          day: selectedSlot.day,
          time: selectedSlot.time,
          department: formData.department
        });

        updateLocalSlot({
          ...selectedSlot,
          department: formData.department
        });
      }

      if (role === "professor") {
        await API.put("/professor/update-slot", {
          timetableId,
          day: selectedSlot.day,
          time: selectedSlot.time,
          courseCode: formData.courseCode,
          courseName: formData.courseName
        });

        updateLocalSlot({
          ...selectedSlot,
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          professor: {
            name: localStorage.getItem("name") || "You"
          }
        });
      }

      setSelectedSlot(null);

      // 🔥 SUCCESS MESSAGE
      setMessage("Updated successfully");
      setMessageType("success");

    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <table className="timetable">
        <thead>
          <tr>
            <th>Time</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>

        <tbody>
          {times.map(time => (
            <tr key={time}>
              <td>{time}</td>
              {days.map(day => {
                const slot = slots.find(
                  s => s.day === day && s.time === time
                );

                return (
                  <td
                    key={day}
                    className={
                      role === "professor" &&
                        (!slot?.department || slot.department !== userDepartment)
                        ? "cell disabled"
                        : "cell"
                    }
                    onClick={() => {
                      if (!slot) return;

                      if (role === "admin") {
                        openModal(slot);
                      }

                      if (role === "professor") {
                        if (
                          slot.department &&
                          slot.department === userDepartment
                        ) {
                          openModal(slot);
                        }
                      }
                    }}
                  >
                    <strong>{slot?.department || "-"}</strong>
                    <br />
                    {slot?.courseCode || ""} {slot?.courseName || ""}
                    <div style={{ fontSize: "13px", color: "#666666" }}>
                      {slot?.professor?.name || ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {selectedSlot && (
        <div className="overlay" onClick={() => setSelectedSlot(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Slot</h3>

            {role === "admin" && (
              <input
                placeholder="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            )}

            {role === "professor" && (
              <>
                <input
                  placeholder="Course Code"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                />
                <input
                  placeholder="Course Name"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                />
              </>
            )}

            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setSelectedSlot(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* 🔥 MESSAGE MODAL */}
      {message && (
        <div className="overlay" onClick={() => setMessage("")}>
          <div
            className="messageModal"
            onClick={(e) => e.stopPropagation()}
          >
            <p className={messageType === "error" ? "errorText" : "successText"}>
              {message}
            </p>

            <button onClick={() => setMessage("")}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Timetable;