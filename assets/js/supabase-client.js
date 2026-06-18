/* =============================================================================
   Equine Edu — supabase-client.js
   Initializes the Supabase client and exposes EEAuth for all auth operations.
   Load this BEFORE layout.js on any page that needs auth awareness.

   Usage:
     EEAuth.signUp(email, password, displayName)  → { data, error }
     EEAuth.signIn(email, password)               → { data, error }
     EEAuth.signOut()                             → void
     EEAuth.getSession()                          → session | null
     EEAuth.getUser()                             → user | null
     EEAuth.getProfile()                          → profile row | null
     EEAuth.onAuthChange(callback)               → unsubscribe fn
   ============================================================================= */

(function () {
  'use strict';

  var SUPABASE_URL = 'https://yrnvowujqsniletkhqba.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_mFGTWaxPvtaEZlVErTPlSQ_uCt5BBMP';

  /* ---------- Load Supabase SDK (resilient: timeout + multi-CDN fallback) ----------
     Previous version silently hung forever if the CDN failed: onerror only logged
     and never invoked the callback, so every auth Promise (getSession, signIn, …)
     never settled and any page gated behind it froze. This version guarantees the
     load Promise always settles, tries a backup CDN, and records the last error so
     callers can surface a real message instead of hanging. */
  /* Resolve the self-hosted copy that sits next to THIS file, so auth works
     with no network and over file:// too. currentScript is this script during
     initial execution; we strip the filename to get its folder. The CDNs are
     kept only as a fallback. */
  var _self = document.currentScript;
  if (!_self) { var _ss = document.getElementsByTagName('script'); _self = _ss[_ss.length - 1]; }
  var _base = (_self && _self.src) ? _self.src.replace(/[^\/]*$/, '') : '';
  var SDK_URLS = [
    _base + 'supabase.min.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  ];
  var SDK_TIMEOUT_MS = 12000;
  var _sdkPromise = null;

  function loadSDKPromise() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    if (_sdkPromise) return _sdkPromise;

    _sdkPromise = new Promise(function (resolve, reject) {
      function tryUrl(i) {
        if (i >= SDK_URLS.length) {
          reject(new Error('Could not load the Supabase SDK from any CDN'));
          return;
        }
        var settled = false;
        var script = document.createElement('script');
        script.src = SDK_URLS[i];
        script.async = true;

        var timer = setTimeout(function () {
          if (settled) return;
          settled = true;
          script.onload = script.onerror = null;
          tryUrl(i + 1); // timed out — try the next CDN
        }, SDK_TIMEOUT_MS);

        script.onload = function () {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (window.supabase && window.supabase.createClient) resolve();
          else tryUrl(i + 1); // loaded but unusable — try the next CDN
        };
        script.onerror = function () {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          tryUrl(i + 1);
        };

        document.head.appendChild(script);
      }
      tryUrl(0);
    });

    // Allow a later retry if this attempt fails
    _sdkPromise.catch(function () { _sdkPromise = null; });
    return _sdkPromise;
  }

  /* Back-compat wrapper: loadSDK(onReady, onError).
     onReady runs once the SDK is usable; onError runs if loading ultimately fails
     so callers can resolve/reject their own Promise instead of hanging. */
  function loadSDK(callback, onError) {
    loadSDKPromise().then(function () {
      if (typeof callback === 'function') callback();
    }).catch(function (err) {
      console.error('[EEAuth] ' + err.message);
      if (window.EEAuth) window.EEAuth.lastError = err.message;
      if (typeof onError === 'function') onError(err);
    });
  }

  var AUTH_UNREACHABLE = 'Could not reach the authentication service. Check your connection and try again.';

  /* ---------- Client singleton ---------- */
  var _client = null;
  function getClient() {
    if (!_client) {
      _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    }
    return _client;
  }

  /* ---------- EEAuth public API ---------- */
  window.EEAuth = {

    /* Most recent SDK/auth load error, for diagnostics */
    lastError: null,

    /* Initialize — call once on page load if you need early session data */
    init: function (callback) {
      loadSDK(function () {
        var client = getClient();
        if (typeof callback === 'function') {
          client.auth.getSession().then(function (result) {
            callback(result.data.session);
          }).catch(function () { callback(null); });
        }
      }, function () {
        if (typeof callback === 'function') callback(null);
      });
    },

    /* Sign up a new user */
    signUp: function (email, password, displayName) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.signUp({
            email: email,
            password: password,
            options: {
              data: { display_name: displayName || '' },
              emailRedirectTo: window.location.origin + '/auth/callback.html'
            }
          }).then(resolve).catch(function (e) { resolve({ error: e }); });
        }, function () { resolve({ error: { message: AUTH_UNREACHABLE } }); });
      });
    },

    /* Sign in with email + password */
    signIn: function (email, password) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.signInWithPassword({
            email: email,
            password: password
          }).then(resolve).catch(function (e) { resolve({ error: e }); });
        }, function () { resolve({ error: { message: AUTH_UNREACHABLE } }); });
      });
    },

    /* Sign out */
    signOut: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.signOut().then(resolve).catch(function () { resolve(); });
        }, function () { resolve(); });
      });
    },

    /* Get current session (sync-ish — returns promise) */
    getSession: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.getSession().then(function (result) {
            resolve(result.data.session);
          }).catch(function () { resolve(null); });
        }, function () { resolve(null); });
      });
    },

    /* Get current user */
    getUser: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.getUser().then(function (result) {
            resolve(result.data.user || null);
          }).catch(function () { resolve(null); });
        }, function () { resolve(null); });
      });
    },

    /* Get profile row from profiles table */
    getProfile: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.getUser().then(function (userResult) {
            var user = userResult.data.user;
            if (!user) { resolve(null); return; }
            getClient()
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
              .then(function (result) {
                resolve(result.data || null);
              }).catch(function () { resolve(null); });
          }).catch(function () { resolve(null); });
        }, function () { resolve(null); });
      });
    },

    /* Update profile fields */
    updateProfile: function (fields) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.getUser().then(function (userResult) {
            var user = userResult.data.user;
            if (!user) { resolve({ error: 'Not logged in' }); return; }
            getClient()
              .from('profiles')
              .update(Object.assign({}, fields, { updated_at: new Date().toISOString() }))
              .eq('id', user.id)
              .then(resolve).catch(function (e) { resolve({ error: e }); });
          }).catch(function (e) { resolve({ error: e }); });
        }, function () { resolve({ error: { message: AUTH_UNREACHABLE } }); });
      });
    },

    /* Reset password email */
    resetPassword: function (email) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/callback.html?type=recovery'
          }).then(resolve).catch(function (e) { resolve({ error: e }); });
        }, function () { resolve({ error: { message: AUTH_UNREACHABLE } }); });
      });
    },

    /* Update password (after reset redirect) */
    updatePassword: function (newPassword) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.updateUser({ password: newPassword })
            .then(resolve).catch(function (e) { resolve({ error: e }); });
        }, function () { resolve({ error: { message: AUTH_UNREACHABLE } }); });
      });
    },

    /* Listen for auth state changes */
    onAuthChange: function (callback) {
      var unsub = null;
      loadSDK(function () {
        var result = getClient().auth.onAuthStateChange(function (event, session) {
          callback(event, session);
        });
        unsub = result.data.subscription.unsubscribe;
      }, function () { /* SDK unavailable — no subscription to make */ });
      return function () { if (unsub) unsub(); };
    },

    /* Expose raw client for advanced use */
    client: function () {
      return _client;
    }
  };

})();
