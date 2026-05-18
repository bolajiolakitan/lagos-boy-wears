import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true"; // Admin can view inactive ones too

    try {
        const where = showAll ? {} : { isActive: true };
        const collections = await prisma.collection.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return NextResponse.json({ collections });
    } catch (error) {
        console.error("Collections GET error:", error);
        return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, coverImage, isActive } = body;

        if (!name || !description || !coverImage) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate clean, readable slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Check if slug already exists
        const existing = await prisma.collection.findUnique({
            where: { slug }
        });

        if (existing) {
            return NextResponse.json({ error: "A collection with this name or slug already exists" }, { status: 400 });
        }

        const collection = await prisma.collection.create({
            data: {
                name,
                slug,
                description,
                coverImage,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            }
        });

        return NextResponse.json({ collection }, { status: 201 });
    } catch (error) {
        console.error("Collections POST error:", error);
        return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }
}
