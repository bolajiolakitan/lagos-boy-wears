import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        const { slug } = await params;
        const { rating, comment, userName, userEmail } = await req.json();

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Invalid rating. Must be between 1 and 5." }, { status: 400 });
        }
        if (!comment || comment.trim().length < 3) {
            return NextResponse.json({ error: "Comment must be at least 3 characters long." }, { status: 400 });
        }
        if (!userName || userName.trim().length < 2) {
            return NextResponse.json({ error: "Name must be at least 2 characters long." }, { status: 400 });
        }
        if (!userEmail || !userEmail.includes("@")) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

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

        // Create the review
        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment: comment.trim(),
                userName: userName.trim(),
                userEmail: userEmail.trim(),
                productId: product.id
            }
        });

        return NextResponse.json({ review, success: true }, { status: 201 });
    } catch (error) {
        console.error("Review creation error:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
