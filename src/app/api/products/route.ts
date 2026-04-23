import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    try {
        const where: any = { isActive: true };
        if (category) where.category = category;
        if (q) {
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                sizes: true,
                stock: true,
                category: true,
                isActive: true,
            },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error("Products GET error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, price, images, sizes, stock, category } = body;

        if (!name || !description || !price || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") + "-" + Date.now();

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: Number(price),
                images: images || [],
                sizes: sizes || ["S", "M", "L", "XL", "XXL"],
                stock: Number(stock) || 0,
                category,
                isActive: true,
            },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error("Products POST error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
