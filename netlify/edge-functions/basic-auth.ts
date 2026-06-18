// =============================================================================
// Equine EDU — site-wide password gate (Netlify Edge Function)
// Protects the WHOLE site behind a single shared password EXCEPT:
//   • the landing page            ( / , /index.html )
//   • the all-courses catalog page ( /courses/ , /courses/index.html )
//   • static assets those public pages need (css/js/images/fonts) so they render
//   • Netlify serverless functions ( /.netlify/* ) so Stripe webhooks keep working
// Everything else (course lessons, quizzes, hub, Horse Bowl, tools, account,
// auth, pricing) prompts for the password.
//
// Set the password in Netlify: Site settings → Environment variables →
//   BASIC_AUTH = "username:password"   (defaults to equine:website if unset)
// =============================================================================
import type { Context } from "https://edge.netlify.com";

const PUBLIC_PAGES = new Set([
  "/", "/index.html",
  "/courses", "/courses/", "/courses/index.html",
]);

// path prefixes that must stay open for the public pages to work / for webhooks
const PUBLIC_PREFIXES = [
  "/assets/",                 // shared css, js, images, data
  "/courses/images-index/",   // thumbnails shown on the all-courses page
  "/.netlify/",               // serverless functions (Stripe, etc.)
];

// static file types are allowed everywhere so public pages render correctly
const STATIC_RE = /\.(css|js|mjs|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|json|txt|xml|webmanifest)$/i;

export default async (request: Request, context: Context) => {
  const path = decodeURIComponent(new URL(request.url).pathname);

  if (
    PUBLIC_PAGES.has(path) ||
    PUBLIC_PREFIXES.some((p) => path.startsWith(p)) ||
    STATIC_RE.test(path)
  ) {
    return; // public — continue without a password
  }

  const creds = Deno.env.get("BASIC_AUTH") || "equine:website";
  const sep = creds.indexOf(":");
  const user = creds.slice(0, sep);
  const pass = creds.slice(sep + 1);
  const expected = "Basic " + btoa(`${user}:${pass}`);

  if (request.headers.get("authorization") === expected) {
    return; // correct password — let them through
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Equine Edu", charset="UTF-8"' },
  });
};

export const config = { path: "/*" };
