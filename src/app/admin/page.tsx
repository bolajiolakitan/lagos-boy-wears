import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

    let revenue = 0;
    let orderCount = 0;
    let topProducts: any[] = [];
    let recentOrders: any[] = [];

    try {
        const [orders, items] = await Promise.all([
            prisma.order.findMany({
                where: { status: { not: "CANCELLED" } },
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { user: { select: { name: true, email: true } } },
            }),
            prisma.orderItem.groupBy({
                by: ["productId"],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5,
            }),
        ]);

        recentOrders = orders;
        orderCount = orders.length;
        revenue = orders.reduce((sum, o) => sum + o.total, 0);

        const productIds = items.map((i) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, images: true, price: true },
        });

        topProducts = items.map((item) => ({
            ...item,
            product: products.find((p) => p.id === item.productId),
        }));
    } catch { }

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

    const STATUS_CLASSES: Record<string, string> = {
        PENDING: "badge-pending", PROCESSING: "badge-processing",
        SHIPPED: "badge-shipped", DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
    };

    const stats = [
        { label: "Gross Revenue", value: formatPrice(revenue), icon: "₦" },
        { label: "Total Orders", value: orderCount.toString(), icon: "📦" },
    ];

    return (
        <div className="container" style={{ padding: "3rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2.5rem" }}>
                <h1>ADMIN DASHBOARD</h1>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <Link href="/admin/collections" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Manage Collections</Link>
                    <Link href="/admin/products" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Manage Products</Link>
                    <Link href="/admin/orders" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>View Orders</Link>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "var(--black)", marginBottom: "3rem" }}>
                {stats.map(({ label, value, icon }) => (
                    <div key={label} style={{ background: "var(--white)", padding: "2rem" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.75rem" }}>{label}</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem" }}>{value}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
                {/* Top 5 Products */}
                <div>
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--black)" }}>
                        TOP 5 PRODUCTS
                    </h2>
                    {topProducts.length === 0 ? (
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-400)" }}>No sales data yet</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {topProducts.map((item, idx) => (
                                <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-400)", width: "20px" }}>{String(idx + 1).padStart(2, "0")}</span>
                                    <div style={{ width: "48px", height: "60px", background: "var(--gray-100)", overflow: "hidden", flexShrink: 0 }}>
                                        {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>{item.product?.name || "Unknown"}</p>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)" }}>
                                            {item._sum.quantity} units sold · {formatPrice((item.product?.price || 0) * (item._sum.quantity || 0))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div>
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--black)" }}>
                        RECENT ORDERS
                    </h2>
                    {recentOrders.length === 0 ? (
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--gray-400)" }}>No orders yet</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                            {recentOrders.slice(0, 8).map((order) => (
                                <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--gray-200)" }}>
                                    <div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", marginBottom: "0.15rem" }}>#{order.id.slice(-6).toUpperCase()}</p>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--gray-600)" }}>{order.user?.name}</p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{formatPrice(order.total)}</p>
                                        <span className={`badge ${STATUS_CLASSES[order.status] || ""}`}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
