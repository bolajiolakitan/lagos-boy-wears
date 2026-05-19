import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const products = await getFeaturedProducts();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(p / 100);

  const categories = [
    { name: "Tops", slug: "tops", desc: "Graphic tees, hoodies & more" },
    { name: "Bottoms", slug: "bottoms", desc: "Trousers, shorts & joggers" },
    { name: "Accessories", slug: "accessories", desc: "Caps, bags & essentials" },
  ];

  return (
    <>
      {/* HERO */}
      <section
        style={{
          background: "var(--black)",
          color: "var(--white)",
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1, padding: "6rem 1.5rem" }}>
          <div style={{ maxWidth: "800px" }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                color: "var(--gray-400)",
                marginBottom: "2rem",
                textTransform: "uppercase",
              }}
            >
              Lagos Boy Wears — Est. 2024
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(3rem, 8vw, 7rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                marginBottom: "2.5rem",
              }}
            >
              DRESSED{" "}
              <span style={{ display: "block", WebkitTextStroke: "2px white", color: "transparent" }}>
                IN CODE.
              </span>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.1rem",
                color: "var(--gray-400)",
                maxWidth: "480px",
                marginBottom: "3rem",
                lineHeight: 1.6,
              }}
            >
              Premium streetwear rooted in Lagos urban culture. Built for 18–35 year olds who move different.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 2.5rem",
                  background: "var(--white)",
                  color: "var(--black)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "2px solid var(--white)",
                  transition: "all 0.2s ease",
                }}
              >
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hero decoration */}
          <div
            style={{
              position: "absolute",
              right: "5%",
              top: "50%",
              transform: "translateY(-50%)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              opacity: 0.15,
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "80px",
                  height: "80px",
                  border: "1px solid white",
                  background: i % 3 === 0 ? "white" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "3rem",
              borderBottom: "2px solid var(--black)",
              paddingBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>CATEGORIES</h2>
            <Link
              href="/shop"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              View All →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2rem",
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                style={{
                  display: "block",
                  padding: "3rem 2rem",
                  background: "var(--white)",
                  transition: "background 0.2s ease, color 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                    opacity: 0.5,
                  }}
                >
                  0{categories.indexOf(cat) + 1}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {cat.name}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", opacity: 0.6 }}>
                  {cat.desc}
                </p>
                <span
                  style={{
                    position: "absolute",
                    bottom: "2rem",
                    right: "2rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: "0 0 6rem" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "3rem",
              borderBottom: "2px solid var(--black)",
              paddingBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>NEW DROPS</h2>
            <Link
              href="/shop"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              View All →
            </Link>
          </div>

          {products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 0",
                borderTop: "1px solid var(--gray-200)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  color: "var(--gray-400)",
                  letterSpacing: "0.05em",
                }}
              >
                NEW DROPS COMING SOON — CHECK BACK LATER
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "4rem 2rem",
                paddingTop: "2rem",
              }}
            >
              {products.map((product, index) => {
                const isFeatured = index === 0 || index === 4;
                const isStaggered = index % 2 === 1 && !isFeatured;
                
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className={`product-card ${isFeatured ? 'featured-card' : ''} ${isStaggered ? 'staggered-item' : ''}`}
                    style={{ 
                      background: "var(--white)", 
                      display: "block",
                      marginTop: isStaggered ? "4rem" : "0", // Fallback, but handled by class too
                    }}
                  >
                    <div className="product-card-image">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--gray-100)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            aspectRatio: "3/4",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.7rem",
                              color: "var(--gray-400)",
                              letterSpacing: "0.1em",
                            }}
                          >
                            NO IMAGE
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                          <p
                              style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.6rem",
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  color: "var(--gray-400)",
                              }}
                          >
                              {product.category}
                          </p>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", opacity: 0.3 }}>
                              0{index + 1}
                          </span>
                      </div>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "1.25rem",
                          marginBottom: "0.75rem",
                          lineHeight: 1.1,
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="price"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "1.5rem",
                          letterSpacing: "-0.02em"
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MARQUEE BAND */}
      <section
        style={{
          background: "var(--black)",
          color: "var(--white)",
          padding: "1.5rem 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4rem",
            whiteSpace: "nowrap",
            animation: "marquee 20s linear infinite",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              BUILD SHARP * SHIP CLEAN * DRESS THE CITY * LAGOS BOY WEARS *
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div
            style={{
              border: "2px solid var(--black)",
              padding: "4rem 3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "2rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", marginBottom: "0.75rem" }}>
                READY TO DRESS THE CITY?
              </h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-600)", maxWidth: "400px" }}>
                Join thousands of fashion-forward Lagosians who move different.
              </p>
            </div>
            {session?.user ? (
              <Link href="/shop" className="btn-primary" style={{ flexShrink: 0 }}>
                Shop Latest Drops
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary" style={{ flexShrink: 0 }}>
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
