/* Room Stay — admin + landlord (self-contained, loads Parse automatically) */
(function () {
  'use strict';

  function loadParse() {
    if (window.Parse) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/parse/dist/parse.min.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load Parse SDK')); };
      document.head.appendChild(s);
    });
  }

  function boot() {
    Parse.initialize(
      'yZd1tyOC06p5XRKmUwNkaip9UUMoQoteFPKcrTSe',
      '1pZ0JnP06gfyVGj6CHXWREo3rqsu7HmLixCCxgrk'
    );
    Parse.serverURL = 'https://parseapi.back4app.com/';

    /* ---- Icons ---- */
    function svg(inner) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
             'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    }
    var ICONS = {
      wifi: svg('<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/>'),
      parking: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M9.5 17V7h3.2a3.1 3.1 0 0 1 0 6.2H9.5"/>'),
      shower: svg('<path d="M12 3.2s5.4 5.6 5.4 9.3a5.4 5.4 0 1 1-10.8 0C6.6 8.8 12 3.2 12 3.2z"/>'),
      kitchen: svg('<path d="M7 3v7"/><path d="M4 3v4a3 3 0 0 0 6 0V3"/><path d="M7 10v11"/><path d="M17 3c-1.6 1.2-2.4 3-2.4 5.2 0 1.9.9 3.2 2.4 3.8V21"/>'),
      security: svg('<path d="M12 3l7.5 3v6.1c0 4.5-3.1 7.9-7.5 9.4-4.4-1.5-7.5-4.9-7.5-9.4V6L12 3z"/><path d="M9 12l2 2 4-4"/>'),
      furnished: svg('<path d="M2 18V7"/><path d="M2 14h20"/><path d="M22 18v-4"/><path d="M6 14V9h5v5"/>'),
      laundry: svg('<rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="14" r="4"/><path d="M8 7h.01"/><path d="M11 7h.01"/>'),
      pool: svg('<path d="M8 12V6a4 4 0 0 1 8 0"/><path d="M2 16c1.6 0 1.6-1.2 3.2-1.2S6.8 16 8.4 16s1.6-1.2 3.2-1.2S13.2 16 14.8 16s1.6-1.2 3.2-1.2S19.6 16 21.2 16"/><path d="M2 20c1.6 0 1.6-1.2 3.2-1.2S6.8 20 8.4 20s1.6-1.2 3.2-1.2S13.2 20 14.8 20s1.6-1.2 3.2-1.2S19.6 20 21.2 20"/>'),
      pets: svg('<circle cx="7" cy="9" r="1.7"/><circle cx="12" cy="6.8" r="1.7"/><circle cx="17" cy="9" r="1.7"/><path d="M12 11.6c-2.9 0-5 2-5 4.2 0 1.7 1.3 2.9 3 2.9 1 0 1.4-.5 2-.5s1 .5 2 .5c1.7 0 3-1.2 3-2.9 0-2.2-2.1-4.2-5-4.2z"/>'),
      electricity: svg('<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13V2z"/>'),
      study: svg('<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5v-15z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/><path d="M8 3v12"/>'),
      transport: svg('<rect x="4" y="4" width="16" height="12" rx="3"/><path d="M4 10h16"/><path d="M7 20v-2"/><path d="M17 20v-2"/><path d="M8.5 13h.01"/><path d="M15.5 13h.01"/>'),
      search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>'),
      pin: svg('<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
      check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
      trash: svg('<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l.8 12.2A2 2 0 0 0 9.3 21h5.4a2 2 0 0 0 2-1.8L17.5 7"/>'),
      logout: svg('<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>'),
      home: svg('<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V20h12V9.5"/>'),
      users: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 4.6a3.2 3.2 0 0 1 0 6.4"/><path d="M18 20c0-2.2-.6-3.7-1.8-4.8"/>'),
      money: svg('<rect x="2.5" y="6" width="19" height="12" rx="3"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01"/><path d="M18 14.5h.01"/>'),
      settings: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2"/><path d="M12 19.3v2.2"/><path d="M4.2 4.2l1.6 1.6"/><path d="M18.2 18.2l1.6 1.6"/><path d="M2.5 12h2.2"/><path d="M19.3 12h2.2"/><path d="M4.2 19.8l1.6-1.6"/><path d="M18.2 5.8l1.6-1.6"/>'),
      bed: svg('<path d="M3 18v-8"/><path d="M3 12h18v6"/><path d="M21 18v-4a3 3 0 0 0-3-3h-6v3"/><circle cx="7" cy="10" r="2"/>'),
      image: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 15.5 16 11l-8 9"/>'),
      arrowLeft: svg('<path d="M15 5l-7 7 7 7"/>'),
      star: svg('<path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9L12 3.5z"/>'),
      clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
      mail: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>')
    };
    function icon(n) { return ICONS[n] || ''; }

    var AMENITIES = [
      { key:'wifi',label:'WiFi' },{ key:'parking',label:'Parking' },
      { key:'shower',label:'En-suite shower' },{ key:'kitchen',label:'Kitchen' },
      { key:'security',label:'24h security' },{ key:'furnished',label:'Furnished' },
      { key:'laundry',label:'Laundry' },{ key:'pool',label:'Swimming pool' },
      { key:'pets',label:'Pet friendly' },{ key:'electricity',label:'Electricity included' },
      { key:'study',label:'Study desk' },{ key:'transport',label:'Near transport' }
    ];

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function escapeHtml(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
      });
    }
    function money(a) {
      var n = Math.round(Number(a) || 0);
      return 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    function placeholder(seed, label) {
      seed = String(seed || 'room'); label = String(label || 'Room');
      var h = 0; for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
      var c1 = 'hsl(' + h + ',44%,94%)', c2 = 'hsl(' + ((h + 42) % 360) + ',36%,84%)';
      var s = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
        '<rect width="800" height="600" fill="url(#g)"/>' +
        '<g fill="none" stroke="rgba(0,0,0,0.17)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M268 332 400 220l132 112"/><path d="M312 302v122h176V302"/><path d="M372 424v-62h56v62"/></g>' +
        '<text x="400" y="505" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="23" fill="rgba(0,0,0,0.32)" text-anchor="middle">' + label + '</text></svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    }
    function toast(msg) {
      var stack = document.getElementById('toastStack');
      if (!stack) { stack = document.createElement('div'); stack.id = 'toastStack'; stack.className = 'toast-stack'; document.body.appendChild(stack); }
      var node = document.createElement('div');
      node.className = 'toast'; node.textContent = msg;
      stack.appendChild(node);
      setTimeout(function () {
        node.style.transition = 'opacity .25s,transform .25s';
        node.style.opacity = '0'; node.style.transform = 'translateY(8px)';
        setTimeout(function () { node.remove(); }, 260);
      }, 3200);
    }
    function hydrateIcons(root) {
      $$('[data-ico]', root).forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-ico')); });
    }
    function formatDate(iso) {
      if (!iso) return '—';
      try {
        var d = new Date(iso + 'T00:00:00');
        if (isNaN(d.getTime())) return iso;
        var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
      } catch (e) { return iso; }
    }
    function telHref(phone) { return 'tel:' + String(phone || '').replace(/[^0-9+]/g, ''); }
    function chip(text) {
      return '<span style="background:rgba(0,0,0,.045);border-radius:999px;padding:5px 11px;font-size:12.5px;color:var(--ink-2)">' + escapeHtml(text) + '</span>';
    }
    function parseArray(v) {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') { try { var r = JSON.parse(v); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
      return [];
    }

    async function uploadFile(file, prefix) {
      var ext = (file.name || 'file').split('.').pop().toLowerCase() || 'jpg';
      var name = prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext;
      var pf = new Parse.File(name, file);
      await pf.save();
      return pf.url();
    }

    async function fetchSettings() {
      try { var r = await new Parse.Query('SiteSettings').limit(1).find(); return r[0] || null; }
      catch (e) { return null; }
    }

    var page = document.body.getAttribute('data-page');
    if (page === 'admin') initAdmin();
    else if (page === 'landlord') initLandlord();

    /* =========================================================
       ADMIN
       ========================================================= */
    async function initAdmin() {
      var activeStatus = 'all';
      var activeEnqAgent = 'all';

      /* --- Ensure email input exists in login form --- */
      var adminEmailInput = document.getElementById('adminEmail');
      if (!adminEmailInput) {
        var pwField = document.getElementById('adminPass');
        if (pwField) {
          var pwLabel = pwField.closest('label') || pwField.parentNode;
          var emailLabel = document.createElement('label');
          emailLabel.className = 'field';
          emailLabel.innerHTML = '<span>Admin email</span><input type="email" id="adminEmail" required placeholder="you@roomstay.co.za" autocomplete="username">';
          pwLabel.parentNode.insertBefore(emailLabel, pwLabel);
          adminEmailInput = document.getElementById('adminEmail');
        }
      }

      /* --- Update login title based on state --- */
      var settings = await fetchSettings();
      var adminClaimed = settings && settings.get('adminClaimed');
      var titleEl = document.getElementById('loginTitle');
      var subEl = document.getElementById('loginSub');
      var submitBtn = document.getElementById('loginSubmitBtn');

      if (!adminClaimed) {
        if (titleEl) titleEl.textContent = 'Set up admin account';
        if (subEl) subEl.textContent = 'Create the first admin account for this site. Use a strong password and keep it safe.';
        if (submitBtn) submitBtn.textContent = 'Create admin account';
        if (document.getElementById('adminPass')) {
          document.getElementById('adminPass').setAttribute('minlength', '8');
          document.getElementById('adminPass').setAttribute('autocomplete', 'new-password');
        }
      }

      /* --- Already logged in? --- */
      var currentUser = Parse.User.current();
      if (currentUser && currentUser.get('isAdmin')) {
        showApp();
      }

      /* --- Handle login/signup --- */
      $('#loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var errEl = document.getElementById('loginError');
        if (errEl) errEl.textContent = '';

        var email = (adminEmailInput ? adminEmailInput.value : '').trim();
        var password = document.getElementById('adminPass').value;

        if (!email || email.indexOf('@') === -1) { if (errEl) errEl.textContent = 'Enter a valid email.'; return; }
        if (!password || password.length < 8) { if (errEl) errEl.textContent = 'Password must be at least 8 characters.'; return; }

        /* First-time: create admin */
        if (!adminClaimed) {
          try {
            var user = new Parse.User();
            user.set('username', email);
            user.set('email', email);
            user.set('password', password);
            user.set('isAdmin', true);
            user.set('isLandlord', false);
            await user.signUp();

            var S = Parse.Object.extend('SiteSettings');
            var s = settings || new S();
            s.set('siteName', 'Room Stay');
            s.set('defaultCommission', 400);
            s.set('adminClaimed', true);
            s.set('adminId', user.id);
            var acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setReadAccess(user.id, true);
            acl.setWriteAccess(user.id, true);
            s.setACL(acl);
            await s.save();

            toast('Admin account created. You are signed in.');
            location.reload();
            return;
          } catch (err) {
            console.error(err);
            if (errEl) errEl.textContent = (err && err.message) || 'Could not create admin.';
            return;
          }
        }

        /* Normal login */
        try {
          var u = await Parse.User.logIn(email, password);
          if (!u.get('isAdmin')) {
            await Parse.User.logOut();
            if (errEl) errEl.textContent = 'This account is not an admin.';
            return;
          }
          showApp();
        } catch (err) {
          if (errEl) errEl.textContent = 'Wrong email or password.';
        }
      });

      /* --- Data cache --- */
      var properties = [];
      var agents = [];
      var enquiries = [];
      var settingsCache = null;

      async function loadEverything() {
        try {
          var pq = new Parse.Query('Property'); pq.descending('createdAt'); properties = await pq.find();
          var aq = new Parse.Query('Agent'); agents = await aq.find();
          var eq = new Parse.Query('Enquiry'); eq.descending('createdAt'); enquiries = await eq.find();
          settingsCache = await fetchSettings();
        } catch (err) {
          console.error('loadEverything', err);
          toast('Could not load data. Please refresh.');
        }
      }

      function showApp() {
        $('#loginScreen').classList.add('hidden');
        $('#app').classList.remove('hidden');
        hydrateIcons();
        loadEverything().then(renderAll);
      }

      $('#signOutBtn').addEventListener('click', async function () {
        await Parse.User.logOut();
        location.reload();
      });

      function switchView(name) {
        $$('.nav-item[data-view]').forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
        $$('.view').forEach(function (v) { v.classList.toggle('hidden', v.dataset.view !== name); });
      }
      $$('.nav-item[data-view]').forEach(function (btn) {
        btn.addEventListener('click', function () { switchView(btn.dataset.view); });
      });
      $$('[data-goto]').forEach(function (btn) {
        btn.addEventListener('click', function () { switchView(btn.dataset.goto); });
      });

      function stat(ico, label, value, sub) {
        return '<div class="stat"><div class="stat-label">' + icon(ico) + escapeHtml(label) + '</div>' +
          '<div class="stat-value">' + escapeHtml(value) + '</div>' +
          '<div class="stat-sub">' + escapeHtml(sub) + '</div></div>';
      }

      function renderOverview() {
        var pending = properties.filter(function (p) { return p.get('status') === 'pending'; });
        var approved = properties.filter(function (p) { return p.get('status') === 'approved'; });
        var newEnq = enquiries.filter(function (e) { return e.get('status') === 'new'; });
        var earned = approved.reduce(function (s, p) {
          return s + Math.max(0, (Number(p.get('publicPrice')) || 0) - (Number(p.get('landlordPrice')) || 0));
        }, 0);

        $('#statGrid').innerHTML =
          stat('home', 'Total listings', properties.length, 'across all landlords') +
          stat('clock', 'Awaiting approval', pending.length, 'needs your review') +
          stat('mail', 'New requests', newEnq.length, 'from the public site') +
          stat('check', 'Live on site', approved.length, 'visible to the public') +
          stat('money', 'Commission (live)', money(earned), 'per month when rented') +
          stat('users', 'Agents', agents.length, 'assigned to rooms');
        var pb = $('#pendingBadge'); if (pb) pb.textContent = pending.length;
        var eb = $('#enqBadge'); if (eb) eb.textContent = newEnq.length;

        var list = $('#pendingList');
        if (!list) return;
        if (!pending.length) {
          list.innerHTML = '<p class="login-sub" style="margin:0">Nothing waiting. All caught up.</p>';
          return;
        }
        list.innerHTML = pending.slice(0, 5).map(function (p) {
          var imgs = parseArray(p.get('images'));
          var img = imgs[0] || placeholder(p.id, 'Room');
          return '<div class="pending-item"><img src="' + img + '" alt="">' +
            '<div><strong>' + escapeHtml(p.get('title')) + '</strong>' +
            '<small>' + escapeHtml(p.get('suburb') + ', ' + p.get('city')) + ' · ' + money(p.get('landlordPrice')) + '</small></div>' +
            '<button class="btn btn-ghost btn-sm" data-review="' + escapeHtml(p.id) + '">Review</button></div>';
        }).join('');
        list.querySelectorAll('[data-review]').forEach(function (b) {
          b.addEventListener('click', function () {
            switchView('properties');
            activeStatus = 'pending';
            $$('#statusTabs .tab').forEach(function (t) { t.classList.toggle('active', t.dataset.status === 'pending'); });
            renderProperties();
          });
        });
      }

      function renderProperties() {
        var defaultComm = settingsCache ? Number(settingsCache.get('defaultCommission')) || 400 : 400;
        var list = properties.slice();
        if (activeStatus !== 'all') list = list.filter(function (p) { return p.get('status') === activeStatus; });
        list.sort(function (a, b) {
          if (a.get('status') === 'pending' && b.get('status') !== 'pending') return -1;
          if (b.get('status') === 'pending' && a.get('status') !== 'pending') return 1;
          return (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0);
        });
        var wrap = $('#propertyRows');
        if (!wrap) return;
        if (!list.length) { wrap.innerHTML = '<div class="panel"><p class="login-sub" style="margin:0">No listings in this tab.</p></div>'; return; }

        wrap.innerHTML = list.map(function (p) {
          var imgs = parseArray(p.get('images'));
          var img = imgs[0] || placeholder(p.id, 'Room');
          var agentRef = p.get('agent');
          var base = Number(p.get('landlordPrice')) || 0;
          var suggested = Number(p.get('publicPrice')) || (base + defaultComm);
          var comm = suggested - base;
          var enqCount = enquiries.filter(function (e) { var r = e.get('property'); return r && r.id === p.id; }).length;
          var newCount = enquiries.filter(function (e) { var r = e.get('property'); return r && r.id === p.id && e.get('status') === 'new'; }).length;
          var status = p.get('status');

          var agentOptions = '<option value="">— no agent —</option>' + agents.map(function (a) {
            return '<option value="' + escapeHtml(a.id) + '"' + (agentRef && a.id === agentRef.id ? ' selected' : '') + '>' +
              escapeHtml(a.get('name')) + '</option>';
          }).join('');

          var actions = '';
          if (status !== 'approved') actions += '<button class="btn btn-primary btn-sm" data-action="approve" data-id="' + escapeHtml(p.id) + '">Approve &amp; publish</button>';
          else actions += '<button class="btn btn-ghost btn-sm" data-action="unpublish" data-id="' + escapeHtml(p.id) + '">Unpublish</button>';
          if (status !== 'rejected') actions += '<button class="btn btn-ghost btn-sm" data-action="reject" data-id="' + escapeHtml(p.id) + '">Reject</button>';

          return '<div class="row">' +
            '<img class="row-thumb" src="' + img + '" alt="">' +
            '<div class="row-main">' +
              '<h4>' + escapeHtml(p.get('title')) + '</h4>' +
              '<p class="row-loc">' + icon('pin') + escapeHtml(p.get('suburb') + ', ' + p.get('city')) + '</p>' +
              '<div class="price-editor">' +
                '<label class="price-field"><span>Landlord price</span><input value="' + base + '" disabled></label>' +
                '<label class="price-field"><span>Public price</span>' +
                  '<input type="number" min="0" step="50" class="public-price" data-id="' + escapeHtml(p.id) + '" value="' + suggested + '"></label>' +
                '<span class="commission-tag' + (comm < 0 ? ' neg' : '') + '" data-commission-for="' + escapeHtml(p.id) + '">' +
                  icon('money') + ' Commission ' + money(comm) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="row-side">' +
              '<span class="badge ' + escapeHtml(status) + '">' +
                (status === 'approved' ? 'Live' : status === 'pending' ? 'Pending' : 'Rejected') + '</span>' +
              '<small style="text-align:center;font-size:12px;color:' + (newCount > 0 ? 'var(--accent);font-weight:700' : 'var(--ink-3)') + '">' +
                enqCount + ' request' + (enqCount === 1 ? '' : 's') + (newCount > 0 ? ' · ' + newCount + ' new' : '') + '</small>' +
              '<select class="agent-select" data-agent-for="' + escapeHtml(p.id) + '">' + agentOptions + '</select>' +
              '<div class="row-actions">' + actions +
                '<button class="icon-btn" data-action="delete" data-id="' + escapeHtml(p.id) + '" title="Delete">' + icon('trash') + '</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      $('#propertyRows').addEventListener('input', function (e) {
        if (!e.target.classList.contains('public-price')) return;
        var id = e.target.dataset.id;
        var p = properties.find(function (x) { return x.id === id; });
        if (!p) return;
        var base = Number(p.get('landlordPrice')) || 0;
        var comm = (Number(e.target.value) || 0) - base;
        var tag = document.querySelector('[data-commission-for="' + id + '"]');
        if (tag) { tag.innerHTML = icon('money') + ' Commission ' + money(comm); tag.classList.toggle('neg', comm < 0); }
      });

      $('#propertyRows').addEventListener('change', async function (e) {
        if (!e.target.classList.contains('agent-select')) return;
        var id = e.target.dataset.agentFor;
        var agentId = e.target.value;
        var p = properties.find(function (x) { return x.id === id; });
        if (!p) return;
        try {
          if (agentId) { var A = Parse.Object.extend('Agent'); p.set('agent', A.createWithoutData(agentId)); }
          else p.unset('agent');
          await p.save();
          toast('Agent updated.');
          await loadEverything(); renderAll();
        } catch (err) { console.error(err); toast('Could not update agent.'); }
      });

      $('#propertyRows').addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-action]'); if (!btn) return;
        var id = btn.dataset.id;
        var action = btn.dataset.action;
        var p = properties.find(function (x) { return x.id === id; });
        if (!p) return;
        try {
          if (action === 'approve') {
            var input = document.querySelector('.public-price[data-id="' + id + '"]');
            var price = Number(input ? input.value : 0);
            if (!price || price <= 0) { toast('Enter a public price.'); return; }
            if (price < (Number(p.get('landlordPrice')) || 0)) { toast('Public price is below landlord price.'); return; }
            p.set('status', 'approved');
            p.set('publicPrice', price);
            p.set('approvedAt', new Date());
            var acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            var owner = p.get('owner'); if (owner) acl.setWriteAccess(owner.id, true);
            acl.setWriteAccess(Parse.User.current().id, true);
            p.setACL(acl);
            await p.save();
            toast('Published at ' + money(price) + '.');
          } else if (action === 'unpublish') {
            p.set('status', 'pending');
            var acl2 = new Parse.ACL();
            var owner2 = p.get('owner');
            if (owner2) { acl2.setReadAccess(owner2.id, true); acl2.setWriteAccess(owner2.id, true); }
            acl2.setReadAccess(Parse.User.current().id, true);
            acl2.setWriteAccess(Parse.User.current().id, true);
            p.setACL(acl2);
            await p.save();
            toast('Unpublished.');
          } else if (action === 'reject') {
            p.set('status', 'rejected'); await p.save(); toast('Rejected.');
          } else if (action === 'delete') {
            if (!confirm('Delete this listing permanently?')) return;
            await p.destroy(); toast('Deleted.');
          }
          await loadEverything(); renderAll();
        } catch (err) { console.error(err); toast('Action failed.'); }
      });

      $('#statusTabs').addEventListener('click', function (e) {
        var tab = e.target.closest('.tab'); if (!tab) return;
        activeStatus = tab.dataset.status;
        $$('#statusTabs .tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
        renderProperties();
      });

      function renderEnqFilter() {
        var html = '<button class="tab' + (activeEnqAgent === 'all' ? ' active' : '') + '" data-agent="all">All</button>';
        agents.forEach(function (a) {
          var n = enquiries.filter(function (e) { var r = e.get('agent'); return r && r.id === a.id && e.get('status') === 'new'; }).length;
          html += '<button class="tab' + (activeEnqAgent === a.id ? ' active' : '') + '" data-agent="' + escapeHtml(a.id) + '">' +
            escapeHtml(a.get('name').split(' ')[0]) + (n > 0 ? ' (' + n + ')' : '') + '</button>';
        });
        var el = $('#enqTabs'); if (el) el.innerHTML = html;
      }

      function renderEnquiries() {
        renderEnqFilter();
        var list = enquiries.slice().sort(function (a, b) {
          var aN = a.get('status') === 'new', bN = b.get('status') === 'new';
          if (aN && !bN) return -1; if (bN && !aN) return 1;
          return (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0);
        });
        if (activeEnqAgent !== 'all') list = list.filter(function (e) { var r = e.get('agent'); return r && r.id === activeEnqAgent; });
        var wrap = $('#enquiryRows'); if (!wrap) return;
        if (!list.length) { wrap.innerHTML = '<div class="panel"><p class="login-sub" style="margin:0">No viewing requests yet.</p></div>'; return; }

        wrap.innerHTML = list.map(function (enq) {
          var propRef = enq.get('property');
          var prop = propRef ? properties.find(function (p) { return p.id === propRef.id; }) : null;
          var imgs = prop ? parseArray(prop.get('images')) : [];
          var img = imgs[0] || enq.get('propertyImage') || placeholder('room', 'Room');
          var agentRef = enq.get('agent');
          var agentObj = agentRef ? agents.find(function (a) { return a.id === agentRef.id; }) : null;
          var agentName = agentObj ? agentObj.get('name') : (enq.get('agentName') || '—');
          var agentPhone = agentObj ? agentObj.get('phone') : (enq.get('agentPhone') || '');
          var isNew = enq.get('status') === 'new';

          var agentChip = agentName !== '—'
            ? '<span style="background:rgba(0,113,227,.1);border-radius:999px;padding:5px 11px;font-size:12.5px;color:var(--accent)">Agent: ' + escapeHtml(agentName) + (agentPhone ? ' · ' + escapeHtml(agentPhone) : '') + '</span>'
            : '<span style="background:rgba(196,123,0,.12);border-radius:999px;padding:5px 11px;font-size:12.5px;color:var(--amber)">No agent assigned</span>';

          var actions = '<a class="btn btn-primary btn-sm" href="' + telHref(enq.get('tenantPhone')) + '">Call tenant</a>';
          if (agentPhone) actions += '<a class="btn btn-ghost btn-sm" href="' + telHref(agentPhone) + '">Call agent</a>';
          if (isNew) actions += '<button class="btn btn-ghost btn-sm" data-enq-act="contacted" data-id="' + escapeHtml(enq.id) + '">Mark contacted</button>';
          actions += '<button class="icon-btn" data-enq-act="delete" data-id="' + escapeHtml(enq.id) + '" title="Delete">' + icon('trash') + '</button>';

          return '<div class="row">' +
            '<img class="row-thumb" src="' + img + '" alt="">' +
            '<div class="row-main">' +
              '<h4>' + escapeHtml(enq.get('propertyTitle') || (prop && prop.get('title')) || 'Room') + '</h4>' +
              '<p class="row-loc">' + icon('mail') + escapeHtml(enq.get('tenantName')) + ' · ' + escapeHtml(enq.get('tenantPhone')) +
                (enq.get('tenantEmail') ? ' · ' + escapeHtml(enq.get('tenantEmail')) : '') + '</p>' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
                chip('Move-in ' + formatDate(enq.get('moveInDate'))) +
                chip((enq.get('people') || 1) + ' people') +
                chip(enq.get('employment') || '—') + agentChip + '</div>' +
            '</div>' +
            '<div class="row-side">' +
              '<span class="badge ' + (isNew ? 'pending' : 'approved') + '">' + (isNew ? 'New' : 'Contacted') + '</span>' +
              '<div class="row-actions" style="flex-wrap:wrap">' + actions + '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      $('#enqTabs').addEventListener('click', function (e) {
        var tab = e.target.closest('.tab'); if (!tab) return;
        activeEnqAgent = tab.dataset.agent;
        renderEnquiries();
      });

      $('#enquiryRows').addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-enq-act]'); if (!btn) return;
        var id = btn.dataset.id;
        var act = btn.dataset.enqAct;
        var enq = enquiries.find(function (x) { return x.id === id; });
        if (!enq) return;
        try {
          if (act === 'contacted') { enq.set('status', 'contacted'); enq.set('contactedAt', new Date()); await enq.save(); toast('Marked contacted.'); }
          else if (act === 'delete') { if (!confirm('Delete this request?')) return; await enq.destroy(); toast('Deleted.'); }
          await loadEverything(); renderAll();
        } catch (err) { console.error(err); toast('Action failed.'); }
      });

      $('#agentForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var A = Parse.Object.extend('Agent');
          var a = new A();
          a.set('name', $('#agentName').value.trim());
          a.set('phone', $('#agentPhone').value.trim());
          a.set('email', $('#agentEmail').value.trim());
          var acl = new Parse.ACL();
          acl.setPublicReadAccess(true);
          acl.setWriteAccess(Parse.User.current().id, true);
          a.setACL(acl);
          await a.save();
          this.reset(); toast('Agent added.');
          await loadEverything(); renderAll();
        } catch (err) { console.error(err); toast('Could not add agent.'); }
      });

      function renderAgents() {
        var list = $('#agentList'); if (!list) return;
        if (!agents.length) { list.innerHTML = '<p class="login-sub" style="margin:0">No agents yet.</p>'; return; }
        list.innerHTML = agents.map(function (a) {
          var roomCount = properties.filter(function (p) { var r = p.get('agent'); return r && r.id === a.id; }).length;
          var newCount = enquiries.filter(function (e) { var r = e.get('agent'); return r && r.id === a.id && e.get('status') === 'new'; }).length;
          var name = a.get('name') || '';
          var initials = name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
          return '<div class="agent-row"><div class="avatar">' + escapeHtml(initials) + '</div>' +
            '<div style="flex:1;min-width:0"><strong>' + escapeHtml(name) + '</strong>' +
            '<small>' + escapeHtml(a.get('phone')) + (a.get('email') ? ' · ' + escapeHtml(a.get('email')) : '') +
              ' · ' + roomCount + ' room' + (roomCount === 1 ? '' : 's') +
              (newCount > 0 ? ' · <strong style="color:var(--accent)">' + newCount + ' new</strong>' : '') +
            '</small></div>' +
            '<button class="icon-btn" data-del-agent="' + escapeHtml(a.id) + '" title="Remove">' + icon('trash') + '</button></div>';
        }).join('');
        list.querySelectorAll('[data-del-agent]').forEach(function (b) {
          b.addEventListener('click', async function () {
            if (!confirm('Remove this agent?')) return;
            try {
              var a = agents.find(function (x) { return x.id === b.dataset.delAgent; });
              if (a) await a.destroy();
              toast('Agent removed.');
              await loadEverything(); renderAll();
            } catch (err) { toast('Could not remove agent.'); }
          });
        });
      }

      function renderSettings() {
        if (!settingsCache) return;
        var sn = $('#setSiteName'); if (sn) sn.value = settingsCache.get('siteName') || 'Room Stay';
        var sc = $('#setCommission'); if (sc) sc.value = settingsCache.get('defaultCommission') || 400;
        var sp = $('#setPassword'); if (sp) sp.value = '';
        refreshHeroPreview();
      }

      var heroInput = $('#heroImageInput'), heroZone = $('#heroUploadZone');
      var heroPreview = $('#heroPreview'), heroPreviewWrap = $('#heroPreviewWrap');
      var heroUploadIco = $('#heroUploadIco');
      if (heroUploadIco) heroUploadIco.innerHTML = icon('image');

      function refreshHeroPreview() {
        if (!heroPreview || !heroPreviewWrap) return;
        var url = settingsCache ? settingsCache.get('heroImage') : null;
        if (url) { heroPreview.src = url; heroPreviewWrap.classList.remove('hidden'); }
        else { heroPreview.removeAttribute('src'); heroPreviewWrap.classList.add('hidden'); }
      }

      if (heroInput && heroZone) {
        heroInput.addEventListener('click', function (e) { e.stopPropagation(); });
        heroZone.addEventListener('click', function () { heroInput.click(); });
        heroZone.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heroInput.click(); }
        });
        heroInput.addEventListener('change', async function (e) {
          var file = e.target.files && e.target.files[0]; if (!file) return;
          try {
            var url = await uploadFile(file, 'hero');
            settingsCache.set('heroImage', url);
            await settingsCache.save();
            refreshHeroPreview(); toast('Hero image updated.');
          } catch (err) { console.error(err); toast('Could not upload image.'); }
          e.target.value = '';
        });
      }

      if ($('#removeHeroBtn')) {
        $('#removeHeroBtn').addEventListener('click', async function () {
          try { settingsCache.unset('heroImage'); await settingsCache.save(); refreshHeroPreview(); toast('Removed.'); }
          catch (err) { toast('Could not remove.'); }
        });
      }

      $('#settingsForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!settingsCache) return;
        try {
          settingsCache.set('siteName', $('#setSiteName').value.trim() || 'Room Stay');
          settingsCache.set('defaultCommission', Number($('#setCommission').value) || 400);
          await settingsCache.save(); toast('Settings saved.');
          await loadEverything(); renderAll();
        } catch (err) { toast('Could not save settings.'); }
      });

      function renderAll() {
        renderOverview();
        renderProperties();
        renderEnquiries();
        renderAgents();
        renderSettings();
        hydrateIcons();
      }
    }

    /* =========================================================
       LANDLORD
       ========================================================= */
    async function initLandlord() {
      var pendingImages = [];
      var editingId = null;
      var myProperties = [];

      var user = Parse.User.current();
      if (user && (user.get('isLandlord') || user.get('isAdmin'))) {
        showApp();
        await loadMine();
        renderMine();
      }

      $('#loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var errEl = document.getElementById('loginError');
        if (errEl) errEl.textContent = '';

        var name = $('#loginName').value.trim();
        var email = $('#loginEmail').value.trim();
        var phone = $('#loginPhone').value.trim();
        var password = $('#loginPass').value;

        if (!name) { if (errEl) errEl.textContent = 'Enter your name.'; return; }
        if (!email || email.indexOf('@') === -1) { if (errEl) errEl.textContent = 'Enter a valid email.'; return; }
        if (!password || password.length < 8) { if (errEl) errEl.textContent = 'Password must be at least 8 characters.'; return; }

        try {
          var u = await Parse.User.logIn(email, password);
          if (!u.get('isLandlord') && !u.get('isAdmin')) {
            await Parse.User.logOut();
            if (errEl) errEl.textContent = 'This account cannot list rooms.';
            return;
          }
          showApp();
          await loadMine(); renderMine();
          toast('Welcome back, ' + (u.get('name') || 'landlord'));
        } catch (err) {
          try {
            var nu = new Parse.User();
            nu.set('username', email);
            nu.set('email', email);
            nu.set('password', password);
            nu.set('name', name);
            nu.set('phone', phone);
            nu.set('isLandlord', true);
            nu.set('isAdmin', false);
            await nu.signUp();
            showApp();
            await loadMine(); renderMine();
            toast('Account created. Welcome to Room Stay.');
          } catch (e2) {
            console.error(e2);
            if (errEl) errEl.textContent = 'Wrong email or password. Try a different email to create a new account.';
          }
        }
      });

      $('#signOutBtn').addEventListener('click', async function () {
        await Parse.User.logOut();
        location.reload();
      });

      function showApp() {
        $('#loginScreen').classList.add('hidden');
        $('#app').classList.remove('hidden');
        var who = Parse.User.current();
        var w = $('#whoAmI'); if (w) w.textContent = (who && who.get('name')) || '';
        var ico = $('#uploadIco'); if (ico) ico.innerHTML = icon('image');
        buildPicker();
      }

      function buildPicker() {
        var el = $('#amenityPicker'); if (!el) return;
        el.innerHTML = AMENITIES.map(function (a) {
          return '<span>' +
            '<input type="checkbox" class="amenity-check" id="am_' + a.key + '" value="' + a.key + '">' +
            '<label class="amenity-label" for="am_' + a.key + '">' + icon(a.key) + escapeHtml(a.label) + '</label>' +
          '</span>';
        }).join('');
      }

      async function loadMine() {
        try {
          var q = new Parse.Query('Property');
          q.equalTo('owner', Parse.User.current());
          q.descending('createdAt');
          myProperties = await q.find();
        } catch (err) { console.error(err); myProperties = []; }
      }

      function showListings() {
        $('#formView').classList.add('hidden');
        $('#listingsView').classList.remove('hidden');
        renderMine();
      }

      function showForm(prop) {
        $('#listingsView').classList.add('hidden');
        $('#formView').classList.remove('hidden');
        editingId = prop ? prop.id : null;
        pendingImages = prop ? parseArray(prop.get('images')) : [];

        $('#formTitle').textContent = prop ? 'Edit listing' : 'Post a room';
        $('#submitBtn').textContent = prop ? 'Save and resubmit' : 'Submit for review';
        $('#fTitle').value = prop ? prop.get('title') || '' : '';
        $('#fAddress').value = prop ? prop.get('address') || '' : '';
        $('#fSuburb').value = prop ? prop.get('suburb') || '' : '';
        $('#fCity').value = prop ? prop.get('city') || '' : '';
        $('#fType').value = prop ? prop.get('type') || 'Room' : 'Room';
        $('#fBedrooms').value = prop ? prop.get('bedrooms') || 1 : 1;
        $('#fBathrooms').value = prop ? prop.get('bathrooms') || 0 : 0;
        $('#fPrice').value = prop ? prop.get('landlordPrice') || '' : '';
        $('#fDescription').value = prop ? prop.get('description') || '' : '';
        var cur = prop ? parseArray(prop.get('amenities')) : [];
        $$('.amenity-check').forEach(function (c) { c.checked = cur.indexOf(c.value) !== -1; });
        renderPreviews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      $('#newListingBtn').addEventListener('click', function () { showForm(null); });
      $('#emptyAddBtn').addEventListener('click', function () { showForm(null); });
      $('#backToListings').addEventListener('click', showListings);
      $('#cancelBtn').addEventListener('click', showListings);

      $('#fImages').addEventListener('click', function (e) { e.stopPropagation(); });
      $('#uploadZone').addEventListener('click', function () { $('#fImages').click(); });
      $('#uploadZone').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#fImages').click(); }
      });

      $('#fImages').addEventListener('change', async function (e) {
        var files = Array.prototype.slice.call(e.target.files || []);
        if (!files.length) return;
        var room = 6 - pendingImages.length;
        if (room <= 0) { toast('Max 6 photos.'); e.target.value = ''; return; }
        files = files.slice(0, room);
        toast('Uploading ' + files.length + '…');
        try {
          for (var i = 0; i < files.length; i++) {
            var url = await uploadFile(files[i], 'room');
            pendingImages.push(url); renderPreviews();
          }
          toast('Photos added.');
        } catch (err) { console.error(err); toast('Upload failed.'); }
        e.target.value = '';
      });

      function renderPreviews() {
        var el = $('#previewGrid'); if (!el) return;
        el.innerHTML = pendingImages.map(function (src, i) {
          return '<div class="preview"><img src="' + src + '" alt="">' +
            '<button type="button" data-remove="' + i + '">×</button></div>';
        }).join('');
      }

      $('#previewGrid').addEventListener('click', function (e) {
        var b = e.target.closest('[data-remove]'); if (!b) return;
        pendingImages.splice(Number(b.dataset.remove), 1);
        renderPreviews();
      });

      $('#listingForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var price = Number($('#fPrice').value);
        if (!price || price <= 0) { toast('Enter a valid price.'); return; }
        var amenities = $$('.amenity-check:checked').map(function (c) { return c.value; });
        try {
          var prop;
          if (editingId) {
            prop = myProperties.find(function (p) { return p.id === editingId; });
            if (!prop) prop = await new Parse.Query('Property').get(editingId);
          } else {
            var P = Parse.Object.extend('Property');
            prop = new P();
            prop.set('owner', Parse.User.current());
          }
          prop.set('title', $('#fTitle').value.trim());
          prop.set('address', $('#fAddress').value.trim());
          prop.set('suburb', $('#fSuburb').value.trim());
          prop.set('city', $('#fCity').value.trim());
          prop.set('type', $('#fType').value);
          prop.set('bedrooms', Number($('#fBedrooms').value) || 0);
          prop.set('bathrooms', Number($('#fBathrooms').value) || 0);
          prop.set('landlordPrice', price);
          prop.set('description', $('#fDescription').value.trim());
          prop.set('amenities', JSON.stringify(amenities));
          prop.set('images', JSON.stringify(pendingImages.length ? pendingImages : [placeholder('room', 'Room')]));
          prop.set('status', 'pending');
          var acl = new Parse.ACL();
          var uid = Parse.User.current().id;
          acl.setReadAccess(uid, true); acl.setWriteAccess(uid, true);
          prop.setACL(acl);
          await prop.save();
          toast(editingId ? 'Listing updated.' : 'Listing submitted.');
          await loadMine();
          showListings();
        } catch (err) { console.error(err); toast('Could not save listing.'); }
      });

      function renderMine() {
        var grid = $('#myGrid'); if (!grid) return;
        if (!myProperties.length) {
          grid.innerHTML = ''; grid.classList.add('hidden');
          var emp = $('#myEmpty'); if (emp) emp.classList.remove('hidden');
          return;
        }
        grid.classList.remove('hidden');
        var emp2 = $('#myEmpty'); if (emp2) emp2.classList.add('hidden');
        grid.innerHTML = myProperties.map(function (p) {
          var imgs = parseArray(p.get('images'));
          var img = imgs[0] || placeholder(p.id, 'Room');
          var status = p.get('status');
          var statusText = status === 'approved' ? 'Live on site' : status === 'pending' ? 'In review' : 'Not approved';
          var lp = Number(p.get('landlordPrice')) || 0;
          var pp = Number(p.get('publicPrice')) || 0;
          var publicBox = status === 'approved' && pp
            ? '<div class="money-box public"><span>Public price</span><strong>' + money(pp) + '</strong></div>'
            : '<div class="money-box public"><span>Public price</span><strong>Pending</strong></div>';
          var actions = '';
          if (status === 'approved') actions += '<a class="btn btn-ghost" href="property.html?id=' + encodeURIComponent(p.id) + '" target="_blank">View</a>';
          actions += '<button class="btn btn-ghost" data-edit="' + escapeHtml(p.id) + '">Edit</button>';
          actions += '<button class="btn btn-danger" data-del="' + escapeHtml(p.id) + '">Delete</button>';
          return '<article class="my-card">' +
            '<div class="my-media"><img src="' + img + '" alt="">' +
              '<span class="badge ' + escapeHtml(status) + '">' + escapeHtml(statusText) + '</span></div>' +
            '<div class="my-body">' +
              '<h3>' + escapeHtml(p.get('title')) + '</h3>' +
              '<p class="my-loc">' + icon('pin') + escapeHtml((p.get('suburb') || '') + ', ' + (p.get('city') || '')) + '</p>' +
              '<div class="money-row">' +
                '<div class="money-box"><span>Your price</span><strong>' + money(lp) + '</strong></div>' +
                publicBox + '</div>' +
              '<div class="my-foot">' + actions + '</div>' +
            '</div></article>';
        }).join('');
      }

      $('#myGrid').addEventListener('click', async function (e) {
        var ed = e.target.closest('[data-edit]');
        if (ed) {
          var p = myProperties.find(function (x) { return x.id === ed.dataset.edit; });
          if (p) showForm(p);
          return;
        }
        var dl = e.target.closest('[data-del]');
        if (dl) {
          if (!confirm('Delete this listing?')) return;
          try {
            var p = myProperties.find(function (x) { return x.id === dl.dataset.del; });
            if (p) await p.destroy();
            toast('Deleted.');
            await loadMine(); renderMine();
          } catch (err) { toast('Could not delete.'); }
        }
      });
    }
  }

  loadParse().then(boot).catch(function (err) {
    console.error('Room Stay: failed to load Parse SDK', err);
  });
})();