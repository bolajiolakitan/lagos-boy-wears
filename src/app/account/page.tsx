import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const STATUS_CLASSES: Record<string, string> = {
    PENDING: "badge-pending",
    PROCESSING: "badge-processing",
    SHIPPED: "badge-shipped",
    DELIVERED: "badge-delivered",
    CANCELLED: "badge-cancelled",
};

export default async function AccountPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/auth/login");
    if ((session.user as any).role === "ADMIN") redirect("/admin");

    let orders: any[] = [];
    try {
        orders = await prisma.order.findMany({
            where: { userId: (session.user as any).id },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, images: true, slug: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch {
        orders = [];
    }

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

    const formatDate = (d: Date) =>
        new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="container" style={{ padding: "3rem 1.5rem" }}>
            <div style={{ marginBottom: "3rem" }}>
                <h1 style={{ marginBottom: "0.5rem" }}>MY ACCOUNT</h1>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-400)", fontSize: "0.9rem" }}>
                    Welcome back, {session.user.name}
                </p>
            </div>

            {/* Account Info */}
            <div
                style={{
                    border: "2px solid var(--black)",
                    padding: "2rem",
                    marginBottom: "3rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                }}
            >
                {[
                    { label: "Name", value: session.user.name },
                    { label: "Email", value: session.user.email },
                    { label: "Total Orders", value: orders.length.toString() },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.25rem" }}>
                            {label}
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Orders */}
            <div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid var(--black)" }}>
                    ORDER HISTORY
                </h2>

                {orders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 0" }}>
                        <p style={{ fontFamily: "var(--font-mono)", color: "var(--gray-400)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
                            NO ORDERS YET
                        </p>
                        <a href="/shop" className="btn-primary">Start Shopping</a>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {orders.map((order) => (
                            <div key={order.id} style={{ border: "1px solid var(--gray-200)", overflow: "hidden" }}>
                                {/* Order Header */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                        gap: "1rem",
                                        padding: "1rem 1.5rem",
                                        background: "var(--gray-100)",
                                        borderBottom: "1px solid var(--gray-200)",
                                    }}
                                >
                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.25rem" }}>Order ID</p>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>#{order.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.25rem" }}>Date</p>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.25rem" }}>Total</p>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem" }}>{formatPrice(order.total)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.25rem" }}>Status</p>
                                        <span className={`badge ${STATUS_CLASSES[order.status] || ""}`}>{order.status}</span>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.75rem" }}>Items</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {order.items.map((item: any) => (
                                                <div key={item.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                                    <div style={{ width: "56px", height: "72px", background: "var(--gray-100)", overflow: "hidden", flexShrink: 0 }}>
                                                        {item.product?.images?.[0] && (
                                                            <img src={item.product.images[0]} alt={item.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem" }}>{item.product?.name}</p>
                                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)" }}>
                                                            {item.size} × {item.quantity}
                                                        </p>
                                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{formatPrice(item.price * item.quantity)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ borderLeft: "1px solid var(--gray-100)", paddingLeft: "2rem" }}>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.75rem" }}>Shipping Address</p>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600 }}>{(order.address as any).name}</p>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--gray-600)", lineHeight: "1.5" }}>
                                            {(order.address as any).street}<br />
                                            {(order.address as any).lga || (order.address as any).area}, {(order.address as any).state || (order.address as any).city}<br />
                                            {(order.address as any).phone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
