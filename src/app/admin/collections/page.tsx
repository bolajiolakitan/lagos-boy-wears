"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    isActive: boolean;
    _count: {
        products: number;
    };
}

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const res = await fetch("/api/collections?all=true");
            const data = await res.json();
            if (res.ok) {
                setCollections(data.collections || []);
            } else {
                toast.error(data.error || "Failed to load collections");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm("Are you sure you want to delete this collection? Products linked to it will not be deleted, but will be deassociated.")) {
            return;
        }

        try {
            const res = await fetch(`/api/collections/${slug}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Collection deleted successfully!");
                setCollections(collections.filter((c) => c.slug !== slug));
            } else {
                toast.error(data.error || "Failed to delete collection");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: "3rem 1.5rem" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-400)" }}>
                    LOADING COLLECTIONS...
                </p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: "3rem 1.5rem" }}>
            <Link href="/admin" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textDecoration: "underline", color: "var(--gray-400)", display: "block", marginBottom: "1.5rem" }}>
                ← BACK TO DASHBOARD
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem" }}>COLLECTIONS</h1>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
                        {collections.length} collection{collections.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link href="/admin/collections/new" className="btn-primary">+ Add Collection</Link>
            </div>

            {collections.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem 0", border: "1px dashed var(--gray-300)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--gray-400)", letterSpacing: "0.05em" }}>
                        NO COLLECTIONS YET
                    </p>
                    <Link href="/admin/collections/new" className="btn-primary" style={{ display: "inline-block", marginTop: "1.5rem" }}>
                        Create Your First Collection
                    </Link>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                        <thead>
                            <tr style={{ background: "var(--black)", color: "var(--white)", textAlign: "left" }}>
                                {["COLLECTION", "DESCRIPTION", "PRODUCTS", "STATUS", "ACTIONS"].map((h) => (
                                    <th key={h} style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.05em", fontWeight: 400 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((c) => (
                                <tr key={c.id} style={{ borderBottom: "1px solid var(--gray-200)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ width: "50px", height: "50px", background: "var(--gray-100)", flexShrink: 0, overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                                                {c.coverImage && (
                                                    <img src={c.coverImage} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9rem" }}>{c.name}</p>
                                                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)" }}>/{c.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem", fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--gray-600)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {c.description}
                                    </td>
                                    <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                                        {c._count?.products || 0} items
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span className={`badge ${c.isActive ? "badge-delivered" : "badge-cancelled"}`} style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                                            {c.isActive ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", gap: "0.75rem" }}>
                                            <Link href={`/admin/collections/${c.id}/edit`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textDecoration: "underline", color: "var(--black)" }}>
                                                EDIT
                                            </Link>
                                            <button onClick={() => handleDelete(c.slug)} style={{ background: "none", fontFamily: "var(--font-mono)", fontSize: "0.7rem", textDecoration: "underline", color: "red" }}>
                                                DELETE
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
