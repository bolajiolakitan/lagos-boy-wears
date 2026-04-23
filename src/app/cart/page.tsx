"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

    if (items.length === 0) {
        return (
            <div className="container" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto 1.5rem", opacity: 0.25 }}>
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <h1 style={{ marginBottom: "1rem" }}>YOUR CART IS EMPTY</h1>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-400)", marginBottom: "2rem" }}>
                    Looks like you haven't added anything yet.
                </p>
                <Link href="/shop" className="btn-primary">Shop Now</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: "3rem 1.5rem" }}>
            <h1 style={{ marginBottom: "2.5rem" }}>YOUR CART</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr min(380px, 100%)", gap: "3rem", alignItems: "start" }}>
                {/* Items */}
                <div>
                    <div style={{ borderTop: "2px solid var(--black)", marginBottom: "1rem" }} />
                    {items.map((item) => (
                        <div
                            key={`${item.id}-${item.size}`}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "100px 1fr",
                                gap: "1.5rem",
                                padding: "1.5rem 0",
                                borderBottom: "1px solid var(--gray-200)",
                                alignItems: "start",
                            }}
                        >
                            <div style={{ width: "100px", height: "120px", background: "var(--gray-100)", overflow: "hidden" }}>
                                {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                    <div>
                                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.25rem" }}>{item.name}</h3>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)", letterSpacing: "0.08em" }}>SIZE: {item.size}</p>
                                    </div>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem" }}>
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--black)" }}>
                                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} style={{ background: "none", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0 0.75rem" }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} style={{ background: "none", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                    </div>
                                    <button onClick={() => removeItem(item.id, item.size)} style={{ background: "none", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)", letterSpacing: "0.05em", textDecoration: "underline" }}>
                                        REMOVE
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div style={{ marginTop: "1rem" }}>
                        <button onClick={clearCart} style={{ background: "none", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)", letterSpacing: "0.05em", textDecoration: "underline" }}>
                            CLEAR CART
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div style={{ border: "2px solid var(--black)", padding: "2rem", position: "sticky", top: "100px" }}>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>ORDER SUMMARY</h2>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ fontFamily: "var(--font-body)", color: "var(--gray-600)", fontSize: "0.875rem" }}>Subtotal</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>{formatPrice(totalPrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ fontFamily: "var(--font-body)", color: "var(--gray-600)", fontSize: "0.875rem" }}>Shipping</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--gray-400)" }}>Calculated at checkout</span>
                    </div>
                    <div style={{ borderTop: "2px solid var(--black)", paddingTop: "1rem", marginTop: "1rem", display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</span>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem" }}>{formatPrice(totalPrice)}</span>
                    </div>
                    <Link href="/checkout" className="btn-primary" style={{ width: "100%", display: "block", textAlign: "center" }}>
                        Proceed to Checkout
                    </Link>
                    <Link href="/shop" style={{ display: "block", textAlign: "center", marginTop: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", letterSpacing: "0.05em", textDecoration: "underline" }}>
                        CONTINUE SHOPPING
                    </Link>
                </div>
            </div>
        </div>
    );
}
