import React from "react";


export default function Header() {
return (
<header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow p-4 flex justify-between">
<h1 className="text-xl font-bold">BLE Attendance System</h1>
<p className="text-sm">{new Date().toDateString()}</p>
</header>
);
}