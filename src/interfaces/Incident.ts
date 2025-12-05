export interface Patient {
    name: string;
    age: number | null;
}

export interface Location {
    lat: number;
    lng: number;
}

export type GravityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
export type IncidentType = "Cardiac" | "Accident" | "Fire" | "Medical" | "Other";

export interface Incident {
    id: number;
    type: IncidentType | string;
    address: string;
    location: Location;
    gravity: GravityLevel;
    status: IncidentStatus;
    patient: Patient;
    AmbulanceId: number | null;
    createdAt: string;
}

export interface CreateIncidentDTO {
    type: string;
    address: string;
    location: Location;
    gravity: GravityLevel;
    status: IncidentStatus;
    patient: Patient;
    AmbulanceId: number | null;
    createdAt: string;
}
