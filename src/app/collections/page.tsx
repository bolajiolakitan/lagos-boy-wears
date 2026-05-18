import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Collections & Drops | Lagos Boy Wears",
    description: "Discover curated street-fashion drops and limited capsule releases from Lagos Boy Wears.",
};

export default async function CollectionsPage() {
    let collections: any[] = [];
    try {
        collections = await prisma.collection.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    } catch (error) {
        console.error("Failed to load collections:", error);
    }

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.2em", color: "var(--gray-400)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    CURATED STREETWEAR
                </p>
                <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
                    THE LOOKBOOK DROPS
                </h1>
            </div>

            {collections.length === 0 ? (
                <div style={{ textAlign: "center", padding: "6rem 0", border: "1px solid var(--gray-200)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--gray-400)" }}>
                        NO DROPS ACTIVE AT THE MOMENT
                    </p>
                    <Link href="/shop" className="btn-primary" style={{ display: "inline-block", marginTop: "1.5rem" }}>
                        Browse Store
                    </Link>
                </div>
            ) : (
                <div className="collections-grid" style={{ display: "grid", gap: "3rem" }}>
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            href={`/collections/${col.slug}`}
                            className="collection-card"
                            style={{
                                display: "block",
                                position: "relative",
                                height: "clamp(350px, 50vh, 500px)",
                                overflow: "hidden",
                                border: "2px solid var(--black)",
                                color: "var(--white)",
                            }}
                        >
                            {/* Background Image */}
                            <img
                                src={col.coverImage}
                                alt={col.name}
                                className="collection-bg"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                            />

                            {/* Color Overlay */}
                            <div
                                className="collection-overlay"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)",
                                    transition: "background 0.5s ease",
                                }}
                            />

                            {/* Content */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: "2.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.75rem",
                                    zIndex: 10,
                                }}
                            >
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-300)", letterSpacing: "0.15em" }}>
                                    DROP #{col.slug.toUpperCase().slice(0, 6)} · {col._count?.products || 0} PIECES
                                </span>
                                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                    {col.name}
                                </h2>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--gray-300)", maxWidth: "550px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {col.description}
                                </p>
                                <span
                                    className="discover-link"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        marginTop: "0.5rem",
                                        letterSpacing: "0.1em",
                                        textDecoration: "underline",
                                    }}
                                >
                                    EXPLORE COLLECTION →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
                .collection-card:hover .collection-bg {
                    transform: scale(1.05);
                }
                .collection-card:hover .collection-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.5) 100%) !important;
                }
                .collection-card:hover .discover-link {
                    color: var(--gray-300);
                }
            `}</style>
        </div>
    );
}
