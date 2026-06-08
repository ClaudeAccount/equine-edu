/* =============================================================================
   Equine Edu — create-checkout.js
   Netlify serverless function: creates a Stripe Checkout session and returns
   the redirect URL. Called from pricing.html when user clicks "Get Pro".

   Required environment variables in Netlify dashboard:
     STRIPE_SECRET_KEY      — sk_live_... (or sk_test_... for testing)
     STRIPE_PRICE_ID        — price_... (your monthly Pro subscription price ID)
     SUPABASE_URL           — https://yrnvowujqsniletkhqba.supabase.co
     SUPABASE_SERVICE_KEY   — sb_secret_... (service role key — NOT the publishable key)
   ============================================================================= */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let userId, email;
  try {
    ({ userId, email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!userId || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId or email' }) };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      metadata: {
        supabase_user_id: userId
      },
      success_url: 'https://equineedu.netlify.app/account/index.html?subscribed=1',
      cancel_url:  'https://equineedu.netlify.app/pricing.html'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
