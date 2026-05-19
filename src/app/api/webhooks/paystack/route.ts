import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

    if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
        const ref = event.data.reference;
        try {
            // Find order and update status
            const order = await prisma.order.findFirst({
                where: { paystackRef: ref },
            });

            if (order) {
                // Verify paid amount matches order total in kobo
                const paidAmount = event.data.amount;
                if (paidAmount !== order.total) {
                    console.error(`Fraud Alert: Amount mismatch for order ${order.id}. Paid: ${paidAmount}, Expected: ${order.total}`);
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "CANCELLED" },
                    });
                    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
                }

                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: "PROCESSING" },
                });

                // Send payment success email
                try {
                    const { sendPaymentSuccessEmail } = await import("@/lib/mail");
                    await sendPaymentSuccessEmail(order);
                } catch (mailError) {
                    console.error("Payment success email failed:", mailError);
                }
            }
        } catch (error) {
            console.error("Webhook update error:", error);
        }
    }

    return NextResponse.json({ received: true });
}
