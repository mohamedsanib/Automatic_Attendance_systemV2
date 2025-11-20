const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  status: { type: String, enum: ["Present", "Absent", "Pending"], default: "Pending" },
  lastSeen: Date,
  manualOverride: { type: Boolean, default: false }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
