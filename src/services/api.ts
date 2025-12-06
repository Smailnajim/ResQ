import type { Ambulance, Incident } from "../types";

const API_URL = "http://localhost:5000";

// ============================================
// AMBULANCE API SERVICES
// ============================================

export const ambulanceService = {
    getAll: async (): Promise<Ambulance[]> => {
        const res = await fetch(`${API_URL}/ambulances`);
        return res.json();
    },

    getById: async (id: string | number): Promise<Ambulance> => {
        const res = await fetch(`${API_URL}/ambulances/${id}`);
        return res.json();
    },

    create: async (ambulance: Omit<Ambulance, "id">): Promise<Ambulance> => {
        const res = await fetch(`${API_URL}/ambulances`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ambulance),
        });
        return res.json();
    },

    update: async (id: string | number, data: Partial<Ambulance>): Promise<Ambulance> => {
        const res = await fetch(`${API_URL}/ambulances/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateStatus: async (id: string | number, status: Ambulance["status"]): Promise<Ambulance> => {
        return ambulanceService.update(id, { status });
    },

    delete: async (id: string | number): Promise<void> => {
        await fetch(`${API_URL}/ambulances/${id}`, {
            method: "DELETE",
        });
    },
};

// ============================================
// INCIDENT API SERVICES
// ============================================

export const incidentService = {
    getAll: async (): Promise<Incident[]> => {
        const res = await fetch(`${API_URL}/incidents`);
        return res.json();
    },

    getById: async (id: string | number): Promise<Incident> => {
        const res = await fetch(`${API_URL}/incidents/${id}`);
        return res.json();
    },

    create: async (incident: Omit<Incident, "id">): Promise<Incident> => {
        const res = await fetch(`${API_URL}/incidents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(incident),
        });
        return res.json();
    },

    update: async (id: string | number, data: Partial<Incident>): Promise<Incident> => {
        const res = await fetch(`${API_URL}/incidents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateStatus: async (id: string | number, status: Incident["status"], closedAt?: string): Promise<Incident> => {
        const data: Partial<Incident> = { status };
        if (closedAt) data.closedAt = closedAt;
        return incidentService.update(id, data);
    },

    assignAmbulance: async (id: string | number, ambulanceId: string | number): Promise<Incident> => {
        return incidentService.update(id, {
            AmbulanceId: ambulanceId,
            status: "IN_PROGRESS"
        });
    },

    delete: async (id: string | number): Promise<void> => {
        await fetch(`${API_URL}/incidents/${id}`, {
            method: "DELETE",
        });
    },
};
