import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

interface CollectionSlugPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionSlugPageProps) {
    const { slug } = await params;
    try {
        const collection = await prisma.collection.findUnique({
            where: { slug },
        });
        if (collection) {
            return {
                title: `${collection.name} | Lagos Boy Wears`,
                description: collection.description,
            };
        }
    } catch {}
    return {
        title: "Collection Drop | Lagos Boy Wears",
    };
}

export default async function CollectionDetailPage({ params }: CollectionSlugPageProps) {
    const { slug } = await params;
    let collection: any = null;

    try {
        collection = await prisma.collection.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
    } catch (error) {
        console.error("Failed to load collection details:", error);
    }

    if (!collection) {
        notFound();
    }

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(p / 100);

    return (
        <>
            {/* Massive Editorial Hero Banner */}
            <div
                style={{
                    position: "relative",
                    height: "clamp(300px, 45vh, 450px)",
                    overflow: "hidden",
                    borderBottom: "2px solid var(--black)",
                    color: "var(--white)",
                }}
            >
                <img
                    src={collection.coverImage}
                    alt={collection.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 100%)",
                    }}
                />
                <div
                    className="container"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "3rem 1.5rem",
                        zIndex: 10,
                    }}
                >
                    <Link
                        href="/collections"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            color: "var(--gray-300)",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            textDecoration: "underline",
                            display: "inline-block",
                            marginBottom: "1rem",
                        }}
                    >
                        ← ALL DROPS
                    </Link>
                    <h1
                        style={{
                            fontSize: "clamp(2rem, 5vw, 4rem)",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                            lineHeight: "1.1",
                        }}
                    >
                        {collection.name}
                    </h1>
                </div>
            </div>

            {/* Editorial Statement */}
            <div
                style={{
                    borderBottom: "1px solid var(--gray-200)",
                    background: "var(--gray-50)",
                }}
            >
                <div
                    className="container"
                    style={{
                        padding: "4rem 1.5rem",
                        maxWidth: "800px",
                        textAlign: "center",
                    }}
                >
                    <p
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.2em",
                            color: "var(--gray-400)",
                            textTransform: "uppercase",
                            marginBottom: "1.25rem",
                        }}
                    >
                        EDITORIAL STATEMENT
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                            lineHeight: "1.7",
                            color: "var(--black)",
                            fontWeight: 500,
                            fontStyle: "italic",
                        }}
                    >
                        "{collection.description}"
                    </p>
                </div>
            </div>

            {/* Collection Product Catalog */}
            <div className="container" style={{ padding: "4rem 1.5rem" }}>
                <h2
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                        letterSpacing: "0.15em",
                        marginBottom: "3rem",
                        paddingBottom: "1rem",
                        borderBottom: "2px solid var(--black)",
                    }}
                >
                    COLLECTION PIECES ({collection.products.length})
                </h2>

                {collection.products.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "5rem 0" }}>
                        <p style={{ fontFamily: "var(--font-mono)", color: "var(--gray-400)" }}>
                            NO ITEMS REGISTERED IN THIS DROP YET
                        </p>
                    </div>
                ) : (
                    <div className="collection-products-grid">
                        {collection.products.map((product: any) => (
                            <Link
                                key={product.id}
                                href={`/shop/${product.slug}`}
                                className="product-card"
                                style={{ background: "var(--white)", display: "block" }}
                            >
                                <div className="product-card-image">
                                    {product.images[0] ? (
                                        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                width: "100%",
                                                aspectRatio: "3/4",
                                                background: "var(--gray-100)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)" }}>
                                                NO IMAGE
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: "1.25rem" }}>
                                    <p
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: "0.65rem",
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                            color: "var(--gray-400)",
                                            marginBottom: "0.25rem",
                                        }}
                                    >
                                        {product.category}
                                    </p>
                                    <h3
                                        style={{
                                            fontFamily: "var(--font-body)",
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                            color: "var(--black)",
                                            marginBottom: "0.5rem",
                                            lineHeight: "1.3",
                                        }}
                                    >
                                        {product.name}
                                    </h3>
                                    <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "var(--black)" }}>
                                        {formatPrice(product.price)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .collection-products-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 3rem 2rem;
                }
                @media (max-width: 1024px) {
                    .collection-products-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .collection-products-grid {
                        grid-template-columns: 1fr;
                        gap: 2.5rem;
                    }
                }
            `}</style>
        </>
    );
}
