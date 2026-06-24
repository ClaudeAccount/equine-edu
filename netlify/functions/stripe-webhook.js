/* =============================================================================
   Equine Edu — stripe-webhook.js
   Netlify serverless function: receives Stripe webhook events and updates
   the user's subscription status in Supabase.

   Required environment variables in Netlify dashboard:
     STRIPE_SECRET_KEY        — sk_live_... (or sk_test_...)
     STRIPE_WEBHOOK_SECRET    — whsec_... (from Stripe webhook settings)
     SUPABASE_URL             — https://yrnvowujqsniletkhqba.supabase.co
     SUPABASE_SERVICE_KEY     — sb_secret_... (service role key)

   In Stripe dashboard, point the webhook to:
     https://equine-edu.netlify.app/.netlify/functions/stripe-webhook

   Events to enable:
     checkout.session.completed
     customer.subscription.updated
     customer.subscription.deleted
   ============================================================================= */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify the webhook signature so only Stripe can call this
  const sig = event.headers['stripe-signature'];
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {

      // ── New subscription created via Checkout ───────────────────────────
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const userId  = session.metadata?.supabase_user_id;
        if (!userId) break;

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status:   'active',
            subscription_tier:     'pro',
            stripe_customer_id:    session.customer,
            stripe_subscription_id: session.subscription,
            updated_at:            new Date().toISOString()
          })
          .eq('id', userId);
        if (error) throw error;

        console.log(`Activated Pro for user ${userId}`);
        break;
      }

      // ── Subscription renewed or changed ────────────────────────────────
      case 'customer.subscription.updated': {
        const sub       = stripeEvent.data.object;
        const customerId = sub.customer;
        const status     = sub.status; // 'active', 'past_due', 'canceled', etc.

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status === 'active' ? 'active' : status,
            subscription_tier:   status === 'active' ? 'pro'    : 'free',
            updated_at:          new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
        if (error) throw error;

        console.log(`Subscription updated for customer ${customerId}: ${status}`);
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub        = stripeEvent.data.object;
        const customerId = sub.customer;

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier:   'free',
            updated_at:          new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
        if (error) throw error;

        console.log(`Subscription canceled for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
