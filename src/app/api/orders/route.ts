import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const isAdmin = (session.user as any).role === "ADMIN";
        const orders = await prisma.order.findMany({
            where: isAdmin ? {} : { userId: (session.user as any).id },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, images: true, slug: true } },
                    },
                },
                user: isAdmin ? { select: { name: true, email: true } } : false,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { items, total, address, paymentMethod, paystackRef, cryptoRef, cryptoAsset } = body;

        const order = await prisma.order.create({
            data: {
                userId: (session.user as any).id,
                total,
                address,
                paymentMethod: paymentMethod || "PAYSTACK",
                paystackRef,
                cryptoRef,
                cryptoAsset,
                status: (paymentMethod === "CRYPTO") ? "PENDING" : "PROCESSING",
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        size: item.size,
                        color: item.color || null,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true },
        });

        // Send email notifications (non-blocking)
        try {
            const { sendOrderConfirmationEmail, sendAdminOrderAlert } = await import("@/lib/mail");
            await Promise.allSettled([
                sendOrderConfirmationEmail(order),
                sendAdminOrderAlert(order)
            ]);
        } catch (mailError) {
            console.error("Mail notification failed:", mailError);
        }

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        console.error("Orders POST error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
