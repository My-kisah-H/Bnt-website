/* ==========================================================================
   Yayasan Bhakti Nusa Tenggara (BNT) — script.js
   Daftar isi:
   1  CONFIG          — SATU-SATUNYA tempat mengisi data resmi (placeholder dulu)
   2  Utilitas & ikon
   3  Foto / placeholder
   4  Komponen UI       (toast, reveal, parallax, counter, carousel, lightbox, nav)
   5  Halaman           (home, program, kegiatan, transparansi, donasi, kontak)
   6  Router & transisi
   7  Init
   --------------------------------------------------------------------------
   Catatan pengembangan dinamis: struktur CONFIG.programs / activities / reports
   sengaja dibuat mirip tabel database. Nanti cukup ganti sumbernya dari
   array statis menjadi fetch() ke API (lihat Api.load di bagian 1).
   ========================================================================== */
(() => {
  'use strict';

  /* ======================================================================
     1. CONFIG
     Kosongkan = tampil sebagai placeholder. Jangan isi data yang belum resmi.
     ====================================================================== */
  const CONFIG = {
    contact: {
      whatsapp: '',            // format internasional tanpa +, contoh: '62812xxxxxxx'
      whatsappDisplay: '',     // contoh tampilan: '0812-xxxx-xxxx'
      email: '',
      address: '',
      socials: { instagram: '', facebook: '', youtube: '', tiktok: '' }  // isi URL lengkap
    },
    legal:   { akta: '', sk: '', npwp: '' },
    finance: { received: '', distributed: '', operational: '' },

    // Rekening resmi: [{ bank: 'Nama Bank', number: '123456', holder: 'Yayasan Bhakti Nusa Tenggara' }]
    banks: [],

    // Statistik: isi value (angka) bila data resmi sudah ada. null = tampil "—".
    stats: [
      { label: 'Penerima manfaat',            value: null, suffix: '' },
      { label: 'Hewan kurban tersalurkan',    value: null, suffix: '' },
      { label: 'Aksi tanggap bencana',        value: null, suffix: '' },
      { label: 'Titik layanan di NTT',        value: null, suffix: '' }
    ],

    // Foto: isi path/URL gambar. Kosong = ilustrasi placeholder.
    // Kunci: hero, identitas, tentang, program-<slug>
    photos: {
      hero: '', identitas: '', tentang: '',
      'program-penyaluran-kurban': '', 'program-tanggap-bencana': '', 'program-sosial-keagamaan': ''
    },

    programs: [
      {
        slug: 'penyaluran-kurban', title: 'Penyaluran Kurban', tone: 'green', icon: 'moon',
        short: 'Distribusi hewan kurban kepada masyarakat yang membutuhkan di Nusa Tenggara Timur.',
        intro: 'Program Penyaluran Kurban menghubungkan para pekurban dengan masyarakat yang membutuhkan di Nusa Tenggara Timur, agar amanah kurban sampai dan manfaatnya benar-benar dirasakan.',
        points: [
          'Distribusi hewan kurban kepada masyarakat yang membutuhkan.',
          'Dokumentasi penyaluran yang dapat dilihat oleh para pekurban.',
          'Informasi program dan cara berpartisipasi yang jelas dan mudah.'
        ],
        steps: [
          ['Pilih program', 'Pilih Penyaluran Kurban pada halaman donasi.'],
          ['Hubungi admin resmi', 'Tanyakan informasi paket dan ketentuan lewat WhatsApp resmi yayasan.'],
          ['Lakukan pembayaran', 'Transfer ke rekening resmi yayasan, lalu konfirmasi lewat WhatsApp.'],
          ['Terima dokumentasi', 'Pantau dokumentasi penyaluran pada halaman Kegiatan dan Transparansi.']
        ],
        category: 'kurban'
      },
      {
        slug: 'tanggap-bencana', title: 'Tanggap Bencana', tone: 'blue', icon: 'lifebuoy',
        short: 'Respons cepat terhadap bencana alam dan kondisi darurat, disertai penggalangan bantuan kemanusiaan.',
        intro: 'Ketika bencana alam atau kondisi darurat terjadi, kami berupaya hadir dan menggalang bantuan kemanusiaan agar kebutuhan mendesak masyarakat terdampak dapat segera terjawab.',
        points: [
          'Respons terhadap bencana alam dan kondisi darurat.',
          'Penggalangan bantuan kemanusiaan dari para donatur.',
          'Dokumentasi aksi lapangan sebagai bentuk pertanggungjawaban.'
        ],
        steps: [
          ['Pilih program', 'Pilih Tanggap Bencana pada halaman donasi.'],
          ['Salurkan bantuan', 'Transfer ke rekening resmi yayasan.'],
          ['Konfirmasi', 'Kirim bukti transfer lewat WhatsApp resmi.'],
          ['Pantau aksi lapangan', 'Lihat dokumentasi aksi pada halaman Kegiatan.']
        ],
        category: 'bencana'
      },
      {
        slug: 'sosial-keagamaan', title: 'Sosial dan Keagamaan', tone: 'orange', icon: 'users',
        short: 'Kegiatan sosial masyarakat, kepedulian terhadap sesama, serta program keagamaan.',
        intro: 'Program ini merangkul kegiatan sosial dan keagamaan di tengah masyarakat — mempererat kebersamaan sambil memastikan bantuan dan kepedulian sampai kepada sesama.',
        points: [
          'Kegiatan sosial masyarakat.',
          'Bantuan dan kepedulian terhadap sesama.',
          'Program keagamaan dan kegiatan masyarakat.'
        ],
        steps: [
          ['Pilih program', 'Pilih Sosial dan Keagamaan pada halaman donasi.'],
          ['Salurkan dukungan', 'Transfer ke rekening resmi yayasan.'],
          ['Konfirmasi', 'Kirim konfirmasi lewat WhatsApp resmi.'],
          ['Ikuti perkembangan', 'Lihat laporan dan dokumentasi kegiatan di website ini.']
        ],
        category: 'sosial'
      }
    ],

    // Kegiatan: { id, category:'kurban|bencana|sosial', type:'foto|video|artikel', title, date:'2026-01-31',
    //             excerpt, image:'path', video:'url mp4/youtube', url:'link artikel' }
    activities: [],

    // Laporan: { title, category:'kegiatan|penyaluran|keuangan', period, file:'path/pdf' }
    reports: [],

    api: { contact: '' },            // endpoint POST untuk formulir kontak (tahap dinamis)
    payment: { provider: null }      // 'midtrans' | 'xendit' | dst. (tahap payment gateway)
  };

  // Contoh tampilan agar galeri/filter dapat dilihat sebelum data asli ada.
  const SAMPLE_ACTIVITIES = [
    { id: 's1', category: 'kurban',  type: 'foto',    title: 'Dokumentasi penyaluran kurban',        excerpt: 'Contoh tampilan: foto dokumentasi penyaluran hewan kurban kepada masyarakat.' },
    { id: 's2', category: 'bencana', type: 'video',   title: 'Video aksi tanggap bencana',           excerpt: 'Contoh tampilan: video dokumentasi aksi lapangan tim tanggap bencana.' },
    { id: 's3', category: 'sosial',  type: 'foto',    title: 'Kegiatan sosial bersama masyarakat',   excerpt: 'Contoh tampilan: foto kegiatan sosial dan kebersamaan warga.' },
    { id: 's4', category: 'kurban',  type: 'artikel', title: 'Artikel: berpartisipasi dalam program kurban', excerpt: 'Contoh tampilan: artikel panduan dan kabar program penyaluran kurban.' },
    { id: 's5', category: 'bencana', type: 'foto',    title: 'Penyaluran bantuan di lokasi terdampak', excerpt: 'Contoh tampilan: dokumentasi penyaluran bantuan kemanusiaan.' },
    { id: 's6', category: 'sosial',  type: 'artikel', title: 'Berita: kegiatan keagamaan dan kepedulian', excerpt: 'Contoh tampilan: berita kegiatan sosial dan keagamaan yayasan.' }
  ].map(a => ({ ...a, placeholder: true }));

  const CATEGORY = { kurban: 'Penyaluran Kurban', bencana: 'Tanggap Bencana', sosial: 'Sosial dan Keagamaan' };
  const TONE = { kurban: 'green', bencana: 'blue', sosial: 'orange' };
  const TYPE_LABEL = { foto: 'Foto', video: 'Video', artikel: 'Artikel' };

  // Titik sambung ke backend (nanti): ganti isi fungsi ini dengan fetch ke API.
  const Api = {
    async load(resource) { return CONFIG[resource] || []; }   // 'programs' | 'activities' | 'reports'
  };
  const getActivities = () => (CONFIG.activities.length ? CONFIG.activities : SAMPLE_ACTIVITIES);

  // Adaptor payment gateway — struktur disiapkan, belum aktif.
  const PaymentGateway = {
    get enabled() { return !!CONFIG.payment.provider; },
    async createCheckout(payload) {
      if (!this.enabled) return { mode: 'manual' };
      // Contoh tahap berikutnya:
      // const res = await fetch('/api/donations/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      // const data = await res.json(); return { mode: 'redirect', url: data.redirectUrl };
      return { mode: 'manual' };
    }
  };

  /* ======================================================================
     2. Utilitas & ikon
     ====================================================================== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const nf = new Intl.NumberFormat('id-ID');
  const fmtDate = s => { const d = new Date(s); return isNaN(d) ? '' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); };
  const getCfg = path => path.split('.').reduce((o, k) => (o ? o[k] : undefined), CONFIG);
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* abaikan */ } } };

  const ICONS = {
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9m5 5 3.9 3.9m0-12.8-3.9 3.9m-5 5-3.9 3.9"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.8-6 6-6s6 2.4 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 2 4.5 5"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    play: '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    download: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9.5 5 2.5-5 2.5v-5Z" fill="currentColor"/>',
    tiktok: '<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.3 2.3 1.8 4 4 4"/>',
    heart: '<path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9Z"/>'
  };
  const icon = (name, cls = 'ico') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const waLink = text => {
    const n = String(CONFIG.contact.whatsapp || '').replace(/\D/g, '');
    return n ? `https://wa.me/${n}?text=${encodeURIComponent(text || '')}` : null;
  };
  const DEFAULT_WA = 'Halo Yayasan BNT, saya ingin bertanya.';

  /* Isi elemen [data-cfg] dari CONFIG; kosong => placeholder bergaris putus */
  function bindConfig(root) {
    $$('[data-cfg]', root).forEach(el => {
      let val = getCfg(el.dataset.cfg);
      if (el.dataset.cfg === 'contact.whatsappDisplay') val = val || CONFIG.contact.whatsapp;
      if (val) el.textContent = val;
      else el.innerHTML = `<span class="ph-text">${esc(el.dataset.ph || 'Menunggu data resmi')}</span>`;
    });
    $$('[data-socials]', root).forEach(box => {
      const items = Object.entries(CONFIG.contact.socials).filter(([, url]) => url);
      box.innerHTML = items.length
        ? items.map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${k}">${icon(k)}</a>`).join('')
        : '<span class="ph-text">Media sosial segera diumumkan</span>';
    });
    $$('[data-wa]', root).forEach(a => { const l = waLink(a.dataset.wa || DEFAULT_WA); a.href = l || '#'; });
  }

  /* ======================================================================
     3. Foto / placeholder
     ====================================================================== */
  const SCENE = `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect class="s-sky" width="800" height="500"/><circle class="s-sun" cx="590" cy="160" r="64"/>
    <path class="s-hill3" d="M0 330C120 270 230 300 340 320c130 25 220-50 460-10v190H0Z"/>
    <path class="s-hill2" d="M0 380c150-50 280 20 420-10 140-30 260 10 380-20v150H0Z"/>
    <path class="s-hill1" d="M0 440c160-40 300 10 460-15 140-20 240 15 340-5v80H0Z"/>
    <g class="s-palm"><path d="M150 440c3-60-3-110 4-160"/><path d="M154 280c-30-26-62-20-84 4M154 280c-22-34-52-40-80-30M154 280c20-30 50-38 78-26M154 280c32-18 62-10 82 14M154 280c-4-30-2-52 6-70"/>
    <path d="M250 450c2-40-2-74 3-108"/><path d="M253 342c-20-18-42-14-56 3M253 342c16-22 38-26 58-16M253 342c-2-22 0-36 6-48"/></g></svg>`;

  function hydratePhotos(root) {
    $$('[data-photo]', root).forEach(el => {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      const src = el.dataset.src || CONFIG.photos[el.dataset.photo];
      const media = document.createElement('div');
      media.className = 'photo-media';
      if (el.dataset.parallax) { media.dataset.parallax = el.dataset.parallax; el.removeAttribute('data-parallax'); }
      const addLabel = () => {
        if (!el.dataset.label || el.querySelector('.photo-label')) return;
        const l = document.createElement('span'); l.className = 'photo-label'; l.textContent = el.dataset.label; el.append(l);
      };
      if (src) {
        const img = new Image();
        img.alt = el.dataset.alt || '';
        img.decoding = 'async'; img.loading = el.dataset.photo === 'hero' ? 'eager' : 'lazy';
        img.onerror = () => { media.innerHTML = SCENE; addLabel(); };
        img.src = src;
        media.append(img);
      } else { media.innerHTML = SCENE; addLabel(); }
      el.insertBefore(media, el.firstChild);
    });
  }

  /* ======================================================================
     4. Komponen UI
     ====================================================================== */
  let cleanups = [];          // dibersihkan tiap pindah halaman
  let introResolve; const introReady = new Promise(r => { introResolve = r; });

  /* Toast */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-show'), 3800);
  }

  /* Pecah judul menjadi kata untuk animasi reveal */
  function splitNode(node, c) {
    const frag = document.createDocumentFragment();
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', c.i++);
          w.append(s); frag.append(w);
        });
      } else if (n.nodeType === 1) { const k = n.cloneNode(false); k.append(splitNode(n, c)); frag.append(k); }
    });
    return frag;
  }

  /* Scroll reveal */
  function initReveal(root) {
    $$('[data-split]', root).forEach(el => el.replaceChildren(splitNode(el, { i: 0 })));
    $$('[data-reveal]', root).forEach(el => { if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay); });
    const targets = $$('[data-reveal], [data-split]', root);
    if (reduceMotion || !('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('is-in')); return; }
    let io;
    introReady.then(() => {
      io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      targets.forEach(t => io.observe(t));
    });
    cleanups.push(() => io && io.disconnect());
  }

  /* Parallax halus (dibatasi agar tidak berlebihan) */
  let parallaxEls = [];
  let ticking = false;
  function collectParallax(root) { parallaxEls = $$('[data-parallax]', root); updateParallax(); }
  function updateParallax() {
    ticking = false;
    if (reduceMotion) return;
    const vh = innerHeight;
    parallaxEls.forEach(el => {
      const p = el.parentElement; if (!p) return;
      const r = p.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const offset = r.top + r.height / 2 - vh / 2;
      const max = r.height * 0.08;
      const y = Math.max(-max, Math.min(max, -offset * speed));
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  }

  /* Counter statistik */
  function initStats(root) {
    const box = $('[data-stats]', root); if (!box) return;
    box.innerHTML = CONFIG.stats.map((s, i) => `
      <div class="stat" data-reveal data-delay="${i + 1}">
        <strong data-count="${s.value ?? ''}" data-suffix="${esc(s.suffix || '')}">${s.value == null ? '—' : '0'}</strong>
        <span>${esc(s.label)}</span>
      </div>`).join('');
    $$('[data-reveal]', box).forEach(el => el.style.setProperty('--d', el.dataset.delay));
    const els = $$('[data-count]', box).filter(e => e.dataset.count !== '');
    if (!els.length) return;
    const run = el => {
      const end = Number(el.dataset.count), suf = el.dataset.suffix, t0 = performance.now(), dur = 1600;
      if (reduceMotion) { el.textContent = nf.format(end) + suf; return; }
      const step = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = nf.format(Math.round(end * (1 - Math.pow(1 - k, 3)))) + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.5 });
    els.forEach(e => io.observe(e));
    cleanups.push(() => io.disconnect());
  }

  /* Kartu aktivitas (dipakai carousel, galeri, transparansi) */
  function activityCard(a, i) {
    const tone = TONE[a.category] || 'green';
    return `<button type="button" class="act-card" data-open="${i}" style="--i:${i}">
      <div class="photo" data-photo="__a" data-src="${esc(a.image || '')}" data-tone="${tone}" data-alt="${esc(a.title)}" ${a.placeholder ? 'data-label="Contoh — placeholder"' : ''}>
        ${a.type === 'video' ? `<span class="play-badge"><span>${icon('play')}</span></span>` : ''}
      </div>
      <div class="act-body">
        <div class="act-meta"><span class="tag tag--${a.category}">${CATEGORY[a.category] || ''}</span><span class="tag tag--type">${TYPE_LABEL[a.type] || ''}</span>${a.date ? `<time datetime="${esc(a.date)}">${fmtDate(a.date)}</time>` : ''}</div>
        <h3>${esc(a.title)}</h3>
        ${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ''}
      </div></button>`;
  }
  function bindOpen(container, list) {
    container.addEventListener('click', e => {
      const b = e.target.closest('[data-open]'); if (!b || container.dataset.dragged === '1') return;
      Lightbox.open(list, Number(b.dataset.open), b);
    });
  }

  /* Carousel */
  function initCarousel(root, list) {
    const wrap = $('[data-carousel]', root); if (!wrap) return;
    const track = $('[data-carousel-track]', wrap), dotsBox = $('[data-carousel-dots]', root);
    track.innerHTML = list.map((a, i) => `<div class="slide">${activityCard(a, i)}</div>`).join('');
    hydratePhotos(track); bindOpen(track, list);
    dotsBox.innerHTML = list.map((_, i) => `<button type="button" aria-label="Slide ${i + 1}"></button>`).join('');
    const dots = $$('button', dotsBox);
    const step = () => (track.firstElementChild ? track.firstElementChild.offsetWidth + 22 : 300);
    const index = () => Math.round(track.scrollLeft / step());
    const sync = () => dots.forEach((d, i) => d.classList.toggle('is-active', i === Math.min(index(), dots.length - 1)));
    const go = i => track.scrollTo({ left: i * step(), behavior: 'smooth' });
    track.addEventListener('scroll', sync, { passive: true }); sync();
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    $$('[data-car]', root).forEach(b => b.addEventListener('click', () => {
      const max = track.scrollWidth - track.clientWidth;
      if (b.dataset.car === 'next') track.scrollLeft >= max - 4 ? go(0) : go(index() + 1);
      else go(Math.max(0, index() - 1));
    }));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(index() + 1); if (e.key === 'ArrowLeft') go(Math.max(0, index() - 1)); });
    // seret dengan mouse
    let down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 5) { track.classList.add('is-drag'); track.dataset.dragged = '1'; track.scrollLeft = sl - dx; } });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-drag'); setTimeout(() => { track.dataset.dragged = '0'; }, 0); go(index()); });
    // autoplay (berhenti saat disentuh / tab tidak aktif)
    if (!reduceMotion) {
      let paused = false;
      ['mouseenter', 'focusin', 'touchstart'].forEach(ev => wrap.addEventListener(ev, () => { paused = true; }, { passive: true }));
      ['mouseleave', 'focusout'].forEach(ev => wrap.addEventListener(ev, () => { paused = false; }));
      const id = setInterval(() => {
        if (paused || document.hidden) return;
        const max = track.scrollWidth - track.clientWidth;
        track.scrollLeft >= max - 4 ? go(0) : go(index() + 1);
      }, 5200);
      cleanups.push(() => clearInterval(id));
    }
  }

  /* Lightbox */
  const Lightbox = (() => {
    const box = $('#lightbox'), media = $('.lb-media', box), cap = $('.lb-caption', box);
    let list = [], i = 0, last = null;
    const youtube = u => { const m = String(u).match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null; };
    function draw() {
      const a = list[i]; if (!a) return;
      media.innerHTML = '';
      if (a.type === 'video' && a.video) {
        const yt = youtube(a.video);
        media.innerHTML = yt ? `<iframe src="${esc(yt)}" title="${esc(a.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
                             : `<video src="${esc(a.video)}" controls autoplay playsinline></video>`;
      } else {
        const ph = document.createElement('div'); ph.className = 'photo'; ph.dataset.photo = '__lb';
        ph.dataset.src = a.image || ''; ph.dataset.tone = TONE[a.category] || 'green'; ph.dataset.alt = a.title;
        if (a.placeholder) ph.dataset.label = 'Contoh — placeholder';
        media.append(ph); hydratePhotos(media);
        if (a.image) { const im = $('img', media); if (im) im.style.objectFit = 'contain'; }
      }
      cap.innerHTML = `<strong>${esc(a.title)}</strong><span>${CATEGORY[a.category] || ''}${a.date ? ' · ' + fmtDate(a.date) : ''}${list.length > 1 ? ` · ${i + 1}/${list.length}` : ''}</span>
        ${a.excerpt ? `<p style="margin-top:.5rem;opacity:.85">${esc(a.excerpt)}</p>` : ''}
        ${a.url ? `<p style="margin-top:.6rem"><a class="link-arrow" style="color:var(--orange-400)" href="${esc(a.url)}" target="_blank" rel="noopener">Baca selengkapnya ${icon('arrow', 'ico ico-sm')}</a></p>` : ''}`;
      $('.lb-prev', box).hidden = $('.lb-next', box).hidden = list.length < 2;
    }
    function open(l, idx, from) { list = l; i = idx; last = from || document.activeElement; box.hidden = false; document.body.style.overflow = 'hidden'; draw(); $('.lb-close', box).focus(); }
    function close() { box.hidden = true; media.innerHTML = ''; document.body.style.overflow = ''; if (last && last.focus) last.focus(); }
    const move = d => { i = (i + d + list.length) % list.length; draw(); };
    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', () => move(-1));
    $('.lb-next', box).addEventListener('click', () => move(1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft' && list.length > 1) move(-1);
      if (e.key === 'ArrowRight' && list.length > 1) move(1);
      if (e.key === 'Tab') { const f = $$('button:not([hidden])', box); const first = f[0], lastF = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); } else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); } }
    });
    let tx = 0;
    box.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60 && list.length > 1) move(dx < 0 ? 1 : -1); }, { passive: true });
    return { open, close };
  })();

  /* Efek tilt lembut pada kartu program */
  function initTilt(root) {
    if (reduceMotion || !matchMedia('(hover: hover)').matches) return;
    $$('.program-card', root).forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-8px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  /* Header, navigasi animasi, menu seluler */
  const header = $('#siteHeader'), nav = $('.main-nav'), pill = $('#navPill'), burger = $('#burger'), mobileMenu = $('#mobileMenu');
  let activeLink = null;
  function movePill(a) {
    if (!a || !nav.offsetParent) { pill.style.opacity = 0; return; }
    const n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    pill.style.width = r.width + 'px'; pill.style.height = r.height + 'px';
    pill.style.top = (r.top - n.top) + 'px';
    pill.style.transform = `translateX(${r.left - n.left}px)`; pill.style.opacity = 1;
  }
  function setActiveNav(navKey) {
    activeLink = null;
    $$('a[data-route]', nav).forEach(a => { const on = a.dataset.route === navKey; a.classList.toggle('is-active', on); if (on) { a.setAttribute('aria-current', 'page'); activeLink = a; } else a.removeAttribute('aria-current'); });
    movePill(activeLink);
  }
  $$('a[data-route]', nav).forEach(a => {
    a.addEventListener('mouseenter', () => movePill(a));
    a.addEventListener('focus', () => movePill(a));
  });
  nav.addEventListener('mouseleave', () => movePill(activeLink));
  window.addEventListener('resize', () => movePill(activeLink));

  function toggleMenu(open) {
    const on = open ?? !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', on);
    burger.setAttribute('aria-expanded', on); burger.setAttribute('aria-label', on ? 'Tutup menu' : 'Buka menu');
    mobileMenu.setAttribute('aria-hidden', !on); document.body.classList.toggle('menu-open', on);
    header.classList.toggle('is-menu', on);
  }
  burger.addEventListener('click', () => toggleMenu());
  mobileMenu.addEventListener('click', e => { if (e.target.closest('a')) toggleMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  let lastY = 0;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !mobileMenu.classList.contains('is-open'));
    if (y < lastY - 4 || y < 500) header.classList.remove('is-hidden');
    lastY = y;
    $('#scrollProgress').style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateParallax);

  /* ======================================================================
     5. Halaman
     ====================================================================== */
  const programBySlug = slug => CONFIG.programs.find(p => p.slug === slug);

  const programCard = (p, i) => `
    <a class="program-card" href="#/program/${p.slug}" data-reveal data-delay="${i + 1}">
      <div class="pc-media">
        <div class="photo" data-photo="program-${p.slug}" data-tone="${p.tone}" data-label="Foto program — placeholder"></div>
        <span class="pc-icon tone-${p.tone}">${icon(p.icon)}</span>
      </div>
      <div class="pc-body"><h3>${esc(p.title)}</h3><p>${esc(p.short)}</p>
        <span class="pc-more">Selengkapnya ${icon('arrow', 'ico ico-sm')}</span></div>
    </a>`;

  function initHome(root) {
    $('[data-program-cards]', root).innerHTML = CONFIG.programs.map(programCard).join('');
    initStats(root);
    initCarousel(root, getActivities().slice(0, 6));
    initTilt(root);
  }

  function initProgramList(root) {
    $('[data-program-rows]', root).innerHTML = CONFIG.programs.map((p, i) => `
      <article class="program-row">
        <div class="photo" data-photo="program-${p.slug}" data-tone="${p.tone}" data-label="Foto program — placeholder" data-reveal="${i % 2 ? 'right' : 'left'}"></div>
        <div data-reveal="${i % 2 ? 'left' : 'right'}">
          <p class="eyebrow">Program ${i + 1}</p>
          <h2>${esc(p.title)}</h2>
          <p>${esc(p.intro)}</p>
          <a class="btn btn-primary" href="#/program/${p.slug}">Lihat detail program</a>
        </div>
      </article>`).join('');
  }

  function programDetailHTML(p) {
    const related = getActivities().filter(a => a.category === p.category).slice(0, 3);
    const others = CONFIG.programs.filter(x => x.slug !== p.slug);
    return `
    <section class="page-hero tone-${p.tone}">
      <div class="page-hero-bg" data-parallax="0.15" aria-hidden="true"></div>
      <div class="container">
        <nav class="crumbs" aria-label="Jejak halaman"><a href="#/">Beranda</a><span>/</span><a href="#/program">Program Kami</a><span>/</span><span>${esc(p.title)}</span></nav>
        <h1 class="page-title" data-split>${esc(p.title)}</h1>
        <p class="page-lead" data-reveal data-delay="2">${esc(p.short)}</p>
      </div>
    </section>
    <section class="section">
      <div class="container detail-grid">
        <div class="detail-main">
          <div class="photo" data-photo="program-${p.slug}" data-tone="${p.tone}" data-label="Foto program — placeholder" style="aspect-ratio:16/9;border-radius:var(--radius);margin-bottom:2.5rem" data-reveal></div>
          <h2 data-reveal>Tentang program</h2>
          <p data-reveal>${esc(p.intro)}</p>
          <h2 data-reveal>Yang kami lakukan</h2>
          <ul class="check-list">${p.points.map((t, i) => `<li data-reveal data-delay="${i + 1}">${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>
          <h2 data-reveal>Cara berpartisipasi</h2>
          <ol class="steps">${p.steps.map(([t, d], i) => `<li data-reveal data-delay="${i + 1}"><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ol>
          <h2 data-reveal>Dokumentasi</h2>
          <div class="gallery gallery--sm" data-related></div>
        </div>
        <aside class="side-card" data-reveal="right">
          <h3>Dukung program ini</h3>
          <p>Salurkan kebaikan Anda untuk ${esc(p.title)} dan pantau penyalurannya di website ini.</p>
          <a class="btn btn-accent btn-block" href="#/donasi?program=${p.slug}">Dukung program ini</a>
          <a class="btn btn-ghost btn-block" data-wa="Halo Yayasan BNT, saya ingin bertanya tentang program ${esc(p.title)}." href="#" target="_blank" rel="noopener">${icon('arrow', 'ico ico-sm').replace('class="ico ico-sm"', 'class="ico ico-sm"')} Tanya via WhatsApp</a>
        </aside>
      </div>
    </section>
    <section class="section section--cream">
      <div class="container">
        <header class="section-head" data-reveal><p class="eyebrow">Program lainnya</p><h2 class="h2">Jelajahi program kami yang lain</h2></header>
        <div class="more-programs">${others.map((o, i) => `<a class="mini-link" href="#/program/${o.slug}" data-reveal data-delay="${i + 1}"><span>${esc(o.title)}</span>${icon('arrow')}</a>`).join('')}</div>
      </div>
    </section>`;
  }
  function initProgramDetail(root, p) {
    const box = $('[data-related]', root);
    box.innerHTML = getActivities().filter(a => a.category === p.category).slice(0, 3).map(activityCard).join('');
    // index harus mengacu pada daftar yang sama dengan yang dibuka di lightbox
    const list = getActivities().filter(a => a.category === p.category).slice(0, 3);
    hydratePhotos(box); bindOpen(box, list);
  }

  function initKegiatan(root) {
    const gal = $('[data-gallery]', root), empty = $('[data-gallery-empty]', root);
    const all = getActivities(); const state = { cat: 'all', type: 'all' };
    if (!CONFIG.activities.length) $('[data-activity-notice]', root).hidden = false;
    let current = [];
    const draw = () => {
      current = all.filter(a => (state.cat === 'all' || a.category === state.cat) && (state.type === 'all' || a.type === state.type));
      gal.innerHTML = current.map(activityCard).join('');
      hydratePhotos(gal); empty.hidden = current.length > 0;
    };
    gal.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) Lightbox.open(current, Number(b.dataset.open), b); });
    $$('[data-filter]', root).forEach(group => group.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', group).forEach(c => c.classList.toggle('is-active', c === b));
      state[group.dataset.filter] = b.dataset.value; draw();
    }));
    draw();
  }

  function initTransparansi(root) {
    const box = $('[data-reports]', root); let cat = 'all';
    const LABEL = { kegiatan: 'Laporan kegiatan', penyaluran: 'Laporan penyaluran', keuangan: 'Penggunaan donasi' };
    const real = CONFIG.reports;
    const items = real.length ? real : Object.keys(LABEL).map(k => ({ title: `${LABEL[k]} — belum tersedia`, category: k, period: 'Menunggu laporan resmi', placeholder: true }));
    const draw = () => {
      const list = items.filter(r => cat === 'all' || r.category === cat);
      box.innerHTML = list.length ? list.map((r, i) => `
        <div class="report ${r.placeholder ? 'is-placeholder' : ''}" style="animation-delay:${i * 60}ms">
          <span class="report-ico">${icon('doc')}</span>
          <div class="report-info"><strong>${esc(r.title)}</strong><span>${esc(LABEL[r.category] || '')}${r.period ? ' · ' + esc(r.period) : ''}</span></div>
          ${r.file ? `<a class="btn btn-outline btn-sm" href="${esc(r.file)}" target="_blank" rel="noopener">${icon('download', 'ico ico-sm')} Unduh</a>` : '<span class="ph-text">Segera hadir</span>'}
        </div>`).join('') : '<p class="empty">Belum ada laporan pada kategori ini.</p>';
    };
    $('[data-report-filter]', root).addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', e.currentTarget).forEach(c => c.classList.toggle('is-active', c === b)); cat = b.dataset.value; draw();
    });
    draw();
    const gal = $('[data-results-gallery]', root);
    const list = getActivities().filter(a => a.type === 'foto').slice(0, 3);
    gal.innerHTML = list.map(activityCard).join(''); hydratePhotos(gal); bindOpen(gal, list);
  }

  function initDonasi(root, query) {
    const form = $('#donateForm'), progBox = $('[data-donate-programs]', root);
    const choices = [...CONFIG.programs.map(p => ({ value: p.slug, title: p.title, d: p.short, tone: p.tone, icon: p.icon })),
      { value: 'umum', title: 'Donasi umum', d: 'Disalurkan ke program yang paling membutuhkan.', tone: 'green', icon: 'heart' }];
    const want = query.get('program'); const pre = choices.some(c => c.value === want) ? want : 'umum';
    progBox.innerHTML = choices.map(c => `
      <label class="choice"><input type="radio" name="program" value="${c.value}" ${c.value === pre ? 'checked' : ''}>
        <span class="choice-ico pc-icon tone-${c.tone}" style="position:static;width:48px;height:48px;border-radius:14px;box-shadow:none">${icon(c.icon)}</span>
        <span><strong>${esc(c.title)}</strong><span class="d">${esc(c.d)}</span></span>
        <span class="choice-check">${icon('check', 'ico ico-sm')}</span></label>`).join('');

    // rekening
    const bankBox = $('[data-bank-list]', root);
    bankBox.innerHTML = CONFIG.banks.length ? CONFIG.banks.map(b => `
      <div class="bank-item"><small>${esc(b.bank)} · a.n. ${esc(b.holder)}</small>
        <strong><span>${esc(b.number)}</span><button type="button" class="copy-btn" data-copy="${esc(b.number)}">Salin</button></strong></div>`).join('')
      : '<div class="bank-item"><span class="ph-text ph-text--light">Rekening resmi segera diumumkan</span></div>';
    bankBox.addEventListener('click', async e => {
      const b = e.target.closest('[data-copy]'); if (!b) return;
      try { await navigator.clipboard.writeText(b.dataset.copy); toast('Nomor rekening disalin.'); } catch { toast('Tidak dapat menyalin otomatis. Salin nomor secara manual.'); }
    });

    // nominal
    const amount = $('#amountInput'), name = $('#donorName'), confirm = $('#confirmWa');
    const chips = $$('[data-amount-chips] .chip', root);
    const fmtAmount = v => { const d = String(v).replace(/\D/g, ''); return d ? nf.format(Number(d)) : ''; };
    amount.addEventListener('input', () => { amount.value = fmtAmount(amount.value); chips.forEach(c => c.classList.remove('is-active')); sync(); });
    chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.classList.toggle('is-active', x === c)); amount.value = fmtAmount(c.dataset.amount); sync(); }));

    const message = () => {
      const val = form.program.value, label = (choices.find(c => c.value === val) || {}).title || 'Donasi umum';
      const nominal = amount.value ? `Rp ${amount.value}` : '(belum ditentukan)';
      return `Halo Yayasan BNT, saya ingin mengonfirmasi donasi.\nProgram: ${label}\nNominal: ${nominal}\nNama: ${name.value.trim() || '(belum diisi)'}\nBukti transfer saya lampirkan di bawah ini.`;
    };
    const sync = () => { confirm.dataset.wa = message(); const l = waLink(confirm.dataset.wa); confirm.href = l || '#'; };
    form.addEventListener('input', sync); form.addEventListener('change', sync); sync();

    $('#gatewayHint').textContent = PaymentGateway.enabled ? '' : 'Pembayaran online (payment gateway) akan tersedia pada tahap berikutnya. Saat ini donasi dilakukan melalui transfer ke rekening resmi.';

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = { program: form.program.value, amount: Number(amount.value.replace(/\D/g, '')) || null, name: name.value.trim() };
      const res = await PaymentGateway.createCheckout(payload);
      if (res.mode === 'redirect' && res.url) { location.href = res.url; return; }
      const card = $('#bankCard'); card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      card.classList.add('is-highlight'); setTimeout(() => card.classList.remove('is-highlight'), 2200);
      toast(CONFIG.banks.length ? 'Silakan transfer ke rekening resmi, lalu konfirmasi lewat WhatsApp.' : 'Rekening resmi segera diumumkan. Anda dapat menghubungi kami lewat WhatsApp.');
    });
  }

  function initKontak(root) {
    const form = $('#contactForm'), hint = $('#contactHint');
    const rules = { name: v => v.trim().length >= 2 || 'Mohon isi nama Anda.', email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Masukkan alamat email yang valid.', message: v => v.trim().length >= 10 || 'Pesan minimal 10 karakter.' };
    const check = el => { const r = rules[el.name](el.value); const f = el.closest('.field'); f.classList.toggle('has-error', r !== true); $('.err', f).textContent = r === true ? '' : r; return r === true; };
    $$('input, textarea', form).forEach(el => el.addEventListener('blur', () => check(el)));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const ok = $$('input, textarea', form).map(check).every(Boolean); if (!ok) return;
      const data = Object.fromEntries(new FormData(form));
      if (CONFIG.api.contact) {
        try {
          const r = await fetch(CONFIG.api.contact, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error(r.status);
          form.reset(); hint.textContent = ''; toast('Terima kasih, pesan Anda telah terkirim.');
        } catch { toast('Pesan belum terkirim. Silakan coba lagi atau hubungi kami lewat WhatsApp.'); }
      } else if (CONFIG.contact.email) {
        location.href = `mailto:${CONFIG.contact.email}?subject=${encodeURIComponent('Pesan dari website BNT — ' + data.name)}&body=${encodeURIComponent(data.message + '\n\n' + data.name + ' (' + data.email + ')')}`;
      } else {
        hint.textContent = 'Formulir akan terhubung ke server pada tahap berikutnya. Untuk saat ini, silakan hubungi kami lewat WhatsApp atau email resmi setelah diumumkan.';
        toast('Formulir belum terhubung ke server.');
      }
    });
  }

  /* ======================================================================
     6. Router & transisi
     ====================================================================== */
  const BASE_TITLE = 'Yayasan Bhakti Nusa Tenggara (BNT)';
  const ROUTES = [
    { path: '/', tpl: 'tpl-home', nav: '/', title: `${BASE_TITLE} — Peduli, Mengabdi, Menginspirasi`, desc: 'Yayasan berbadan hukum yang berfokus pada kegiatan sosial dan kemanusiaan di Nusa Tenggara Timur: penyaluran kurban, tanggap bencana, serta sosial dan keagamaan.', init: initHome },
    { path: '/tentang', tpl: 'tpl-tentang', nav: '/tentang', title: `Tentang Kami — ${BASE_TITLE}`, desc: 'Profil, sejarah, visi misi, nilai-nilai, serta identitas organisasi Yayasan Bhakti Nusa Tenggara.' },
    { path: '/program', tpl: 'tpl-program', nav: '/program', title: `Program Kami — ${BASE_TITLE}`, desc: 'Tiga program utama BNT: Penyaluran Kurban, Tanggap Bencana, serta Sosial dan Keagamaan.', init: initProgramList },
    { path: '/kegiatan', tpl: 'tpl-kegiatan', nav: '/kegiatan', title: `Kegiatan dan Dokumentasi — ${BASE_TITLE}`, desc: 'Galeri foto, video, serta artikel dan berita kegiatan Yayasan Bhakti Nusa Tenggara.', init: initKegiatan },
    { path: '/transparansi', tpl: 'tpl-transparansi', nav: '/transparansi', title: `Transparansi — ${BASE_TITLE}`, desc: 'Laporan kegiatan, laporan penyaluran bantuan, dan informasi penggunaan donasi Yayasan BNT.', init: initTransparansi },
    { path: '/donasi', tpl: 'tpl-donasi', nav: '/donasi', title: `Donasi — ${BASE_TITLE}`, desc: 'Pilih program, ikuti panduan berdonasi, dan konfirmasi donasi Anda lewat WhatsApp.', init: initDonasi },
    { path: '/kontak', tpl: 'tpl-kontak', nav: '/kontak', title: `Kontak — ${BASE_TITLE}`, desc: 'Hubungi Yayasan Bhakti Nusa Tenggara lewat WhatsApp, email, atau formulir pesan.', init: initKontak }
  ];

  function resolve() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [p, qs] = raw.split('?');
    const path = ('/' + p.replace(/^\/+/, '')).replace(/\/+$/, '') || '/';
    const query = new URLSearchParams(qs || '');
    const m = path.match(/^\/program\/([\w-]+)$/);
    if (m) {
      const prog = programBySlug(m[1]);
      if (prog) return { path, query, nav: '/program', title: `${prog.title} — ${BASE_TITLE}`, desc: prog.short, program: prog };
    }
    const r = ROUTES.find(x => x.path === path);
    return r ? { ...r, query, path } : { path, query, tpl: 'tpl-404', nav: '', title: `Halaman tidak ditemukan — ${BASE_TITLE}`, desc: '' };
  }

  function mount(route) {
    cleanups.forEach(fn => fn()); cleanups = [];
    const app = $('#app');
    if (route.program) app.innerHTML = programDetailHTML(route.program);
    else app.replaceChildren($('#' + route.tpl).content.cloneNode(true));
    if (route.program) initProgramDetail(app, route.program);
    else if (route.init) route.init(app, route.query);
    bindConfig(app); hydratePhotos(app); initReveal(app); collectParallax(app);
    document.title = route.title;
    const meta = $('meta[name="description"]'); if (meta && route.desc) meta.setAttribute('content', route.desc);
    window.scrollTo({ top: 0, behavior: 'instant' });
    lastY = 0; onScroll(); setActiveNav(route.nav); toggleMenu(false);
    app.focus({ preventScroll: true });
  }

  const veil = $('#veil');
  async function veilIn() { veil.className = 'veil is-in'; await sleep(700); }
  async function veilOut() {
    veil.className = 'veil is-out'; await sleep(750);
    veil.className = 'veil is-reset'; await sleep(30); veil.className = 'veil';
  }

  let currentPath = null, navigating = false;
  async function render(first = false) {
    if (location.hash && !location.hash.startsWith('#/')) return;   // jangkar biasa, bukan rute
    const route = resolve();
    if (navigating) return; navigating = true;
    try {
      const samePage = route.path === currentPath;
      if (!first && !samePage && !reduceMotion) await veilIn();
      mount(route); currentPath = route.path;
      if (!first && !samePage && !reduceMotion) await veilOut();
    } finally { navigating = false; }
  }
  window.addEventListener('hashchange', () => render());

  /* Klik jangkar internal & utilitas global */
  document.addEventListener('click', e => {
    const sc = e.target.closest('[data-scroll]');
    if (sc) { e.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    const wa = e.target.closest('[data-wa]');
    if (wa) {
      const l = waLink(wa.dataset.wa || DEFAULT_WA);
      if (l) wa.href = l; else { e.preventDefault(); toast('Nomor WhatsApp resmi segera tersedia.'); }
    }
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  $('#toTop').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ======================================================================
     7. Init
     ====================================================================== */
  function runIntro() {
    const splash = $('#splash');
    const finish = () => { document.body.classList.remove('is-loading'); splash.classList.add('is-gone'); introResolve(); };
    if (reduceMotion || store.get('bnt-intro')) { finish(); return; }
    store.set('bnt-intro', '1');
    setTimeout(() => splash.classList.add('is-done'), 2300);
    setTimeout(() => { document.body.classList.remove('is-loading'); }, 2500);
    setTimeout(() => { splash.classList.add('is-gone'); introResolve(); }, 3400);
  }

  function init() {
    $('#year').textContent = new Date().getFullYear();
    bindConfig(document);
    const wa = $('#waFloat'); wa.dataset.wa = DEFAULT_WA; wa.href = waLink(DEFAULT_WA) || '#';
    wa.addEventListener('click', e => { if (!waLink(DEFAULT_WA)) { e.preventDefault(); toast('Nomor WhatsApp resmi segera tersedia.'); } });
    if (!location.hash || location.hash === '#') history.replaceState(null, '', '#/');
    render(true);
    runIntro();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(activeLink));
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
