"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#92400e" },
    PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
    SHIPPED: { bg: "#f3e8ff", color: "#6b21a8" },
    DELIVERED: { bg: "#dcfce7", color: "#14532d" },
    CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
};

export default function OrderStatusSelect({
    orderId,
    currentStatus,
}: {
    orderId: string;
    currentStatus: string;
}) {
    const router = useRouter();
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const handleChange = async (newStatus: string) => {
        if (newStatus === status) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setStatus(newStatus);
                toast.success(`Order updated to ${newStatus}`);
                router.refresh();
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const colors = STATUS_COLORS[status] || { bg: "#f5f5f5", color: "#525252" };

    return (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={loading}
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "0.3rem 0.5rem",
                border: "none",
                background: colors.bg,
                color: colors.color,
                fontWeight: 600,
                cursor: "pointer",
                opacity: loading ? 0.5 : 1,
                appearance: "auto",
            }}
        >
            {STATUSES.map((s) => (
                <option key={s} value={s}>
                    {s}
                </option>
            ))}
        </select>
    );
}
