import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        // Try by slug first, then by ID
        let product = await prisma.product.findUnique({
            where: { slug },
            include: { collection: true }
        });

        if (!product) {
            product = await prisma.product.findFirst({
                where: { id: slug, isActive: true },
                include: { collection: true }
            });
        }

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error("Product fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug } = await params;
        const body = await req.json();
        const product = await prisma.product.update({
            where: { slug },
            data: body,
        });
        return NextResponse.json({ product });
    } catch (error) {
        console.error("Product update error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug } = await params;
        
        // Check if product has orders
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { _count: { select: { orderItems: true } } }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (product._count.orderItems > 0) {
            return NextResponse.json({ 
                error: "Cannot delete product that has existing orders. Please deactivate it instead." 
            }, { status: 400 });
        }

        await prisma.product.delete({
            where: { slug },
        });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Product delete error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
