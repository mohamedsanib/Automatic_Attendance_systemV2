const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const user = await Student.findOne({ studentId });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, studentId: user.studentId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user: { name: user.name, studentId: user.studentId } });
  } catch (e) {
    res.status(500).json({ message: "Server error during login." });
  }
};
