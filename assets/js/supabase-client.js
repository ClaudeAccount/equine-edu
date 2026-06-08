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

  /* ---------- Load Supabase SDK from CDN if not already present ---------- */
  function loadSDK(callback) {
    if (window.supabase && window.supabase.createClient) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = callback;
    script.onerror = function () {
      console.error('[EEAuth] Failed to load Supabase SDK');
    };
    document.head.appendChild(script);
  }

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

    /* Initialize — call once on page load if you need early session data */
    init: function (callback) {
      loadSDK(function () {
        var client = getClient();
        if (typeof callback === 'function') {
          client.auth.getSession().then(function (result) {
            callback(result.data.session);
          });
        }
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
          }).then(resolve);
        });
      });
    },

    /* Sign in with email + password */
    signIn: function (email, password) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.signInWithPassword({
            email: email,
            password: password
          }).then(resolve);
        });
      });
    },

    /* Sign out */
    signOut: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.signOut().then(resolve);
        });
      });
    },

    /* Get current session (sync-ish — returns promise) */
    getSession: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.getSession().then(function (result) {
            resolve(result.data.session);
          });
        });
      });
    },

    /* Get current user */
    getUser: function () {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.getUser().then(function (result) {
            resolve(result.data.user || null);
          });
        });
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
              });
          });
        });
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
              .then(resolve);
          });
        });
      });
    },

    /* Reset password email */
    resetPassword: function (email) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/callback.html?type=recovery'
          }).then(resolve);
        });
      });
    },

    /* Update password (after reset redirect) */
    updatePassword: function (newPassword) {
      return new Promise(function (resolve) {
        loadSDK(function () {
          getClient().auth.updateUser({ password: newPassword }).then(resolve);
        });
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
      });
      return function () { if (unsub) unsub(); };
    },

    /* Expose raw client for advanced use */
    client: function () {
      return _client;
    }
  };

})();
