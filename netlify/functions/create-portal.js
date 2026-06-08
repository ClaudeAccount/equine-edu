/* =============================================================================
   Equine Edu — create-portal.js
   Creates a Stripe Billing Portal session so subscribers can manage their
   subscription (cancel, update payment method, view invoices).

   Required environment variables:
     STRIPE_SECRET_KEY    — sk_live_... (or sk_test_...)
     SUPABASE_SERVICE_KEY — sb_secret_...
   ============================================================================= */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yrnvowujqsniletkhqba.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let userId;
  try {
    ({ userId } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) };
  }

  try {
    // Look up their Stripe customer ID from the profiles table
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (dbError || !profile || !profile.stripe_customer_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No active subscription found.' })
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: 'https://equine-edu.netlify.app/account/index.html'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('Stripe portal error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
