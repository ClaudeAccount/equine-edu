/* =============================================================================
   Equine Edu — paywall.js
   Drop this script onto any page that requires an active Barn Pass subscription.
   It checks the user's session and subscription status, then either lets them
   through or shows a full-page paywall overlay with a CTA to subscribe.

   Usage: add BEFORE </body> on protected pages, after supabase-client.js:
     <script src="[root]/assets/js/supabase-client.js"></script>
     <script src="[root]/assets/js/paywall.js"></script>

   Optional config (set before this script loads):
     window.PAYWALL = {
       pricingUrl: '../../../pricing.html',   // path to pricing page
       loginUrl:   '../../../auth/login.html' // path to login page
     }
   ============================================================================= */

(function () {
  'use strict';

  var cfg        = window.PAYWALL || {};
  var pricingUrl = cfg.pricingUrl || findRootPath() + 'pricing.html';
  var loginUrl   = cfg.loginUrl   || findRootPath() + 'auth/login.html';

  function findRootPath() {
    // Reuse layout.js depthPrefix logic if available, otherwise infer
    var parts = window.location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
    return parts.map(function () { return '../'; }).join('') || './';
  }

  function injectStyles() {
    if (document.getElementById('ee-paywall-styles')) return;
    var s = document.createElement('style');
    s.id = 'ee-paywall-styles';
    s.textContent = [
      '#ee-paywall-overlay{',
        'position:fixed;inset:0;z-index:9999;',
        'display:flex;align-items:center;justify-content:center;',
        'padding:1.5rem;',
        'background:rgba(10,20,50,0.72);',
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
      '}',
      '#ee-paywall-card{',
        'background:#fff;border-radius:16px;',
        'box-shadow:0 24px 64px rgba(10,20,50,0.28);',
        'padding:2.5rem 2.25rem;',
        'max-width:440px;width:100%;',
        'text-align:center;',
      '}',
      '#ee-paywall-card .pw-lock{',
        'font-size:2.25rem;margin-bottom:0.75rem;',
      '}',
      '#ee-paywall-card h2{',
        'font-family:"Playfair Display",serif;',
        'font-size:1.5rem;color:#0d1b3e;',
        'margin:0 0 0.5rem;line-height:1.2;',
      '}',
      '#ee-paywall-card h2 span{color:#c9a84c;}',
      '#ee-paywall-card p{',
        'color:#555e6d;font-size:0.9rem;',
        'line-height:1.65;margin:0 0 1.75rem;',
      '}',
      '.pw-btn{',
        'display:block;width:100%;padding:0.85rem;',
        'border-radius:8px;font-size:0.95rem;font-weight:700;',
        'cursor:pointer;text-decoration:none;border:none;',
        'transition:opacity 0.15s;letter-spacing:0.02em;',
        'box-sizing:border-box;margin-bottom:0.65rem;',
      '}',
      '.pw-btn-primary{background:#0d1b3e;color:#fff;}',
      '.pw-btn-primary:hover{opacity:0.88;}',
      '.pw-btn-secondary{',
        'background:transparent;',
        'border:1.5px solid #dde1ea;',
        'color:#555e6d;font-size:0.88rem;',
      '}',
      '.pw-btn-secondary:hover{border-color:#0d1b3e;color:#0d1b3e;}',
      '.pw-divider{',
        'border:none;border-top:1px solid #eee;',
        'margin:1.25rem 0;',
      '}',
      '.pw-features{',
        'list-style:none;padding:0;margin:0 0 1.5rem;',
        'text-align:left;',
      '}',
      '.pw-features li{',
        'font-size:0.85rem;color:#333d4d;',
        'padding:0.3rem 0;',
        'display:flex;align-items:center;gap:0.5rem;',
      '}',
      '.pw-features li::before{',
        'content:"✓";',
        'color:#065f46;font-weight:900;font-size:0.75rem;',
        'background:#d1fae5;border-radius:50%;',
        'width:16px;height:16px;',
        'display:flex;align-items:center;justify-content:center;',
        'flex-shrink:0;',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function showPaywall(loggedIn) {
    injectStyles();

    var overlay = document.createElement('div');
    overlay.id = 'ee-paywall-overlay';

    overlay.innerHTML = [
      '<div id="ee-paywall-card">',
        '<div class="pw-lock">🔒</div>',
        '<h2>Barn Pass <span>Required</span></h2>',
        '<p>This content is included with the Equine Edu Barn Pass — full access to all downloads, courses, games, and weekly scenarios.</p>',
        '<ul class="pw-features">',
          '<li>All downloadable worksheets &amp; references</li>',
          '<li>Every intermediate &amp; advanced course</li>',
          '<li>Interactive labeling games</li>',
          '<li>Weekly real-life horse scenarios</li>',
          '<li>Horse Bowl practice &amp; multiplayer</li>',
        '</ul>',
        '<a href="' + pricingUrl + '" class="pw-btn pw-btn-primary">Get Your Barn Pass &mdash; $15/mo</a>',
        loggedIn
          ? '<a href="javascript:history.back()" class="pw-btn pw-btn-secondary">Go Back</a>'
          : '<a href="' + loginUrl + '?next=' + encodeURIComponent(window.location.pathname) + '" class="pw-btn pw-btn-secondary">Log In</a>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function check() {
    if (typeof window.EEAuth === 'undefined') {
      // supabase-client.js not loaded — fail closed (show paywall)
      showPaywall(false);
      return;
    }

    EEAuth.init(function (session) {
      if (!session) {
        showPaywall(false);
        return;
      }

      EEAuth.getProfile().then(function (profile) {
        var tier   = profile && profile.subscription_tier;
        var status = profile && profile.subscription_status;
        var hasAccess = (tier && tier !== 'free' && status === 'active');

        if (!hasAccess) {
          showPaywall(true);
        }
        // else: user has access — do nothing, page loads normally
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }

})();
