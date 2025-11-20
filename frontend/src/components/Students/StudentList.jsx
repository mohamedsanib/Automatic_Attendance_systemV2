import React from "react";
import StudentRow from "./StudentRow";


export default function StudentList({ records, onStatusChange }) {
return (
<div className="bg-white p-4 rounded-xl shadow mt-4">
<h3 className="text-lg font-bold mb-3">Students</h3>
<div className="flex flex-col gap-2">
{records.map((r) => (
<StudentRow key={r._id} record={r} onStatusChange={onStatusChange} />
))}
</div>
</div>
);
}