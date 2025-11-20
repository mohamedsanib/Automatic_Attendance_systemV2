import React from "react";
import StatCard from "./StatCard";
import { Users, UserCheck, UserX, Clock } from "lucide-react";


export default function DashboardStats({ summary }) {
return (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
<StatCard title="Total" value={summary.totalStudents} icon={<Users />} />
<StatCard title="Present" value={summary.present} icon={<UserCheck />} />
<StatCard title="Absent" value={summary.absent} icon={<UserX />} />
<StatCard title="Pending" value={summary.pending} icon={<Clock />} />
</div>
);
}