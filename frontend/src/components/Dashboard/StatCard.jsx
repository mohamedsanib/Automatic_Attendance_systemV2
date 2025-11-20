import React from "react";


export default function StatCard({ icon, title, value }) {
return (
<div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
<div>
<p className="text-slate-500 text-sm">{title}</p>
<p className="text-2xl font-bold text-slate-800">{value}</p>
</div>
<div className="p-3 bg-blue-100 rounded-full text-blue-600">{icon}</div>
</div>
);
}