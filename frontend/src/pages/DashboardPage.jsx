import React, { useState } from "react";
import Header from "../components/Header";
import axiosClient from "../api/axiosClient";


export default function DashboardPage() {
const { dashboardData, isLoading, error, fetchDashboard } = useFetchDashboard();


const [showWebcam, setShowWebcam] = useState(false);
const [result, setResult] = useState(null);


const submitFinal = async () => {
const { present } = dashboardData.summary;
const { finalHeadcount } = dashboardData.session;


if (finalHeadcount === null) {
setResult({ title: "Headcount Needed", message: "Please record or enter headcount first." });
return;
}


if (finalHeadcount !== present) {
setResult({ title: "Mismatch", message: "Headcount and present count do not match." });
return;
}


await axiosClient.post(`/sessions/submit`, { sessionId: dashboardData.session.id });
setResult({ title: "Success", message: "Attendance submitted." });
};


if (isLoading) return <p className="text-center p-10">Loading...</p>;
if (error) return <p className="text-center text-red-500">{error}</p>;


return (
<>
<Header />


<div className="p-4 max-w-6xl mx-auto">
<DashboardStats summary={dashboardData.summary} />


<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<HeadcountCard session={dashboardData.session} onUpdate={fetchDashboard} />


<div className="md:col-span-2">
<ControlsSection
onRefresh={fetchDashboard}
onHeadcountClick={() => setShowWebcam(true)}
onSubmit={submitFinal}
/>
</div>
</div>


<StudentList records={dashboardData.records} onStatusChange={async (id, status) => {
await axiosClient.put(`/attendance/${id}`, { status });
fetchDashboard();
}} />
</div>


{showWebcam && (
<WebcamRecorderModal
sessionId={dashboardData.session.id}
onUploadComplete={fetchDashboard}
onClose={() => setShowWebcam(false)}
/>
)}


{result && <ResultModal content={result} onClose={() => setResult(null)} />}
</>
);
}