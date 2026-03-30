
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hodRoutes = require("./routes/professorRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const roomRoutes = require("./routes/roomRoutes");




dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/rooms", roomRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));