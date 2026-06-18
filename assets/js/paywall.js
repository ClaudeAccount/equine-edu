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
        'background:rgba(36,54,74,0.66);',
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
      '}',
      '#ee-paywall-card{',
        'background:var(--soft-white,#FCFAF7);',
        'border:1px solid var(--border,rgba(36,54,74,0.10));',
        'border-radius:var(--radius-lg,20px);',
        'box-shadow:0 22px 52px rgba(94,71,52,0.28);',
        'padding:2.5rem 2.25rem;',
        'max-width:440px;width:100%;',
        'text-align:center;',
      '}',
      '#ee-paywall-card .pw-lock{',
        'width:56px;height:56px;margin:0 auto 1rem;',
        'display:flex;align-items:center;justify-content:center;',
        'background:var(--cream-bg,#F1E9DC);border-radius:50%;',
      '}',
      '#ee-paywall-card .pw-lock svg{width:28px;height:28px;}',
      '#ee-paywall-card h2{',
        'font-family:var(--font-display,\'Playfair Display\',serif);',
        'font-size:1.6rem;color:var(--heading,#24364A);',
        'margin:0 0 0.5rem;line-height:1.2;font-weight:700;',
      '}',
      '#ee-paywall-card h2 span{color:var(--tan,#C8A27A);}',
      '#ee-paywall-card p{',
        'color:var(--body-text,#4F5B66);font-size:0.92rem;',
        'line-height:1.65;margin:0 0 1.5rem;',
      '}',
      '.pw-btn{',
        'display:block;width:100%;padding:0.85rem;',
        'border-radius:var(--radius-sm,8px);font-size:0.95rem;font-weight:700;',
        'cursor:pointer;text-decoration:none;border:1px solid transparent;',
        'transition:background 0.15s,border-color 0.15s,color 0.15s,transform 0.15s;',
        'box-sizing:border-box;margin-bottom:0.65rem;font-family:var(--font-body,inherit);',
      '}',
      '.pw-btn-primary{background:var(--tan,#C8A27A);color:#fff;border-color:var(--tan,#C8A27A);}',
      '.pw-btn-primary:hover{background:var(--leather,#A9825A);border-color:var(--leather,#A9825A);transform:translateY(-1px);}',
      '.pw-btn-secondary{',
        'background:var(--soft-white,#FCFAF7);',
        'border:1px solid var(--blue-primary,#7F98B2);',
        'color:var(--blue-primary,#7F98B2);font-size:0.9rem;',
      '}',
      '.pw-btn-secondary:hover{background:var(--blue-light,#D9E3EC);color:var(--heading,#24364A);border-color:var(--blue-primary,#7F98B2);}',
      '.pw-divider{',
        'border:none;border-top:1px solid var(--border,rgba(36,54,74,0.10));',
        'margin:1.25rem 0;',
      '}',
      '.pw-features{',
        'list-style:none;padding:0;margin:0 0 1.5rem;',
        'text-align:left;',
      '}',
      '.pw-features li{',
        'font-size:0.88rem;color:var(--body-text,#4F5B66);',
        'padding:0.32rem 0;line-height:1.4;',
        'display:flex;align-items:center;gap:0.6rem;',
      '}',
      '.pw-features li::before{',
        'content:\'\\2713\';',
        'color:var(--success,#5C8A6E);font-weight:900;font-size:0.7rem;',
        'background:var(--success-bg,rgba(92,138,110,0.12));',
        'border:1px solid var(--success-bd,rgba(92,138,110,0.28));',
        'border-radius:50%;width:18px;height:18px;',
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
        '<div class="pw-lock"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'+'<rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="var(--leather-dark,#7A5D45)" stroke-width="1.8"/>'+'<path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 V10.5" stroke="var(--leather-dark,#7A5D45)" stroke-width="1.8" stroke-linecap="round"/>'+'<circle cx="12" cy="15.2" r="1.5" fill="var(--leather-dark,#7A5D45)"/>'+'</svg></div>',
        '<h2>Barn Pass <span>Required</span></h2>',
        '<p>This content is included with the Equine Edu Barn Pass — full access to all downloads, courses, and interactive activities.</p>',
        '<ul class="pw-features">',
          '<li>All downloadable worksheets &amp; references</li>',
          '<li>Every intermediate &amp; advanced course</li>',
          '<li>Interactive labeling activities</li>',
          '<li>Horse Bowl practice</li>',
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
    // Dev bypass: skip paywall on localhost / 127.0.0.1
    var h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '') return;

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
