import React from "react";
import { RefreshCw, Camera } from "lucide-react";


export default function ControlsSection({ onRefresh, onHeadcountClick, onSubmit }) {
return (
<div className="bg-white p-4 rounded-xl shadow flex gap-4">
<button onClick={onRefresh} className="flex gap-2 items-center">
<RefreshCw size={16} /> Refresh
</button>
<button onClick={onHeadcountClick} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex gap-2">
<Camera size={16} /> Headcount
</button>
<button onClick={onSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg">
Submit
</button>
</div>
);
}