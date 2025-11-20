const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const getActiveSession = require("../utils/getActiveSession");

exports.markAttendance = async (req, res) => {
  try {
    const { studentId } = req.body;

    const activeSession = await getActiveSession();
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    await Attendance.updateOne(
      { sessionId: activeSession._id, student: student._id },
      { $set: { status: "Present", lastSeen: new Date() } },
      { upsert: true }
    );

    res.json({ message: `Attendance marked for ${student.name}.` });
  } catch (e) {
    res.status(500).json({ message: "Error marking attendance." });
  }
};
