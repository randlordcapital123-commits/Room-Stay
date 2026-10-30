/* ===========================================================
   Room Stay — LANDLORD PORTAL
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
    console.log('[Landlord] Booting…');

    Parse.initialize(
      'yZd1tyOC06p5XRKmUwNkaip9UUMoQoteFPKcrTSe',
      '1pZ0JnP06gfyVGj6CHXWREo3rqsu7HmLixCCxgrk'
    );
    Parse.serverURL = 'https://parseapi.back4app.com/';
    console.log('[Landlord] Parse initialized.');

    var BASIC_SLOTS = 2;
    var BASIC_MONTHLY_FEE = 50;

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
      pin: svg('<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
      image: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 15.5 16 11l-8 9"/>')
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
    function safeImageUrl(v, seed) { var u = String(v || '').trim(); return (/^https?:\/\//i.test(u) ? u : placeholder(seed || 'room', 'Room')); }
    function parseArray(v) {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') { try { var r = JSON.parse(v); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
      return [];
    }
    async function uploadFile(file, prefix) {
      if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Only JPG, PNG and WebP images are allowed.');
      if (file.size > 2 * 1024 * 1024) throw new Error('Each image must be 2 MB or smaller.');
      var ext = (file.name || 'file').split('.').pop().toLowerCase() || 'jpg';
      var name = prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext;
      var pf = new Parse.File(name, file);
      await pf.save();
      return pf.url();
    }

    var state = { user: null, properties: [], pendingImages: [], editingId: null };

    /* ---------- LOGIN ---------- */
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var errEl = document.getElementById('loginError');
        if (errEl) errEl.textContent = '';

        var nameEl = document.getElementById('loginName');
        var emailEl = document.getElementById('loginEmail');
        var phoneEl = document.getElementById('loginPhone');
        var passEl = document.getElementById('loginPass');

        var name = nameEl ? nameEl.value.trim() : '';
        var email = emailEl ? emailEl.value.trim().toLowerCase() : '';
        var phone = phoneEl ? phoneEl.value.trim() : '';
        var password = passEl ? passEl.value : '';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (errEl) errEl.textContent = 'Please enter a valid email.'; return; }
        if (!password || password.length < 8) { if (errEl) errEl.textContent = 'Password must be at least 8 characters.'; return; }
        var action = e.submitter && e.submitter.value ? e.submitter.value : 'login';

        if (action === 'login') {
          try {
            var loggedIn = await Parse.User.logIn(email, password);
            var roleCheck;
            try { roleCheck = await Parse.Cloud.run('checkUserRole', { roleName: 'Landlord' }); }
            catch (roleErr) { await Parse.Cloud.run('ensureLandlordRole'); roleCheck = await Parse.Cloud.run('checkUserRole', { roleName: 'Landlord' }); }
            if (!roleCheck || !roleCheck.allowed) { await Parse.User.logOut(); throw new Error('This account is not registered as a landlord.'); }
            state.user = loggedIn;
            showApp();
            toast('Welcome back, ' + (loggedIn.get('name') || 'landlord') + '.');
          } catch (loginErr) {
            if (errEl) errEl.textContent = loginErr.message || (loginErr.code === 101 ? 'Incorrect email or password.' : 'Unable to sign in. Please try again.');
          }
          return;
        }
        if (!name) { if (errEl) errEl.textContent = 'Please enter your full name to create an account.'; return; }

        try {
          var nu = new Parse.User();
          nu.set('username', email);
          nu.set('email', email);
          nu.set('password', password);
          nu.set('name', name);
          nu.set('phone', phone);
          nu.set('isLandlord', true);
          nu.set('isAdmin', false);
          nu.set('plan', 'basic');
          nu.set('planFee', BASIC_MONTHLY_FEE);
          await nu.signUp();
          await Parse.Cloud.run('ensureLandlordRole');
          console.log('[Landlord] Signup OK');
          state.user = nu;
          showApp();
          toast('Account created. Welcome to Room Stay.');
        } catch (signupErr) {
          console.error('[Landlord] Signup failed:', signupErr.code, signupErr.message);
          if (errEl) {
            if (signupErr.code === 202) errEl.textContent = 'That email is already registered. Check your password, or use a different email.';
            else if (signupErr.code === 203) errEl.textContent = 'That email is already in use.';
            else if (signupErr.code === 125) errEl.textContent = 'That email address is not valid.';
            else if (signupErr.code === 119) errEl.textContent = 'Signups are disabled on this site. Contact the administrator.';
            else errEl.textContent = 'Could not create account: ' + (signupErr.message || 'unknown error');
          }
        }
      });
    }

    var forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', async function () {
      var email = (document.getElementById('loginEmail') || {}).value || '';
      email = email.trim().toLowerCase();
      var errEl = document.getElementById('loginError');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (errEl) errEl.textContent = 'Enter your account email first.'; return; }
      try { await Parse.User.requestPasswordReset(email); if (errEl) errEl.textContent = 'If the account exists, a password reset email has been sent.'; }
      catch (err) { if (errEl) errEl.textContent = 'Could not send reset email. Check Back4App email settings.'; }
    });

    var signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async function () {
        try { await Parse.User.logOut(); } catch (e) {}
        location.reload();
      });
    }

    var existing = Parse.User.current();
    if (existing) {
      Parse.Cloud.run('checkUserRole', { roleName: 'Landlord' }).then(function (r) {
        if (r && r.allowed) { state.user = existing; showApp(); } else { Parse.User.logOut(); }
      }).catch(function () { Parse.User.logOut(); });
    }

    /* ---------- APP ---------- */
    function showApp() {
      var loginScreen = document.getElementById('loginScreen');
      var app = document.getElementById('app');
      if (loginScreen) loginScreen.classList.add('hidden');
      if (app) app.classList.remove('hidden');
      var whoEl = document.getElementById('whoAmI');
      if (whoEl) whoEl.textContent = (state.user && state.user.get('name')) || '';
      var uploadIco = document.getElementById('uploadIco');
      if (uploadIco) uploadIco.innerHTML = icon('image');
      buildAmenityPicker();
      wireManagementToggle();
      loadMyProperties().then(renderMyListings);
    }

    function buildAmenityPicker() {
      var pick = document.getElementById('amenityPicker');
      if (!pick) return;
      pick.innerHTML = AMENITIES.map(function (a) {
        return '<span>' +
          '<input type="checkbox" class="amenity-check" id="am_' + a.key + '" value="' + a.key + '">' +
          '<label class="amenity-label" for="am_' + a.key + '">' + icon(a.key) + esc(a.label) + '</label>' +
        '</span>';
      }).join('');
    }

    function wireManagementToggle() {
      var chk = document.getElementById('fManaged');
      var priceLabel = document.getElementById('fPrice');
      var priceWrap = priceLabel ? priceLabel.closest('label') : null;
      var managedWrap = document.getElementById('managedPriceWrap');
      var managedInput = document.getElementById('fManagedPayout');
      if (!chk || !priceWrap || !managedWrap) return;

      function apply() {
        if (chk.checked) {
          priceWrap.style.display = 'none';
          if (priceLabel) priceLabel.required = false;
          managedWrap.classList.remove('hidden');
          if (managedInput) managedInput.required = true;
        } else {
          priceWrap.style.display = '';
          if (priceLabel) priceLabel.required = true;
          managedWrap.classList.add('hidden');
          if (managedInput) managedInput.required = false;
        }
      }
      chk.addEventListener('change', apply);
      apply();
    }

    async function loadMyProperties() {
      try {
        var q = new Parse.Query('Property');
        q.equalTo('owner', state.user);
        q.descending('createdAt');
        state.properties = await q.find();
        console.log('[Landlord] Loaded', state.properties.length, 'properties');
      } catch (err) {
        console.error('[Landlord] loadMyProperties failed:', err);
        state.properties = [];
      }
    }

    function countSlotsUsed() {
      return state.properties.filter(function (p) { return !p.get('managed'); }).length;
    }

    function updatePlanCard() {
      var slotsEl = document.getElementById('planSlots');
      if (!slotsEl) return;
      slotsEl.textContent = countSlotsUsed() + ' / ' + BASIC_SLOTS + ' used';
    }

    function showListings() {
      var formView = document.getElementById('formView');
      var listView = document.getElementById('listingsView');
      if (formView) formView.classList.add('hidden');
      if (listView) listView.classList.remove('hidden');
      renderMyListings();
    }

    function showForm(prop) {
      var formView = document.getElementById('formView');
      var listView = document.getElementById('listingsView');
      if (listView) listView.classList.add('hidden');
      if (formView) formView.classList.remove('hidden');

      state.editingId = prop ? prop.id : null;
      state.pendingImages = prop ? parseArray(prop.get('images')) : [];

      var formTitle = document.getElementById('formTitle');
      if (formTitle) formTitle.textContent = prop ? 'Edit listing' : 'Post a room';
      var submitBtn = document.getElementById('submitBtn');
      if (submitBtn) submitBtn.textContent = prop ? 'Save and resubmit' : 'Submit for review';

      setField('fTitle', prop ? prop.get('title') : '');
      setField('fAddress', prop ? prop.get('address') : '');
      setField('fSuburb', prop ? prop.get('suburb') : '');
      setField('fCity', prop ? prop.get('city') : 'Witbank');
      setField('fType', prop ? prop.get('type') : 'Room');
      setField('fBedrooms', prop ? prop.get('bedrooms') : 1);
      setField('fBathrooms', prop ? prop.get('bathrooms') : 0);
      setField('fDescription', prop ? prop.get('description') : '');

      var isManaged = prop ? !!prop.get('managed') : false;
      var managedChk = document.getElementById('fManaged');
      if (managedChk) managedChk.checked = isManaged;

      if (isManaged) {
        setField('fManagedPayout', prop ? prop.get('landlordPrice') : '');
        setField('fPrice', '');
      } else {
        setField('fPrice', prop ? prop.get('landlordPrice') : '');
        setField('fManagedPayout', '');
      }
      if (managedChk) managedChk.dispatchEvent(new Event('change'));

      var currentAmenities = prop ? parseArray(prop.get('amenities')) : [];
      $$('.amenity-check').forEach(function (c) { c.checked = currentAmenities.indexOf(c.value) !== -1; });

      renderPreviews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setField(id, value) {
      var el = document.getElementById(id);
      if (el) el.value = (value == null ? '' : value);
    }
    function getVal(id) {
      var el = document.getElementById(id);
      return el ? String(el.value || '').trim() : '';
    }

    var newListingBtn = document.getElementById('newListingBtn');
    if (newListingBtn) {
      newListingBtn.addEventListener('click', function () {
        if (countSlotsUsed() >= BASIC_SLOTS) {
          toast('Your Basic plan allows 2 rooms. Delete one or move another to Property Management.');
          return;
        }
        showForm(null);
      });
    }
    var emptyAddBtn = document.getElementById('emptyAddBtn');
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', function () { showForm(null); });
    var backBtn = document.getElementById('backToListings');
    if (backBtn) backBtn.addEventListener('click', showListings);
    var cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', showListings);

    var fileInput = document.getElementById('fImages');
    if (fileInput) {
      fileInput.addEventListener('click', function (e) { e.stopPropagation(); });
      fileInput.addEventListener('change', async function (e) {
        var files = Array.prototype.slice.call(e.target.files || []);
        if (!files.length) return;
        var room = 6 - state.pendingImages.length;
        if (room <= 0) { toast('You can add up to 6 photos.'); e.target.value = ''; return; }
        files = files.slice(0, room);
        toast('Uploading ' + files.length + ' photo' + (files.length === 1 ? '' : 's') + '…');
        try {
          for (var i = 0; i < files.length; i++) {
            var url = await uploadFile(files[i], 'room');
            state.pendingImages.push(url);
            renderPreviews();
          }
          toast('Photos added.');
        } catch (err) {
          console.error('[Landlord] Upload failed:', err);
          toast('Could not upload some photos.');
        }
        e.target.value = '';
      });
    }
    var uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
      uploadZone.addEventListener('click', function () { if (fileInput) fileInput.click(); });
      uploadZone.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (fileInput) fileInput.click(); }
      });
    }

    function renderPreviews() {
      var grid = document.getElementById('previewGrid');
      if (!grid) return;
      grid.innerHTML = state.pendingImages.map(function (src, i) {
        return '<div class="preview"><img src="' + esc(safeImageUrl(src, 'preview')) + '" alt="">' +
          '<button type="button" data-remove="' + i + '">×</button></div>';
      }).join('');
    }
    var previewGrid = document.getElementById('previewGrid');
    if (previewGrid) {
      previewGrid.addEventListener('click', function (e) {
        var b = e.target.closest('[data-remove]');
        if (!b) return;
        state.pendingImages.splice(Number(b.dataset.remove), 1);
        renderPreviews();
      });
    }

    /* ---------- SUBMIT LISTING ---------- */
    var listingForm = document.getElementById('listingForm');
    if (listingForm) {
      listingForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('[Landlord] ============ SUBMIT STARTED ============');

        var managedChk = document.getElementById('fManaged');
        var isManaged = managedChk ? !!managedChk.checked : false;

        var priceEl = isManaged ? document.getElementById('fManagedPayout') : document.getElementById('fPrice');
        var priceStr = priceEl ? String(priceEl.value || '').trim() : '';
        var price = Number(priceStr);
        console.log('[Landlord] price:', price, 'isManaged:', isManaged);
        if (!priceStr || !isFinite(price) || price <= 0) {
          toast('Please enter a valid monthly amount.');
          return;
        }

        var title = getVal('fTitle');
        var address = getVal('fAddress');
        var suburb = getVal('fSuburb');
        var city = getVal('fCity') || 'Witbank';
        var type = getVal('fType') || 'Room';
        var bedrooms = Number(getVal('fBedrooms')) || 0;
        var bathrooms = Number(getVal('fBathrooms')) || 0;
        var description = getVal('fDescription');

        if (!title) { toast('Please enter a listing title.'); return; }
        if (!suburb) { toast('Please enter a suburb.'); return; }

        if (!state.editingId && !isManaged && countSlotsUsed() >= BASIC_SLOTS) {
          toast('You already have 2 rooms on the Basic plan.');
          return;
        }

        var amenities = $$('.amenity-check:checked').map(function (c) { return c.value; });

        try {
          var prop;
          if (state.editingId) {
            prop = state.properties.find(function (p) { return p.id === state.editingId; });
            if (!prop) prop = await new Parse.Query('Property').get(state.editingId);
          } else {
            var P = Parse.Object.extend('Property');
            prop = new P();
            prop.set('owner', state.user);
          }

          prop.set('title', title);
          prop.set('address', address);
          prop.set('suburb', suburb);
          prop.set('city', city);
          prop.set('type', type);
          prop.set('bedrooms', bedrooms);
          prop.set('bathrooms', bathrooms);
          prop.set('landlordPrice', price);
          prop.set('description', description);
          prop.set('amenities', JSON.stringify(amenities));
          prop.set('images', JSON.stringify(state.pendingImages.length ? state.pendingImages : [placeholder('room', 'Room')]));
          prop.set('managed', isManaged);
          prop.set('status', 'pending');

          /* Private owner ACL. Public listings are exposed only through the
             getApprovedProperties Cloud Code function after admin approval. */
          var acl = new Parse.ACL();
          acl.setReadAccess(state.user.id, true);
          acl.setWriteAccess(state.user.id, true);
          prop.setACL(acl);

          console.log('[Landlord] Saving private property listing…');
          await prop.save();
          console.log('[Landlord] SAVE OK. Property id:', prop.id);
          toast(state.editingId ? 'Listing updated.' : 'Listing submitted for review.');
          await loadMyProperties();
          showListings();
        } catch (err) {
          console.error('[Landlord] SAVE FAILED:', err.code, err.message);
          var msg = (err && err.message) ? err.message : 'Unknown error';
          if (err && err.code === 119) msg = 'Back4App denied this operation. Check the Property class permissions and deploy the Room Stay Cloud Code security functions.';
          if (err && err.code === 209) msg = 'Session expired. Sign out and sign in again.';
          if (err && err.code === 100) msg = 'Not connected. Check your internet.';
          toast('Could not save listing: ' + msg);
        }
      });
    }

    function renderMyListings() {
      updatePlanCard();
      var grid = document.getElementById('myGrid');
      if (!grid) return;

      if (!state.properties.length) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
        var emp = document.getElementById('myEmpty');
        if (emp) emp.classList.remove('hidden');
        return;
      }
      grid.classList.remove('hidden');
      var emp2 = document.getElementById('myEmpty');
      if (emp2) emp2.classList.add('hidden');

      grid.innerHTML = state.properties.map(function (p) {
        var imgs = parseArray(p.get('images'));
        var img = imgs[0] || placeholder(p.id, 'Room');
        var status = p.get('status') || 'pending';
        var statusText = status === 'approved' ? 'Live' : status === 'pending' ? 'In review' : 'Not approved';
        var lp = Number(p.get('landlordPrice')) || 0;
        var pp = Number(p.get('publicPrice')) || 0;
        var isManaged = !!p.get('managed');
        var publicBox = status === 'approved' && pp
          ? '<div class="money-box public"><span>Public price</span><strong>' + money(pp) + '</strong></div>'
          : '<div class="money-box public"><span>Public price</span><strong>Pending</strong></div>';
        var actions = '';
        if (status === 'approved') actions += '<a class="btn btn-ghost" href="property.html?id=' + encodeURIComponent(p.id) + '" target="_blank">View</a>';
        actions += '<button class="btn btn-ghost" data-edit="' + esc(p.id) + '">Edit</button>';
        actions += '<button class="btn btn-danger" data-del="' + esc(p.id) + '">Delete</button>';
        return '<article class="my-card">' +
          '<div class="my-media"><img src="' + esc(safeImageUrl(img, p.id)) + '" alt="">' +
            '<span class="badge ' + esc(status) + '">' + esc(statusText) + (isManaged ? ' · Managed' : '') + '</span></div>' +
          '<div class="my-body">' +
            '<h3>' + esc(p.get('title')) + '</h3>' +
            '<p class="my-loc">' + icon('pin') + esc((p.get('suburb') || '') + ', ' + (p.get('city') || '')) + '</p>' +
            '<div class="money-row">' +
              '<div class="money-box"><span>' + (isManaged ? 'Your payout' : 'Your price') + '</span><strong>' + money(lp) + '</strong></div>' +
              publicBox +
            '</div>' +
            '<div class="my-foot">' + actions + '</div>' +
          '</div></article>';
      }).join('');
    }

    var myGrid = document.getElementById('myGrid');
    if (myGrid) {
      myGrid.addEventListener('click', async function (e) {
        var ed = e.target.closest('[data-edit]');
        if (ed) {
          var p = state.properties.find(function (x) { return x.id === ed.dataset.edit; });
          if (p) showForm(p);
          return;
        }
        var dl = e.target.closest('[data-del]');
        if (dl) {
          if (!confirm('Delete this listing?')) return;
          try {
            var p2 = state.properties.find(function (x) { return x.id === dl.dataset.del; });
            if (p2) await p2.destroy();
            toast('Deleted.');
            await loadMyProperties();
            renderMyListings();
          } catch (err) { toast('Could not delete.'); }
        }
      });
    }

    console.log('[Landlord] Boot complete.');
  }

  loadParse().then(boot).catch(function (err) {
    console.error('Room Stay: failed to load Parse', err);
  });
})();