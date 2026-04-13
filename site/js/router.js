/* ═══════════════════════════════════════════════════════
   SPA Router — Hash-based page switching
   ═══════════════════════════════════════════════════════ */

const PORTAL_PAGES = ['portal', 'internship-form'];

const PAGE_TITLES = {
  home:              'The Scholarly Editorial | University Home',
  academics:         'Academics | The Scholarly Editorial',
  admissions:        'Admissions | The Scholarly Editorial',
  about:             'About Us | The Scholarly Editorial',
  campus:            'Campus Life | The Scholarly Editorial',
  portal:            'Student Portal | The Scholarly Editorial',
  'internship-form': 'Internship Application | The Scholarly Editorial',
};

function navigate(page) {
  // Reset tuition calculator when leaving admissions
  const currentPage = location.hash.replace('#', '') || 'home';
  if (currentPage === 'admissions' && page !== 'admissions' && typeof resetTuitionCalculator === 'function') {
    resetTuitionCalculator();
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Portal layout toggle
  const isPortal = PORTAL_PAGES.includes(page);
  document.body.classList.toggle('portal-mode', isPortal);

  // Update main nav active states
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`[data-page="${page}"]`) ||
                     (isPortal ? document.querySelector('[data-page="portal"]') : null);
  if (activeLink) activeLink.classList.add('active');

  // Update portal sidebar active states
  document.querySelectorAll('.portal-nav-link').forEach(link => link.classList.remove('active-portal'));
  const activePortalLink = document.querySelector(`[data-portal-page="${page}"]`);
  if (activePortalLink) activePortalLink.classList.add('active-portal');

  // Update title
  document.title = PAGE_TITLES[page] || 'The Scholarly Editorial';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update URL
  history.pushState(null, '', '#' + page);

  return false;
}

// Portal sub-navigation (same as navigate)
function portalNav(page) { navigate(page); }

// Handle browser back/forward
window.addEventListener('popstate', () => {
  const page = location.hash.replace('#', '') || 'home';
  navigate(page);
});
