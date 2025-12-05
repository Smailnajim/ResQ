import { useEffect, useState } from "react";
import IncidentForm from "@/components/3_Modules/IncidentForm";
import type { Incident } from "@/interfaces/Incident";

export default function Incidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIncidents = async () => {
        try {
            const response = await fetch("http://localhost:5000/incidents");
            const data = await response.json();
            setIncidents(data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const getGravityColor = (gravity: string) => {
        switch (gravity) {
            case "CRITICAL": return "bg-red-100 text-red-800 border-red-200";
            case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "LOW": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-blue-100 text-blue-800";
            case "IN_PROGRESS": return "bg-purple-100 text-purple-800";
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "CANCELLED": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-1">
                <IncidentForm onSuccess={fetchIncidents} />
            </div>

            {/* Right: Incidents List */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">📋</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Incidents List</h2>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            {incidents.length} total
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : incidents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <span className="text-4xl mb-3 block">📭</span>
                            <p>No incidents yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {incidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className={`p-4 rounded-lg border-l-4 ${getGravityColor(incident.gravity)} transition-all hover:shadow-md`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-800">
                                                    {incident.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                                                    {incident.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                📍 {incident.address}
                                            </p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                🌐 Lat: {incident.location.lat.toFixed(4)}, Lng: {incident.location.lng.toFixed(4)}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>👤 {incident.patient.name}</span>
                                                {incident.patient.age && <span>Age: {incident.patient.age}</span>}
                                                {incident.AmbulanceId && (
                                                    <span className="text-blue-600">🚑 AMB-{String(incident.AmbulanceId).padStart(3, '0')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getGravityColor(incident.gravity)}`}>
                                                {incident.gravity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
