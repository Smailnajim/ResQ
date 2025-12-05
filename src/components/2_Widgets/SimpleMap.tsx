import { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ambulance type definition
interface Ambulance {
    id: number;
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

// Custom ambulance icon based on status
const createAmbulanceIcon = (status: string) => {
    const color = status === "AVAILABLE" ? "#22c55e" : status === "OCCUPIED" ? "#ef4444" : "#f59e0b";

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

export default function SimpleMap() {
    const mapRef = useRef<LeafletMap | null>(null);
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [loading, setLoading] = useState(true);

    // Casablanca center (where your ambulances are located)
    const center: L.LatLngExpression = [33.5731, -7.5898];

    // Fetch ambulances from JSON server
    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                const response = await fetch("http://localhost:5000/ambulances");
                const data = await response.json();
                console.error("data", data);
                setAmbulances(data);
            } catch (error) {
                console.error("Error fetching ambulances:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAmbulances();
    }, []);

    return (
        <div className="w-full h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
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

                {ambulances.map((ambulance) => (
                    <Marker
                        key={ambulance.id}
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
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <div className="text-sm font-semibold mb-2">Ambulances</div>
                <div className="space-y-1 text-xs">
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
                </div>
            </div>
        </div>
    );
}


