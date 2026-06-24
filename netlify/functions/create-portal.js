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

    const { data: profile, error: dbError } = await auth.supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', auth.user.id)
      .single();

    if (dbError || !profile || !profile.stripe_customer_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No active subscription found.' })
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${SITE_URL}/account/index.html`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('Stripe portal error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not open the billing portal.' })
    };
  }
};
