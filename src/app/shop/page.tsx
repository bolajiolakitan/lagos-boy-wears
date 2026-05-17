"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    category: string;
    sizes: string[];
    stock: number;
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryParam = searchParams.get("category") || "";
    const searchParam = searchParams.get("q") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParam);
    const [category, setCategory] = useState(categoryParam);

    const categories = ["", "tops", "bottoms", "accessories"];
    const categoryLabels: Record<string, string> = {
        "": "All",
        tops: "Tops",
        bottoms: "Bottoms",
        accessories: "Accessories",
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            if (search) params.set("q", search);
            router.replace(`/shop?${params.toString()}`, { scroll: false });

            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, category]);

    const fetchProducts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("q", search);
        try {
            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch {
            setProducts([]);
        }
        setLoading(false);
    };

    // Initial fetch is handled by the debounced useEffect above

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(p / 100);

    return (
        <>
            {/* Shop Header */}
            <div
                style={{
                    borderBottom: "2px solid var(--black)",
                    padding: "2rem 0",
                }}
            >
                <div className="container">
                    <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", marginBottom: "2rem" }}>
                        {category ? categoryLabels[category]?.toUpperCase() || "SHOP" : "ALL PRODUCTS"}
                    </h1>

                    {/* Filters Row */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Category Tabs */}
                        <div style={{ display: "flex", gap: "0", border: "2px solid var(--black)" }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        fontFamily: "var(--font-body)",
                                        fontWeight: 600,
                                        fontSize: "0.8rem",
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        background: category === cat ? "var(--black)" : "transparent",
                                        color: category === cat ? "var(--white)" : "var(--black)",
                                        borderRight: cat !== "accessories" ? "1px solid var(--black)" : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {categoryLabels[cat]}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: "2.5rem" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container" style={{ padding: "3rem 1.5rem" }}>
                {loading ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "2.5rem 2rem",
                        }}
                    >
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ background: "var(--white)", padding: "1.25rem" }}>
                                <div
                                    style={{
                                        aspectRatio: "3/4",
                                        background: "var(--gray-100)",
                                        marginBottom: "1rem",
                                        animation: "pulse 1.5s infinite",
                                    }}
                                />
                                <div style={{ height: "12px", background: "var(--gray-100)", marginBottom: "0.5rem", width: "60%" }} />
                                <div style={{ height: "16px", background: "var(--gray-100)", width: "80%" }} />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "6rem 0" }}>
                        <p style={{ fontFamily: "var(--font-mono)", color: "var(--gray-400)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
                            NO PRODUCTS FOUND
                        </p>
                        <button
                            onClick={() => { setSearch(""); setCategory(""); }}
                            className="btn-secondary"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "2.5rem 2rem",
                        }}
                    >
                        {products.map((product) => (
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
                                            fontFamily: "var(--font-display)",
                                            fontWeight: 800,
                                            fontSize: "1rem",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {product.name}
                                    </h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem" }}>
                                            {formatPrice(product.price)}
                                        </p>
                                        {product.stock < 5 && product.stock > 0 && (
                                            <span className="badge" style={{ background: "var(--black)", color: "var(--white)", fontSize: "0.6rem" }}>
                                                {product.stock} LEFT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <p
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: "var(--gray-400)",
                        marginTop: "2rem",
                        letterSpacing: "0.05em",
                    }}
                >
                    {!loading && `${products.length} PRODUCT${products.length !== 1 ? "S" : ""} FOUND`}
                </p>
            </div>
        </>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>LOADING...</div>}>
            <ShopContent />
        </Suspense>
    );
}
