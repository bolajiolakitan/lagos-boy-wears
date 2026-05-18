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
    colors: string[];
    stock: number;
    category: string;
    collection?: {
        name: string;
        slug: string;
    } | null;
}

const SIZES_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewName, setReviewName] = useState("");
    const [reviewEmail, setReviewEmail] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchReviews = async () => {
        if (!params.slug) return;
        try {
            const res = await fetch(`/api/products/${params.slug}/reviews`);
            const data = await res.json();
            if (data.reviews) {
                setReviews(data.reviews);
            }
        } catch (err) {
            console.error("Error loading reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (params.slug) {
            fetch(`/api/products/${params.slug}`)
                .then((r) => r.json())
                .then((data) => {
                    setProduct(data.product);
                    setLoading(false);
                })
                .catch(() => setLoading(false));

            fetchReviews();
        }
    }, [params.slug]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
            toast.error("Please select a rating.");
            return;
        }
        if (!reviewComment.trim() || reviewComment.trim().length < 3) {
            toast.error("Please write a comment of at least 3 characters.");
            return;
        }
        if (!reviewName.trim() || reviewName.trim().length < 2) {
            toast.error("Please enter your name.");
            return;
        }
        if (!reviewEmail.trim() || !reviewEmail.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${params.slug}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: reviewRating,
                    comment: reviewComment,
                    userName: reviewName,
                    userEmail: reviewEmail,
                }),
            });
            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success("Review submitted successfully!");
                setReviewComment("");
                setReviewName("");
                setReviewEmail("");
                setReviewRating(5);
                fetchReviews(); // Reload list
            }
        } catch {
            toast.error("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(p / 100);

    const handleAddToCart = () => {
        if (product && product.sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }
        if (!product) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || "",
            size: selectedSize || "OS",
            quantity,
            slug: product.slug,
        });
        toast.success("Added to cart!");
    };

    const handleBuyNow = () => {
        if (product && product.sizes.length > 0 && !selectedSize) {
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
                    className="product-detail-grid"
                    style={{
                        display: "grid",
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
                    className="product-detail-grid"
                    style={{
                        display: "grid",
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
                        {product.collection && (
                            <a
                                href={`/collections/${product.collection.slug}`}
                                style={{
                                    display: "inline-block",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.6rem",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    background: "var(--black)",
                                    color: "var(--white)",
                                    padding: "0.25rem 0.6rem",
                                    marginBottom: "1rem",
                                    fontWeight: 700,
                                }}
                            >
                                Part of the {product.collection.name} drop
                            </a>
                        )}
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
                        {product.sizes && product.sizes.length > 0 && (
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
                        )}

                        {/* Color Selector */}
                        {product.colors && product.colors.length > 0 && (
                            <div style={{ marginBottom: "2rem" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                                    Colour: {selectedColor && <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{selectedColor}</span>}
                                </p>
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            style={{
                                                padding: "0.5rem 1.25rem",
                                                border: "2px solid var(--black)",
                                                background: selectedColor === color ? "var(--black)" : "transparent",
                                                color: selectedColor === color ? "var(--white)" : "var(--black)",
                                                fontFamily: "var(--font-mono)",
                                                fontWeight: 700,
                                                fontSize: "0.7rem",
                                                letterSpacing: "0.05em",
                                                textTransform: "uppercase",
                                                transition: "all 0.15s ease",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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

            {/* Reviews Section */}
            <div className="container" style={{ borderTop: "2px solid var(--black)", marginTop: "4rem", paddingTop: "4rem", paddingBottom: "4rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "2.5rem", letterSpacing: "-0.02em" }}>
                    CUSTOMER REVIEWS
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "4rem" }} className="reviews-grid">
                    {/* Summary & Form */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                        {/* Rating summary */}
                        <div style={{ background: "var(--gray-50)", border: "2px solid var(--black)", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.08em", color: "var(--gray-400)", marginBottom: "0.5rem" }}>AVERAGE RATING</p>
                            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "3rem", lineHeight: 1, marginBottom: "0.5rem" }}>
                                {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                            </h3>
                            <div style={{ display: "flex", gap: "0.15rem", marginBottom: "0.75rem" }}>
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
                                    const fill = i < Math.round(avg);
                                    return (
                                        <span key={i} style={{ fontSize: "1.25rem", color: fill ? "var(--black)" : "var(--gray-200)" }}>★</span>
                                    );
                                })}
                            </div>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-500)", letterSpacing: "0.03em" }}>
                                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                            </p>
                        </div>

                        {/* Submit review card */}
                        <div style={{ border: "2px solid var(--black)", padding: "2rem" }}>
                            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.5rem", letterSpacing: "-0.01em" }}>
                                LEAVE A STYLE REVIEW
                            </h4>
                            <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase" }}>Rating</label>
                                    <div style={{ display: "flex", gap: "0.4rem" }}>
                                        {Array.from({ length: 5 }).map((_, idx) => {
                                            const starVal = idx + 1;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setReviewRating(starVal)}
                                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "1.75rem", color: reviewRating >= starVal ? "var(--black)" : "var(--gray-200)", transition: "color 0.1s ease" }}
                                                >
                                                    ★
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="rev-name" style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase" }}>Your Name</label>
                                    <input
                                        type="text"
                                        id="rev-name"
                                        value={reviewName}
                                        onChange={(e) => setReviewName(e.target.value)}
                                        className="input-field"
                                        placeholder="e.g. Bolaji O."
                                        required
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="rev-email" style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase" }}>Email Address</label>
                                    <input
                                        type="email"
                                        id="rev-email"
                                        value={reviewEmail}
                                        onChange={(e) => setReviewEmail(e.target.value)}
                                        className="input-field"
                                        placeholder="e.g. bolaji@lagosboy.com"
                                        required
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="rev-comment" style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase" }}>Comment</label>
                                    <textarea
                                        id="rev-comment"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        className="input-field"
                                        placeholder="Tell us about the fit, material, and look..."
                                        rows={4}
                                        required
                                        style={{ marginBottom: 0, resize: "vertical", minHeight: "80px", padding: "0.75rem" }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={submittingReview} style={{ width: "100%", padding: "0.75rem" }}>
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div>
                        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.5rem", letterSpacing: "-0.01em", paddingBottom: "0.75rem", borderBottom: "2px solid var(--black)" }}>
                            WHAT THE STREETS ARE SAYING ({reviews.length})
                        </h4>

                        {reviewsLoading ? (
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-400)" }}>Loading style reviews...</p>
                        ) : reviews.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed var(--gray-200)" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9rem", color: "var(--gray-400)", marginBottom: "0.5rem" }}>No reviews yet</p>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)" }}>Be the first to share your fit review!</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                {reviews.map((rev) => (
                                    <div key={rev.id} style={{ borderBottom: "1px solid var(--gray-200)", paddingBottom: "1.5rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9rem" }}>{rev.userName}</span>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)" }}>
                                                {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.15rem", marginBottom: "0.75rem" }}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} style={{ fontSize: "1rem", color: i < rev.rating ? "var(--black)" : "var(--gray-200)" }}>★</span>
                                            ))}
                                        </div>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.6, color: "var(--gray-600)" }}>
                                            {rev.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
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
        .product-detail-grid {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
        .reviews-grid {
          grid-template-columns: 1fr 1.5fr;
        }
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .reviews-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
        </>
    );
}
