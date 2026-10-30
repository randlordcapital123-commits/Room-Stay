/* ===========================================================
   Room Stay — ADMIN DASHBOARD ONLY
   =========================================================== */
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

    function svg(inner) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
             'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    }
    var ICONS = {
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

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function esc(v) {
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
    function hydrateIcons(root) { $$('[data-ico]', root).forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-ico')); }); }
    function formatDate(iso) {
      if (!iso) return '—';
      try { var d = new Date(iso + 'T00:00:00'); if (isNaN(d.getTime())) return iso;
        var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
      } catch (e) { return iso; }
    }
    function telHref(phone) { return 'tel:' + String(phone || '').replace(/[^0-9+]/g, ''); }
    function chip(text) { return '<span style="background:rgba(0,0,0,.045);border-radius:999px;padding:5px 11px;font-size:12.5px;color:var(--ink-2)">' + esc(text) + '</span>'; }
    function safeImageUrl(v, seed) { var u = String(v || '').trim(); return (/^https?:\/\//i.test(u) ? u : placeholder(seed || 'room', 'Room')); }
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
    async function fetchSettings() { try { var r = await new Parse.Query('SiteSettings').limit(1).find(); return r[0] || null; } catch (e) { return null; } }

    var activeStatus = 'all';
    var activeEnqAgent = 'all';
    var properties = [];
    var agents = [];
    var enquiries = [];
    var settingsCache = null;

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

    async function isAdminUser(user) {
      if (!user) return false;
      try { var result = await Parse.Cloud.run('checkUserRole', { roleName: 'Admin' }); return !!(result && result.allowed); }
      catch (err) { console.error('[Admin] Role verification failed:', err); return false; }
    }

    var currentUser = Parse.User.current();
    if (currentUser) {
      isAdminUser(currentUser).then(function (allowed) {
        if (allowed) showApp();
        else { Parse.User.logOut(); var err = document.getElementById('loginError'); if (err) err.textContent = 'This account does not have administrator access.'; }
      });
    }

    function showApp() {
      var loginScreen = document.getElementById('loginScreen');
      var app = document.getElementById('app');
      if (loginScreen) loginScreen.classList.add('hidden');
      if (app) app.classList.remove('hidden');
      hydrateIcons();
      loadEverything().then(renderAll);
    }

    async function loadEverything() {
      try {
        properties = await Parse.Cloud.run('adminListProperties');
        agents = await Parse.Cloud.run('adminListAgents');
        enquiries = await Parse.Cloud.run('adminListEnquiries');
        settingsCache = await fetchSettings();
        console.log('[Admin] Loaded', properties.length, 'properties');
      } catch (err) { console.error('[Admin] load failed:', err); toast('Could not load data.'); }
    }

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var errEl = document.getElementById('loginError');
        if (errEl) errEl.textContent = '';
        var email = (adminEmailInput ? adminEmailInput.value : '').trim().toLowerCase();
        var password = document.getElementById('adminPass') ? document.getElementById('adminPass').value : '';
        if (!email || email.indexOf('@') === -1) { if (errEl) errEl.textContent = 'Enter a valid email.'; return; }
        if (!password || password.length < 8) { if (errEl) errEl.textContent = 'Password must be at least 8 characters.'; return; }

        try {
          var u = await Parse.User.logIn(email, password);
          if (!(await isAdminUser(u))) {
            await Parse.User.logOut();
            if (errEl) errEl.textContent = 'This account is not assigned to the Admin role. Ask the application owner to assign your account in Back4App.';
            return;
          }
          showApp();
        } catch (err) {
          console.error('[Admin] Login failed:', err);
          if (errEl) errEl.textContent = err.code === 101 ? 'Incorrect email or password.' : 'Could not sign in. Check your connection and try again.';
        }
      });
    }

    var forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', async function () {
      var email = (adminEmailInput ? adminEmailInput.value : '').trim().toLowerCase();
      var errEl = document.getElementById('loginError');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (errEl) errEl.textContent = 'Enter your admin email first.'; return; }
      try { await Parse.User.requestPasswordReset(email); if (errEl) errEl.textContent = 'If the account exists, a password reset email has been sent.'; }
      catch (err) { if (errEl) errEl.textContent = 'Could not send reset email. Check Back4App email settings.'; }
    });

    var signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async function () { await Parse.User.logOut(); location.reload(); });
    }

    function switchView(name) {
      $$('.nav-item[data-view]').forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
      $$('.view').forEach(function (v) { v.classList.toggle('hidden', v.dataset.view !== name); });
    }
    $$('.nav-item[data-view]').forEach(function (btn) { btn.addEventListener('click', function () { switchView(btn.dataset.view); }); });
    $$('[data-goto]').forEach(function (btn) { btn.addEventListener('click', function () { switchView(btn.dataset.goto); }); });

    function stat(ico, label, value, sub) {
      return '<div class="stat"><div class="stat-label">' + icon(ico) + esc(label) + '</div>' +
        '<div class="stat-value">' + esc(value) + '</div>' +
        '<div class="stat-sub">' + esc(sub) + '</div></div>';
    }

    function renderOverview() {
      var pending = properties.filter(function (p) { return p.get('status') === 'pending'; });
      var approved = properties.filter(function (p) { return p.get('status') === 'approved'; });
      var managed = properties.filter(function (p) { return p.get('managed'); });
      var newEnq = enquiries.filter(function (e) { return e.get('status') === 'new'; });
      var earned = approved.reduce(function (s, p) {
        return s + Math.max(0, (Number(p.get('publicPrice')) || 0) - (Number(p.get('landlordPrice')) || 0));
      }, 0);

      var statGrid = document.getElementById('statGrid');
      if (statGrid) statGrid.innerHTML =
        stat('home', 'Total listings', properties.length, 'across all landlords') +
        stat('clock', 'Awaiting approval', pending.length, 'needs your review') +
        stat('mail', 'New requests', newEnq.length, 'from the public site') +
        stat('check', 'Live on site', approved.length, 'visible to the public') +
        stat('money', 'Commission (live)', money(earned), 'per month when rented') +
        stat('users', 'Managed properties', managed.length, 'on Property Management');

      var pb = document.getElementById('pendingBadge'); if (pb) pb.textContent = pending.length;
      var eb = document.getElementById('enqBadge'); if (eb) eb.textContent = newEnq.length;

      var list = document.getElementById('pendingList');
      if (!list) return;
      if (!pending.length) { list.innerHTML = '<p class="login-sub" style="margin:0">Nothing waiting.</p>'; return; }
      list.innerHTML = pending.slice(0, 5).map(function (p) {
        var imgs = parseArray(p.get('images'));
        var img = safeImageUrl(imgs[0], p.id);
        return '<div class="pending-item"><img src="' + esc(img) + '" alt="">' +
          '<div><strong>' + esc(p.get('title')) + '</strong>' +
          '<small>' + esc(p.get('suburb') + ', ' + p.get('city')) + ' · ' + money(p.get('landlordPrice')) + '</small></div>' +
          '<button class="btn btn-ghost btn-sm" data-review="' + esc(p.id) + '">Review</button></div>';
      }).join('');
      list.querySelectorAll('[data-review]').forEach(function (b) {
        b.addEventListener('click', function () {
          switchView('properties'); activeStatus = 'pending';
          var tabs = document.querySelectorAll('#statusTabs .tab');
          Array.prototype.forEach.call(tabs, function (t) { t.classList.toggle('active', t.dataset.status === 'pending'); });
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
      var wrap = document.getElementById('propertyRows');
      if (!wrap) return;
      if (!list.length) { wrap.innerHTML = '<div class="panel"><p class="login-sub" style="margin:0">No listings in this tab.</p></div>'; return; }

      wrap.innerHTML = list.map(function (p) {
        var imgs = parseArray(p.get('images'));
        var img = safeImageUrl(imgs[0], p.id);
        var agentRef = p.get('agent');
        var base = Number(p.get('landlordPrice')) || 0;
        var isManaged = !!p.get('managed');
        var suggested = Number(p.get('publicPrice')) || (base + defaultComm);
        var comm = suggested - base;
        var status = p.get('status');
        var enqCount = enquiries.filter(function (e) { var r = e.get('property'); return r && r.id === p.id; }).length;
        var newCount = enquiries.filter(function (e) { var r = e.get('property'); return r && r.id === p.id && e.get('status') === 'new'; }).length;

        var agentOptions = '<option value="">— no agent —</option>' + agents.map(function (a) {
          return '<option value="' + esc(a.id) + '"' + (agentRef && a.id === agentRef.id ? ' selected' : '') + '>' + esc(a.get('name')) + '</option>';
        }).join('');

        var actions = '';
        if (status !== 'approved') actions += '<button class="btn btn-primary btn-sm" data-action="approve" data-id="' + esc(p.id) + '">Approve</button>';
        else actions += '<button class="btn btn-ghost btn-sm" data-action="unpublish" data-id="' + esc(p.id) + '">Unpublish</button>';
        if (status !== 'rejected') actions += '<button class="btn btn-ghost btn-sm" data-action="reject" data-id="' + esc(p.id) + '">Reject</button>';

        return '<div class="row">' +
          '<img class="row-thumb" src="' + esc(img) + '" alt="">' +
          '<div class="row-main">' +
            '<h4>' + esc(p.get('title')) + ' ' + (isManaged ? '<span style="background:var(--accent-soft);color:var(--accent);border-radius:999px;padding:2px 9px;font-size:11px;font-weight:700;letter-spacing:.02em">MANAGED</span>' : '') + '</h4>' +
            '<p class="row-loc">' + icon('pin') + esc(p.get('suburb') + ', ' + p.get('city')) + '</p>' +
            '<div class="price-editor">' +
              '<label class="price-field"><span>Landlord price</span><input value="' + base + '" disabled></label>' +
              '<label class="price-field"><span>Public price</span>' +
                '<input type="number" min="0" step="50" class="public-price" data-id="' + esc(p.id) + '" value="' + suggested + '"></label>' +
              '<span class="commission-tag' + (comm < 0 ? ' neg' : '') + '" data-commission-for="' + esc(p.id) + '">' +
                icon('money') + ' ' + (isManaged ? 'Management ' : 'Commission ') + money(comm) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="row-side">' +
            '<span class="badge ' + esc(status) + '">' +
              (status === 'approved' ? 'Live' : status === 'pending' ? 'Pending' : 'Rejected') + '</span>' +
            '<small style="text-align:center;font-size:12px;color:' + (newCount > 0 ? 'var(--accent);font-weight:700' : 'var(--ink-3)') + '">' +
              enqCount + ' request' + (enqCount === 1 ? '' : 's') + (newCount > 0 ? ' · ' + newCount + ' new' : '') + '</small>' +
            '<select class="agent-select" data-agent-for="' + esc(p.id) + '">' + agentOptions + '</select>' +
            '<div class="row-actions">' + actions +
              '<button class="icon-btn" data-action="delete" data-id="' + esc(p.id) + '" title="Delete">' + icon('trash') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var propertyRows = document.getElementById('propertyRows');
    if (propertyRows) {
      propertyRows.addEventListener('input', function (e) {
        if (!e.target.classList.contains('public-price')) return;
        var id = e.target.dataset.id;
        var p = properties.find(function (x) { return x.id === id; });
        if (!p) return;
        var base = Number(p.get('landlordPrice')) || 0;
        var comm = (Number(e.target.value) || 0) - base;
        var tag = document.querySelector('[data-commission-for="' + id + '"]');
        if (tag) { tag.innerHTML = icon('money') + (p.get('managed') ? ' Management ' : ' Commission ') + money(comm); tag.classList.toggle('neg', comm < 0); }
      });
      propertyRows.addEventListener('change', async function (e) {
        if (!e.target.classList.contains('agent-select')) return;
        var id = e.target.dataset.agentFor;
        var agentId = e.target.value;
        var p = properties.find(function (x) { return x.id === id; });
        if (!p) return;
        try {
          await Parse.Cloud.run('adminAssignAgent', { propertyId: id, agentId: agentId }); toast('Agent updated.'); await loadEverything(); renderAll();
        } catch (err) { toast('Could not update agent.'); }
      });
      propertyRows.addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-action]'); if (!btn) return;
        var id = btn.dataset.id; var action = btn.dataset.action;
        var p = properties.find(function (x) { return x.id === id; }); if (!p) return;
        try {
          if (action === 'approve') {
            var input = document.querySelector('.public-price[data-id="' + id + '"]');
            var price = Number(input ? input.value : 0);
            if (!price || price <= 0) { toast('Enter a public price.'); return; }
            if (price < (Number(p.get('landlordPrice')) || 0)) { toast('Public price below landlord price.'); return; }
            await Parse.Cloud.run('adminSetPropertyStatus', { propertyId: id, status: 'approved', publicPrice: price });
            toast('Published at ' + money(price) + '.');
          } else if (action === 'unpublish') {
            await Parse.Cloud.run('adminSetPropertyStatus', { propertyId: id, status: 'pending' }); toast('Unpublished.');
          } else if (action === 'reject') { await Parse.Cloud.run('adminSetPropertyStatus', { propertyId: id, status: 'rejected' }); toast('Rejected.'); }
          else if (action === 'delete') { if (!confirm('Delete this listing permanently?')) return; await Parse.Cloud.run('adminDeleteProperty', { propertyId: id }); toast('Deleted.'); }
          await loadEverything(); renderAll();
        } catch (err) { console.error(err); toast('Action failed.'); }
      });
    }

    var statusTabs = document.getElementById('statusTabs');
    if (statusTabs) {
      statusTabs.addEventListener('click', function (e) {
        var tab = e.target.closest('.tab'); if (!tab) return;
        activeStatus = tab.dataset.status;
        var tabs = statusTabs.querySelectorAll('.tab');
        Array.prototype.forEach.call(tabs, function (t) { t.classList.toggle('active', t === tab); });
        renderProperties();
      });
    }

    function renderEnquiries() {
      var enqTabs = document.getElementById('enqTabs');
      if (enqTabs) {
        var html = '<button class="tab' + (activeEnqAgent === 'all' ? ' active' : '') + '" data-agent="all">All</button>';
        agents.forEach(function (a) {
          var n = enquiries.filter(function (e) { var r = e.get('agent'); return r && r.id === a.id && e.get('status') === 'new'; }).length;
          html += '<button class="tab' + (activeEnqAgent === a.id ? ' active' : '') + '" data-agent="' + esc(a.id) + '">' + esc(String(a.get('name') || 'Agent').split(' ')[0]) + (n > 0 ? ' (' + n + ')' : '') + '</button>';
        });
        enqTabs.innerHTML = html;
      }
      var list = enquiries.slice().sort(function (a, b) {
        var aN = a.get('status') === 'new', bN = b.get('status') === 'new';
        if (aN && !bN) return -1; if (bN && !aN) return 1;
        return (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0);
      });
      if (activeEnqAgent !== 'all') list = list.filter(function (e) { var r = e.get('agent'); return r && r.id === activeEnqAgent; });
      var wrap = document.getElementById('enquiryRows'); if (!wrap) return;
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
          ? '<span style="background:var(--accent-soft);border-radius:999px;padding:5px 11px;font-size:12.5px;color:var(--accent)">Agent: ' + esc(agentName) + (agentPhone ? ' · ' + esc(agentPhone) : '') + '</span>'
          : '<span style="background:rgba(196,123,0,.12);border-radius:999px;padding:5px 11px;font-size:12.5px;color:var(--amber)">No agent assigned</span>';

        var actions = '<a class="btn btn-primary btn-sm" href="' + telHref(enq.get('tenantPhone')) + '">Call tenant</a>';
        if (agentPhone) actions += '<a class="btn btn-ghost btn-sm" href="' + telHref(agentPhone) + '">Call agent</a>';
        if (isNew) actions += '<button class="btn btn-ghost btn-sm" data-enq-act="contacted" data-id="' + esc(enq.id) + '">Mark contacted</button>';
        actions += '<button class="icon-btn" data-enq-act="delete" data-id="' + esc(enq.id) + '" title="Delete">' + icon('trash') + '</button>';

        return '<div class="row">' +
          '<img class="row-thumb" src="' + esc(img) + '" alt="">' +
          '<div class="row-main">' +
            '<h4>' + esc(enq.get('propertyTitle') || (prop && prop.get('title')) || 'Room') + '</h4>' +
            '<p class="row-loc">' + icon('mail') + esc(enq.get('tenantName')) + ' · ' + esc(enq.get('tenantPhone')) +
              (enq.get('tenantEmail') ? ' · ' + esc(enq.get('tenantEmail')) : '') + '</p>' +
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

    var enqTabsEl = document.getElementById('enqTabs');
    if (enqTabsEl) {
      enqTabsEl.addEventListener('click', function (e) {
        var tab = e.target.closest('.tab'); if (!tab) return;
        activeEnqAgent = tab.dataset.agent; renderEnquiries();
      });
    }

    var enquiryRows = document.getElementById('enquiryRows');
    if (enquiryRows) {
      enquiryRows.addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-enq-act]'); if (!btn) return;
        var id = btn.dataset.id; var act = btn.dataset.enqAct;
        var enq = enquiries.find(function (x) { return x.id === id; }); if (!enq) return;
        try {
          if (act === 'contacted') { await Parse.Cloud.run('adminUpdateEnquiry', { enquiryId: enq.id, status: 'contacted' }); toast('Marked contacted.'); }
          else if (act === 'delete') { if (!confirm('Delete this request?')) return; await enq.destroy(); toast('Deleted.'); }
          await loadEverything(); renderAll();
        } catch (err) { toast('Action failed.'); }
      });
    }

    var agentForm = document.getElementById('agentForm');
    if (agentForm) {
      agentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var A = Parse.Object.extend('Agent'); var a = new A();
          a.set('name', (document.getElementById('agentName') || {}).value || '');
          a.set('phone', (document.getElementById('agentPhone') || {}).value || '');
          a.set('email', (document.getElementById('agentEmail') || {}).value || '');
          var acl = new Parse.ACL(); acl.setPublicReadAccess(true); acl.setWriteAccess(Parse.User.current().id, true); a.setACL(acl);
          await a.save(); this.reset(); toast('Agent added.');
          await loadEverything(); renderAll();
        } catch (err) { toast('Could not add agent.'); }
      });
    }

    function renderAgents() {
      var list = document.getElementById('agentList');
      if (!list) return;
      if (!agents.length) { list.innerHTML = '<p class="login-sub" style="margin:0">No agents yet.</p>'; return; }
      list.innerHTML = agents.map(function (a) {
        var roomCount = properties.filter(function (p) { var r = p.get('agent'); return r && r.id === a.id; }).length;
        var newCount = enquiries.filter(function (e) { var r = e.get('agent'); return r && r.id === a.id && e.get('status') === 'new'; }).length;
        var name = a.get('name') || '';
        var initials = name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        return '<div class="agent-row"><div class="avatar">' + esc(initials) + '</div>' +
          '<div style="flex:1;min-width:0"><strong>' + esc(name) + '</strong>' +
          '<small>' + esc(a.get('phone')) + (a.get('email') ? ' · ' + esc(a.get('email')) : '') +
            ' · ' + roomCount + ' room' + (roomCount === 1 ? '' : 's') +
            (newCount > 0 ? ' · <strong style="color:var(--accent)">' + newCount + ' new</strong>' : '') +
          '</small></div>' +
          '<button class="icon-btn" data-del-agent="' + esc(a.id) + '" title="Remove">' + icon('trash') + '</button></div>';
      }).join('');
      list.querySelectorAll('[data-del-agent]').forEach(function (b) {
        b.addEventListener('click', async function () {
          if (!confirm('Remove this agent?')) return;
          try {
            var a = agents.find(function (x) { return x.id === b.dataset.delAgent; });
            if (a) await a.destroy();
            toast('Agent removed.'); await loadEverything(); renderAll();
          } catch (err) { toast('Could not remove agent.'); }
        });
      });
    }

    function renderSettings() {
      if (!settingsCache) return;
      var sn = document.getElementById('setSiteName'); if (sn) sn.value = settingsCache.get('siteName') || 'Room Stay';
      var sc = document.getElementById('setCommission'); if (sc) sc.value = settingsCache.get('defaultCommission') || 400;
      var sm = document.getElementById('setMgmtFee'); if (sm) sm.value = settingsCache.get('managementFee') || 15;
      var sp = document.getElementById('setPassword'); if (sp) sp.value = '';
      refreshHeroPreview();
    }
    var heroInput = document.getElementById('heroImageInput');
    var heroZone = document.getElementById('heroUploadZone');
    var heroPreview = document.getElementById('heroPreview');
    var heroPreviewWrap = document.getElementById('heroPreviewWrap');
    var heroUploadIco = document.getElementById('heroUploadIco');
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
      heroZone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heroInput.click(); } });
      heroInput.addEventListener('change', async function (e) {
        var file = e.target.files && e.target.files[0]; if (!file) return;
        try { var url = await uploadFile(file, 'hero'); settingsCache.set('heroImage', url); await settingsCache.save(); refreshHeroPreview(); toast('Hero updated.'); }
        catch (err) { toast('Could not upload.'); }
        e.target.value = '';
      });
    }
    var removeHeroBtn = document.getElementById('removeHeroBtn');
    if (removeHeroBtn) {
      removeHeroBtn.addEventListener('click', async function () {
        try { settingsCache.unset('heroImage'); await settingsCache.save(); refreshHeroPreview(); toast('Removed.'); }
        catch (err) { toast('Could not remove.'); }
      });
    }

    var settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!settingsCache) { var SettingsClass = Parse.Object.extend('SiteSettings'); settingsCache = new SettingsClass(); }
        try {
          settingsCache.set('siteName', ((document.getElementById('setSiteName') || {}).value || 'Room Stay').trim());
          settingsCache.set('defaultCommission', (document.getElementById('setCommission') || {}).value === '' ? 400 : Number(document.getElementById('setCommission').value));
          settingsCache.set('managementFee', (document.getElementById('setMgmtFee') || {}).value === '' ? 15 : Number(document.getElementById('setMgmtFee').value));
          await settingsCache.save(); toast('Settings saved.'); await loadEverything(); renderAll();
        } catch (err) { toast('Could not save settings.'); }
      });
    }

    function renderAll() {
      renderOverview(); renderProperties(); renderEnquiries(); renderAgents(); renderSettings(); hydrateIcons();
    }
  }

  loadParse().then(boot).catch(function (err) {
    console.error('Room Stay: failed to load Parse', err);
  });
})();