const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function loadModule(relativePath, mocks, env = {}) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require(name) {
      if (Object.prototype.hasOwnProperty.call(mocks, name)) return mocks[name];
      throw new Error(`Unexpected require: ${name}`);
    },
    process: { env },
    console
  };
  vm.runInNewContext(source, sandbox, { filename });
  return module.exports;
}

async function testAuthHelper() {
  let verifiedToken = null;
  const helper = loadModule(
    'netlify/functions/_auth.js',
    {
      '@supabase/supabase-js': {
        createClient() {
          return {
            auth: {
              async getUser(token) {
                verifiedToken = token;
                return { data: { user: { id: 'auth-user' } }, error: null };
              }
            }
          };
        }
      }
    },
    { SUPABASE_SERVICE_KEY: 'service-key' }
  );

  const result = await helper.requireUser({
    headers: { authorization: 'Bearer verified-token' }
  });
  assert.strictEqual(verifiedToken, 'verified-token');
  assert.strictEqual(result.user.id, 'auth-user');

  const missing = await helper.requireUser({ headers: {} });
  assert.strictEqual(missing.statusCode, 401);
}

async function testCheckoutOwnership() {
  let checkoutOptions = null;
  const stripeFactory = () => ({
    checkout: {
      sessions: {
        async create(options) {
          checkoutOptions = options;
          return { url: 'https://stripe.test/checkout' };
        }
      }
    }
  });

  const checkout = loadModule(
    'netlify/functions/create-checkout.js',
    {
      stripe: stripeFactory,
      './_auth': {
        async requireUser() {
          return { user: { id: 'authenticated-user', email: 'owner@example.com' } };
        }
      }
    },
    {
      STRIPE_SECRET_KEY: 'secret',
      STRIPE_PRICE_ID: 'price',
      URL: 'https://equine.test'
    }
  );

  const response = await checkout.handler({
    httpMethod: 'POST',
    body: JSON.stringify({ userId: 'attacker-selected-user', email: 'attacker@example.com' })
  });
  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(checkoutOptions.customer_email, 'owner@example.com');
  assert.strictEqual(checkoutOptions.metadata.supabase_user_id, 'authenticated-user');
  assert.strictEqual(
    checkoutOptions.subscription_data.metadata.supabase_user_id,
    'authenticated-user'
  );
}

async function testPortalOwnership() {
  let queriedUserId = null;
  let portalCustomer = null;
  const query = {
    select() { return this; },
    eq(column, value) {
      assert.strictEqual(column, 'id');
      queriedUserId = value;
      return this;
    },
    async single() {
      return { data: { stripe_customer_id: 'cus_owner' }, error: null };
    }
  };

  const portal = loadModule(
    'netlify/functions/create-portal.js',
    {
      stripe: () => ({
        billingPortal: {
          sessions: {
            async create(options) {
              portalCustomer = options.customer;
              return { url: 'https://stripe.test/portal' };
            }
          }
        }
      }),
      './_auth': {
        async requireUser() {
          return {
            user: { id: 'authenticated-user' },
            supabase: { from() { return query; } }
          };
        }
      }
    },
    { STRIPE_SECRET_KEY: 'secret', URL: 'https://equine.test' }
  );

  const response = await portal.handler({
    httpMethod: 'POST',
    body: JSON.stringify({ userId: 'attacker-selected-user' })
  });
  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(queriedUserId, 'authenticated-user');
  assert.strictEqual(portalCustomer, 'cus_owner');
}

Promise.resolve()
  .then(testAuthHelper)
  .then(testCheckoutOwnership)
  .then(testPortalOwnership)
  .then(() => console.log('PASS: Stripe endpoints derive ownership from authenticated users'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
