/* Room Stay — public site (self-contained, loads Parse automatically) */
(function () {
  'use strict';

  function loadParse() {
    if (window.Parse) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/parse@5.3.0/dist/parse.min.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load Parse SDK')); };
      document.head.appendChild(s);
    });
  }

  function boot() {
    Parse.initialize('yZd1tyOC06p5XRKmUwNkaip9UUMoQoteFPKcrTSe', '1pZ0JnP06gfyVGj6CHXWREo3rqsu7HmLixCCxgrk');
    Parse.serverURL = 'https://parseapi.back4app.com/';

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
      home: svg('<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V20h12V9.5"/>'),
      bed: svg('<path d="M3 18v-8"/><path d="M3 12h18v6"/><path d="M21 18v-4a3 3 0 0 0-3-3h-6v3"/><circle cx="7" cy="10" r="2"/>'),
      bath: svg('<path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3z"/><path d="M6 12V6a2 2 0 0 1 3.5-1.3"/><path d="M7 19l-1 2"/><path d="M17 19l1 2"/>'),
      clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
      phone: svg('<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'),
      mail: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>'),
      image: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 15.5 16 11l-8 9"/>'),
      filter: svg('<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>')
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
    function amenityLabel(k) {
      for (var i = 0; i < AMENITIES.length; i++) if (AMENITIES[i].key === k) return AMENITIES[i].label;
      return k;
    }

    var WITBANK_SUBURBS = ['Witbank Central','Del Judor','Reyno Ridge','Die Heuwel','Model Park','Tasbet Park','Klarinet','Emalahleni','Middelburg','Hendrina','Kriel','Bethal'];

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function escapeHtml(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
      });
    }
    function safeImageUrl(value) {
      var raw = String(value == null ? '' : value).trim();
      if (/^https:\/\//i.test(raw) || /^http:\/\//i.test(raw)) return raw;
      return '';
    }
    function imageAttr(value, fallback) {
      return escapeHtml(safeImageUrl(value) || fallback || '');
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
    function parseArray(v) {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') { try { var r = JSON.parse(v); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
      return [];
    }

    async function fetchApproved() {
      var q = new Parse.Query('Property');
      q.equalTo('status', 'approved');
      q.descending('createdAt');
      q.limit(200);
      try { return await q.find(); } catch (e) { console.error(e); throw e; }
    }
    async function fetchById(id) { try { return await new Parse.Query('Property').get(id); } catch (e) { return null; } }
    async function fetchAgent(id) { if (!id) return null; try { return await new Parse.Query('Agent').get(id); } catch (e) { return null; } }
    async function fetchSettings() { try { var r = await new Parse.Query('SiteSettings').limit(1).find(); return r[0] || null; } catch (e) { return null; } }

    async function submitEnquiry(data) {
      var Enq = Parse.Object.extend('Enquiry');
      var e = new Enq();
      Object.keys(data).forEach(function (k) { e.set(k, data[k]); });
      var acl = new Parse.ACL();
      acl.setPublicReadAccess(false);
      e.setACL(acl);
      return await e.save();
    }
    function toPlain(p) {
      var ag = p.get('agent');
      return {
        id: p.id, title: p.get('title') || '', description: p.get('description') || '',
        suburb: p.get('suburb') || '', city: p.get('city') || '', address: p.get('address') || '',
        type: p.get('type') || 'Room',
        bedrooms: Number(p.get('bedrooms')) || 0,
        bathrooms: Number(p.get('bathrooms')) || 0,
        landlordPrice: Number(p.get('landlordPrice')) || 0,
        publicPrice: Number(p.get('publicPrice')) || 0,
        amenities: parseArray(p.get('amenities')),
        images: parseArray(p.get('images')),
        agentId: ag ? ag.id : null,
        status: p.get('status') || 'pending',
        managed: !!p.get('managed'),
        createdAt: p.createdAt ? p.createdAt.getTime() : Date.now()
      };
    }

    if (document.getElementById('detailRoot')) initProperty();
    else if (document.getElementById('grid')) initIndex();

    async function initIndex() {
      var state = { q:'', type:'all', maxPrice:0, sort:'newest', amenities:[] };

      $('#searchIcon').innerHTML = icon('search');
      $('#emptyIcon').innerHTML = icon('search');
      $('#howIco1').innerHTML = icon('filter');
      $('#howIco2').innerHTML = icon('image');
      $('#howIco3').innerHTML = icon('phone');
      var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

      var settings = await fetchSettings();
      if (settings && settings.get('heroImage')) {
        var hv = document.getElementById('heroVisual');
        if (hv && safeImageUrl(settings.get('heroImage'))) { hv.innerHTML = ''; var img = document.createElement('img'); img.src = safeImageUrl(settings.get('heroImage')); img.alt = 'Room Stay hero'; hv.appendChild(img); }
      }

      $('#amenityChips').innerHTML = AMENITIES.map(function (a) {
        return '<button type="button" class="chip" data-amenity="' + a.key + '">' +
               '<span class="chip-ico">' + icon(a.key) + '</span>' + escapeHtml(a.label) + '</button>';
      }).join('');

      var results = await fetchApproved();
      var all = results.map(toPlain);

      var agentCache = {};
      try {
        var publicAgents = await new Parse.Query('Agent').find();
        publicAgents.forEach(function (a) {
          agentCache[a.id] = { name: a.get('name') || '', phone: a.get('phone') || '', email: a.get('email') || '' };
        });
      } catch (agentError) { console.warn('Agent details unavailable.'); }
      async function getAgent(id) { return id && agentCache[id] ? agentCache[id] : null; }

      function matches(p) {
        if (state.type !== 'all' && p.type !== state.type) return false;
        if (state.maxPrice && Number(p.publicPrice) > state.maxPrice) return false;
        if (state.q) {
          var hay = [p.title, p.suburb, p.city, p.description].join(' ').toLowerCase();
          if (hay.indexOf(state.q) === -1) return false;
        }
        for (var i = 0; i < state.amenities.length; i++) {
          if ((p.amenities || []).indexOf(state.amenities[i]) === -1) return false;
        }
        return true;
      }
      function sorted(list) {
        var copy = list.slice();
        if (state.sort === 'price-asc') copy.sort(function (a,b) { return a.publicPrice - b.publicPrice; });
        else if (state.sort === 'price-desc') copy.sort(function (a,b) { return b.publicPrice - a.publicPrice; });
        else copy.sort(function (a,b) { return (b.createdAt || 0) - (a.createdAt || 0); });
        return copy;
      }

      async function render() {
        var filtered = sorted(all.filter(matches));
        var grid = $('#grid');
        var cards = [];
        for (var i = 0; i < filtered.length; i++) {
          var p = filtered[i];
          var agent = await getAgent(p.agentId);
          var iconsHtml = (p.amenities || []).slice(0, 5).map(function (k) {
            return '<span class="amenity" title="' + escapeHtml(amenityLabel(k)) + '">' + icon(k) + '</span>';
          }).join('');
          var cover = imageAttr((p.images && p.images[0]) || '', placeholder(p.id, 'Room'));
          cards.push('<article class="card" data-id="' + escapeHtml(p.id) + '" tabindex="0">' +
            '<div class="card-media"><img src="' + cover + '" alt="' + escapeHtml(p.title) + '" loading="lazy">' +
              '<span class="price-pill">' + money(p.publicPrice) + '<small>/month</small></span></div>' +
            '<div class="card-body">' +
              '<h3 class="card-title">' + escapeHtml(p.title) + '</h3>' +
              '<p class="card-loc">' + icon('pin') + escapeHtml(p.suburb + ', ' + p.city) + '</p>' +
              '<div class="amenities">' + iconsHtml + '</div>' +
              '<div class="card-foot"><span>' + escapeHtml(p.type) + ' · ' + p.bedrooms + ' bed</span>' +
              '<span>' + (agent ? escapeHtml((agent.name || 'Agent').trim().split(/\\s+/)[0]) : 'Room Stay') + '</span></div>' +
            '</div></article>');
        }
        if (thisRender !== renderVersion) return;
        grid.innerHTML = cards.join('');
        $('#resultCount').textContent = filtered.length + (filtered.length === 1 ? ' room' : ' rooms');
        if (!filtered.length) { grid.classList.add('hidden'); $('#emptyState').classList.remove('hidden'); }
        else { grid.classList.remove('hidden'); $('#emptyState').classList.add('hidden'); }
      }

      $('#searchForm').addEventListener('submit', function (e) {
        e.preventDefault();
        state.q = $('#searchInput').value.trim().toLowerCase();
        state.type = $('#typeSelect').value;
        state.maxPrice = Number($('#priceSelect').value) || 0;
        render();
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      $('#searchInput').addEventListener('input', function () { state.q = this.value.trim().toLowerCase(); render(); });
      $('#typeSelect').addEventListener('change', function () { state.type = this.value; render(); });
      $('#priceSelect').addEventListener('change', function () { state.maxPrice = Number(this.value) || 0; render(); });
      $('#sortSelect').addEventListener('change', function () { state.sort = this.value; render(); });
      $('#amenityChips').addEventListener('click', function (e) {
        var c = e.target.closest('.chip'); if (!c) return;
        var k = c.getAttribute('data-amenity');
        var idx = state.amenities.indexOf(k);
        if (idx === -1) state.amenities.push(k); else state.amenities.splice(idx, 1);
        c.classList.toggle('active'); render();
      });
      var resetFilters = $('#resetFilters');
      if (resetFilters) resetFilters.addEventListener('click', function () {
        state.q = ''; state.type = 'all'; state.maxPrice = 0; state.sort = 'newest'; state.amenities = [];
        $('#searchInput').value = ''; $('#typeSelect').value = 'all'; $('#priceSelect').value = '0'; $('#sortSelect').value = 'newest';
        $$('#amenityChips .chip').forEach(function (c) { c.classList.remove('active'); });
        render();
      });
      $('#grid').addEventListener('click', function (e) {
        var c = e.target.closest('.card'); if (c) location.href = 'property.html?id=' + encodeURIComponent(c.dataset.id);
      });
      $('#grid').addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var c = e.target.closest('.card'); if (c) location.href = 'property.html?id=' + encodeURIComponent(c.dataset.id);
      });

      render();
    }

    async function initProperty() {
      var root = $('#detailRoot');
      var id = new URLSearchParams(location.search).get('id');
      var yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

      function notFound(msg) {
        root.innerHTML = '<div class="empty"><div class="empty-icon">' + icon('search') + '</div>' +
          '<h3>' + escapeHtml(msg) + '</h3><p>This room may have been rented or removed.</p>' +
          '<a class="btn btn-dark" href="index.html">Back to all rooms</a></div>';
      }

      if (!id) return notFound('Room not found');
      var propObj = await fetchById(id);
      if (!propObj || propObj.get('status') !== 'approved') return notFound(propObj ? 'This room is not live yet' : 'Room not found');

      var p = toPlain(propObj);
      var agentObj = p.agentId ? await fetchAgent(p.agentId) : null;
      var agent = agentObj ? { name: agentObj.get('name'), phone: agentObj.get('phone'), email: agentObj.get('email') } : null;
      var images = (p.images && p.images.length) ? p.images : [placeholder(p.id, 'Room')];
      var amenityItems = (p.amenities || []).map(function (k) {
        return '<div class="amenity-item">' + icon(k) + '<span>' + escapeHtml(amenityLabel(k)) + '</span></div>';
      }).join('');
      var thumbs = images.map(function (src, i) {
        return '<div class="thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">' +
               '<img src="' + imageAttr(src, placeholder(p.id, 'Room')) + '" alt="Photo ' + (i + 1) + '"></div>';
      }).join('');

      var agentBlock = agent
        ? '<div class="agent-card"><h3>' + escapeHtml(agent.name) + '</h3>' +
          '<p class="agent-role">Your Room Stay agent for this room</p>' +
          '<div class="agent-line">' + icon('phone') + escapeHtml(agent.phone) + '</div>' +
          (agent.email ? '<div class="agent-line">' + icon('mail') + escapeHtml(agent.email) + '</div>' : '') + '</div>'
        : '<div class="agent-card"><h3>Room Stay support</h3><p class="agent-role">Contact us and we will connect you</p>' +
          '<div class="agent-line">' + icon('mail') + 'hello@roomstay.co.za</div></div>';

      var baths = Number(p.bathrooms) || 0;
      var bathChip = baths > 0 ? '<span class="meta-chip">' + icon('bath') + baths + ' bathroom' + (baths > 1 ? 's' : '') + '</span>' : '';

      function timeAgo(ts) {
        if (!ts) return 'recently';
        var d = Math.floor((Date.now() - ts) / 86400000);
        if (d <= 0) return 'today'; if (d === 1) return 'yesterday';
        if (d < 30) return d + ' days ago';
        var m = Math.floor(d / 30); return m + (m === 1 ? ' month ago' : ' months ago');
      }

      root.innerHTML = '<div class="detail-grid"><div class="detail-main">' +
        '<div class="gallery-main"><img id="mainImage" src="' + imageAttr(images[0], placeholder(p.id, 'Room')) + '" alt="' + escapeHtml(p.title) + '"></div>' +
        '<div class="gallery-thumbs" id="thumbs">' + thumbs + '</div>' +
        '<h1 class="detail-title">' + escapeHtml(p.title) + '</h1>' +
        '<p class="detail-loc">' + icon('pin') + escapeHtml(p.suburb + ', ' + p.city) + '</p>' +
        '<div class="meta-row">' +
          '<span class="meta-chip">' + icon('home') + escapeHtml(p.type) + '</span>' +
          '<span class="meta-chip">' + icon('bed') + p.bedrooms + ' bedroom' + (p.bedrooms > 1 ? 's' : '') + '</span>' +
          bathChip +
          (p.managed ? '<span class="meta-chip" style="background:var(--accent-soft);color:var(--accent);border-color:var(--accent)">Managed by Room Stay</span>' : '') +
          '<span class="meta-chip">' + icon('clock') + 'Listed ' + timeAgo(p.createdAt) + '</span>' +
        '</div>' +
        '<h2 class="section-title">About this room</h2>' +
        '<p class="desc">' + escapeHtml(p.description || 'No description provided.') + '</p>' +
        '<h2 class="section-title">What\'s included</h2>' +
        (amenityItems ? '<div class="amenity-grid">' + amenityItems + '</div>' : '<p class="desc">No extra amenities listed.</p>') +
        '</div><aside class="aside">' +
          '<div class="price-card"><div class="price-big">' + money(p.publicPrice) + ' <small>/month</small></div>' +
          '<p class="price-note">' + (p.managed ? 'Price includes rent and management fee. Deposit confirmed at viewing.' : 'Deposit and lease terms confirmed at viewing.') + '</p>' +
          '<button class="btn btn-primary" id="bookBtn">Book a viewing</button></div>' +
          agentBlock +
        '</aside></div>';

      $('#thumbs').addEventListener('click', function (e) {
        var t = e.target.closest('.thumb'); if (!t) return;
        var i = Number(t.dataset.index);
        $('#mainImage').src = safeImageUrl(images[i]) || placeholder(p.id, 'Room');
        $$('.thumb').forEach(function (x) { x.classList.toggle('active', x === t); });
      });

      var modal = document.getElementById('bookingModal');
      var form = document.getElementById('bookingForm');
      var closeBtn = document.getElementById('closeBooking');

      function openModal() { if (!modal) return; modal.classList.remove('hidden'); document.body.style.overflow = 'hidden';
        var m = document.getElementById('bookMoveIn'); if (m) var now = new Date(); m.min = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-'); }
      function closeModal() { if (!modal) return; modal.classList.add('hidden'); document.body.style.overflow = ''; }

      $('#bookBtn').addEventListener('click', openModal);
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

      if (form) form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var moveIn = document.getElementById('bookMoveIn').value;
        if (!moveIn) { toast('Please choose a move-in date.'); return; }
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        try {
          await submitEnquiry({
            property: propObj,
            propertyTitle: p.title,
            propertyImage: (p.images && p.images[0]) || null,
            agent: agentObj || null,
            agentName: agent ? agent.name : null,
            agentPhone: agent ? agent.phone : null,
            tenantName: document.getElementById('bookName').value.trim(),
            tenantPhone: document.getElementById('bookPhone').value.trim(),
            tenantEmail: document.getElementById('bookEmail').value.trim(),
            people: Number(document.getElementById('bookPeople').value) || 1,
            employment: document.getElementById('bookEmployment').value,
            moveInDate: moveIn,
            status: 'new'
          });
          form.reset();
          closeModal();
          var who = agent ? (agent.name || 'Agent').trim().split(/\\s+/)[0] : 'the Room Stay team';
          toast('Request sent to ' + who + '. They will call you shortly.');
        } catch (err) {
          console.error(err);
          toast('Could not send request. Try again.');
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = 'Send request'; }
        }
      });
    }
  }

  loadParse().then(boot).catch(function (err) { console.error('Room Stay: failed to load Parse', err); });
})();