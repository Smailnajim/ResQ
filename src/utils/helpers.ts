// Calculate resolution time between two dates
export const calculateResolutionTime = (createdAt: string, closedAt: string): string => {
    const start = new Date(createdAt).getTime();
    const end = new Date(closedAt).getTime();
    const diffMs = end - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

// Status color configurations
export const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string; border: string }> = {
        AVAILABLE: { bg: "bg-emerald-500", text: "text-emerald-600", icon: "🟢", border: "border-emerald-400" },
        OCCUPIED: { bg: "bg-red-500", text: "text-red-600", icon: "🔴", border: "border-red-400" },
        MAINTENANCE: { bg: "bg-amber-500", text: "text-amber-600", icon: "🟡", border: "border-amber-400" },
        LUNCH_BREAK: { bg: "bg-orange-500", text: "text-orange-600", icon: "🍴", border: "border-orange-400" },
    };
    return configs[status] || { bg: "bg-gray-500", text: "text-gray-600", icon: "⚪", border: "border-gray-400" };
};

// Incident gravity colors
export const getGravityColor = (gravity: string) => {
    switch (gravity) {
        case "CRITICAL": return "bg-red-100 text-red-800 border-red-200";
        case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
        case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "LOW": return "bg-green-100 text-green-800 border-green-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

// Incident status colors
export const getIncidentStatusColor = (status: string) => {
    switch (status) {
        case "PENDING": return "bg-blue-100 text-blue-800";
        case "IN_PROGRESS": return "bg-purple-100 text-purple-800";
        case "RESOLVED": return "bg-green-100 text-green-800";
        case "CANCELLED": return "bg-gray-100 text-gray-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

// Incident type icons
export const getIncidentIcon = (type: string) => {
    switch (type) {
        case "Accident": return "🚗";
        case "Fire": return "🔥";
        case "Medical": return "🏥";
        case "Cardiac": return "❤️";
        default: return "⚠️";
    }
};
