const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://yrnvowujqsniletkhqba.supabase.co';

function getBearerToken(event) {
  const headers = event.headers || {};
  const authorization = headers.authorization || headers.Authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY is not configured');
  }

  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function requireUser(event) {
  const token = getBearerToken(event);
  if (!token) {
    return { error: 'Authentication required', statusCode: 401 };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  const user = data && data.user;

  if (error || !user) {
    return { error: 'Invalid or expired session', statusCode: 401 };
  }

  return { user, supabase };
}

module.exports = {
  requireUser
};
