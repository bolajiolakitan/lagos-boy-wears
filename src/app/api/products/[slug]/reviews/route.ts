import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        
        // Find product by slug or id
        let product = await prisma.product.findUnique({
            where: { slug }
        });
        
        if (!product) {
            product = await prisma.product.findFirst({
                where: { id: slug }
            });
        }
        
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const reviews = await prisma.review.findMany({
            where: { productId: product.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error("Reviews fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
        }

        const { slug } = await params;
        const { rating, comment, userName } = await req.json();

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Invalid rating. Must be between 1 and 5." }, { status: 400 });
        }
        if (!comment || comment.trim().length < 3) {
            return NextResponse.json({ error: "Comment must be at least 3 characters long." }, { status: 400 });
        }

        const displayName = userName?.trim() || session.user.name || "Customer";
        const displayEmail = session.user.email || "";

        // Find the product
        let product = await prisma.product.findUnique({
            where: { slug }
        });
        
        if (!product) {
            product = await prisma.product.findFirst({
                where: { id: slug }
            });
        }
        
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Check if the user has purchased the product
        const purchasedOrder = await prisma.order.findFirst({
            where: {
                userId: (session.user as any).id,
                status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
                items: {
                    some: {
                        productId: product.id
                    }
                }
            }
        });
        const isVerified = !!purchasedOrder;

        // Create the review
        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment: comment.trim(),
                userName: displayName,
                userEmail: displayEmail,
                productId: product.id,
                userId: (session.user as any).id,
                isVerified: isVerified
            }
        });

        return NextResponse.json({ review, success: true }, { status: 201 });
    } catch (error) {
        console.error("Review creation error:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
