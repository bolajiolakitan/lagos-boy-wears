"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setLoading(true);
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) {
            toast.error(data.error || "Registration failed");
        } else {
            toast.success("Account created! Please sign in.");
            router.push("/auth/login");
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
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>CREATE ACCOUNT</h1>
                    <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-400)", fontSize: "0.875rem" }}>
                        Join the Lagos Boy Wears crew
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {[
                        { key: "name", label: "Full Name", type: "text", placeholder: "Your Name" },
                        { key: "email", label: "Email", type: "email", placeholder: "your@email.com" },
                        { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
                    ].map(({ key, label, type, placeholder }) => (
                        <div key={key}>
                            <label style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                {label}
                            </label>
                            <input
                                type={type}
                                value={form[key as keyof typeof form]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                required
                                placeholder={placeholder}
                                className="input-field"
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: "100%", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--gray-200)" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                        Already have an account?{" "}
                        <Link href="/auth/login" style={{ fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
