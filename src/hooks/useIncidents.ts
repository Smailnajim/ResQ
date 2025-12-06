import { useState, useEffect, useCallback } from "react";
import type { Incident } from "../types";
import { incidentService, ambulanceService } from "../services/api";

export function useIncidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIncidents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await incidentService.getAll();
            setIncidents(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching incidents:", err);
            setError("Failed to fetch incidents");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    const updateStatus = useCallback(async (
        incident: Incident,
        newStatus: Incident["status"],
        freeAmbulance: boolean = false
    ) => {
        try {
            const closedAt = (newStatus === "RESOLVED" || newStatus === "CANCELLED")
                ? new Date().toISOString()
                : undefined;

            await incidentService.updateStatus(incident.id, newStatus, closedAt);

            // Free ambulance if needed
            if (freeAmbulance && incident.AmbulanceId) {
                await ambulanceService.updateStatus(incident.AmbulanceId, "AVAILABLE");
            }

            await fetchIncidents();
        } catch (err) {
            console.error("Error updating incident status:", err);
            throw err;
        }
    }, [fetchIncidents]);

    const createIncident = useCallback(async (incident: Omit<Incident, "id">) => {
        try {
            await incidentService.create(incident);
            await fetchIncidents();
        } catch (err) {
            console.error("Error creating incident:", err);
            throw err;
        }
    }, [fetchIncidents]);

    const assignAmbulance = useCallback(async (incidentId: string | number, ambulanceId: string | number) => {
        try {
            await incidentService.assignAmbulance(incidentId, ambulanceId);
            await ambulanceService.updateStatus(ambulanceId, "OCCUPIED");
            await fetchIncidents();
        } catch (err) {
            console.error("Error assigning ambulance:", err);
            throw err;
        }
    }, [fetchIncidents]);

    const deleteIncident = useCallback(async (incident: Incident) => {
        try {
            // Free ambulance if assigned to active incident
            if (incident.AmbulanceId && (incident.status === "IN_PROGRESS" || incident.status === "PENDING")) {
                await ambulanceService.updateStatus(incident.AmbulanceId, "AVAILABLE");
            }
            await incidentService.delete(incident.id);
            await fetchIncidents();
        } catch (err) {
            console.error("Error deleting incident:", err);
            throw err;
        }
    }, [fetchIncidents]);

    return {
        incidents,
        loading,
        error,
        fetchIncidents,
        updateStatus,
        createIncident,
        assignAmbulance,
        deleteIncident,
    };
}
