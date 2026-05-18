"use client";
import { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import toast from "react-hot-toast";
import { NIGERIA_LOCATIONS } from "@/lib/nigeria-data";

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

    const [form, setForm] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        street: "",
        state: "",
        lga: "",
    });
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "CRYPTO">("PAYSTACK");
    const [cryptoAsset, setCryptoAsset] = useState<"USDT" | "USDC" | "BTC">("USDT");
    const [txHash, setTxHash] = useState("");
    const [copied, setCopied] = useState(false);

    const CRYPTO_ADDRESSES = {
        USDT: process.env.NEXT_PUBLIC_CRYPTO_USDT_TRC20 || "TYq8S86b5U5H9kH76B8v2H1xXy4zZ11A2B",
        USDC: process.env.NEXT_PUBLIC_CRYPTO_USDC_SOL || "7y1B8n2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s",
        BTC: process.env.NEXT_PUBLIC_CRYPTO_BTC || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    };

    const CRYPTO_NETWORKS = {
        USDT: "Tron (TRC-20) network",
        USDC: "Solana network",
        BTC: "Bitcoin mainnet",
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(CRYPTO_ADDRESSES[cryptoAsset]);
        setCopied(true);
        toast.success("Address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const availableLgas = useMemo(() => {
        if (!form.state) return [];
        return NIGERIA_LOCATIONS.find(loc => loc.state === form.state)?.lgas || [];
    }, [form.state]);

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

    const handlePaystack = () => {
        if (!form.name || !form.email || !form.phone || !form.street || !form.state || !form.lga) {
            toast.error("Please fill in all delivery details");
            return;
        }
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setLoading(true);
        const handler = (window as any).PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_paystack_public_key",
            email: form.email,
            amount: totalPrice,
            currency: "NGN",
            ref: `LBW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            callback: async (response: any) => {
                try {
                    const res = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            items: items.map((i) => ({
                                productId: i.id,
                                size: i.size,
                                color: i.color || null,
                                quantity: i.quantity,
                                price: i.price,
                            })),
                            total: totalPrice,
                            address: { 
                                name: form.name, 
                                phone: form.phone, 
                                street: form.street, 
                                lga: form.lga, 
                                state: form.state 
                            },
                            paystackRef: response.reference,
                        }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        clearCart();
                        toast.success("Order placed successfully!");
                        router.push("/account");
                    } else {
                        toast.error(data.error || "Failed to place order");
                    }
                } catch {
                    toast.error("Something went wrong");
                }
                setLoading(false);
            },
            onClose: () => {
                setLoading(false);
                toast.error("Payment cancelled");
            },
        });
        handler.openIframe();
    };

    const handleCryptoCheckout = async () => {
        if (!form.name || !form.email || !form.phone || !form.street || !form.state || !form.lga) {
            toast.error("Please fill in all delivery details");
            return;
        }
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        if (!txHash) {
            toast.error("Please enter your Transaction Hash (TxHash) to confirm");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((i) => ({
                        productId: i.id,
                        size: i.size,
                        color: i.color || null,
                        quantity: i.quantity,
                        price: i.price,
                    })),
                    total: totalPrice,
                    address: {
                        name: form.name,
                        phone: form.phone,
                        street: form.street,
                        lga: form.lga,
                        state: form.state,
                    },
                    paymentMethod: "CRYPTO",
                    cryptoAsset,
                    cryptoRef: txHash,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                clearCart();
                toast.success("Crypto order submitted! Awaiting manual confirmation.");
                router.push("/account");
            } else {
                toast.error(data.error || "Failed to place order");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
                <h1 style={{ marginBottom: "1rem" }}>NOTHING TO CHECKOUT</h1>
                <Link href="/shop" className="btn-primary">Shop Now</Link>
            </div>
        );
    }

    return (
        <>
            <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
            <div className="container" style={{ padding: "3rem 1.5rem" }}>
                <h1 style={{ marginBottom: "2.5rem" }}>CHECKOUT</h1>

                <div className="checkout-grid" style={{ display: "grid", gap: "3rem", alignItems: "start" }}>
                    {/* Delivery Form */}
                    <div>
                        <h2 style={{ fontSize: "1.1rem", letterSpacing: "0.05em", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid var(--black)" }}>
                            DELIVERY DETAILS
                        </h2>
                        <div className="checkout-form-grid" style={{ display: "grid", gap: "1rem" }}>
                            {[
                                { key: "name", label: "Full Name", type: "text", placeholder: "Your Name", span: 2 },
                                { key: "email", label: "Email", type: "email", placeholder: "your@email.com", span: 1 },
                                { key: "phone", label: "Phone", type: "tel", placeholder: "080XXXXXXXX", span: 1 },
                                { key: "street", label: "Street Address", type: "text", placeholder: "e.g. 12 Urban Street", span: 2 },
                            ].map(({ key, label, type, placeholder, span }) => (
                                <div key={key} style={{ gridColumn: `span ${span}` }}>
                                    <label style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        value={form[key as keyof typeof form]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className="input-field"
                                    />
                                </div>
                            ))}

                            <div>
                                <label style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                    State
                                </label>
                                <select
                                    value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value, lga: "" })}
                                    className="input-field"
                                >
                                    <option value="">Select State</option>
                                    {NIGERIA_LOCATIONS.map((loc) => (
                                        <option key={loc.state} value={loc.state}>{loc.state}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                    Local Govt (LGA)
                                </label>
                                <select
                                    value={form.lga}
                                    onChange={(e) => setForm({ ...form, lga: e.target.value })}
                                    className="input-field"
                                    disabled={!form.state}
                                >
                                    <option value="">{form.state ? "Select LGA" : "Select State First"}</option>
                                    {availableLgas.map((lga) => (
                                        <option key={lga} value={lga}>{lga}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ border: "2px solid var(--black)", padding: "2rem", position: "sticky", top: "100px" }}>
                        <h2 style={{ fontSize: "1.1rem", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>ORDER SUMMARY</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}-${item.color || ""}`} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <div style={{ width: "48px", height: "60px", background: "var(--gray-100)", flexShrink: 0, overflow: "hidden" }}>
                                        {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", textTransform: "uppercase" }}>
                                            {item.size} {item.color ? `| ${item.color}` : ""} × {item.quantity}
                                        </p>
                                    </div>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", flexShrink: 0 }}>
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--gray-600)" }}>Subtotal</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>{formatPrice(totalPrice)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--gray-600)" }}>Delivery</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--gray-400)" }}>Calculated at next step</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--black)", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                                <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</span>
                                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem" }}>{formatPrice(totalPrice)}</span>
                            </div>

                            {/* Payment Tabs Selector */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                <button
                                    onClick={() => setPaymentMethod("PAYSTACK")}
                                    style={{
                                        padding: "0.75rem",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        border: paymentMethod === "PAYSTACK" ? "2px solid var(--black)" : "1px solid var(--gray-200)",
                                        background: paymentMethod === "PAYSTACK" ? "var(--black)" : "var(--white)",
                                        color: paymentMethod === "PAYSTACK" ? "var(--white)" : "var(--black)",
                                        cursor: "pointer",
                                    }}
                                >
                                    Card / Transfer
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("CRYPTO")}
                                    style={{
                                        padding: "0.75rem",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        border: paymentMethod === "CRYPTO" ? "2px solid var(--black)" : "1px solid var(--gray-200)",
                                        background: paymentMethod === "CRYPTO" ? "var(--black)" : "var(--white)",
                                        color: paymentMethod === "CRYPTO" ? "var(--white)" : "var(--black)",
                                        cursor: "pointer",
                                    }}
                                >
                                    Pay with Crypto
                                </button>
                            </div>

                            {paymentMethod === "PAYSTACK" ? (
                                <>
                                    <button
                                        onClick={handlePaystack}
                                        className="btn-primary"
                                        style={{ width: "100%", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                        disabled={loading}
                                    >
                                        {loading ? "Processing..." : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                                    <line x1="1" y1="10" x2="23" y2="10" />
                                                </svg>
                                                Pay with Paystack
                                            </>
                                        )}
                                    </button>
                                    <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", marginTop: "0.75rem", letterSpacing: "0.05em" }}>
                                        SECURED BY PAYSTACK · PCI COMPLIANT
                                    </p>
                                </>
                            ) : (
                                <div style={{ border: "1px solid var(--gray-200)", padding: "1.25rem", background: "var(--gray-50)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", gap: "0.25rem" }}>
                                        {(["USDT", "USDC", "BTC"] as const).map((asset) => (
                                            <button
                                                key={asset}
                                                onClick={() => setCryptoAsset(asset)}
                                                style={{
                                                    flex: 1,
                                                    padding: "0.5rem",
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    border: cryptoAsset === asset ? "1px solid var(--black)" : "1px solid var(--gray-200)",
                                                    background: cryptoAsset === asset ? "var(--black)" : "var(--white)",
                                                    color: cryptoAsset === asset ? "var(--white)" : "var(--gray-500)",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {asset}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.75rem", borderBottom: "1px solid var(--gray-200)", paddingBottom: "1rem" }}>
                                        <div style={{ width: "120px", height: "120px", background: "var(--white)", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(CRYPTO_ADDRESSES[cryptoAsset])}`}
                                                alt="QR Code"
                                                style={{ width: "100px", height: "100px" }}
                                            />
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                                                Network
                                            </p>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "var(--black)" }}>
                                                {CRYPTO_NETWORKS[cryptoAsset]}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                                            Wallet Address
                                        </p>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input
                                                type="text"
                                                readOnly
                                                value={CRYPTO_ADDRESSES[cryptoAsset]}
                                                style={{
                                                    flex: 1,
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "0.65rem",
                                                    padding: "0.5rem",
                                                    background: "var(--white)",
                                                    border: "1px solid var(--gray-200)",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            />
                                            <button
                                                onClick={copyAddress}
                                                style={{
                                                    padding: "0.5rem 0.75rem",
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    background: "var(--black)",
                                                    color: "var(--white)",
                                                    border: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {copied ? "COPIED" : "COPY"}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1rem" }}>
                                        <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                                            Transaction Hash (TxHash) *
                                        </label>
                                        <input
                                            type="text"
                                            value={txHash}
                                            onChange={(e) => setTxHash(e.target.value)}
                                            placeholder="Paste your transaction hash here"
                                            className="input-field"
                                            style={{ fontSize: "0.75rem", padding: "0.5rem" }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleCryptoCheckout}
                                        className="btn-primary"
                                        style={{ width: "100%", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                                        disabled={loading}
                                    >
                                        {loading ? "Processing..." : "Confirm Crypto Order"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
        .checkout-grid {
          grid-template-columns: 1fr min(420px, 100%);
        }
        .checkout-form-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-form-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
        </>
    );
}
