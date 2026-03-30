import { useEffect, useState } from "react";
import API from "../services/api";
import Timetable from "../components/Timetable";

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [creatingRoom, setCreatingRoom] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [editingRoom, setEditingRoom] = useState(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  const [deletingRoom, setDeletingRoom] = useState(null);

  const role = localStorage.getItem("role");

  const filteredRooms = rooms.filter(room =>
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get("/rooms");
        setRooms(res.data);
      } catch (err) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // EDIT ROOM
  const handleEditRoom = async () => {
    try {
      if (!editRoomNumber || !editCapacity) {
        setMessage("All fields are required");
        setMessageType("error");
        return;
      }

      const res = await API.put(`/admin/room/${editingRoom._id}`, {
        roomNumber: editRoomNumber,
        capacity: editCapacity
      });

      // Update local state
      setRooms(prev => prev.map(room =>
        room._id === editingRoom._id ? res.data : room
      ));

      setEditingRoom(null);
      setEditRoomNumber("");
      setEditCapacity("");

      setMessage("Room updated successfully");
      setMessageType("success");

    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update room");
      setMessageType("error");
    }
  };

  // DELETE ROOM
  const handleDeleteRoom = async (roomId) => {
    try {
      await API.delete(`/admin/room/${roomId}`);

      // Update local state
      setRooms(prev => prev.filter(room => room._id !== roomId));

      setMessage("Room deleted successfully");
      setMessageType("success");

    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete room");
      setMessageType("error");
    } finally {
      setDeletingRoom(null);
    }
  };

  // 🔥 FIXED ROOM CREATION
  const handleCreateRoom = async () => {
    try {
      setCreatingRoom(true);

      if (!roomNumber || !capacity) {
        setMessage("All fields are required");
        setMessageType("error");
        return;
      }

      // ✅ correct endpoint
      const res = await API.post("/admin/room", {
        roomNumber,
        capacity
      });

      const newRoom = res.data;

      // 🔥 AUTO CREATE TIMETABLE (important)
      await API.post("/admin/timetable", {
        roomId: newRoom._id
      });

      // update UI
      setRooms(prev => [...prev, newRoom]);

      setShowModal(false);
      setRoomNumber("");
      setCapacity("");

      setMessage("Room created successfully");
      setMessageType("success");

    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create room");
      setMessageType("error");
    } finally {
      setCreatingRoom(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>Dashboard</h2>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {loading && <p style={styles.info}>Loading rooms...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {/* ADD ROOM BUTTON */}
        {role === "admin" && !selectedRoom && (
          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            + Add Room
          </button>
        )}

        {!loading && !selectedRoom && (
          <>
            {/* SEARCH BAR */}
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />

            <h3>Select a Room</h3>

            {filteredRooms.length === 0 ? (
              <p style={styles.info}>No rooms available</p>
            ) : (
              <div style={styles.roomList}>
                {filteredRooms.map(room => (
                  <div
                    key={room._id}
                    style={styles.roomCard}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div style={styles.roomCardContent}>
                      <div style={styles.roomInfo}>
                        <div style={styles.roomNumber}>Room {room.roomNumber}</div>
                        <div style={styles.roomCapacity}>Capacity: {room.capacity}</div>
                      </div>
                      {role === "admin" && (
                        <div style={styles.roomActions}>
                          <button
                            style={styles.editBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRoom(room);
                              setEditRoomNumber(room.roomNumber);
                              setEditCapacity(room.capacity);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingRoom(room);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedRoom && (
          <>
            <div style={styles.backRow}>
              <button
                style={styles.backBtn}
                onClick={() => setSelectedRoom(null)}
              >
                ← Back
              </button>
              <h3>Room: {selectedRoom.roomNumber}</h3>
            </div>

            <Timetable roomId={selectedRoom._id} />
          </>
        )}
      </div>

      {/* ADD ROOM MODAL */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Room</h3>

            <input
              placeholder="Room Number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />

            <input
              placeholder="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />

            <button onClick={handleCreateRoom} disabled={creatingRoom}>
              {creatingRoom ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* EDIT ROOM MODAL */}
      {editingRoom && (
        <div className="overlay" onClick={() => setEditingRoom(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Room</h3>

            <input
              placeholder="Room Number"
              value={editRoomNumber}
              onChange={(e) => setEditRoomNumber(e.target.value)}
            />

            <input
              placeholder="Capacity"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
            />

            <button onClick={handleEditRoom}>Update</button>
            <button onClick={() => setEditingRoom(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* DELETE ROOM CONFIRMATION MODAL */}
      {deletingRoom && (
        <div className="overlay" onClick={() => setDeletingRoom(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Room</h3>
            <p style={{ margin: "15px 0", textAlign: "center" }}>
              Are you sure you want to delete <strong>Room {deletingRoom.roomNumber}</strong>?
            </p>
            <p style={{ margin: "10px 0 20px 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setDeletingRoom(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRoom(deletingRoom._id)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {message && (
        <div className="overlay" onClick={() => setMessage("")}>
          <div className="messageModal" onClick={(e) => e.stopPropagation()}>
            <p style={messageType === "error" ? { color: "red" } : { color: "green" }}>
              {message}
            </p>
            <button onClick={() => setMessage("")}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// styles unchanged
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #eef2f3, #f9f9f9)",
    padding: "30px"
  },

  card: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  logoutBtn: {
    padding: "10px 15px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  addBtn: {
    marginBottom: "20px",
    padding: "12px 18px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  searchInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px"
  },

  roomList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },

  roomCard: {
    padding: "20px",
    borderRadius: "10px",
    background: "#f8f9ff",
    border: "1px solid #ddd",
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center",
    fontWeight: "bold",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  roomCardContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%"
  },

  roomInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: "15px"
  },

  roomNumber: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "5px"
  },

  roomCapacity: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "normal"
  },

  roomActions: {
    display: "flex",
    gap: "8px",
    justifyContent: "center"
  },

  editBtn: {
    padding: "8px 16px",
    background: "#ffc107",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s"
  },

  deleteBtn: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s"
  },

  cancelBtn: {
    padding: "8px 16px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s"
  },

  confirmDeleteBtn: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s"
  },

  roomCardHover: {
    background: "#e6edff"
  },

  backRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px"
  },

  backBtn: {
    padding: "8px 12px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  error: {
    color: "red",
    marginBottom: "10px"
  },

  info: {
    color: "#555",
    marginBottom: "10px"
  }
};

export default Dashboard;