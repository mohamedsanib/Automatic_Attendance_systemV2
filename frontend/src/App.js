// App.js
// FINAL VERSION: Includes the requested submit verification logic and all features.
// Corrected the webcam recording logic to ensure it stops properly.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Users, UserCheck, UserX, Clock, RefreshCw, Camera, CheckCircle, XCircle, Video, Edit3, Save } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api';
const RECORDING_DURATION = 5000; // 5 seconds

// --- Main App Component ---
export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalContent, setResultModalContent] = useState({ title: '', message: '' });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/attendance/${attendanceId}`, { status: newStatus });
      fetchDashboardData(); // Refetch all data to ensure consistency
    } catch (err) {
      alert('Could not update attendance status.');
    }
  };
  
  const handleSubmitFinal = async () => {
    const presentCount = dashboardData.summary.present;
    const finalHeadcount = dashboardData.session.finalHeadcount;

    // NEW: First, check if headcount has been done at all.
    if (finalHeadcount === null) {
        setResultModalContent({ 
            title: '⚠️ Headcount Required', 
            message: `Please perform a headcount verification or manually enter the count before submitting.`
        });
        setShowResultModal(true);
        return; // Stop the submission process
    }

    // Second, check for mismatches.
    if (presentCount !== finalHeadcount) {
        setResultModalContent({ 
            title: '⚠️ Headcount Mismatch', 
            message: `The final headcount (${finalHeadcount}) does not match the number of present students (${presentCount}). Please correct the numbers before submitting.`
        });
        setShowResultModal(true);
        return; // Stop the submission process
    }

    // If all checks pass, proceed with submission
    if (window.confirm('Are you sure you want to finalize and submit this attendance?')) {
        try {
            await axios.post(`${API_BASE_URL}/sessions/submit`, { sessionId: dashboardData.session.id });
            setResultModalContent({ title: '✅ Success', message: 'Attendance has been marked successfully.' });
            setShowResultModal(true);
            // Show loading while a new session is created on the next automatic poll
            setIsLoading(true); 
        } catch (err) {
            setResultModalContent({ title: 'Error', message: 'Could not finalize attendance.' });
            setShowResultModal(true);
        }
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <Header />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {isLoading || !dashboardData ? (
          <p className="text-center text-slate-500 py-10">Loading Session...</p>
        ) : error ? (
          <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
        ) : (
          <>
            <DashboardStats summary={dashboardData.summary} />
            <ControlsSection 
                session={dashboardData.session}
                onUpdate={fetchDashboardData}
                onRefresh={fetchDashboardData}
                onHeadcountClick={() => setIsWebcamModalOpen(true)}
                onSubmit={handleSubmitFinal}
            />
            <StudentList records={dashboardData.records} onStatusChange={handleStatusChange} />
          </>
        )}
      </main>
      {isWebcamModalOpen && dashboardData &&
        <WebcamRecorderModal 
          sessionId={dashboardData.session.id}
          onClose={() => setIsWebcamModalOpen(false)}
          onUploadComplete={fetchDashboardData}
        />
      }
      {showResultModal && <ResultModal content={resultModalContent} onClose={() => setShowResultModal(false)} />}
    </div>
  );
}

// --- Webcam Recorder Component (Corrected) ---
const WebcamRecorderModal = ({ sessionId, onClose, onUploadComplete }) => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [status, setStatus] = useState('idle');
    const recordedChunksRef = useRef([]); // Use a ref to store chunks to avoid re-render issues

    const handleDataAvailable = useCallback((event) => {
        if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
        }
    }, []);

    const handleStop = useCallback(async () => {
        if (recordedChunksRef.current.length > 0) {
            setStatus('uploading');
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            const formData = new FormData();
            formData.append("video", blob, "headcount.webm");
            try {
                await axios.post(`${API_BASE_URL}/headcount/${sessionId}`, formData);
                onUploadComplete();
                onClose();
            } catch (err) {
                alert('Failed to process video. Make sure the Python AI service is running.');
                setStatus('idle');
            }
            recordedChunksRef.current = []; // Clear chunks after upload
        }
    }, [sessionId, onClose, onUploadComplete]);

    const handleStartRecording = useCallback(() => {
        if (webcamRef.current?.stream) {
            setStatus('recording');
            recordedChunksRef.current = []; // Reset chunks for new recording
            const mediaRecorder = new MediaRecorder(webcamRef.current.stream, { mimeType: "video/webm" });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
            mediaRecorder.addEventListener("stop", handleStop);

            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            }, RECORDING_DURATION);
        }
    }, [webcamRef, handleDataAvailable, handleStop]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4 text-center">Headcount Verification</h3>
                <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
                    <Webcam audio={false} ref={webcamRef} className="w-full h-full" />
                    {status === 'recording' && <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">REC</div>}
                </div>
                <div className="mt-6 text-center">
                    {status === 'idle' && <button onClick={handleStartRecording} className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2 text-lg font-semibold mx-auto"><Video size={24} /> Start {RECORDING_DURATION / 1000}s Recording</button>}
                    {status === 'recording' && <p className="text-lg font-semibold text-slate-700 animate-pulse">Recording...</p>}
                    {status === 'uploading' && <p className="text-lg font-semibold text-slate-700">Uploading and processing...</p>}
                </div>
                <div className="mt-6 text-center"><button onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 font-semibold">Cancel</button></div>
            </div>
        </div>
    );
};

const ResultModal = ({ content, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{content.title}</h3>
            <p className="text-slate-600 mb-4">{content.message}</p>
            <button onClick={onClose} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">Close</button>
        </div>
    </div>
);

// --- Reusable Components ---
const Header = () => (
  <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md p-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold">BLE Attendance System</h1>
    <p className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </header>
);

const DashboardStats = ({ summary }) => {
    const attendanceRate = summary.totalStudents > 0 ? (summary.present / summary.totalStudents) * 100 : 0;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<Users />} title="Total Students" value={summary.totalStudents} color="blue" />
            <StatCard icon={<UserCheck />} title="Present" value={summary.present} color="green" rate={attendanceRate}/>
            <StatCard icon={<UserX />} title="Absent" value={summary.absent} color="red" />
            <StatCard icon={<Clock />} title="Pending" value={summary.pending} color="orange" />
        </div>
    );
};

const ControlsSection = ({ session, onUpdate, onRefresh, onHeadcountClick, onSubmit }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
            <HeadcountCard session={session} onUpdate={() => onUpdate(session.id)} />
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-md flex items-center justify-around gap-4">
            <button onClick={() => onRefresh(session.id)} className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 font-medium"><RefreshCw size={16} /> Refresh</button>
            <button onClick={onHeadcountClick} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 flex items-center gap-2 text-sm font-semibold"><Camera size={16} /> Headcount Verification</button>
            <button onClick={onSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2 text-sm font-semibold">Submit Final Attendance</button>
        </div>
    </div>
);

const StatCard = ({ icon, title, value, color, rate }) => {
  const colors = { blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', red: 'bg-red-100 text-red-600', orange: 'bg-orange-100 text-orange-600' };
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {rate !== undefined && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${rate.toFixed(1)}%` }}></div></div>
            <p className="text-xs text-slate-400 mt-1">{rate.toFixed(1)}% Attendance Rate</p>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${colors[color]}`}>{React.cloneElement(icon, { size: 24 })}</div>
    </div>
  );
};

const HeadcountCard = ({ session, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [count, setCount] = useState(session.finalHeadcount);

    useEffect(() => { setCount(session.finalHeadcount); }, [session.finalHeadcount]);

    const handleSave = async () => {
        try {
            await axios.put(`${API_BASE_URL}/headcount/${session.id}`, { newCount: count });
            setIsEditing(false);
            onUpdate();
        } catch (error) { alert("Failed to update headcount."); }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-full">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 font-medium">Headcount</p>
                    {isEditing ? (
                        <input type="number" value={count ?? ''} onChange={(e) => setCount(parseInt(e.target.value, 10))} className="text-3xl font-bold mt-1 w-24 border-b-2 border-blue-500 focus:outline-none" autoFocus />
                    ) : (
                        <p className="text-3xl font-bold mt-1">{session.finalHeadcount ?? '--'}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">AI Count: {session.aiHeadcount ?? 'N/A'}</p>
                </div>
                {isEditing ? <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save size={20} /></button> : <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-blue-600"><Edit3 size={20} /></button>}
            </div>
        </div>
    );
};

const StudentList = ({ records, onStatusChange }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-lg font-semibold mb-4">Student Attendance ({records.length} students)</h2>
    <div className="flex flex-col gap-2">
      {records.sort((a, b) => a.student.name.localeCompare(b.student.name)).map(record => <StudentRow key={record._id} record={record} onStatusChange={onStatusChange} />)}
    </div>
  </div>
);

const StudentRow = ({ record, onStatusChange }) => {
  const { student } = record;
  if (!student) return null; // Safety check

  const statusConfig = { 
      Present: { bg: 'bg-green-100', text: 'text-green-800' }, 
      Absent: { bg: 'bg-red-100', text: 'text-red-800' },
      Pending: { bg: 'bg-white', text: 'text-slate-600' } 
  };
  const currentStyle = statusConfig[record.status] || statusConfig.Pending;
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`p-3 rounded-lg flex items-center justify-between transition-colors duration-200 ${currentStyle.bg}`}>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {getInitials(student.name)}
            </div>
            <div>
                <p className="font-semibold text-slate-800">{student.name}</p>
                <p className="text-xs text-slate-500">ID: {student.studentId}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onStatusChange(record._id, 'Present')} className={`px-3 py-1 text-sm rounded-md ${record.status === 'Present' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-green-200'}`}>Present</button>
            <button onClick={() => onStatusChange(record._id, 'Absent')} className={`px-3 py-1 text-sm rounded-md ${record.status === 'Absent' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-red-200'}`}>Absent</button>
        </div>
    </div>
  );
};
