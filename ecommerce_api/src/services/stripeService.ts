import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-08-26.dahlia",
});

export interface CheckoutSessionOptions {
    amount: number;       // total in dollars (e.g. 29.99)
    currency: string;     // e.g. "usd"
    userId: string;       // stored in metadata to trace back on webhook
    orderId: string;      // stored in metadata so webhook can mark the order paid
    successUrl: string;   // redirect after successful payment
    cancelUrl: string;    // redirect if user cancels
}

/**
 * Creates a Stripe Checkout Session.
 * The returned `session.url` is the hosted Stripe payment page the user
 * should be redirected to.  The actual order should only be marked 'paid'
 * after the `checkout.session.completed` webhook fires.
 */
export async function createCheckoutSession(options: CheckoutSessionOptions): Promise<Stripe.Checkout.Session> {
    const { amount, currency, userId, orderId, successUrl, cancelUrl } = options;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: "Order Total",
                    },
                    unit_amount: Math.round(amount * 100), // Stripe expects cents
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            user_id: userId,   // real user id — used by webhook to identify the payer
            order_id: orderId, // real order id — used by webhook to mark the order paid
        },
    });

    console.log(`Stripe Checkout Session created: ${session.id} for order ${orderId}`);
    return session;
}

export default stripe;
