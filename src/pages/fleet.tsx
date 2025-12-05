import { useEffect, useState } from "react";

interface Ambulance {
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

interface Incident {
    id: number | string;
    status: string;
    AmbulanceId: number | string | null;
}

type StatusFilter = "ALL" | "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "LUNCH_BREAK";

export default function Fleet() {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>("ALL");
    const [updating, setUpdating] = useState<string | number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        matricule: "",
        driver: "",
        medic: "",
        equipment: "",
        lat: "33.5731",
        lng: "-7.5898",
    });

    const fetchData = async () => {
        try {
            const [ambulancesRes, incidentsRes] = await Promise.all([
                fetch("http://localhost:5000/ambulances"),
                fetch("http://localhost:5000/incidents")
            ]);
            const ambulancesData = await ambulancesRes.json();
            const incidentsData = await incidentsRes.json();
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

    const isAssignedToActiveIncident = (ambulanceId: string | number): boolean => {
        return incidents.some(
            incident =>
                String(incident.AmbulanceId) === String(ambulanceId) &&
                (incident.status === "IN_PROGRESS" || incident.status === "PENDING")
        );
    };

    const updateAmbulanceStatus = async (ambulanceId: string | number, newStatus: Ambulance["status"]) => {
        if (isAssignedToActiveIncident(ambulanceId)) {
            setError("Cannot change status: Ambulance is assigned to an active incident");
            setTimeout(() => setError(null), 4000);
            return;
        }

        setUpdating(ambulanceId);
        try {
            await fetch(`http://localhost:5000/ambulances/${ambulanceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            await fetchData();
        } catch (error) {
            console.error("Error updating ambulance status:", error);
        } finally {
            setUpdating(null);
        }
    };

    const deleteAmbulance = async (ambulanceId: string | number, matricule: string) => {
        if (isAssignedToActiveIncident(ambulanceId)) {
            setError("Cannot delete: Ambulance is assigned to an active incident");
            setTimeout(() => setError(null), 4000);
            return;
        }

        if (!confirm(`Are you sure you want to delete ${matricule}?`)) {
            return;
        }

        setUpdating(ambulanceId);
        try {
            await fetch(`http://localhost:5000/ambulances/${ambulanceId}`, {
                method: "DELETE",
            });
            await fetchData();
        } catch (error) {
            console.error("Error deleting ambulance:", error);
            setError("Failed to delete ambulance");
        } finally {
            setUpdating(null);
        }
    };

    const createAmbulance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.matricule || !formData.driver || !formData.medic) {
            setError("Please fill in all required fields");
            setTimeout(() => setError(null), 3000);
            return;
        }

        setCreating(true);
        try {
            await fetch("http://localhost:5000/ambulances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    matricule: formData.matricule,
                    status: "AVAILABLE",
                    location: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
                    group: { driver: formData.driver, medic: formData.medic },
                    equipment: formData.equipment.split(",").map(e => e.trim()).filter(e => e),
                }),
            });
            await fetchData();
            setShowForm(false);
            setFormData({ matricule: "", driver: "", medic: "", equipment: "", lat: "33.5731", lng: "-7.5898" });
        } catch (error) {
            console.error("Error creating ambulance:", error);
            setError("Failed to create ambulance");
        } finally {
            setCreating(false);
        }
    };

    const filteredAmbulances = ambulances.filter(amb =>
        filter === "ALL" ? true : amb.status === filter
    );

    const counts = {
        ALL: ambulances.length,
        AVAILABLE: ambulances.filter(a => a.status === "AVAILABLE").length,
        OCCUPIED: ambulances.filter(a => a.status === "OCCUPIED").length,
        MAINTENANCE: ambulances.filter(a => a.status === "MAINTENANCE").length,
        LUNCH_BREAK: ambulances.filter(a => a.status === "LUNCH_BREAK").length,
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { bg: string; text: string; icon: string; border: string }> = {
            AVAILABLE: { bg: "bg-emerald-500", text: "text-emerald-600", icon: "🟢", border: "border-emerald-400" },
            OCCUPIED: { bg: "bg-red-500", text: "text-red-600", icon: "🔴", border: "border-red-400" },
            MAINTENANCE: { bg: "bg-amber-500", text: "text-amber-600", icon: "🟡", border: "border-amber-400" },
            LUNCH_BREAK: { bg: "bg-orange-500", text: "text-orange-600", icon: "🍴", border: "border-orange-400" },
        };
        return configs[status] || { bg: "bg-gray-500", text: "text-gray-600", icon: "⚪", border: "border-gray-400" };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            {/* Error Toast */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-2 hover:bg-red-600 rounded-full p-1">✕</button>
                </div>
            )}

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Title */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">🚑</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Fleet Management
                                </h1>
                                <p className="text-gray-500">Manage and monitor your ambulance fleet</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: "Available", count: counts.AVAILABLE, color: "emerald" },
                                { label: "Occupied", count: counts.OCCUPIED, color: "red" },
                                { label: "Maintenance", count: counts.MAINTENANCE, color: "amber" },
                                { label: "On Break", count: counts.LUNCH_BREAK, color: "orange" },
                            ].map(stat => (
                                <div key={stat.label} className={`px-4 py-3 rounded-xl bg-${stat.color}-50 border border-${stat.color}-200`}>
                                    <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</div>
                                    <div className={`text-xs text-${stat.color}-600`}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE", "LUNCH_BREAK"] as const).map(status => {
                                const config = getStatusConfig(status === "ALL" ? "AVAILABLE" : status);
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === status
                                            ? status === "ALL"
                                                ? "bg-gray-800 text-white shadow-lg"
                                                : `${config.bg} text-white shadow-lg`
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {status === "ALL" ? "All" : status === "LUNCH_BREAK" ? "On Break" : status.charAt(0) + status.slice(1).toLowerCase()}
                                        <span className="ml-1 opacity-75">({counts[status]})</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${showForm
                                ? "bg-gray-200 text-gray-700"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                                }`}
                        >
                            {showForm ? "✕ Cancel" : "➕ Add Ambulance"}
                        </button>
                    </div>

                    {/* Create Form */}
                    {showForm && (
                        <form onSubmit={createAmbulance} className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🚑 New Ambulance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    value={formData.matricule}
                                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                                    placeholder="Matricule (e.g., AMB-005) *"
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                                    required
                                />
                                <input
                                    type="text"
                                    value={formData.driver}
                                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                                    placeholder="Driver Name *"
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                                    required
                                />
                                <input
                                    type="text"
                                    value={formData.medic}
                                    onChange={(e) => setFormData({ ...formData, medic: e.target.value })}
                                    placeholder="Medic Name *"
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                                    required
                                />
                                <input
                                    type="text"
                                    value={formData.equipment}
                                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                                    placeholder="Equipment (comma-separated)"
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                                />
                                <input
                                    type="text"
                                    value={formData.lat}
                                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                    placeholder="Latitude"
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                                />
                                <input
                                    type="text"
                                    value={formData.lng}
                                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                    placeholder="Longitude"
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "✅ Create Ambulance"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Ambulances Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredAmbulances.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
                        <span className="text-6xl mb-4 block">🚑</span>
                        <p className="text-xl text-gray-500">No ambulances found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAmbulances.map(ambulance => {
                            const config = getStatusConfig(ambulance.status);
                            const isAssigned = isAssignedToActiveIncident(ambulance.id);

                            return (
                                <div
                                    key={ambulance.id}
                                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-l-4 ${config.border}`}
                                >
                                    {/* Header */}
                                    <div className="p-5 bg-gradient-to-r from-gray-50 to-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center shadow-md`}>
                                                    <span className="text-2xl">🚑</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{ambulance.matricule}</h3>
                                                    <span className={`text-sm ${config.text} font-medium`}>
                                                        {config.icon} {ambulance.status === "LUNCH_BREAK" ? "On Break" : ambulance.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isAssigned && (
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                        On Mission
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => deleteAmbulance(ambulance.id, ambulance.matricule)}
                                                    disabled={updating === ambulance.id}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete ambulance"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Crew */}
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="text-xs text-gray-500 mb-2 font-medium">CREW</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">🚗</span>
                                                    <span className="font-medium text-gray-700">{ambulance.group.driver}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">👨‍⚕️</span>
                                                    <span className="font-medium text-gray-700">{ambulance.group.medic}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Equipment */}
                                        {ambulance.equipment.length > 0 && (
                                            <div>
                                                <div className="text-xs text-gray-500 mb-2 font-medium">EQUIPMENT</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {ambulance.equipment.map((item, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Location */}
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            📍 {ambulance.location.lat.toFixed(4)}, {ambulance.location.lng.toFixed(4)}
                                        </div>

                                        {/* Status Buttons */}
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="text-xs text-gray-500 mb-2 font-medium">CHANGE STATUS</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ambulance.status !== "AVAILABLE" && (
                                                    <button
                                                        onClick={() => updateAmbulanceStatus(ambulance.id, "AVAILABLE")}
                                                        disabled={updating === ambulance.id}
                                                        className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === ambulance.id ? "..." : "🟢 Available"}
                                                    </button>
                                                )}
                                                {ambulance.status !== "OCCUPIED" && (
                                                    <button
                                                        onClick={() => updateAmbulanceStatus(ambulance.id, "OCCUPIED")}
                                                        disabled={updating === ambulance.id}
                                                        className="py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === ambulance.id ? "..." : "🔴 Occupied"}
                                                    </button>
                                                )}
                                                {ambulance.status !== "MAINTENANCE" && (
                                                    <button
                                                        onClick={() => updateAmbulanceStatus(ambulance.id, "MAINTENANCE")}
                                                        disabled={updating === ambulance.id}
                                                        className="py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === ambulance.id ? "..." : "🟡 Maintenance"}
                                                    </button>
                                                )}
                                                {ambulance.status !== "LUNCH_BREAK" && (
                                                    <button
                                                        onClick={() => updateAmbulanceStatus(ambulance.id, "LUNCH_BREAK")}
                                                        disabled={updating === ambulance.id}
                                                        className="py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === ambulance.id ? "..." : "🍴 Break"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
