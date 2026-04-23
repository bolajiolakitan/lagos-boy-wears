"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProductActions({ slug, isActive }: { slug: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Product deactivated" : "Product activated");
        router.refresh();
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this product? This cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Product deleted permanently");
        router.refresh();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <a
        href={`/admin/products/${slug}/edit`}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          padding: "0.35rem 0.75rem",
          border: "2px solid var(--black)",
          background: "transparent",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
        }}
      >
        Edit
      </a>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          padding: "0.35rem 0.75rem",
          border: "2px solid var(--black)",
          background: isActive ? "var(--black)" : "transparent",
          color: isActive ? "var(--white)" : "var(--black)",
          textTransform: "uppercase",
          cursor: "pointer",
          whiteSpace: "nowrap",
          opacity: loading ? 0.5 : 1,
          transition: "all 0.15s ease",
        }}
      >
        {loading ? "…" : isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          padding: "0.35rem 0.75rem",
          border: "2px solid #c00",
          background: "transparent",
          color: "#c00",
          textTransform: "uppercase",
          cursor: "pointer",
          whiteSpace: "nowrap",
          opacity: loading ? 0.5 : 1,
          transition: "all 0.15s ease",
        }}
      >
        Delete
      </button>
    </div>
  );
}
