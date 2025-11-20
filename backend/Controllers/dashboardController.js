const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const getActiveSession = require("../utils/getActiveSession");

exports.getDashboard = async (req, res) => {
  try {
    const session = await getActiveSession();
    const records = await Attendance.find({ sessionId: session._id }).populate("student");

    const totalStudents = await Student.countDocuments();

    res.json({
      session,
      summary: {
        totalStudents,
        present: records.filter(r => r.status === "Present").length,
        absent: records.filter(r => r.status === "Absent").length,
        pending: records.filter(r => r.status === "Pending").length
      },
      records
    });
  } catch (e) {
    res.status(500).json({ message: "Dashboard error." });
  }
};
