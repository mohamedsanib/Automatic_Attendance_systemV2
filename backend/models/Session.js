const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  course: String,
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ["active", "completed"], default: "active" },
  aiHeadcount: { type: Number, default: null },
  finalHeadcount: { type: Number, default: null }
});

module.exports = mongoose.model("Session", sessionSchema);
