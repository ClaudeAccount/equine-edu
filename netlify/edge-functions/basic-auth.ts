const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://yrnvowujqsniletkhqba.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ||
  Deno.env.get('SUPABASE_ANON_KEY') ||
  'sb_publishable_mFGTWaxPvtaEZlVErTPlSQ_uCt5BBMP';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const ACCESS_COOKIE = 'ee_access_token';
const REFRESH_COOKIE = 'ee_refresh_token';

function cookieValue(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function cookieHeader(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value || '')}; Path=/; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

function attachSessionCookies(response, session) {
  if (!session || !session.access_token) return response;
  response.headers.append('Set-Cookie', cookieHeader(ACCESS_COOKIE, session.access_token, Number(session.expires_in || 3600)));
  if (session.refresh_token) {
    response.headers.append('Set-Cookie', cookieHeader(REFRESH_COOKIE, session.refresh_token, 60 * 60 * 24 * 30));
  }
  return response;
}

function clearSessionCookies(response) {
  response.headers.append('Set-Cookie', cookieHeader(ACCESS_COOKIE, '', 0));
  response.headers.append('Set-Cookie', cookieHeader(REFRESH_COOKIE, '', 0));
  return response;
}

function isCoursePreview(pathname) {
  return pathname === '/courses' ||
    pathname === '/courses/' ||
    pathname === '/courses/index.html' ||
    pathname.endsWith('/1-index.html');
}

function accessRequirement(pathname) {
  if (pathname === '/hub' || pathname.startsWith('/hub/') ||
      pathname === '/account' || pathname.startsWith('/account/')) {
    return 'auth';
  }

  if (pathname.startsWith('/courses/')) {
    return isCoursePreview(pathname) ? 'public' : 'subscription';
  }

  if (pathname === '/horse-bowl' || pathname.startsWith('/horse-bowl/')) {
    return 'subscription';
  }

  if (pathname === '/assets/data/question-bank.js' ||
      pathname === '/assets/data/question-bank.json' ||
      pathname === '/assets/data/image-questions.json') {
    return 'subscription';
  }

  return 'public';
}

function redirect(request, targetPath) {
  const requestUrl = new URL(request.url);
  const target = new URL(targetPath, requestUrl.origin);
  target.searchParams.set('next', requestUrl.pathname + requestUrl.search);
  const response = Response.redirect(target, 302);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function getUser(accessToken) {
  if (!accessToken) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) return null;
  return await response.json();
}

async function refreshSession(refreshToken) {
  if (!refreshToken) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!response.ok) return null;
  return await response.json();
}

async function resolveSession(request) {
  const accessToken = cookieValue(request, ACCESS_COOKIE);
  const user = await getUser(accessToken);
  if (user && user.id) return { user, session: null };

  const refreshed = await refreshSession(cookieValue(request, REFRESH_COOKIE));
  if (!refreshed || !refreshed.access_token || !refreshed.user) return null;
  return { user: refreshed.user, session: refreshed };
}

async function hasActiveSubscription(userId) {
  if (!SUPABASE_SERVICE_ROLE_KEY) return { allowed: false, unavailable: true };

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=subscription_tier,subscription_status&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  );
  if (!response.ok) return { allowed: false, unavailable: true };

  const rows = await response.json();
  const profile = rows && rows[0];
  return {
    allowed: !!profile && profile.subscription_tier !== 'free' && profile.subscription_status === 'active',
    unavailable: false
  };
}

export default async (request, context) => {
  const url = new URL(request.url);
  const requirement = accessRequirement(url.pathname);
  if (requirement === 'public') return context.next();

  const resolved = await resolveSession(request);
  if (!resolved || !resolved.user) {
    return clearSessionCookies(redirect(request, '/auth/login.html'));
  }

  if (requirement === 'subscription') {
    const subscription = await hasActiveSubscription(resolved.user.id);
    if (subscription.unavailable) {
      return new Response('Subscription verification is unavailable.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' }
      });
    }
    if (!subscription.allowed) {
      return attachSessionCookies(redirect(request, '/pricing.html'), resolved.session);
    }
  }

  const nextResponse = await context.next();
  const response = new Response(nextResponse.body, nextResponse);
  response.headers.set('Cache-Control', 'private, no-store');
  return attachSessionCookies(response, resolved.session);
};

export const config = { path: '/*' };
