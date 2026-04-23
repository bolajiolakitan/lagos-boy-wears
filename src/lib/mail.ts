import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "admin@lagosboywears.com";

const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p / 100);

export async function sendOrderConfirmationEmail(order: any) {
    try {
        const { address, items, total, id } = order;
        
        await resend.emails.send({
            from: "Lagos Boy Wears <orders@lagosboywears.com>",
            to: [address.email || adminEmail], // Fallback if email missing
            subject: `Order Confirmation #${id.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                    <h1 style="font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 10px;">LAGOS BOY WEARS</h1>
                    <p>Hi ${address.name},</p>
                    <p>Thank you for your order! We've received your details and we're getting things ready.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Summary</h3>
                        <p><strong>Order ID:</strong> #${id.slice(-8).toUpperCase()}</p>
                        <p><strong>Total:</strong> ${formatPrice(total)}</p>
                    </div>

                    <h3>Shipping Address</h3>
                    <p>
                        ${address.street}<br/>
                        ${address.lga}, ${address.state}<br/>
                        ${address.phone}
                    </p>

                    <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; pt: 10px;">
                        Once your payment is confirmed, we will begin processing your shipment.
                    </p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
    }
}

export async function sendAdminOrderAlert(order: any) {
    try {
        const { address, total, id } = order;
        
        await resend.emails.send({
            from: "Lagos Boy Store <system@lagosboywears.com>",
            to: [adminEmail],
            subject: `🚨 NEW ORDER RECEIVED #${id.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>New Order Alert</h2>
                    <p><strong>Customer:</strong> ${address.name} (${address.email || 'No Email'})</p>
                    <p><strong>Amount:</strong> ${formatPrice(total)}</p>
                    <p><strong>Location:</strong> ${address.lga}, ${address.state}</p>
                    <p><strong>Address:</strong> ${address.street}</p>
                    <a href="${process.env.NEXTAUTH_URL}/admin/orders" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; margin-top: 20px;">
                        View Order in Admin
                    </a>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send admin alert:", error);
    }
}

export async function sendPaymentSuccessEmail(order: any) {
    try {
        const { address, id } = order;
        
        await resend.emails.send({
            from: "Lagos Boy Wears <orders@lagosboywears.com>",
            to: [address.email || adminEmail],
            subject: `Payment Confirmed! Order #${id.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                    <h1 style="color: green;">Payment Successful!</h1>
                    <p>Hi ${address.name},</p>
                    <p>We've successfully received your payment for order <strong>#${id.slice(-8).toUpperCase()}</strong>.</p>
                    <p>Our team is now processing your items for shipment. You will receive another update once your package is on its way.</p>
                    <br/>
                    <p>Stay Sharp,</p>
                    <p><strong>Lagos Boy Team</strong></p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send payment success email:", error);
    }
}
