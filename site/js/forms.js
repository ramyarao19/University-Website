/* ═══════════════════════════════════════════════════════
   Forms — Validation, Submission, File Upload, Drafts
   ═══════════════════════════════════════════════════════ */

/* ── Validation Helpers ───────────────────────────────── */
function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  form.querySelectorAll('.error-msg').forEach(el => el.remove());
}

function showFieldError(field, message) {
  field.classList.add('field-error');
  const msg = document.createElement('div');
  msg.className = 'error-msg';
  msg.textContent = message;
  field.parentElement.appendChild(msg);
}

function validateRequired(form, selector, label) {
  const field = form.querySelector(selector);
  if (!field) return true;
  const val = field.value.trim();
  if (!val) { showFieldError(field, `${label} is required`); return false; }
  return true;
}

function validateEmail(form, selector) {
  const field = form.querySelector(selector);
  if (!field) return true;
  const val = field.value.trim();
  if (!val) { showFieldError(field, 'Email is required'); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    showFieldError(field, 'Please enter a valid email');
    return false;
  }
  return true;
}

/* ── Contact / Inquiry Form ───────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors(form);

    const fields = {
      firstName: form.querySelector('[data-field="first-name"]'),
      lastName:  form.querySelector('[data-field="last-name"]'),
      major:     form.querySelector('[data-field="major"]'),
      message:   form.querySelector('[data-field="message"]'),
    };

    let valid = true;
    if (!fields.firstName?.value.trim()) { showFieldError(fields.firstName, 'First name is required'); valid = false; }
    if (!fields.lastName?.value.trim())  { showFieldError(fields.lastName, 'Last name is required'); valid = false; }
    if (!fields.message?.value.trim())   { showFieldError(fields.message, 'Message is required'); valid = false; }

    if (!valid) { showToast('Please fill in the required fields', 'error'); return; }

    const record = DB.submitInquiry({
      firstName: fields.firstName.value.trim(),
      lastName:  fields.lastName.value.trim(),
      major:     fields.major?.value.trim() || '',
      message:   fields.message.value.trim(),
    });

    form.innerHTML = `
      <div class="form-success">
        <div class="checkmark"><span class="material-symbols-outlined" style="font-size:2.5rem">check</span></div>
        <h3 class="font-headline text-2xl font-bold text-primary mb-3">Inquiry Submitted</h3>
        <p class="text-on-surface-variant mb-2">Thank you for reaching out! Your inquiry has been recorded.</p>
        <p class="font-label text-xs text-outline uppercase tracking-widest">Reference: ${record.id}</p>
      </div>
    `;

    showToast('Inquiry submitted successfully!', 'success');
  });
}

/* ── Internship Application Form ──────────────────────── */
function initInternshipForm() {
  const form = document.getElementById('internship-form');
  if (!form) return;

  // Load saved draft if any
  const draft = DB.loadDraft('internship-app');
  if (draft) {
    Object.keys(draft).forEach(key => {
      if (key.startsWith('_')) return;
      const field = form.querySelector(`[data-field="${key}"]`);
      if (field) field.value = draft[key];
    });
    showToast('Draft loaded from your last session', 'info');
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors(form);

    const fields = {
      fullName:    form.querySelector('[data-field="full-name"]'),
      studentId:   form.querySelector('[data-field="student-id"]'),
      email:       form.querySelector('[data-field="email"]'),
      major:       form.querySelector('[data-field="major"]'),
      gpa:         form.querySelector('[data-field="gpa"]'),
      graduation:  form.querySelector('[data-field="graduation"]'),
      portfolio:   form.querySelector('[data-field="portfolio"]'),
      statement:   form.querySelector('[data-field="statement"]'),
    };

    let valid = true;
    if (!fields.fullName?.value.trim())  { showFieldError(fields.fullName, 'Full name is required'); valid = false; }
    if (!fields.studentId?.value.trim()) { showFieldError(fields.studentId, 'Student ID is required'); valid = false; }
    if (!fields.email?.value.trim())     { showFieldError(fields.email, 'Email is required'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) {
      showFieldError(fields.email, 'Please enter a valid email'); valid = false;
    }
    if (!fields.major?.value.trim())     { showFieldError(fields.major, 'Major is required'); valid = false; }
    if (!fields.statement?.value.trim()) { showFieldError(fields.statement, 'Statement of intent is required'); valid = false; }

    if (!valid) {
      showToast('Please complete all required fields', 'error');
      const firstError = form.querySelector('.field-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const fileInfo = form.querySelector('.file-name-display');
    const fileName = fileInfo ? fileInfo.textContent : '';

    const record = DB.submitApplication({
      fullName:   fields.fullName.value.trim(),
      studentId:  fields.studentId.value.trim(),
      email:      fields.email.value.trim(),
      major:      fields.major.value.trim(),
      gpa:        fields.gpa?.value.trim() || '',
      graduation: fields.graduation?.value || '',
      portfolio:  fields.portfolio?.value.trim() || '',
      statement:  fields.statement.value.trim(),
      resume:     fileName,
      position:   'Junior Software Engineer',
      company:    'Google',
    });

    DB.clearDraft('internship-app');

    // Replace form with success state
    const formParent = form.closest('main');
    if (formParent) {
      formParent.innerHTML = `
        <div class="max-w-2xl mx-auto py-24 text-center">
          <div class="form-success">
            <div class="checkmark"><span class="material-symbols-outlined" style="font-size:2.5rem">check</span></div>
            <h2 class="font-headline text-4xl font-bold text-primary mb-4">Application Submitted</h2>
            <p class="text-on-surface-variant text-lg mb-3">Your application for <strong>Junior Software Engineer at Google</strong> has been received.</p>
            <p class="font-label text-xs text-outline uppercase tracking-widest mb-8">Reference: ${record.id}</p>
            <div class="bg-surface-container-low p-8 rounded-xl text-left max-w-md mx-auto mb-8">
              <h4 class="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">What's Next?</h4>
              <ul class="space-y-3 text-sm text-on-surface-variant">
                <li class="flex gap-3"><span class="material-symbols-outlined text-secondary text-base">schedule</span>Review period: 2–3 weeks</li>
                <li class="flex gap-3"><span class="material-symbols-outlined text-secondary text-base">mail</span>Status updates sent to ${fields.email.value.trim()}</li>
                <li class="flex gap-3"><span class="material-symbols-outlined text-secondary text-base">groups</span>Interview invitations via portal</li>
              </ul>
            </div>
            <button onclick="portalNav('portal')" class="bg-primary text-on-primary px-10 py-4 rounded-md font-label font-bold text-sm tracking-widest hover:opacity-90 transition-opacity">
              Return to Dashboard
            </button>
          </div>
        </div>
      `;
    }

    showToast('Application submitted successfully!', 'success');
  });
}

/* ── Save Draft ───────────────────────────────────────── */
function saveDraft() {
  const form = document.getElementById('internship-form');
  if (!form) return;
  const data = {};
  form.querySelectorAll('[data-field]').forEach(field => {
    data[field.dataset.field] = field.value;
  });
  DB.saveDraft('internship-app', data);
  showToast('Draft saved successfully', 'success');
}

/* ── File Upload ──────────────────────────────────────── */
function initFileUpload() {
  const zone = document.querySelector('.file-upload-zone');
  if (!zone) return;
  const input = zone.querySelector('input[type="file"]');
  if (!input) return;

  input.addEventListener('change', function() {
    if (this.files.length > 0) {
      handleFileSelected(zone, this.files[0]);
    }
  });

  zone.addEventListener('dragover', function(e) {
    e.preventDefault(); zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', function(e) {
    e.preventDefault(); zone.classList.remove('drag-over');
  });
  zone.addEventListener('drop', function(e) {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(zone, e.dataTransfer.files[0]);
    }
  });
}

function handleFileSelected(zone, file) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('File exceeds 10MB limit', 'error');
    return;
  }
  zone.classList.add('has-file');
  const info = zone.querySelector('.file-info');
  if (info) {
    info.innerHTML = `
      <span class="material-symbols-outlined" style="color:#166534;font-size:1.25rem">description</span>
      <span class="file-name-display">${file.name}</span>
      <span style="color:#6b7280">(${(file.size / 1024).toFixed(1)} KB)</span>
      <button type="button" onclick="removeFile(this)" style="margin-left:auto;color:#ef4444;cursor:pointer;background:none;border:none">
        <span class="material-symbols-outlined" style="font-size:1.25rem">close</span>
      </button>
    `;
  }
  showToast(`File "${file.name}" attached`, 'success');
}

