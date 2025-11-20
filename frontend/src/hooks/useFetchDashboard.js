import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";


export default function useFetchDashboard() {
const [dashboardData, setDashboardData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);


const fetchDashboard = useCallback(async () => {
try {
const res = await axiosClient.get("/dashboard");
setDashboardData(res.data);
setError(null);
} catch (err) {
setError("Failed to fetch data. Ensure backend is running.");
}
setIsLoading(false);
}, []);


useEffect(() => {
fetchDashboard();
const interval = setInterval(fetchDashboard, 5000);
return () => clearInterval(interval);
}, [fetchDashboard]);


return { dashboardData, isLoading, error, fetchDashboard };
}