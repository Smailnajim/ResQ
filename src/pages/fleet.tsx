import { useEffect, useState } from "react";

interface Ambulance {
    id: number | string;
    matricule: string;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
    location: {
        lat: number;
        lng: number;
    };
    group: {
        driver: string;
        medic: string;
    };
    equipment: string[];
}

interface Incident {
    id: number | string;
    status: string;
    AmbulanceId: number | string | null;
}

type StatusFilter = "ALL" | "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export default function Fleet() {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>("ALL");
    const [updating, setUpdating] = useState<string | number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [ambulancesRes, incidentsRes] = await Promise.all([
                fetch("http://localhost:5000/ambulances"),
                fetch("http://localhost:5000/incidents")
            ]);
            const ambulancesData = await ambulancesRes.json();
            const incidentsData = await incidentsRes.json();
            setAmbulances(ambulancesData);
            setIncidents(incidentsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Check if ambulance is assigned to an active incident
    const isAssignedToActiveIncident = (ambulanceId: string | number): boolean => {
        return incidents.some(
            incident =>
                String(incident.AmbulanceId) === String(ambulanceId) &&
                (incident.status === "IN_PROGRESS" || incident.status === "PENDING")
        );
    };

    // Update ambulance status
    const updateAmbulanceStatus = async (ambulanceId: string | number, newStatus: Ambulance["status"]) => {
        // Check if assigned to active incident
        if (isAssignedToActiveIncident(ambulanceId)) {
            setError(`Cannot change status: This ambulance is assigned to an active incident`);
            setTimeout(() => setError(null), 4000);
            return;
        }

        setUpdating(ambulanceId);
        setError(null);
        try {
            await fetch(`http://localhost:5000/ambulances/${ambulanceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            await fetchData();
        } catch (error) {
            console.error("Error updating ambulance status:", error);
        } finally {
            setUpdating(null);
        }
    };

    // Filter ambulances based on status
    const filteredAmbulances = ambulances.filter(amb =>
        filter === "ALL" ? true : amb.status === filter
    );

    // Count by status
    const counts = {
        ALL: ambulances.length,
        AVAILABLE: ambulances.filter(a => a.status === "AVAILABLE").length,
        OCCUPIED: ambulances.filter(a => a.status === "OCCUPIED").length,
        MAINTENANCE: ambulances.filter(a => a.status === "MAINTENANCE").length,
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "AVAILABLE": return "bg-green-100 text-green-800 border-green-200";
            case "OCCUPIED": return "bg-red-100 text-red-800 border-red-200";
            case "MAINTENANCE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "AVAILABLE": return "🟢";
            case "OCCUPIED": return "🔴";
            case "MAINTENANCE": return "🟡";
            default: return "⚪";
        }
    };

    const filterButtons: { value: StatusFilter; label: string; color: string }[] = [
        { value: "ALL", label: "All", color: "bg-gray-600" },
        { value: "AVAILABLE", label: "Available", color: "bg-green-600" },
        { value: "OCCUPIED", label: "Occupied", color: "bg-red-600" },
        { value: "MAINTENANCE", label: "Maintenance", color: "bg-yellow-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700 font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🚑</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Fleet Management</h1>
                            <p className="text-gray-500 text-sm">Manage and monitor all ambulances</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{counts.AVAILABLE}</div>
                            <div className="text-xs text-green-600">Available</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{counts.OCCUPIED}</div>
                            <div className="text-xs text-red-600">Occupied</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{counts.MAINTENANCE}</div>
                            <div className="text-xs text-yellow-600">Maintenance</div>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 mr-2">Filter:</span>
                    {filterButtons.map(btn => (
                        <button
                            key={btn.value}
                            onClick={() => setFilter(btn.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === btn.value
                                ? `${btn.color} text-white shadow-md`
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {btn.label} ({counts[btn.value]})
                        </button>
                    ))}
                </div>
            </div>

            {/* Ambulances Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : filteredAmbulances.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <span className="text-4xl mb-3 block">🚑</span>
                    <p className="text-gray-500">No ambulances found with status "{filter}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAmbulances.map(ambulance => (
                        <div
                            key={ambulance.id}
                            className={`bg-white rounded-xl shadow-lg p-5 border-l-4 transition-all hover:shadow-xl ${getStatusStyle(ambulance.status)}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                        🚑
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-gray-800">{ambulance.matricule}</div>
                                        <div className="text-sm text-gray-500">ID: {ambulance.id}</div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusStyle(ambulance.status)}`}>
                                    {getStatusIcon(ambulance.status)} {ambulance.status}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Crew */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 mb-1">Crew</div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <span>🚗</span>
                                            <span className="font-medium">{ambulance.group.driver}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>👨‍⚕️</span>
                                            <span className="font-medium">{ambulance.group.medic}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Equipment */}
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Equipment</div>
                                    <div className="flex flex-wrap gap-1">
                                        {ambulance.equipment.map((item, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="text-xs text-gray-400 pt-2 border-t">
                                    📍 {ambulance.location.lat.toFixed(4)}, {ambulance.location.lng.toFixed(4)}
                                </div>

                                {/* Change Status */}
                                <div className="pt-3 border-t">
                                    <div className="text-xs text-gray-500 mb-2">Change Status:</div>
                                    <div className="flex gap-2">
                                        {ambulance.status !== "AVAILABLE" && (
                                            <button
                                                onClick={() => updateAmbulanceStatus(ambulance.id, "AVAILABLE")}
                                                disabled={updating === ambulance.id}
                                                className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                                            >
                                                {updating === ambulance.id ? "..." : "🟢 Available"}
                                            </button>
                                        )}
                                        {ambulance.status !== "OCCUPIED" && (
                                            <button
                                                onClick={() => updateAmbulanceStatus(ambulance.id, "OCCUPIED")}
                                                disabled={updating === ambulance.id}
                                                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                                            >
                                                {updating === ambulance.id ? "..." : "🔴 Occupied"}
                                            </button>
                                        )}
                                        {ambulance.status !== "MAINTENANCE" && (
                                            <button
                                                onClick={() => updateAmbulanceStatus(ambulance.id, "MAINTENANCE")}
                                                disabled={updating === ambulance.id}
                                                className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                                            >
                                                {updating === ambulance.id ? "..." : "🟡 Maintenance"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
