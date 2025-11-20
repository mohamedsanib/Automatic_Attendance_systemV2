const Session = require("../models/Session");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

async function getActiveSession() {
  let session = await Session.findOne({ status: "active" });

  if (!session) {
    session = new Session({
      course: `Class Session ${new Date().toLocaleDateString()}`
    });
    await session.save();

    const students = await Student.find({});
    if (students.length > 0) {
      const records = students.map(s => ({
        sessionId: session._id,
        student: s._id,
        status: "Pending"
      }));
      await Attendance.insertMany(records);
    }
  }

  return session;
}

module.exports = getActiveSession;
