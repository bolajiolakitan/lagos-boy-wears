import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProductActions from "./ProductActions";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  } catch {}

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem" }}>PRODUCTS</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 0", border: "1px dashed var(--gray-300)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--gray-400)", letterSpacing: "0.05em" }}>
            NO PRODUCTS YET
          </p>
          <Link href="/admin/products/new" className="btn-primary" style={{ display: "inline-block", marginTop: "1.5rem" }}>
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "var(--black)", color: "var(--white)", textAlign: "left" }}>
                {["PRODUCT", "CATEGORY", "PRICE", "STOCK", "STATUS", "ACTIONS"].map((h) => (
                  <th key={h} style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.05em", fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-200)" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "40px", height: "50px", background: "var(--gray-100)", flexShrink: 0, overflow: "hidden" }}>
                        {p.images[0] && (
                          <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>{p.name}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)" }}>{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    {p.category}
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem" }}>
                    {formatPrice(p.price)}
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                    <span style={{ color: p.stock < 5 ? "#c00" : "inherit" }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.6rem",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        background: p.isActive ? "var(--black)" : "var(--gray-200)",
                        color: p.isActive ? "var(--white)" : "var(--gray-600)",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <ProductActions slug={p.slug} isActive={p.isActive} />
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
