# Automatic Smart Attendance System (BLE + Computer Vision)

## 📌 Owner Details
**Name:** Mohamed Sanib  
**College:** Lovely Professional University (LPU)  
**Role:** Full-Stack Developer | Creator of the System  
**Project Type:** Fully self-built — Hardware + Firmware + Backend + Frontend + AI

---

## 📘 Small Description
A fully automated classroom attendance solution using **Bluetooth Low Energy (BLE)** for identity detection and **Computer Vision (YOLOv5n)** for physical presence validation.  
This system eliminates proxy attendance, removes manual roll-calls, and ensures accurate and real-time attendance tracking in a scalable and cost-effective way.

---

## 🧩 Problem Statement
Traditional attendance systems are:
- Slow and time-consuming  
- Vulnerable to proxy marking  
- Error-prone and inefficient  
- Lacking real-time monitoring  
- Hard to scale across multiple classrooms  

Modern educational institutions need a **fast, automated, reliable, and low-cost** system.

---

## 💡 Solution Overview
A hybrid solution combining:
1. **BLE Auto-Marking** — Phones broadcast encrypted UIDs.  
2. **ESP32 BLE Scanner** — Captures BLE packets, checks RSSI (proximity), decrypts, and sends data to backend.  
3. **AI Headcount Verification** — YOLOv5n model validates classroom presence using webcam video.  
4. **Teacher Dashboard** — Real-time attendance status and manual overrides.

This system ensures **anti-proxy protection, automation, and high accuracy**.

---

## ⚙️ Brief Working
1. Student logs in → receives a **unique UID** stored in their phone.  
2. Phone broadcasts **encrypted BLE packets** for the first 10 minutes.  
3. ESP32 inside the classroom:
   - Scans BLE signals  
   - Filters using RSSI  
   - Decrypts UID  
   - Sends `{ studentId }` to backend  
4. Teacher records a 5-second video → AI service counts people.  
5. Backend compares BLE-present students with AI headcount.  
6. Teacher finalizes session.

---

## ⭐ Core Features & Trade-offs

### **Core Features**
- Automatic BLE-based attendance  
- RSSI-based proximity check (proxy prevention)  
- Encrypted BLE packet broadcasting  
- AI-powered headcount verification (YOLOv5n)  
- React-based teacher dashboard  
- Session management & manual corrections  
- ESP32 low-cost hardware  
- MongoDB-based scalable backend  

### **Why These Matter**
- Fully automated  
- Proxy attendance becomes impossible  
- Works in real-time  
- Cost-effective for large deployments  

### **Trade-offs**
- Caesar Cipher used for demo → AES recommended  
- RSSI fluctuation requires calibration  
- YOLOv5n gives headcount but not identity  
- ESP32 requires reliable WiFi

---

## 🛠️ Tech Stack

### **Frontend**
- React.js  
- React-Webcam  
- Tailwind CSS  
- Lucide Icons  

### **Backend**
- Node.js + Express  
- MongoDB + Mongoose  
- JWT Authentication  
- Multer (video uploads)  
- Axios + FormData  

### **AI Headcount Service**
- Python Flask  
- YOLOv5n (Ultralytics)  
- PyTorch  
- OpenCV  

### **Embedded / Hardware**
- ESP32 (Arduino Framework)  
- BLE Scanner  
- RSSI Filtering  
- ArduinoJson  
- WiFi HTTP Client  

---

## 🏗️ System Architecture

```
Student Phone (BLE UID)
        │
        ▼
ESP32 Scanner → RSSI Check → Decrypt → POST /attendance
        │
        ▼
Node.js Backend → MongoDB ←→ React Dashboard (Live Data)
        │
        └────────→ Python YOLOv5n Service (AI Headcount)
```

---

## 🗂️ Database Schema

### **Student Schema**
```js
{
  studentId: String,
  name: String,
  email: String,
  password: String,
  role: "student"
}
```

### **Session Schema**
```js
{
  course: String,
  startTime: Date,
  endTime: Date,
  status: "active" | "completed",
  aiHeadcount: Number,
  finalHeadcount: Number
}
```

### **Attendance Schema**
```js
{
  sessionId: ObjectId,
  student: ObjectId,
  status: "Present" | "Absent" | "Pending",
  lastSeen: Date,
  manualOverride: Boolean
}
```

---

## 📡 API Design (Key Endpoints)

### **Auth**
POST /api/auth/login

### **Attendance**
POST /api/attendance/mark

### **Dashboard**
GET /api/dashboard

### **Headcount (AI)**
POST /api/headcount/:sessionId  
PUT /api/headcount/:sessionId

### **Session**
POST /api/sessions/submit

### **Admin**
POST /api/students/seed

---

## 📁 File Structure

```
project/
 ├── backend/
 │    ├── server.js
 │    ├── models/
 │    ├── routes/
 │    └── .env.example
 ├── frontend/
 │    ├── src/App.js
 │    └── .env.example
 ├── esp32_firmware/
 │    └── firmware.ino
 ├── python_headcount/
 │    ├── app.py
 │    └── requirements.txt
 ├── diagrams/
 └── README.md
```

---

## 🚀 How to Use (Setup Guide)

### **Backend**
```
cd backend
npm install
cp .env.example .env
node server.js
```

### **Frontend**
```
cd frontend
npm install
npm start
```

### **AI Headcount Service**
```
cd python_headcount
pip install -r requirements.txt
python app.py
```

### **ESP32 Firmware**
- Open firmware in Arduino IDE  
- Update WiFi credentials and backend URL  
- Upload to ESP32  

---

## 🔐 Environment Variables

### backend/.env.example
```
PORT=5000
MONGO_URI=your_mongo_url_here
JWT_SECRET=your_secret_here
AI_SERVICE_URL=http://localhost:5001/process_video
```

### frontend/.env.example
```
REACT_APP_API_URL=http://localhost:5000/api
```

---


