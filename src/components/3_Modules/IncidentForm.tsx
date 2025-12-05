import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CreateIncidentDTO, GravityLevel } from "@/interfaces/Incident";

interface IncidentFormProps {
    onSuccess?: () => void;
}

export default function IncidentForm({ onSuccess }: IncidentFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        type: "",
        address: "",
        latitude: "33.5731",
        longitude: "-7.5898",
        gravity: "MEDIUM" as GravityLevel,
        patientName: "",
        patientAge: "",
    });

    const gravityOptions = [
        { value: "CRITICAL", label: "🔴 Critical" },
        { value: "HIGH", label: "🟠 High" },
        { value: "MEDIUM", label: "🟡 Medium" },
        { value: "LOW", label: "🟢 Low" },
    ];

    const typeOptions = [
        { value: "Cardiac", label: "❤️ Cardiac" },
        { value: "Accident", label: "🚗 Accident" },
        { value: "Fire", label: "🔥 Fire" },
        { value: "Medical", label: "🏥 Medical" },
        { value: "Other", label: "📋 Other" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Use user-provided location
        const location = {
            lat: parseFloat(formData.latitude) || 33.5731,
            lng: parseFloat(formData.longitude) || -7.5898,
        };

        const incident: CreateIncidentDTO = {
            type: formData.type,
            address: formData.address,
            location,
            gravity: formData.gravity,
            status: "PENDING",
            patient: {
                name: formData.patientName || "Unknown",
                age: formData.patientAge ? parseInt(formData.patientAge) : null,
            },
            AmbulanceId: null,
            createdAt: new Date().toISOString(),
        };

        try {
            const response = await fetch("http://localhost:5000/incidents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(incident),
            });

            if (!response.ok) {
                throw new Error("Failed to create incident");
            }

            setSuccess(true);
            setFormData({
                type: "",
                address: "",
                latitude: "33.5731",
                longitude: "-7.5898",
                gravity: "MEDIUM",
                patientName: "",
                patientAge: "",
            });
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🚨</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">New Incident</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Incident Type */}
                <div className="space-y-2">
                    <Label htmlFor="type">Incident Type *</Label>
                    <Select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        options={[{ value: "", label: "Select type..." }, ...typeOptions]}
                        required
                    />
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                        id="address"
                        type="text"
                        placeholder="Enter incident address..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label>Location *</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                id="latitude"
                                type="number"
                                step="0.0001"
                                placeholder="Latitude"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Latitude</span>
                        </div>
                        <div>
                            <Input
                                id="longitude"
                                type="number"
                                step="0.0001"
                                placeholder="Longitude"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Longitude</span>
                        </div>
                    </div>
                </div>

                {/* Gravity */}
                <div className="space-y-2">
                    <Label htmlFor="gravity">Gravity Level *</Label>
                    <Select
                        id="gravity"
                        value={formData.gravity}
                        onChange={(e) => setFormData({ ...formData, gravity: e.target.value as GravityLevel })}
                        options={gravityOptions}
                        required
                    />
                </div>

                {/* Patient Info */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Patient Information (Optional)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="patientName">Name</Label>
                            <Input
                                id="patientName"
                                type="text"
                                placeholder="Patient name"
                                value={formData.patientName}
                                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientAge">Age</Label>
                            <Input
                                id="patientAge"
                                type="number"
                                placeholder="Age"
                                min="0"
                                max="150"
                                value={formData.patientAge}
                                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                        ❌ {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                        ✅ Incident created successfully!
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span> Creating...
                        </span>
                    ) : (
                        "🚨 Create Incident"
                    )}
                </Button>
            </form>
        </div>
    );
}
