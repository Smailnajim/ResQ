import { useState, useEffect, useCallback } from "react";
import type { Ambulance } from "../types";
import { ambulanceService } from "../services/api";

export function useAmbulances() {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAmbulances = useCallback(async () => {
        try {
            setLoading(true);
            const data = await ambulanceService.getAll();
            setAmbulances(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching ambulances:", err);
            setError("Failed to fetch ambulances");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAmbulances();
    }, [fetchAmbulances]);

    const updateStatus = useCallback(async (id: string | number, status: Ambulance["status"]) => {
        try {
            await ambulanceService.updateStatus(id, status);
            await fetchAmbulances();
        } catch (err) {
            console.error("Error updating ambulance status:", err);
            throw err;
        }
    }, [fetchAmbulances]);

    const createAmbulance = useCallback(async (ambulance: Omit<Ambulance, "id">) => {
        try {
            await ambulanceService.create(ambulance);
            await fetchAmbulances();
        } catch (err) {
            console.error("Error creating ambulance:", err);
            throw err;
        }
    }, [fetchAmbulances]);

    const deleteAmbulance = useCallback(async (id: string | number) => {
        try {
            await ambulanceService.delete(id);
            await fetchAmbulances();
        } catch (err) {
            console.error("Error deleting ambulance:", err);
            throw err;
        }
    }, [fetchAmbulances]);

    return {
        ambulances,
        loading,
        error,
        fetchAmbulances,
        updateStatus,
        createAmbulance,
        deleteAmbulance,
    };
}
