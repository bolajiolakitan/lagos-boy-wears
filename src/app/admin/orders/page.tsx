import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrderStatusSelect from "./OrderStatusSelect";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem" }}>ORDERS</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="/admin" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", letterSpacing: "0.05em", textDecoration: "underline", textUnderlineOffset: "3px" }}>
          ← Dashboard
        </a>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 0", border: "1px dashed var(--gray-300)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--gray-400)", letterSpacing: "0.05em" }}>
            NO ORDERS YET
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "var(--black)", color: "var(--white)", textAlign: "left" }}>
                {["ORDER ID", "DATE", "CUSTOMER", "DELIVERY ADDRESS", "ITEMS", "TOTAL", "STATUS"].map((h) => (
                  <th key={h} style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.05em", fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--gray-200)" }}>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                    #{o.id.slice(-8)}
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem" }}>{o.user?.name}</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)" }}>{o.user?.email}</p>
                  </td>
                  <td style={{ padding: "1rem", maxWidth: "200px" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", lineHeight: "1.4" }}>
                      {(o.address as any)?.street}<br />
                      <span style={{ color: "var(--gray-400)", fontSize: "0.75rem" }}>
                        {(o.address as any)?.lga || (o.address as any)?.area}, {(o.address as any)?.state || (o.address as any)?.city}
                      </span>
                    </p>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {o.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} style={{ width: "32px", height: "40px", background: "var(--gray-100)", overflow: "hidden", flexShrink: 0 }}>
                          {item.product?.images?.[0] && (
                            <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", alignSelf: "center", marginLeft: "0.25rem" }}>
                          +{o.items.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem" }}>
                    {formatPrice(o.total)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
