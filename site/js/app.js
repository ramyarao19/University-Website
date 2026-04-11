/* ═══════════════════════════════════════════════════════
   App — Main entry point, initialization, event wiring
   ═══════════════════════════════════════════════════════ */

(async function initApp() {
  // 1. Initialize mock database
  await DB.init();

  // 2. Initialize all form handlers
  initAllForms();

  // 3. Set up search overlay keyboard shortcut (Cmd/Ctrl + K)
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearch();
    }
  });

  // 4. Wire search input
  const searchInput = document.querySelector('#search-overlay .search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      renderSearchResults(this.value);
    });
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const first = document.querySelector('#search-overlay .search-result-item');
        if (first) first.click();
      }
    });
  }

  // 5. Update notification badges
  updateNotifBadges();

  // 6. Wire up the portal dashboard with live data from DB
  refreshPortalData();

  // 7. Navigate to correct page
  const initialPage = location.hash.replace('#', '') || 'home';
  navigate(initialPage);

  console.log('%c The Scholarly Editorial — Site Loaded ', 'background:#000a1e;color:#fff;padding:4px 12px;border-radius:4px;font-family:serif;');
  console.log('Mock DB ready. Use DB.dump() to inspect data, DB.reset() to reseed.');
})();

/* ── Refresh portal dashboard from DB ─────────────────── */
function refreshPortalData() {
  // Update balance
  const balance = DB.getOutstandingBalance();
  const balanceEl = document.querySelector('#page-portal .billing-balance');
  if (balanceEl) balanceEl.textContent = `$${balance.toFixed(2)}`;

  // Update fee items
  const fees = DB.getFees().filter(f => f.status !== 'paid');
  const feeItemsEl = document.querySelector('#page-portal .billing-items');
  if (feeItemsEl && fees.length > 0) {
    feeItemsEl.innerHTML = fees.map(f => `
      <div class="flex justify-between text-sm">
        <span class="text-on-primary-container font-label text-xs uppercase">${f.type} ${f.status === 'overdue' ? 'Fee' : 'Due'}</span>
        <span class="font-bold">${f.status === 'overdue' ? 'Due Now' : f.due.replace(/^\d{4}-/, '').replace('-', '/')}</span>
      </div>
    `).join('');
  }

  // Update student info
  const student = DB.getStudent();
  const nameEl = document.querySelector('#portal-sidebar .student-name');
  if (nameEl && student.name) nameEl.textContent = student.name;

  // Update application count in sidebar if any
  const apps = DB.getApplications();
  if (apps.length > 0) {
    const appBadge = document.querySelector('.app-count-badge');
    if (appBadge) appBadge.textContent = apps.length;
  }
}
