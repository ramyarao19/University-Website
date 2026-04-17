/* ═══════════════════════════════════════════════════════
   UI Components — Toasts, Search, Modals, Notifications
   ═══════════════════════════════════════════════════════ */

/* ── Toast System ─────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.25rem;flex-shrink:0">${icons[type] || 'info'}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ── Search Overlay ───────────────────────────────────── */
const SEARCH_INDEX = [
  { page: 'home', label: 'Home', keywords: 'home heritage modern inquiry campus news events established 1892' },
  { page: 'academics', label: 'Academics', keywords: 'academics programs colleges engineering business graduate research majors minors stem humanities arts sciences' },
  { page: 'admissions', label: 'Admissions', keywords: 'admissions apply application deadline tuition financial aid scholarships faq international' },
  { page: 'about', label: 'About Us', keywords: 'about history heritage timeline leadership chancellor faculty values mission' },
  { page: 'campus', label: 'Campus Life', keywords: 'campus life housing dining facilities library athletics clubs organizations student' },
  { page: 'portal', label: 'Student Portal', keywords: 'portal dashboard student milestones billing fees internships gazette courses' },
  { page: 'internship-form', label: 'Internship Application', keywords: 'internship application apply resume portfolio cover letter career' },
];

function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  const isOpen = overlay.classList.contains('open');
  if (isOpen) {
    overlay.classList.remove('open');
  } else {
    overlay.classList.add('open');
    const input = overlay.querySelector('.search-input');
    if (input) { input.value = ''; input.focus(); }
    renderSearchResults('');
  }
}

function renderSearchResults(query) {
  const container = document.querySelector('#search-overlay .search-results');
  if (!container) return;
  if (!query.trim()) {
    container.innerHTML = SEARCH_INDEX.map(item => `
      <div class="search-result-item" onclick="navigate('${item.page}'); toggleSearch();">
        <span class="material-symbols-outlined text-on-surface-variant" style="font-size:1.25rem">arrow_forward</span>
        <span style="flex:1;font-family:'Manrope',sans-serif">${item.label}</span>
        <span class="result-page">${item.label}</span>
      </div>
    `).join('');
    return;
  }
  const q = query.toLowerCase();
  const results = SEARCH_INDEX.filter(item =>
    item.label.toLowerCase().includes(q) || item.keywords.includes(q)
  );
  if (results.length === 0) {
    container.innerHTML = `<div style="padding:2rem;text-align:center;color:#74777f;font-family:'Manrope',sans-serif">No results found for "${query}"</div>`;
    return;
  }
  container.innerHTML = results.map(item => `
    <div class="search-result-item" onclick="navigate('${item.page}'); toggleSearch();">
      <span class="material-symbols-outlined text-on-surface-variant" style="font-size:1.25rem">arrow_forward</span>
      <span style="flex:1;font-family:'Manrope',sans-serif">${item.label}</span>
      <span class="result-page">${item.label}</span>
    </div>
  `).join('');
}

/* ── Modal System ─────────────────────────────────────── */
function openModal(title, bodyHTML, actions) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  const box = overlay.querySelector('.modal-box');
  let actionsHTML = '';
  if (actions) {
    actionsHTML = `<div class="flex justify-end gap-4 mt-8">${actions.map(a =>
      `<button onclick="${a.onclick}" class="${a.class || 'bg-primary text-on-primary px-6 py-3 rounded-md font-label text-sm font-bold tracking-widest hover:opacity-90 transition-opacity'}">${a.label}</button>`
    ).join('')}</div>`;
  }
  box.innerHTML = `
    <h3 class="font-headline text-2xl font-bold text-primary mb-4">${title}</h3>
    <div class="font-body text-on-surface-variant leading-relaxed">${bodyHTML}</div>
    ${actionsHTML}
  `;
  overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

/* ── Notification Dropdown ────────────────────────────── */
async function toggleNotifications(btnEl) {
  const dropdown = btnEl.closest('.relative').querySelector('.notif-dropdown');
  if (!dropdown) return;
  const isOpen = dropdown.classList.contains('open');
  document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) {
    await renderNotifications(dropdown);
    dropdown.classList.add('open');
  }
}

async function renderNotifications(dropdown) {
  const notifs = await DB.getNotifications();
  if (!notifs.length) {
    dropdown.innerHTML = `<div style="padding:2rem;text-align:center;color:#74777f;font-family:'Manrope',sans-serif">No notifications</div>`;
    return;
  }
  dropdown.innerHTML = `
    <div style="padding:1rem 1.25rem;border-bottom:1px solid #e1e3e4;display:flex;justify-content:space-between;align-items:center">
      <span class="font-label text-sm font-bold text-primary">Notifications</span>
      <button onclick="markAllRead(this)" class="font-label text-xs text-secondary hover:underline">Mark all read</button>
    </div>
    ${notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}', this)">
        ${n.read ? '' : '<div class="notif-dot"></div>'}
        <div style="flex:1">
          <p class="font-label text-sm font-bold text-primary" style="margin-bottom:2px">${n.title}</p>
          <p class="font-body text-xs text-on-surface-variant">${n.body}</p>
          <p class="font-label text-[10px] text-outline mt-1">${n.time}</p>
        </div>
      </div>
    `).join('')}
  `;
}

function handleNotifClick(id, el) {
  DB.markNotifRead(id);
  el.classList.remove('unread');
  const dot = el.querySelector('.notif-dot');
  if (dot) dot.remove();
  updateNotifBadges();
}

async function markAllRead(btn) {
  const notifs = await DB.getNotifications();
  for (const n of notifs) await DB.markNotifRead(n.id);
  const dropdown = btn.closest('.notif-dropdown');
  if (dropdown) await renderNotifications(dropdown);
  updateNotifBadges();
}

async function updateNotifBadges() {
  const count = await DB.getUnreadCount();
  document.querySelectorAll('.notif-badge').forEach(badge => {
    badge.style.display = count > 0 ? 'block' : 'none';
  });
}

/* ── Mobile Menu ──────────────────────────────────────── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

/* ── Close overlays on Escape ─────────────────────────── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const search = document.getElementById('search-overlay');
    if (search && search.classList.contains('open')) { toggleSearch(); return; }
    const modal = document.getElementById('modal-overlay');
    if (modal && modal.classList.contains('open')) { closeModal(); return; }
    const mobile = document.getElementById('mobile-menu');
    if (mobile && mobile.classList.contains('open')) { toggleMobileMenu(); return; }
    document.querySelectorAll('.notif-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

/* ── Close dropdowns on outside click ─────────────────── */
document.addEventListener('click', function(e) {
  if (!e.target.closest('.relative') || !e.target.closest('[onclick*="toggleNotifications"]')) {
    document.querySelectorAll('.notif-dropdown.open').forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('open');
    });
  }
});
