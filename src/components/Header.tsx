"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Header() {
    const { totalItems, setIsOpen } = useCart();
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "var(--white)",
                borderBottom: "2px solid var(--black)",
            }}
        >
            <div
                className="container"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "72px",
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect width="40" height="40" fill="#000" />
                        <text
                            x="50%"
                            y="50%"
                            dominantBaseline="central"
                            textAnchor="middle"
                            fill="#fff"
                            fontFamily="Syne, sans-serif"
                            fontWeight="800"
                            fontSize="14"
                            letterSpacing="1"
                        >
                            [A]
                        </text>
                    </svg>
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "1.1rem",
                            letterSpacing: "-0.02em",
                            lineHeight: 1,
                        }}
                    >
                        LAGOS BOY WEARS
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2rem",
                    }}
                    className="desktop-nav"
                >
                    <Link
                        href="/shop"
                        style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            transition: "opacity var(--transition)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        Shop
                    </Link>

                    <Link
                        href="/collections"
                        style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            transition: "opacity var(--transition)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        Drops
                    </Link>

                    {session?.user ? (
                        <>
                            {(session.user as any).role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontWeight: 500,
                                        fontSize: "0.875rem",
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href="/account"
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                Account
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="btn-ghost"
                                style={{
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    padding: "0",
                                }}
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/auth/login"
                            style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            Login
                        </Link>
                    )}

                    {/* Cart Button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            position: "relative",
                            background: "none",
                            padding: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        {totalItems > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: "0",
                                    right: "0",
                                    background: "var(--black)",
                                    color: "var(--white)",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.6rem",
                                    fontWeight: 500,
                                    width: "16px",
                                    height: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {totalItems}
                            </span>
                        )}
                    </button>
                </nav>

                {/* Mobile menu button */}
                <div style={{ display: "none" }} className="mobile-menu-btn">
                    <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", padding: "0.5rem" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {menuOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div
                    style={{
                        borderTop: "1px solid var(--gray-200)",
                        padding: "1rem 1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                    className="mobile-menu"
                >
                    <Link href="/shop" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>Shop</Link>
                    <Link href="/collections" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>Drops</Link>
                    {session?.user ? (
                        <>
                            <Link href="/account" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>Account</Link>
                            {(session.user as any).role === "ADMIN" && <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>Admin</Link>}
                            <button onClick={() => signOut()} style={{ textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem", background: "none" }}>Sign Out</button>
                        </>
                    ) : (
                        <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>Login</Link>
                    )}
                    <button
                        onClick={() => { setIsOpen(true); setMenuOpen(false); }}
                        style={{ textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem", background: "none" }}
                    >
                        Cart ({totalItems})
                    </button>
                </div>
            )}

            <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; gap: 0.5rem; align-items: center; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
        </header>
    );
}
