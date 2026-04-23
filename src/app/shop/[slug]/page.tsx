"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    sizes: string[];
    stock: number;
    category: string;
}

const SIZES_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    useEffect(() => {
        if (params.slug) {
            fetch(`/api/products/${params.slug}`)
                .then((r) => r.json())
                .then((data) => {
                    setProduct(data.product);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [params.slug]);

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(p / 100);

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }
        if (!product) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || "",
            size: selectedSize,
            quantity,
            slug: product.slug,
        });
        toast.success("Added to cart!");
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }
        handleAddToCart();
        router.push("/checkout");
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4rem",
                    }}
                >
                    <div style={{ aspectRatio: "3/4", background: "var(--gray-100)" }} />
                    <div style={{ paddingTop: "2rem" }}>
                        <div style={{ height: "12px", background: "var(--gray-100)", width: "30%", marginBottom: "1rem" }} />
                        <div style={{ height: "40px", background: "var(--gray-100)", width: "80%", marginBottom: "2rem" }} />
                        <div style={{ height: "32px", background: "var(--gray-100)", width: "40%", marginBottom: "2rem" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
                <h1 style={{ marginBottom: "1rem" }}>Product Not Found</h1>
                <a href="/shop" className="btn-primary">Back to Shop</a>
            </div>
        );
    }

    return (
        <>
            <div className="container" style={{ padding: "3rem 1.5rem" }}>
                {/* Breadcrumb */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", alignItems: "center" }}>
                    <a href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)" }}>Home</a>
                    <span style={{ color: "var(--gray-400)" }}>/</span>
                    <a href="/shop" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)" }}>Shop</a>
                    <span style={{ color: "var(--gray-400)" }}>/</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{product.name}</span>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                        gap: "clamp(2rem, 5vw, 5rem)",
                        alignItems: "start",
                    }}
                >
                    {/* Image Gallery */}
                    <div>
                        <div
                            style={{
                                aspectRatio: "3/4",
                                background: "var(--gray-100)",
                                overflow: "hidden",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {product.images[selectedImage] ? (
                                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                    <Image
                                        src={product.images[selectedImage]}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                        priority
                                    />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)" }}>
                                        NO IMAGE
                                    </span>
                                </div>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        style={{
                                            width: "72px",
                                            height: "88px",
                                            background: "var(--gray-100)",
                                            overflow: "hidden",
                                            border: selectedImage === i ? "2px solid var(--black)" : "2px solid transparent",
                                            padding: 0,
                                        }}
                                    >
                                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                            <Image
                                                src={img}
                                                alt={`View ${i + 1}`}
                                                fill
                                                sizes="72px"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <p
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.7rem",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "var(--gray-400)",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {product.category}
                        </p>
                        <h1
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                                lineHeight: 1,
                                marginBottom: "1rem",
                            }}
                        >
                            {product.name}
                        </h1>
                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: "2rem",
                                marginBottom: "2rem",
                            }}
                        >
                            {formatPrice(product.price)}
                        </p>

                        {/* Description */}
                        <p
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.9rem",
                                lineHeight: 1.7,
                                color: "var(--gray-600)",
                                marginBottom: "2rem",
                                borderTop: "1px solid var(--gray-200)",
                                paddingTop: "1.5rem",
                            }}
                        >
                            {product.description}
                        </p>

                        {/* Size Selector */}
                        <div style={{ marginBottom: "2rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Size: {selectedSize && <span style={{ fontFamily: "var(--font-mono)" }}>{selectedSize}</span>}
                                </p>
                                <button
                                    onClick={() => setShowSizeGuide(true)}
                                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.05em", textDecoration: "underline", background: "none", color: "var(--gray-400)" }}
                                >
                                    SIZE GUIDE
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {product.sizes.sort((a, b) => SIZES_ORDER.indexOf(a) - SIZES_ORDER.indexOf(b)).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            border: "2px solid var(--black)",
                                            background: selectedSize === size ? "var(--black)" : "transparent",
                                            color: selectedSize === size ? "var(--white)" : "var(--black)",
                                            fontFamily: "var(--font-body)",
                                            fontWeight: 700,
                                            fontSize: "0.8rem",
                                            transition: "all 0.15s ease",
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                                Quantity
                            </p>
                            <div style={{ display: "flex", alignItems: "center", border: "2px solid var(--black)", width: "fit-content" }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ background: "none", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}
                                >
                                    −
                                </button>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", padding: "0 1rem", minWidth: "44px", textAlign: "center" }}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    style={{ background: "none", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Stock indicator */}
                        {product.stock < 10 && product.stock > 0 && (
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.05em", color: "var(--gray-600)", marginBottom: "1rem" }}>
                                ⚡ ONLY {product.stock} LEFT IN STOCK
                            </p>
                        )}

                        {/* CTA Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <button onClick={handleAddToCart} className="btn-secondary" style={{ width: "100%" }}>
                                Add to Cart
                            </button>
                            <button onClick={handleBuyNow} className="btn-primary" style={{ width: "100%" }}>
                                Buy Now
                            </button>
                        </div>

                        {/* Meta */}
                        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-200)" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", letterSpacing: "0.08em" }}>
                                SKU: LBW-{product.id.slice(-6).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1.5rem",
                    }}
                    onClick={() => setShowSizeGuide(false)}
                >
                    <div
                        style={{
                            background: "var(--white)",
                            border: "2px solid var(--black)",
                            maxWidth: "500px",
                            width: "100%",
                            padding: "2rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>SIZE GUIDE</h3>
                            <button onClick={() => setShowSizeGuide(false)} style={{ background: "none" }}>✕</button>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {["Size", "Chest (cm)", "Waist (cm)", "Hip (cm)"].map((h) => (
                                        <th key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.08em", textAlign: "left", padding: "0.5rem", borderBottom: "2px solid var(--black)" }}>
                                            {h.toUpperCase()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["XS", "82-86", "62-66", "88-92"],
                                    ["S", "88-92", "68-72", "94-98"],
                                    ["M", "96-100", "76-80", "102-106"],
                                    ["L", "104-108", "84-88", "110-114"],
                                    ["XL", "112-116", "92-96", "118-122"],
                                    ["XXL", "120-124", "100-104", "126-130"],
                                ].map(([size, chest, waist, hip]) => (
                                    <tr key={size} style={{ borderBottom: "1px solid var(--gray-200)" }}>
                                        {[size, chest, waist, hip].map((val, i) => (
                                            <td key={i} style={{ fontFamily: i === 0 ? "var(--font-display)" : "var(--font-mono)", fontWeight: i === 0 ? 800 : 400, fontSize: "0.85rem", padding: "0.75rem 0.5rem" }}>
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
        @media (max-width: 640px) {
          .container > div > div:first-child + div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </>
    );
}
