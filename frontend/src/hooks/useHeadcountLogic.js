import { useRef, useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";


export default function useHeadcountLogic(sessionId, onUploadComplete, onClose) {
const webcamRef = useRef(null);
const recorderRef = useRef(null);
const chunksRef = useRef([]);


const [status, setStatus] = useState("idle");


const handleData = useCallback((e) => {
if (e.data.size > 0) chunksRef.current.push(e.data);
}, []);


const onStop = useCallback(async () => {
const blob = new Blob(chunksRef.current, { type: "video/webm" });
const form = new FormData();
form.append("video", blob);


setStatus("uploading");


await axiosClient.post(`/headcount/${sessionId}`, form);
onUploadComplete();
onClose();
}, [sessionId, onUploadComplete, onClose]);


const startRecording = () => {
const stream = webcamRef.current.stream;
const rec = new MediaRecorder(stream);
recorderRef.current = rec;
chunksRef.current = [];


rec.ondataavailable = handleData;
rec.onstop = onStop;


setStatus("recording");
rec.start();


setTimeout(() => rec.state === "recording" && rec.stop(), 5000);
};


return { webcamRef, status, startRecording };
}