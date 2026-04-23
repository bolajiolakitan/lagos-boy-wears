import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin User ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lagosboywears.com" },
    update: {},
    create: {
      email: "admin@lagosboywears.com",
      password: hashedPassword,
      name: "Lagos Boy Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── Sample Products ──────────────────────────────────────────────────────────
  const products = [
    {
      name: "Lagos Street Hoodie",
      slug: "lagos-street-hoodie",
      description:
        "Premium heavyweight hoodie crafted from 400gsm French terry cotton. Featuring the [A] emblem embroidered on the chest and our iconic Lagos skyline graphic on the back. Oversized silhouette, designed to move with you.",
      price: 3500000, // ₦35,000
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
        "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 25,
      category: "tops",
    },
    {
      name: "Island Boy Tee",
      slug: "island-boy-tee",
      description:
        "Ultra-soft 240gsm Pima cotton tee with a boxy fit. Screen-printed with our signature Lagos Boy Wears graphic. Pre-washed for a lived-in feel from day one.",
      price: 1800000, // ₦18,000
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 40,
      category: "tops",
    },
    {
      name: "Eko Cargo Pants",
      slug: "eko-cargo-pants",
      description:
        "Technical ripstop cargo pants with utility pockets engineered for Lagos streets. Slim-tapered leg, adjustable ankle toggles. Available in black only. Built to last.",
      price: 4200000, // ₦42,000
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
        "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 18,
      category: "bottoms",
    },
    {
      name: "Bode Track Pants",
      slug: "bode-track-pants",
      description:
        "Japanese nylon track pants with contrast stitching and side zip pockets. Elastic waistband with our LBW woven label. The perfect off-duty bottom.",
      price: 2800000, // ₦28,000
      images: [
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80",
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 30,
      category: "bottoms",
    },
    {
      name: "Agege Script Cap",
      slug: "agege-script-cap",
      description:
        "6-panel structured cap in heavy-wash black twill. Embroidered 'Lagos Boy' script on front, [A] metal badge on side. Adjustable strap, one size fits all.",
      price: 1200000, // ₦12,000
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80",
      ],
      sizes: ["ONE SIZE"],
      stock: 50,
      category: "accessories",
    },
    {
      name: "LBW Monochrome Jogger",
      slug: "lbw-monochrome-jogger",
      description:
        "Heavyweight 380gsm fleece jogger with ribbed cuffs and an elasticated drawstring waist. Twin side pockets, single back pocket with zip. Essential Lagos uniform.",
      price: 2500000, // ₦25,000
      images: [
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 35,
      category: "bottoms",
    },
    {
      name: "Code Crewneck Sweatshirt",
      slug: "code-crewneck-sweatshirt",
      description:
        "Our signature crewneck in 350gsm loopback cotton fleece. Drop-shoulder fit with ribbed collar, cuffs and hem. Garment-dyed for a rich, deep black tone.",
      price: 3200000, // ₦32,000
      images: [
        "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=800&q=80",
        "https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=800&q=80",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 22,
      category: "tops",
    },
    {
      name: "Victoria Island Tote",
      slug: "victoria-island-tote",
      description:
        "Heavy-duty waxed canvas tote with reinforced handles. Interior zip pocket and brass snap closure. Debossed Lagos Boy Wears wordmark. Holds everything you need for the city.",
      price: 1500000, // ₦15,000
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      ],
      sizes: ["ONE SIZE"],
      stock: 45,
      category: "accessories",
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    console.log(`✅ Product: ${created.name} (₦${(created.price / 100).toLocaleString()})`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("──────────────────────────────────────");
  console.log("Admin login:");
  console.log("  Email:    admin@lagosboywears.com");
  console.log("  Password: admin123!");
  console.log("──────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
