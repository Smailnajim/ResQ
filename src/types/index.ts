// Ambulance Types
export interface Ambulance {
    id: number | string;
    matricule: string;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "LUNCH_BREAK";
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

export type AmbulanceStatus = Ambulance["status"];
export type StatusFilter = "ALL" | AmbulanceStatus;

// Incident Types
export interface Incident {
    id: number | string;
    type: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    gravity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
    patient: {
        name: string;
        age: number | null;
    };
    AmbulanceId: number | string | null;
    createdAt: string;
    closedAt?: string;
}

export type IncidentStatus = Incident["status"];
export type IncidentGravity = Incident["gravity"];
