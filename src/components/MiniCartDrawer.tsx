"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function MiniCartDrawer() {
    const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        zIndex: 200,
                        animation: "fadeIn 0.2s ease",
                    }}
                />
            )}

            {/* Drawer */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "min(420px, 100vw)",
                    background: "var(--white)",
                    zIndex: 201,
                    display: "flex",
                    flexDirection: "column",
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderLeft: "2px solid var(--black)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1.5rem",
                        borderBottom: "2px solid var(--black)",
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "1.2rem",
                        }}
                    >
                        CART ({totalItems})
                    </h2>
                    <button onClick={() => setIsOpen(false)} style={{ background: "none", padding: "0.25rem" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: "center", paddingTop: "3rem" }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto 1rem", opacity: 0.3 }}>
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-400)", marginBottom: "1.5rem" }}>
                                Your cart is empty
                            </p>
                            <Link href="/shop" onClick={() => setIsOpen(false)} className="btn-primary" style={{ display: "inline-block" }}>
                                Shop Now
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {items.map((item) => (
                                <div
                                    key={`${item.id}-${item.size}`}
                                    style={{
                                        display: "flex",
                                        gap: "1rem",
                                        paddingBottom: "1.5rem",
                                        borderBottom: "1px solid var(--gray-200)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "80px",
                                            height: "96px",
                                            background: "var(--gray-100)",
                                            flexShrink: 0,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {item.image && (
                                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                                            {item.name}
                                        </p>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)", marginBottom: "0.75rem" }}>
                                            SIZE: {item.size}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--black)" }}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                    style={{ background: "none", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}
                                                >
                                                    −
                                                </button>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0 0.5rem" }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                    style={{ background: "none", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem" }}>
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                                <button
                                                    onClick={() => removeItem(item.id, item.size)}
                                                    style={{ background: "none", color: "var(--gray-400)" }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M18 6L6 18M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{ padding: "1.5rem", borderTop: "2px solid var(--black)" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "1.25rem",
                            }}
                        >
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.875rem" }}>
                                Subtotal
                            </span>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem" }}>
                                {formatPrice(totalPrice)}
                            </span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={() => setIsOpen(false)}
                            className="btn-primary"
                            style={{ width: "100%", display: "block", textAlign: "center", marginBottom: "0.75rem" }}
                        >
                            Checkout
                        </Link>
                        <Link
                            href="/cart"
                            onClick={() => setIsOpen(false)}
                            className="btn-secondary"
                            style={{ width: "100%", display: "block", textAlign: "center" }}
                        >
                            View Cart
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
