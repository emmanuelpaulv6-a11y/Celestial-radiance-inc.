/* Celestial Radiance Inc. — contenu piloté par Google Sheets (promotions, packs, plats, offres, bandeau) */
(function () {
  'use strict';
  var CFG = (window.CR_CONFIG && window.CR_CONFIG.sheets) || {};
  var root = document.documentElement;
  var data = {};   // clé -> lignes actives
  var okAny = false;

  function lang() { return root.lang === 'en' ? 'en' : 'fr'; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pick(r, base) { var v = r[base + '_' + lang()]; return (v && v.trim()) ? v.trim() : (r[base + '_fr'] || r[base] || '').trim(); }

  var S = {
    fr: { none: 'Aucune annonce pour le moment. Revenez bientôt.', apply: 'Postuler', quote: 'Demander un devis', order: 'Demander ce pack', until: 'Jusqu’au ', sub: 'Sur devis' },
    en: { none: 'Nothing to show right now. Please check back soon.', apply: 'Apply', quote: 'Request a quote', order: 'Request this pack', until: 'Until ', sub: 'On quote' }
  };
  function s(k) { return S[lang()][k]; }

  // --- CSV ---
  function parseCSV(txt) {
    var rows = [], row = [], f = '', q = false, i, c;
    txt = txt.replace(/^﻿/, '');
    for (i = 0; i < txt.length; i++) {
      c = txt[i];
      if (q) {
        if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).filter(function (r) { return r.some(function (x) { return x.trim(); }); }).map(function (r) {
      var o = {}; head.forEach(function (h, j) { o[h] = (r[j] || '').trim(); }); return o;
    });
  }
  function isActive(r) {
    var a = (r.actif || 'oui').toLowerCase();
    if (a === 'non' || a === 'no' || a === 'false' || a === '0') return false;
    if (r.date_fin && /^\d{4}-\d{2}-\d{2}$/.test(r.date_fin)) {
      var end = new Date(r.date_fin + 'T23:59:59');
      if (end < new Date()) return false;
    }
    return true;
  }
  function yes(v) { v = (v || '').toLowerCase(); return v === 'oui' || v === 'yes' || v === 'true' || v === '1'; }
  function fmtDate(d) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '')) return '';
    try { return new Date(d + 'T12:00:00').toLocaleDateString(lang() === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return d; }
  }
  function svc(v) { return /^(p[1-5]|autre)$/.test(v || '') ? v : 'p5'; }

  // --- rendus ---
  var R = {
    promos: function (rows) {
      return rows.map(function (r) {
        var v = pick(r, 'validite') || (r.date_fin ? s('until') + fmtDate(r.date_fin) : '');
        return '<article class="card promo in"><div class="promo-head">' + (pick(r, 'etiquette') ? '<span class="tag tag-gold">' + esc(pick(r, 'etiquette')) + '</span>' : '') + '</div>' +
          '<h3>' + esc(pick(r, 'titre')) + '</h3><p>' + esc(pick(r, 'description')) + '</p>' +
          (v ? '<div class="promo-valid">' + esc(v) + '</div>' : '') +
          '<a href="index.html?service=' + svc(r.service) + '#devis" class="lnk-azure">' + esc(s('quote')) + '</a></article>';
      }).join('');
    },
    packs: function (rows) {
      return rows.map(function (r) {
        var items = pick(r, 'contenu').split(';').map(function (x) { return x.trim(); }).filter(Boolean);
        return '<article class="card pack in"><div class="pack-top"><div class="pack-ph" aria-hidden="true"></div></div>' +
          '<h3>' + esc(pick(r, 'titre')) + '</h3><p>' + esc(pick(r, 'description')) + '</p>' +
          (items.length ? '<ul class="pack-items">' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' : '') +
          (pick(r, 'duree') ? '<div class="pack-meta">' + esc(pick(r, 'duree')) + '</div>' : '') +
          '<div class="pack-price">' + esc(pick(r, 'prix') || s('sub')) + '</div>' +
          '<a href="index.html?service=' + svc(r.service || 'p5') + '#devis" class="lnk-azure">' + esc(s('order')) + '</a></article>';
      }).join('');
    },
    plats: function (rows) {
      return rows.map(function (r) {
        var ph = (r.photo || '').trim();
        return '<div class="dish"><div class="dish-ph" aria-hidden="true">' + (ph ? '<img src="assets/plats/' + esc(ph) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</div><div class="dish-t"><strong>' + esc(pick(r, 'nom')) + '</strong>' + (pick(r, 'description') ? '<span>' + esc(pick(r, 'description')) + '</span>' : '') + '</div>' + (r.prix ? '<em>' + esc(r.prix) + '</em>' : '') + '</div>';
      }).join('');
    },
    equipe: function (rows) {
      return rows.slice().sort(function (a, b) { return (parseFloat(a.ordre) || 99) - (parseFloat(b.ordre) || 99); }).map(function (r, i) {
        var ph = (r.photo || '').trim();
        return '<article class="card member in"><div class="member-ph" aria-hidden="true">' + (ph ? '<img src="assets/team/' + esc(ph) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</div>' +
          '<h3>' + esc(r.nom) + '</h3><div class="member-role">' + esc(pick(r, 'titre')) + '</div>' +
          (pick(r, 'bio') ? '<p>' + esc(pick(r, 'bio')) + '</p>' : '') + '</article>';
      }).join('');
    },
    offres: function (rows) {
      return rows.map(function (r) {
        var type = /stage|intern/i.test(r.type) ? 'stage' : 'emploi';
        var tl = type === 'stage' ? (lang() === 'en' ? 'Internship' : 'Stage') : (lang() === 'en' ? 'Job' : 'Emploi');
        var meta = [pick(r, 'lieu'), pick(r, 'statut'), r.date_fin ? (lang() === 'en' ? 'Apply by ' : 'Candidature avant le ') + fmtDate(r.date_fin) : ''].filter(Boolean).join(' · ');
        return '<article class="card job in"><div class="promo-head"><span class="tag tag-gold">' + tl + '</span></div>' +
          '<h3>' + esc(pick(r, 'titre')) + '</h3>' + (meta ? '<div class="job-meta">' + esc(meta) + '</div>' : '') +
          '<p>' + esc(pick(r, 'description')) + '</p>' +
          '<a href="#candidature" class="lnk-azure" data-poste="' + type + '" data-titre="' + esc(pick(r, 'titre')) + '">' + esc(s('apply')) + '</a></article>';
      }).join('');
    }
  };

  function render() {
    document.querySelectorAll('[data-sheet]').forEach(function (el) {
      var k = el.getAttribute('data-sheet');
      if (!data[k]) return;
      el.innerHTML = data[k].length ? R[k](data[k]) : '<p class="fine">' + esc(s('none')) + '</p>';
    });
    renderBanner();
  }

  function bar0() { return document.getElementById('promo-bar'); }
  function renderBanner() {
    if (!data.promos) return;
    var fpb = document.getElementById('float-promo');
    var b = data.promos.filter(function (r) { return yes(r.banniere); })[0] || data.promos[0];
    if (!b) { if (fpb) fpb.hidden = true; if (bar0()) bar0().hidden = true; return; }   // aucune promotion en cours
    var bar = bar0();
    if (!bar) return;
    var key = 'cr-promo-' + (b.id || pick({ titre_fr: b.titre_fr }, 'titre')).replace(/\W+/g, '-').slice(0, 40);
    bar.setAttribute('data-campaign', b.id || key);
    var dismissed = false;
    try { dismissed = localStorage.getItem('cr-promo-' + (b.id || key)) === '1'; } catch (e) {}
    bar.hidden = dismissed;
    var inner = bar.querySelector('.promo-in');
    if (inner) {
      var star = inner.querySelector('svg');
      inner.innerHTML = (star ? star.outerHTML : '') + '<strong>' + esc(pick(b, 'etiquette') || (lang() === 'en' ? 'Promotion' : 'Promotion')) + '</strong><span>' + esc(pick(b, 'titre')) + '</span><a href="promotions.html">' + (lang() === 'en' ? 'See offers' : 'Voir les offres') + '</a>';
    }
  }

  // Clic « Postuler » : préremplit type + intitulé (liens générés dynamiquement)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-titre]');
    if (!a) return;
    var p = document.getElementById('poste'), i = document.getElementById('intitule');
    if (p && a.getAttribute('data-poste')) p.value = a.getAttribute('data-poste');
    if (i) i.value = a.getAttribute('data-titre');
  });

  document.addEventListener('cr-lang', function () { if (okAny) render(); });

  var pending = 0;
  function done() {
    if (--pending > 0) return;
    root.classList.remove('promo-pending');
    if (CFG.promos && !data.promos) { // adresse configurée mais tableur injoignable : on masque
      var f0 = document.getElementById('float-promo'); if (f0) f0.hidden = true;
      if (bar0()) bar0().hidden = true;
    }
    if (okAny) {
      document.querySelectorAll('.example-flag').forEach(function (el) { el.hidden = true; });
      render();
    }
  }
  if (CFG.promos) root.classList.add('promo-pending');
  Object.keys(CFG).forEach(function (k) {
    var url = CFG[k];
    if (!url || !R[k]) return;
    var needed = document.querySelector('[data-sheet="' + k + '"]') || (k === 'promos' && document.getElementById('promo-bar'));
    if (!needed) return;
    pending++;
    fetch(url).then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (t) { data[k] = parseCSV(t).filter(isActive); okAny = true; })
      .catch(function () { /* repli : contenu d'exemple conservé */ })
      .then(done);
  });
  if (!pending) root.classList.remove('promo-pending');
})();
