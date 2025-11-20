const express = require("express");
const router = express.Router();
const { markAttendance } = require("../controllers/attendanceController");

router.post("/mark", markAttendance);

module.exports = router;
