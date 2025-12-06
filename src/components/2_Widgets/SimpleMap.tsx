import { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Ambulance, Incident } from "../../types";
import { ambulanceService, incidentService } from "../../services/api";// Custom ambulance icon based on status
const createAmbulanceIcon = (status: string) => {
    const colorMap: { [key: string]: string } = {
        AVAILABLE: "#22c55e",
        OCCUPIED: "#ef4444",
        MAINTENANCE: "#f59e0b",
        LUNCH_BREAK: "#f97316"
    };
    const color = colorMap[status] || "#6b7280";

    return L.divIcon({
        className: "custom-ambulance-marker",
        html: `
            <div style="
                background: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 10H6"/>
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
                    <path d="M8 8v4"/>
                    <circle cx="17" cy="18" r="2"/>
                    <circle cx="7" cy="18" r="2"/>
                </svg>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
    });
};

// Custom incident icon based on gravity
const createIncidentIcon = (gravity: string, status: string) => {
    const colorMap: { [key: string]: string } = {
        CRITICAL: "#dc2626",
        HIGH: "#ea580c",
        MEDIUM: "#ca8a04",
        LOW: "#16a34a",
    };
    const color = colorMap[gravity] || "#6b7280";
    const isResolved = status === "RESOLVED" || status === "CANCELLED";

    return L.divIcon({
        className: "custom-incident-marker",
        html: `
            <div style="
                background: ${isResolved ? "#9ca3af" : color};
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ${!isResolved && status === "PENDING" ? "animation: pulse 2s infinite;" : ""}
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
    });
};

