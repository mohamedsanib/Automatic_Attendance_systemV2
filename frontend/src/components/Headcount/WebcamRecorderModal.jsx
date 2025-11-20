import React from "react";
import Webcam from "react-webcam";
import useHeadcountLogic from "../../hooks/useHeadcountLogic";
import { Video } from "lucide-react";


export default function WebcamRecorderModal({ sessionId, onUploadComplete, onClose }) {
const { webcamRef, status, startRecording } = useHeadcountLogic(sessionId, onUploadComplete, onClose);


return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
<div className="bg-white p-6 rounded-lg w-full max-w-lg">
<h3 className="text-center font-bold text-xl mb-4">Headcount Verification</h3>


<div className="bg-black rounded overflow-hidden aspect-video">
<Webcam ref={webcamRef} audio={false} className="w-full" />
</div>


<div className="text-center mt-4">
{status === "idle" && (
<button onClick={startRecording} className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 mx-auto">
<Video size={20} /> Start Recording
</button>
)}


{status === "recording" && <p className="text-lg text-red-600">Recording...</p>}
</div>


<button onClick={onClose} className="w-full mt-4 bg-slate-200 p-2 rounded-md">Cancel</button>
</div>
</div>
);
}