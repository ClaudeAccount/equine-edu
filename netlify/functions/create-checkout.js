const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { requireUser } = require('./_auth');

const SITE_URL = (process.env.URL || process.env.SITE_URL || 'https://equine-edu.netlify.app')
  .replace(/\/+$/, '');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const auth = await requireUser(event);
    if (!auth.user) {
      return {
        statusCode: auth.statusCode,
        body: JSON.stringify({ error: auth.error })
      };
    }

    if (!auth.user.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'The authenticated account has no email address.' })
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: auth.user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      metadata: {
        supabase_user_id: auth.user.id
      },
      subscription_data: {
        metadata: {
          supabase_user_id: auth.user.id
        }
      },
      success_url: `${SITE_URL}/account/index.html?subscribed=1`,
      cancel_url: `${SITE_URL}/pricing.html`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not start checkout.' })
    };
  }
};
