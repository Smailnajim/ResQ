import { useEffect, useState } from "react";
import IncidentForm from "@/components/3_Modules/IncidentForm";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Ambulance, Incident } from "../types";
import { ambulanceService, incidentService } from "../services/api";
import { getGravityColor, getIncidentStatusColor, calculateResolutionTime } from "../utils/helpers";

export default function Incidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | string | null>(null);
    const [selectedAmbulance, setSelectedAmbulance] = useState<{ [key: string | number]: string }>({});
    const [updatingStatus, setUpdatingStatus] = useState<string | number | null>(null);
    const [deleting, setDeleting] = useState<string | number | null>(null);

    // Fetch data using services
    const fetchIncidents = async () => {
        try {
            const data = await incidentService.getAll();
            setIncidents(data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAmbulances = async () => {
        try {
            const data = await ambulanceService.getAll();
            setAmbulances(data);
        } catch (error) {
            console.error("Error fetching ambulances:", error);
        }
    };

    useEffect(() => {
        fetchIncidents();
        fetchAmbulances();
    }, []);

    const availableAmbulances = ambulances.filter(amb => amb.status === "AVAILABLE");

    const assignAmbulance = async (incidentId: number | string) => {
        const ambulanceId = selectedAmbulance[incidentId];
        if (!ambulanceId) return;

        setAssigningId(incidentId);

        try {
            // Update incident with ambulance ID and change status to IN_PROGRESS
            await incidentService.assignAmbulance(incidentId, ambulanceId);

            // Update ambulance status to OCCUPIED
            await ambulanceService.updateStatus(ambulanceId, "OCCUPIED");

            // Refresh data
            await fetchIncidents();
            await fetchAmbulances();

            // Clear selection
            setSelectedAmbulance(prev => {
                const updated = { ...prev };
                delete updated[incidentId];
                return updated;
            });
        } catch (error) {
            console.error("Error assigning ambulance:", error);
        } finally {
            setAssigningId(null);
        }
    };

    // Update incident status
    const updateIncidentStatus = async (incident: Incident, newStatus: Incident["status"]) => {
        setUpdatingStatus(incident.id);

        try {
            // Prepare update data
            const closedAt = (newStatus === "RESOLVED" || newStatus === "CANCELLED")
                ? new Date().toISOString()
                : undefined;

            // Update incident status using service
            await incidentService.updateStatus(incident.id, newStatus, closedAt);

            // If resolved or cancelled and has ambulance assigned, set ambulance to AVAILABLE
            if ((newStatus === "RESOLVED" || newStatus === "CANCELLED") && incident.AmbulanceId) {
                await ambulanceService.updateStatus(incident.AmbulanceId, "AVAILABLE");
            }

            // Refresh data
            await fetchIncidents();
            await fetchAmbulances();
        } catch (error) {
            console.error("Error updating incident status:", error);
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Delete incident
    const deleteIncident = async (incident: Incident) => {
        if (!confirm(`Are you sure you want to delete this incident at ${incident.address}?`)) {
            return;
        }

        setDeleting(incident.id);
        try {
            // If incident has ambulance and is active, free the ambulance first
            if (incident.AmbulanceId && (incident.status === "IN_PROGRESS" || incident.status === "PENDING")) {
                await ambulanceService.updateStatus(incident.AmbulanceId, "AVAILABLE");
            }

            // Delete the incident using service
            await incidentService.delete(incident.id);

            await fetchIncidents();
            await fetchAmbulances();
        } catch (error) {
            console.error("Error deleting incident:", error);
        } finally {
            setDeleting(null);
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
                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                                🚑 {availableAmbulances.length} available
                            </span>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                {incidents.length} total
                            </span>
                        </div>
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
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
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

                                            {/* Closed time for RESOLVED or CANCELLED */}
                                            {(incident.status === "RESOLVED" || incident.status === "CANCELLED") && incident.closedAt && (
                                                <div className={`mt-2 p-2 rounded-lg ${incident.status === "RESOLVED" ? "bg-green-50" : "bg-gray-50"}`}>
                                                    <div className={`text-xs flex items-center gap-1 ${incident.status === "RESOLVED" ? "text-green-600" : "text-gray-500"}`}>
                                                        <span>🕐 {incident.status === "RESOLVED" ? "Resolved" : "Cancelled"} at:</span>
                                                        <span className="font-medium">
                                                            {new Date(incident.closedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className={`text-xs flex items-center gap-1 mt-1 ${incident.status === "RESOLVED" ? "text-green-700" : "text-gray-600"}`}>
                                                        <span>⏱️ Duration:</span>
                                                        <span className="font-bold">
                                                            {calculateResolutionTime(incident.createdAt, incident.closedAt)}
                                                        </span>
                                                        <span>to {incident.status === "RESOLVED" ? "resolve" : "cancel"}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assign Ambulance Section - Only for PENDING incidents */}
                                            {incident.status === "PENDING" && !incident.AmbulanceId && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            value={selectedAmbulance[incident.id] || ""}
                                                            onChange={(e) => setSelectedAmbulance(prev => ({
                                                                ...prev,
                                                                [incident.id]: e.target.value
                                                            }))}
                                                            options={[
                                                                { value: "", label: "Select ambulance..." },
                                                                ...availableAmbulances.map(amb => ({
                                                                    value: String(amb.id),
                                                                    label: `🚑 ${amb.matricule}`
                                                                }))
                                                            ]}
                                                            className="flex-1 h-8 text-sm"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => assignAmbulance(incident.id)}
                                                            disabled={!selectedAmbulance[incident.id] || assigningId === incident.id}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                                                        >
                                                            {assigningId === incident.id ? "..." : "Assign"}
                                                        </Button>
                                                    </div>
                                                    {availableAmbulances.length === 0 && (
                                                        <p className="text-xs text-orange-600 mt-1">
                                                            ⚠️ No ambulances available
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Change Status Section */}
                                            {incident.status !== "RESOLVED" && incident.status !== "CANCELLED" && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="text-xs text-gray-500 mb-2">Change Status:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {incident.status === "PENDING" && incident.AmbulanceId && (
                                                            <button
                                                                onClick={() => updateIncidentStatus(incident, "IN_PROGRESS")}
                                                                disabled={updatingStatus === incident.id}
                                                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                                                            >
                                                                {updatingStatus === incident.id ? "..." : "▶️ Start"}
                                                            </button>
                                                        )}
                                                        {incident.status === "IN_PROGRESS" && (
                                                            <button
                                                                onClick={() => updateIncidentStatus(incident, "RESOLVED")}
                                                                disabled={updatingStatus === incident.id}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                                                            >
                                                                {updatingStatus === incident.id ? "..." : "✅ Resolved"}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => updateIncidentStatus(incident, "CANCELLED")}
                                                            disabled={updatingStatus === incident.id}
                                                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                                                        >
                                                            {updatingStatus === incident.id ? "..." : "❌ Cancel"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getGravityColor(incident.gravity)}`}>
                                                {incident.gravity}
                                            </span>
                                            <button
                                                onClick={() => deleteIncident(incident)}
                                                disabled={deleting === incident.id}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete incident"
                                            >
                                                {deleting === incident.id ? "..." : "🗑️"}
                                            </button>
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
