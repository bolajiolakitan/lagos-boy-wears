"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

interface CoverImage {
    url: string;
    preview: string;
    uploading?: boolean;
}

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        name: "",
        description: "",
        isActive: true,
    });
    const [coverImage, setCoverImage] = useState<CoverImage | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchCollection();
        }
    }, [params.id]);

    const fetchCollection = async () => {
        try {
            const res = await fetch(`/api/collections/${params.id}`);
            const data = await res.json();
            if (res.ok && data.collection) {
                setForm({
                    name: data.collection.name,
                    description: data.collection.description,
                    isActive: data.collection.isActive,
                });
                if (data.collection.coverImage) {
                    setCoverImage({
                        url: data.collection.coverImage,
                        preview: data.collection.coverImage,
                        uploading: false,
                    });
                }
            } else {
                toast.error(data.error || "Failed to load collection details");
            }
        } catch {
            toast.error("Failed to load collection details");
        } finally {
            setFetching(false);
        }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Set preview immediately
        const preview = {
            url: "",
            preview: URL.createObjectURL(file),
            uploading: true,
        };
        setCoverImage(preview);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setCoverImage({
                    url: data.url,
                    preview: preview.preview,
                    uploading: false,
                });
                toast.success("Cover image updated!");
            } else {
                toast.error(data.error || "Failed to upload image");
                fetchCollection(); // Restore previous cover
            }
        } catch {
            toast.error("Upload failed");
            fetchCollection(); // Restore previous cover
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.description) {
            toast.error("Please fill in all details");
            return;
        }
        if (!coverImage || coverImage.uploading) {
            toast.error("Please wait for the cover image to finish uploading");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`/api/collections/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    coverImage: coverImage.url,
                    isActive: form.isActive,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Collection updated successfully!");
                router.push("/admin/collections");
                router.refresh();
            } else {
                toast.error(data.error || "Failed to update collection");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = {
        display: "block",
        fontFamily: "var(--font-body)",
        fontWeight: 600 as const,
        fontSize: "0.75rem",
        letterSpacing: "0.05em",
        textTransform: "uppercase" as const,
        marginBottom: "0.5rem",
    };

    if (fetching) {
        return (
            <div className="container" style={{ padding: "3rem 1.5rem" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-400)" }}>
                    LOADING COLLECTION DETAILS...
                </p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "800px" }}>
            <div style={{ marginBottom: "2.5rem" }}>
                <a
                    href="/admin/collections"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", letterSpacing: "0.05em" }}
                >
                    ← Back to Collections
                </a>
                <h1 style={{ marginTop: "0.75rem", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>EDIT COLLECTION</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "2rem" }}>
                {/* Cover Image Upload */}
                <div>
                    <label style={labelStyle}>Collection Cover Image (Lookbook Art)</label>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end" }}>
                        <div
                            style={{
                                width: "150px",
                                height: "200px",
                                background: "var(--gray-100)",
                                border: "2px solid var(--black)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            {coverImage ? (
                                <>
                                    <img
                                        src={coverImage.preview}
                                        alt="Preview"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: coverImage.uploading ? 0.5 : 1 }}
                                    />
                                    {coverImage.uploading && (
                                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-600)" }}>UPLOADING...</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", textAlign: "center", padding: "1rem" }}>
                                    NO COVER SELECTED
                                </span>
                            )}
                        </div>

                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFile}
                                style={{ display: "none" }}
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                            >
                                Change Image
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collection Name */}
                <div>
                    <label style={labelStyle}>Collection Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Harmattan '26, Midnight Basics"
                        className="input-field"
                        required
                    />
                </div>

                {/* Collection Description */}
                <div>
                    <label style={labelStyle}>Editorial Statement / Intro</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe the mood, textures, and story behind this fashion release..."
                        className="input-field"
                        style={{ minHeight: "140px", resize: "vertical" }}
                        required
                    />
                </div>

                {/* Active Switch */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "var(--black)" }}
                    />
                    <label htmlFor="isActive" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                        Collection is active
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: "fit-content", minWidth: "180px" }}
                    disabled={loading}
                >
                    {loading ? "Saving Changes..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
