import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        // Try by slug first, then by ID
        let collection = await prisma.collection.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!collection) {
            collection = await prisma.collection.findUnique({
                where: { id: slug }, // Try matching as database ID
                include: {
                    products: {
                        where: { isActive: true },
                        orderBy: { createdAt: "desc" }
                    }
                }
            });
        }

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        return NextResponse.json({ collection });
    } catch (error) {
        console.error("Collection GET error:", error);
        return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
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
        const { name, description, coverImage, isActive } = body;

        // Find the collection to edit (can be slug or id)
        let collection = await prisma.collection.findUnique({ where: { slug } });
        if (!collection) {
            collection = await prisma.collection.findUnique({ where: { id: slug } });
        }

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        const dataToUpdate: any = {};
        if (name !== undefined) {
            dataToUpdate.name = name;
            // Regenerate slug if name is edited
            dataToUpdate.slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
        }
        if (description !== undefined) dataToUpdate.description = description;
        if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
        if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

        const updatedCollection = await prisma.collection.update({
            where: { id: collection.id },
            data: dataToUpdate
        });

        return NextResponse.json({ collection: updatedCollection });
    } catch (error) {
        console.error("Collection PUT error:", error);
        return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug } = await params;

        let collection = await prisma.collection.findUnique({ where: { slug } });
        if (!collection) {
            collection = await prisma.collection.findUnique({ where: { id: slug } });
        }

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        // Deassociate products in this collection
        await prisma.product.updateMany({
            where: { collectionId: collection.id },
            data: { collectionId: null }
        });

        // Delete the collection
        await prisma.collection.delete({
            where: { id: collection.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Collection DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
    }
}
