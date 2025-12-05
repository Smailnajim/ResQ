import { useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";//npm install --save-dev @types/leaflet
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function SimpleMap() {
    // Typed reference to Leaflet map instance
    const mapRef = useRef<LeafletMap | null>(null);

    const latitude: number = 51.505;
    const longitude: number = -0.09;

    const center: L.LatLngExpression = [latitude, longitude];

    return (
        <MapContainer
            center={center}
            zoom={13}
            ref={mapRef}
            style={{ height: "100vh", width: "100vw" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
            OpenStreetMap
        </a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    );
};


