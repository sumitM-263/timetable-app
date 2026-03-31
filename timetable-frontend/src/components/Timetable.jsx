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
    courseName: "",
    professorName: ""
  });

  // 🔥 NEW: message modal state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

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
      courseName: slot.courseName || "",
      professorName: slot.professor || ""
    });
  };

  const handleSave = async () => {
    // Check if any changes were made (only for slots that already have data)
    const hasChanges = () => {
      if (role === "admin") {
        // Only check for changes if slot already has a department assigned
        if (selectedSlot.department) {
          return formData.department.trim() !== (selectedSlot.department || "");
        }
        return true; // New department assignment is always a change
      } else if (role === "hod") {
        // Only check for changes if slot already has course data
        if (selectedSlot.courseCode || selectedSlot.courseName || selectedSlot.professor) {
          return formData.courseCode.trim() !== (selectedSlot.courseCode || "") ||
                 formData.courseName.trim() !== (selectedSlot.courseName || "") ||
                 formData.professorName.trim() !== (selectedSlot.professor || "");
        }
        return true; // New course assignment is always a change
      }
      return false;
    };

    if (!hasChanges()) {
      setSelectedSlot(null); // Just close the modal
      return;
    }

    try {
      setSaving(true);

      if (role === "admin") {
        if (!formData.department.trim()) {
          setMessage("Please enter a department name");
          setMessageType("error");
          return;
        }

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

      if (role === "hod") {
        if (!formData.courseCode.trim()) {
          setMessage("Please enter a course code");
          setMessageType("error");
          return;
        }
        if (!formData.courseName.trim()) {
          setMessage("Please enter a course name");
          setMessageType("error");
          return;
        }
        if (!formData.professorName.trim()) {
          setMessage("Please enter a professor name");
          setMessageType("error");
          return;
        }

        await API.put("/hod/update-slot", {
          timetableId,
          day: selectedSlot.day,
          time: selectedSlot.time,
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          professorName: formData.professorName
        });

        updateLocalSlot({
          ...selectedSlot,
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          professor: formData.professorName
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

  const handleClear = async () => {
    // Check if slot is already empty
    const isSlotEmpty = () => {
      if (role === "admin") {
        // Admin considers slot empty if nothing is assigned
        return !selectedSlot.department && 
               !selectedSlot.courseCode && 
               !selectedSlot.courseName && 
               !selectedSlot.professor;
      } else if (role === "hod") {
        // HOD considers slot empty if no course details (department stays)
        return !selectedSlot.courseCode && 
               !selectedSlot.courseName && 
               !selectedSlot.professor;
      }
      return false;
    };

    if (isSlotEmpty()) {
      setMessage("Slot is already empty");
      setMessageType("error");
      return;
    }

    try {
      setClearing(true);

      if (role === "admin") {
        await API.put("/admin/clear-slot", {
          timetableId,
          day: selectedSlot.day,
          time: selectedSlot.time,
          clearDepartment: true // Admin clears everything including department
        });

        updateLocalSlot({
          ...selectedSlot,
          department: null,
          courseCode: null,
          courseName: null,
          professor: null
        });
      }

      if (role === "hod") {
        await API.put("/hod/clear-slot", {
          timetableId,
          day: selectedSlot.day,
          time: selectedSlot.time
        });

        updateLocalSlot({
          ...selectedSlot,
          courseCode: null,
          courseName: null,
          professor: null
        });
      }

      setSelectedSlot(null);

      // 🔥 SUCCESS MESSAGE
      setMessage("Slot cleared successfully");
      setMessageType("success");

    } catch (err) {
      setMessage(err.response?.data?.message || "Error clearing slot");
      setMessageType("error");
    } finally {
      setClearing(false);
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
                      role === "hod" &&
                        (!slot?.department || slot.department !== userDepartment)
                        ? "cell disabled"
                        : "cell"
                    }
                    onClick={() => {
                      if (!slot) return;

                      if (role === "admin") {
                        openModal(slot);
                      }

                      if (role === "hod") {
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
                      {slot?.professor || ""}
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

            {role === "hod" && (
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
                <input
                  placeholder="Professor Name"
                  value={formData.professorName}
                  onChange={(e) =>
                    setFormData({ ...formData, professorName: e.target.value })
                  }
                />
              </>
            )}

            <button onClick={handleSave} disabled={saving || clearing}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button 
              onClick={handleClear} 
              disabled={saving || clearing}
              style={{ backgroundColor: "#ff6b6b", color: "white" }}
            >
              {clearing ? "Clearing..." : "Clear Slot"}
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