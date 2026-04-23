"use client";
import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            style={{
                background: "var(--black)",
                color: "var(--white)",
                padding: "4rem 0 2rem",
                marginTop: "6rem",
            }}
        >
            <div className="container">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "3rem",
                        marginBottom: "4rem",
                    }}
                >
                    {/* Brand */}
                    <div>
                        <div
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: "1.4rem",
                                letterSpacing: "-0.02em",
                                marginBottom: "0.75rem",
                            }}
                        >
                            LAGOS BOY WEARS
                        </div>
                        <p
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.75rem",
                                letterSpacing: "0.1em",
                                color: "var(--gray-400)",
                                marginBottom: "0.5rem",
                            }}
                        >
                            EST. 2024
                        </p>
                        <p
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.875rem",
                                color: "var(--gray-400)",
                                lineHeight: 1.6,
                            }}
                        >
                            Dressed in Code. Premium streetwear rooted in Lagos urban culture.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4
                            style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: "1rem",
                            }}
                        >
                            Shop
                        </h4>
                        <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {[
                                { href: "/shop?category=tops", label: "Tops" },
                                { href: "/shop?category=bottoms", label: "Bottoms" },
                                { href: "/shop?category=accessories", label: "Accessories" },
                                { href: "/shop", label: "All Products" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: "0.875rem",
                                        color: "var(--gray-400)",
                                        transition: "color var(--transition)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color = "var(--white)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.color = "var(--gray-400)")
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Account */}
                    <div>
                        <h4
                            style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: "1rem",
                            }}
                        >
                            Account
                        </h4>
                        <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {[
                                { href: "/auth/login", label: "Login" },
                                { href: "/auth/register", label: "Register" },
                                { href: "/account", label: "My Orders" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    style={{
                                        fontFamily: "var(--font-body)",
                                        fontSize: "0.875rem",
                                        color: "var(--gray-400)",
                                        transition: "color var(--transition)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color = "var(--white)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.color = "var(--gray-400)")
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4
                            style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: "1rem",
                            }}
                        >
                            Contact
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--gray-400)" }}>
                                Lagos, Nigeria
                            </p>
                            <a
                                href="mailto:hello@lagosboywears.com"
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.875rem",
                                    color: "var(--gray-400)",
                                    transition: "color var(--transition)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gray-400)")}
                            >
                                hello@lagosboywears.com
                            </a>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                {[
                                    { label: "IG", href: "https://instagram.com/lagosboywears" },
                                    { label: "TW", href: "https://twitter.com/lagosboywears" },
                                    { label: "TK", href: "https://tiktok.com/@lagosboywears" },
                                ].map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: "0.7rem",
                                            letterSpacing: "0.08em",
                                            color: "var(--gray-400)",
                                            transition: "color var(--transition)",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gray-400)")}
                                    >
                                        {s.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        borderTop: "1px solid #1a1a1a",
                        paddingTop: "2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}
                >
                    <p
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.08em",
                            color: "var(--gray-600)",
                        }}
                    >
                        © {year} LAGOS BOY WEARS. ALL RIGHTS RESERVED.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.08em",
                            color: "var(--gray-600)",
                        }}
                    >
                        BUILD SHARP. SHIP CLEAN. DRESS THE CITY.
                    </p>
                </div>
            </div>
        </footer>
    );
}
