"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (result?.error) {
            toast.error(result.error || "Login failed");
        } else {
            toast.success("Welcome back!");
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();
            if (session?.user?.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/");
            }
            router.refresh();
        }
    };

    return (
        <div
            style={{
                minHeight: "calc(100vh - 72px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
                background: "var(--gray-100)",
            }}
        >
            <div
                style={{
                    background: "var(--white)",
                    border: "2px solid var(--black)",
                    width: "100%",
                    maxWidth: "420px",
                    padding: "3rem",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            background: "var(--black)",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontFamily="Syne" fontWeight="800" fontSize="14">[A]</text>
                        </svg>
                    </div>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>WELCOME BACK</h1>
                    <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-400)", fontSize: "0.875rem" }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="input-field"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: "100%", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "2rem",
                        paddingTop: "2rem",
                        borderTop: "1px solid var(--gray-200)",
                    }}
                >
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                        Don't have an account?{" "}
                        <Link
                            href="/auth/register"
                            style={{ fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
