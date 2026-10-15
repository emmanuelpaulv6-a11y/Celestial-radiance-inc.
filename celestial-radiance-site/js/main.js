/* Celestial Radiance Inc. — comportements du site (sans dépendance) */
(function () {
  'use strict';
  var D = window.CR_I18N || { fr: {}, en: {} };
  var root = document.documentElement;
  var LS = 'cr-lang';

  function safeGet() { try { return localStorage.getItem(LS); } catch (e) { return null; } }
  function safeSet(v) { try { localStorage.setItem(LS, v); } catch (e) {} }

  function t(key) { var l = root.lang === 'en' ? 'en' : 'fr'; return (D[l] && D[l][key]) || key; }

  function groupsHtml(base, l) {
    var gs = D[l][base + '.g'] || [], note = D[l][base + '.n'], cl = D[l][base + '.c'], fm = D[l][base + '.f'], h = '';
    gs.forEach(function (g) {
      h += '<div class="sub">' + esc(g.t) + '</div><ul>' + g.i.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
    });
    if (cl) h += '<p class="meta"><strong>' + esc(D[l]['lbl.c']) + ' :</strong> ' + esc(cl) + '</p>';
    if (fm) h += '<p class="meta"><strong>' + esc(D[l]['lbl.f']) + ' :</strong> ' + esc(fm) + '</p>';
    if (note) h += '<p class="note">' + esc(note) + '</p>';
    return h;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function applyLang(l) {
    if (l !== 'fr' && l !== 'en') l = 'fr';
    root.lang = l;
    var dict = D[l];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = String(v).replace('{y}', new Date().getFullYear());
    });
    document.querySelectorAll('[data-i18n-list]').forEach(function (el) {
      var arr = dict[el.getAttribute('data-i18n-list')] || [];
      el.innerHTML = arr.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('');
    });
    document.querySelectorAll('[data-i18n-groups]').forEach(function (el) {
      el.innerHTML = groupsHtml(el.getAttribute('data-i18n-groups'), l);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var p = pair.split(':');
        if (dict[p[1]] !== undefined) el.setAttribute(p[0], dict[p[1]]);
      });
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false');
    });
    var tk = root.getAttribute('data-t-title') || (document.body.classList.contains('legal') ? null : 'meta.title');
    var dk = root.getAttribute('data-t-desc') || (document.body.classList.contains('legal') ? null : 'meta.desc');
    if (tk && dict[tk]) document.title = dict[tk];
    var md = document.querySelector('meta[name="description"]');
    if (md && dk && dict[dk]) md.setAttribute('content', dict[dk]);
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', l === 'en' ? 'en_CA' : 'fr_CA');
    document.dispatchEvent(new Event('cr-lang'));
  }

  // Langue : ?lang=en > choix mémorisé > français
  var qs = /[?&]lang=(fr|en)/.exec(location.search);
  var initial = qs ? qs[1] : (safeGet() || 'fr');
  if (initial !== 'fr') applyLang(initial); else root.lang = 'fr';
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      safeSet(l);
      applyLang(l);
    });
  });
  // année du pied de page (FR statique déjà à jour au build)
  document.querySelectorAll('[data-i18n="foot.copy"]').forEach(function (el) {
    el.textContent = String(D[root.lang === 'en' ? 'en' : 'fr']['foot.copy']).replace('{y}', new Date().getFullYear());
  });

  // Menu mobile
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); }
    });
  }

  // Apparition au défilement
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Bouton flottant + menu actif
  var floatBtn = document.querySelector('.float-cta');
  var quote = document.getElementById('devis');
  var links = document.querySelectorAll('.nav a[href^="#"]');
  var sections = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    if (floatBtn && quote) {
      var past = window.scrollY > 700;
      var q = quote.getBoundingClientRect();
      var inQuote = q.top < window.innerHeight * 0.6 && q.bottom > 0;
      floatBtn.classList.toggle('show', past && !inQuote);
    }
    var y = window.scrollY + 140, cur = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
  }
  var fp = document.getElementById('float-promo');
  var onPromoPage = !!document.querySelector('.nav a[aria-current="page"][href*="promotions"], .nav a[aria-current="page"][data-go="promotions.html"]');
  if (fp && onPromoPage) fp.hidden = true;
  function promoFloat() { if (fp && !fp.hidden) fp.classList.toggle('show', window.scrollY > 300); }
  window.addEventListener('scroll', promoFloat, { passive: true });
  promoFloat();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Préremplissage : ?service=p5 (devis) ou ?poste=stage (candidature) ; liens internes data-solution / data-poste
  function setVal(id, v) { var el = document.getElementById(id); if (el && v) el.value = v; }
  var params = new URLSearchParams(location.search);
  setVal('service', params.get('service'));
  setVal('poste', params.get('poste'));
  var itemEl = document.getElementById('item');
  if (itemEl && params.get('item')) { itemEl.value = params.get('item'); document.getElementById('item-row').hidden = false; }
  var svcEl = document.getElementById('service');
  if (svcEl && itemEl) svcEl.addEventListener('change', function () { if (!params.get('item')) { itemEl.value = ''; document.getElementById('item-row').hidden = true; } });
  document.querySelectorAll('[data-solution]').forEach(function (a) {
    a.addEventListener('click', function () { setVal('service', a.getAttribute('data-solution')); });
  });
  document.querySelectorAll('[data-poste]').forEach(function (a) {
    a.addEventListener('click', function () { setVal('poste', a.getAttribute('data-poste')); });
  });

  // Pack / promotion choisi : le titre de la carte est transmis au formulaire de devis (?item=)
  window.crItemFor = function (a) {
    var card = a.closest && a.closest('.pack, .promo, .forfait'), h = card && card.querySelector('h3');
    return h ? h.textContent.trim() : '';
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#devis"]');
    var it = a && window.crItemFor(a);
    if (!it) return;
    var parts = a.getAttribute('href').split('#');
    parts[0] = parts[0].replace(/([?&])item=[^&]*&?/, '$1').replace(/[?&]$/, '');
    a.setAttribute('href', parts[0] + (parts[0].indexOf('?') > -1 ? '&' : '?') + 'item=' + encodeURIComponent(it) + '#' + parts[1]);
  });

  // Bandeau d'annonce (masquable, mémorisé par campagne)
  var bar = document.getElementById('promo-bar');
  if (bar) {
    var key = 'cr-promo-' + (bar.getAttribute('data-campaign') || 'x');
    var dismissed = false;
    try { dismissed = localStorage.getItem(key) === '1'; } catch (e) {}
    if (dismissed) bar.hidden = true;
    var x = bar.querySelector('.promo-x');
    if (x) x.addEventListener('click', function () {
      bar.hidden = true;
      try { localStorage.setItem('cr-promo-' + (bar.getAttribute('data-campaign') || 'x'), '1'); } catch (e) {}
    });
  }

  // Formulaires (devis et candidature)
  document.querySelectorAll('form.js-form').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var okKey = form.getAttribute('data-ok') || 'f.ok';
    function say(txt, cls) { if (msg) { msg.textContent = txt; msg.className = 'form-msg ' + (cls || ''); } }
    function labelOf(el) {
      var lb = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
      if (!lb) return el.name;
      var sp = lb.querySelector('span');
      return (sp || lb).textContent.trim();
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return; // anti-spam
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !String(f.value).trim();
        if (!bad && f.type === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value);
        if (f.type !== 'checkbox') f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) { say(t('f.required'), 'err'); return; }

      var data = new FormData(form);
      var configured = form.action.indexOf('YOUR_FORM_ID') === -1;
      if (configured) {
        say(t('f.sending'), '');
        fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
          .then(function (r) { if (r.ok) { say(t(okKey), 'ok'); form.reset(); } else { say(t('f.err'), 'err'); } })
          .catch(function () { say(t('f.err'), 'err'); });
      } else {
        // Repli : ouvre le courriel de l'utilisateur, prérempli
        var lines = [];
        Array.prototype.forEach.call(form.elements, function (el) {
          if (!el.name || el.name.charAt(0) === '_' || el.name === 'consentement' || el.type === 'submit' || el.type === 'button') return;
          var v = el.tagName === 'SELECT' ? (el.options[el.selectedIndex] ? el.options[el.selectedIndex].textContent : '') : el.value;
          if (!String(v).trim()) return;
          lines.push(labelOf(el) + ' : ' + v);
        });
        var pre = form.getAttribute('data-subject-' + (root.lang === 'en' ? 'en' : 'fr')) || '';
        say(t('f.mailto'), 'ok');
        window.location.href = 'mailto:admin@celestialradiance.ca?subject=' + encodeURIComponent(pre + (data.get('nom') || '')) + '&body=' + encodeURIComponent(lines.join('\n'));
      }
    });
    form.querySelectorAll('input,select,textarea').forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('invalid'); });
    });
  });
})();