function removeFile(btn) {
  const zone = btn.closest('.file-upload-zone');
  if (zone) {
    zone.classList.remove('has-file');
    const input = zone.querySelector('input[type="file"]');
    if (input) input.value = '';
  }
}

/* ── Tuition Calculator ───────────────────────────────── */
function initTuitionCalculator() {
  const residencySelect = document.getElementById('tuition-residency');
  const modalitySelect  = document.getElementById('tuition-modality');
  const housingSelect   = document.getElementById('tuition-housing');
  const display         = document.getElementById('tuition-display');
  const recalcBtn       = document.getElementById('tuition-recalc');
  if (!residencySelect || !modalitySelect || !housingSelect || !display) return;

  function updateHousingState() {
    const isOnline = modalitySelect.value === 'Online';
    housingSelect.disabled = isOnline;
    if (isOnline) {
      housingSelect.selectedIndex = 0;
      housingSelect.style.opacity = '0.4';
      housingSelect.style.cursor = 'not-allowed';
    } else {
      housingSelect.style.opacity = '1';
      housingSelect.style.cursor = '';
    }
  }

  function calculate() {
    const residencyMap = { 'In-State Resident': 'in_state', 'Out-of-State': 'out_of_state', 'International': 'international' };
    const housingMap   = { 'On-Campus Dormitory': 'on_campus', 'Off-Campus': 'off_campus', 'Living with Family': 'family' };
    const modalityMap  = { 'In-Person': 'in_person', 'Online': 'online' };

    const isOnline = modalitySelect.value === 'Online';

    // If required dropdowns are still on placeholder, show $0
    // Online doesn't require housing; in-person requires all three
    if (!residencySelect.value || !modalitySelect.value || (!isOnline && !housingSelect.value)) {
      display.innerHTML = `$0<span class="text-xl font-normal opacity-50 ml-2">/year</span>`;
      const breakdown = document.getElementById('tuition-breakdown');
      if (breakdown) breakdown.innerHTML = '';
      return;
    }

    const r = residencyMap[residencySelect.value] || 'out_of_state';
    const h = housingMap[housingSelect.value] || 'on_campus';
    const m = modalityMap[modalitySelect.value] || 'in_person';
    const result = DB.calculateTuition(r, h, m);
    display.innerHTML = `$${result.total.toLocaleString()}<span class="text-xl font-normal opacity-50 ml-2">/year</span>`;

    // Update breakdown
    const breakdown = document.getElementById('tuition-breakdown');
    if (breakdown) {
      breakdown.innerHTML = `
        <div class="flex justify-between text-sm"><span class="text-on-primary-container font-label text-xs uppercase">Tuition (${result.modality})</span><span>$${result.tuition.toLocaleString()}</span></div>
        <div class="flex justify-between text-sm"><span class="text-on-primary-container font-label text-xs uppercase">Fees</span><span>$${result.fees.toLocaleString()}</span></div>
        ${result.housing > 0 ? `<div class="flex justify-between text-sm"><span class="text-on-primary-container font-label text-xs uppercase">Housing</span><span>$${result.housing.toLocaleString()}</span></div>` : ''}
        ${isOnline ? `<div class="text-xs text-on-primary-container/60 italic mt-2">Online students are not charged housing fees.</div>` : ''}
      `;
    }
  }

  modalitySelect.addEventListener('change', function() {
    updateHousingState();
    calculate();
  });
  residencySelect.addEventListener('change', calculate);
  housingSelect.addEventListener('change', calculate);
  if (recalcBtn) recalcBtn.addEventListener('click', function() {
    const isOnline = modalitySelect.value === 'Online';
    if (!residencySelect.value || !modalitySelect.value || (!isOnline && !housingSelect.value)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    calculate();
    showToast('Tuition estimate updated', 'info');
  });

  // No initial calculation — starts at $0
}

/* ── Reset Tuition Calculator ─────────────────────────── */
function resetTuitionCalculator() {
  const residencySelect = document.getElementById('tuition-residency');
  const modalitySelect  = document.getElementById('tuition-modality');
  const housingSelect   = document.getElementById('tuition-housing');
  const display         = document.getElementById('tuition-display');
  const breakdown       = document.getElementById('tuition-breakdown');
  if (residencySelect) residencySelect.selectedIndex = 0;
  if (modalitySelect) modalitySelect.selectedIndex = 0;
  if (housingSelect) { housingSelect.selectedIndex = 0; housingSelect.disabled = false; housingSelect.style.opacity = '1'; housingSelect.style.cursor = ''; }
  if (display) display.innerHTML = `$0<span class="text-xl font-normal opacity-50 ml-2">/year</span>`;
  if (breakdown) breakdown.innerHTML = '';
}

/* ── Academics Search/Filter ──────────────────────────── */
function initAcademicsFilter() {
  const searchInput = document.getElementById('academics-search');
  const levelSelect = document.getElementById('academics-level');
  const areaSelect  = document.getElementById('academics-area');
  if (!searchInput) return;

  function filterCards() {
    const query = searchInput.value.toLowerCase();
    const level = levelSelect ? levelSelect.value : '';
    const area  = areaSelect ? areaSelect.value : '';
    const cards = document.querySelectorAll('.college-card');

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardLevel = card.dataset.level || '';
      const cardArea  = card.dataset.area || '';

      let show = true;
      if (query && !text.includes(query)) show = false;
      if (level && level !== 'all' && cardLevel && !cardLevel.includes(level)) show = false;
      if (area && area !== 'all' && cardArea && !cardArea.includes(area)) show = false;

      card.classList.toggle('hidden-filter', !show);
    });
  }

  searchInput.addEventListener('input', filterCards);
  if (levelSelect) levelSelect.addEventListener('change', filterCards);
  if (areaSelect) areaSelect.addEventListener('change', filterCards);
}