export default function SimpleMap() {
    const mapRef = useRef<LeafletMap | null>(null);
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [assigning, setAssigning] = useState<string | number | null>(null);

    // Casablanca center
    const center: L.LatLngExpression = [33.5731, -7.5898];

    // Fetch data using services
    const fetchData = async () => {
        try {
            const [ambulancesData, incidentsData] = await Promise.all([
                ambulanceService.getAll(),
                incidentService.getAll()
            ]);
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

    // Assign ambulance to incident
    const assignAmbulance = async (ambulanceId: string | number) => {
        if (!selectedIncident) return;

        setAssigning(ambulanceId);

        try {
            // Update incident with ambulance ID and change status to IN_PROGRESS
            await incidentService.assignAmbulance(selectedIncident.id, ambulanceId);

            // Update ambulance status to OCCUPIED
            await ambulanceService.updateStatus(ambulanceId, "OCCUPIED");

            // Refresh data and close panel
            await fetchData();
            setSelectedIncident(null);
        } catch (error) {
            console.error("Error assigning ambulance:", error);
        } finally {
            setAssigning(null);
        }
    };

    const getGravityLabel = (gravity: string) => {
        switch (gravity) {
            case "CRITICAL": return "🔴 Critical";
            case "HIGH": return "🟠 High";
            case "MEDIUM": return "🟡 Medium";
            case "LOW": return "🟢 Low";
            default: return gravity;
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

    // Haversine formula to calculate distance between two points
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get distances from selected incident to all ambulances
    const getAmbulanceDistances = () => {
        if (!selectedIncident) return [];
        return ambulances
            .map(amb => ({
                ...amb,
                distance: calculateDistance(
                    selectedIncident.location.lat,
                    selectedIncident.location.lng,
                    amb.location.lat,
                    amb.location.lng
                )
            }))
            .sort((a, b) => a.distance - b.distance);
    };

    return (
        <div className="w-full h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
            {/* Pulse animation for pending incidents */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>

            {loading && (
                <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            )}
            <MapContainer
                center={center}
                zoom={12}
                ref={mapRef}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Incident Markers */}
                {incidents.map((incident) => (
                    <Marker
                        key={`incident-${incident.id}`}
                        position={[incident.location.lat, incident.location.lng]}
                        icon={createIncidentIcon(incident.gravity, incident.status)}
                    >
                        <Popup>
                            <div className="min-w-[220px]">
                                <div className="font-bold text-lg mb-2 flex items-center gap-2">
                                    🚨 {incident.type}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                                        {incident.status}
                                    </span>
                                    <span className="text-xs font-medium">
                                        {getGravityLabel(incident.gravity)}
                                    </span>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p><strong>📍 Address:</strong> {incident.address}</p>
                                    <p><strong>👤 Patient:</strong> {incident.patient.name} {incident.patient.age ? `(${incident.patient.age} yrs)` : ""}</p>
                                    {incident.AmbulanceId && (
                                        <p className="text-blue-600"><strong>🚑 Ambulance:</strong> AMB-{String(incident.AmbulanceId).padStart(3, '0')}</p>
                                    )}
                                </div>
                                {/* Button to show distance panel */}
                                <button
                                    onClick={() => setSelectedIncident(incident)}
                                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-all flex items-center justify-center gap-2"
                                >
                                    📏 Calculate Distances
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Ambulance Markers */}
                {ambulances.map((ambulance) => (
                    <Marker
                        key={`ambulance-${ambulance.id}`}
                        position={[ambulance.location.lat, ambulance.location.lng]}
                        icon={createAmbulanceIcon(ambulance.status)}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <div className="font-bold text-lg mb-2 flex items-center gap-2">
                                    🚑 {ambulance.matricule}
                                </div>
                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${ambulance.status === "AVAILABLE"
                                    ? "bg-green-100 text-green-800"
                                    : ambulance.status === "OCCUPIED"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {ambulance.status}
                                </div>
                                <div className="text-sm space-y-1">
                                    <p><strong>Driver:</strong> {ambulance.group.driver}</p>
                                    <p><strong>Medic:</strong> {ambulance.group.medic}</p>
                                    <p><strong>Equipment:</strong> {ambulance.equipment.join(", ")}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Connection lines between ambulances and assigned incidents (only active ones) */}
                {incidents
                    .filter(incident =>
                        incident.AmbulanceId !== null &&
                        (incident.status === "IN_PROGRESS" || incident.status === "PENDING")
                    )
                    .map(incident => {
                        const ambulance = ambulances.find(
                            amb => String(amb.id) === String(incident.AmbulanceId)
                        );
                        if (!ambulance) return null;

                        return (
                            <Polyline
                                key={`line-${incident.id}-${ambulance.id}`}
                                positions={[
                                    [ambulance.location.lat, ambulance.location.lng],
                                    [incident.location.lat, incident.location.lng]
                                ]}
                                pathOptions={{
                                    color: "#8b5cf6",
                                    weight: 3,
                                    opacity: 0.8,
                                    dashArray: "10, 10",
                                }}
                            />
                        );
                    })}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <div className="text-sm font-semibold mb-2">🚑 Ambulances</div>
                <div className="space-y-1 text-xs mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span>Maintenance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        <span>Pause déjeuner</span>
                    </div>
                </div>
                <div className="text-sm font-semibold mb-2 border-t pt-2">🚨 Incidents</div>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-red-600"></span>
                        <span>Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-orange-500"></span>
                        <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-yellow-600"></span>
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-green-600"></span>
                        <span>Low</span>
                    </div>
                </div>
                <div className="text-sm font-semibold mb-2 border-t pt-2">🔗 Connections</div>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-purple-500" style={{ backgroundImage: "repeating-linear-gradient(90deg, #8b5cf6, #8b5cf6 4px, transparent 4px, transparent 8px)" }}></span>
                        <span>Assigned</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-blue-600">{incidents.filter(i => i.status === "PENDING").length}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-purple-600">{incidents.filter(i => i.status === "IN_PROGRESS").length}</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-green-600">{ambulances.filter(a => a.status === "AVAILABLE").length}</div>
                        <div className="text-xs text-gray-500">Available 🚑</div>
                    </div>
                </div>
            </div>

            {/* Distance Panel - shown when an incident is selected */}
            {selectedIncident && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 z-[1001] min-w-[320px] max-w-[400px]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📏</span>
                            <h3 className="font-bold text-gray-800">Distances to Ambulances</h3>
                        </div>
                        <button
                            onClick={() => setSelectedIncident(null)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 mb-3">
                        <div className="text-xs text-gray-500">Selected Incident</div>
                        <div className="font-semibold text-gray-800">🚨 {selectedIncident.type}</div>
                        <div className="text-sm text-gray-600">📍 {selectedIncident.address}</div>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {getAmbulanceDistances().map((amb, index) => (
                            <div
                                key={amb.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${index === 0 && amb.status === "AVAILABLE" ? "bg-green-50 border border-green-200" : "bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${amb.status === "AVAILABLE" ? "bg-green-500" :
                                        amb.status === "OCCUPIED" ? "bg-red-500" : "bg-yellow-500"
                                        }`}></span>
                                    <div>
                                        <div className="font-medium text-sm">🚑 {amb.matricule}</div>
                                        <div className="text-xs text-gray-500">{amb.status}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <div className={`font-bold ${index === 0 && amb.status === "AVAILABLE" ? "text-green-600" : "text-gray-700"}`}>
                                            {amb.distance.toFixed(2)} km
                                        </div>
                                        {index === 0 && amb.status === "AVAILABLE" && (
                                            <div className="text-xs text-green-600">Closest</div>
                                        )}
                                    </div>
                                    {/* Assign button - only for PENDING incidents and AVAILABLE ambulances */}
                                    {selectedIncident.status === "PENDING" && amb.status === "AVAILABLE" && (
                                        <button
                                            onClick={() => assignAmbulance(amb.id)}
                                            disabled={assigning === amb.id}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${assigning === amb.id
                                                ? "bg-gray-300 text-gray-500 cursor-wait"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                                }`}
                                        >
                                            {assigning === amb.id ? "..." : "Assign"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Already assigned message */}
                    {selectedIncident.AmbulanceId && (
                        <div className="mt-3 pt-3 border-t text-center text-sm text-purple-600">
                            ✅ Already assigned to AMB-{String(selectedIncident.AmbulanceId).padStart(3, '0')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
