import React from "react";
import { getInitials } from "../../utils/helpers";


export default function StudentRow({ record, onStatusChange }) {
const st = record.student;
if (!st) return null;


return (
<div className="p-3 rounded-lg bg-white shadow flex justify-between items-center">
<div className="flex gap-4 items-center">
<div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold">
{getInitials(st.name)}
</div>
<div>
<p className="font-semibold">{st.name}</p>
<p className="text-xs text-slate-500">ID: {st.studentId}</p>
</div>
</div>


<div className="flex gap-2">
<button
onClick={() => onStatusChange(record._id, "Present")}
className="px-3 py-1 rounded bg-green-600 text-white"
>
Present
</button>
<button
onClick={() => onStatusChange(record._id, "Absent")}
className="px-3 py-1 rounded bg-red-600 text-white"
>
Absent
</button>
</div>
</div>
);
}