/* ── Settle Fees Modal ────────────────────────────────── */
function settleFees() {
  const fees = DB.getFees().filter(f => f.status !== 'paid');
  if (fees.length === 0) {
    showToast('All fees are already paid!', 'success');
    return;
  }
  const total = fees.reduce((s, f) => s + f.amount, 0);
  const feeList = fees.map(f =>
    `<div class="flex justify-between py-2 border-b border-outline-variant/20">
      <span class="text-sm">${f.type}</span>
      <span class="font-bold text-sm">$${f.amount.toFixed(2)}</span>
    </div>`
  ).join('');

  openModal('Settle Outstanding Fees', `
    <div class="space-y-2 mb-6">${feeList}</div>
    <div class="flex justify-between py-3 border-t-2 border-primary">
      <span class="font-label text-sm font-bold uppercase">Total Due</span>
      <span class="font-headline text-2xl font-bold text-primary">$${total.toFixed(2)}</span>
    </div>
    <p class="text-xs text-on-surface-variant mt-4 italic">This is a demo — no real payment will be processed.</p>
  `, [
    { label: 'Cancel', onclick: 'closeModal()', class: 'font-label text-sm text-on-surface-variant font-bold hover:text-primary transition-colors' },
    { label: 'Pay Now', onclick: 'processPayment()' },
  ]);
}

function processPayment() {
  const fees = DB.getFees().filter(f => f.status !== 'paid');
  fees.forEach(f => DB.payFee(f.id));
  closeModal();
  showToast('All fees have been settled!', 'success');

  // Update the billing card on the portal page
  const balanceEl = document.querySelector('#page-portal .billing-balance');
  if (balanceEl) balanceEl.textContent = '$0.00';

  const feeItems = document.querySelector('#page-portal .billing-items');
  if (feeItems) feeItems.innerHTML = '<p class="text-sm text-on-primary-container italic">All fees are paid!</p>';

  const settleBtn = document.querySelector('#page-portal .settle-btn');
  if (settleBtn) { settleBtn.textContent = 'ALL PAID'; settleBtn.disabled = true; settleBtn.style.opacity = '0.5'; }
}

/* ── Init all forms on page load ──────────────────────── */
function initAllForms() {
  initContactForm();
  initInternshipForm();
  initFileUpload();
  initTuitionCalculator();
  initAcademicsFilter();
}
