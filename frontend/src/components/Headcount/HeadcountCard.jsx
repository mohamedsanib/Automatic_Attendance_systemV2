import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Save, Edit3 } from "lucide-react";


export default function HeadcountCard({ session, onUpdate }) {
const [editing, setEditing] = useState(false);
const [count, setCount] = useState(session.finalHeadcount);


const save = async () => {
await axiosClient.put(`/headcount/${session.id}`, { newCount: count });
setEditing(false);
onUpdate();
};


return (
<div className="bg-white p-4 rounded-xl shadow">
<p className="text-slate-500">Headcount</p>
{editing ? (
<input
type="number"
className="text-3xl font-bold border-b-2"
value={count}
onChange={(e) => setCount(Number(e.target.value))}
/>
) : (
<p className="text-3xl font-bold">{session.finalHeadcount ?? "--"}</p>
)}


{editing ? (
<button onClick={save} className="text-green-600 mt-2">
<Save />
</button>
) : (
<button onClick={() => setEditing(true)} className="text-slate-500 mt-2">
<Edit3 />
</button>
)}
</div>
);
}