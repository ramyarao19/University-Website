/* ═══════════════════════════════════════════════════════
   Database Layer — Supabase (cloud) + localStorage fallback

   Exposes the same DB.* API regardless of backend.
   If Supabase is configured (supabase-config.js), all data
   is read/written to your Supabase PostgreSQL database.
   Otherwise, falls back to localStorage for offline dev.
   ═══════════════════════════════════════════════════════ */

const DB = (function () {

  /* ══════════════════════════════════════════════════════
     SHARED STATE
     ══════════════════════════════════════════════════════ */
  let _sb = null;            // Supabase client (if configured)
  let _local = null;         // localStorage cache (fallback mode)
  const STORAGE_KEY = 'scholarly_db';

  // Static tuition/housing rates (not stored in Supabase — they're reference data)
  const TUITION_RATES = {
    in_state:      { tuition: 28500, fees: 2800 },
    out_of_state:  { tuition: 42500, fees: 3200 },
    international: { tuition: 52000, fees: 4500 }
  };
  const HOUSING_RATES = {
    on_campus:  12800,
    off_campus: 9600,
    family:     0
  };

  /* ══════════════════════════════════════════════════════
     INITIALIZATION
     ══════════════════════════════════════════════════════ */
  async function init() {
    if (typeof USE_SUPABASE !== 'undefined' && USE_SUPABASE) {
      try {
        _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        // Quick connectivity test
        const { error } = await _sb.from('students').select('id').limit(1);
        if (error) throw error;
        console.log('%c✓ Supabase connected', 'color:#22c55e;font-weight:bold');
        return;
      } catch (e) {
        console.warn('Supabase connection failed, falling back to localStorage:', e.message);
        _sb = null;
      }
    }
    // Fallback: localStorage
    console.log('%c⚡ Using localStorage fallback', 'color:#f59e0b;font-weight:bold');
    _localInit();
  }

  /* ══════════════════════════════════════════════════════
     LOCAL STORAGE FALLBACK (same logic as before)
     ══════════════════════════════════════════════════════ */
  function _uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  function _localSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_local));
  }
  function _localInit() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { _local = JSON.parse(raw); return; } catch (e) { /* re-seed */ }
    }
    // Seed from fetch
    return fetch('data/seed.json')
      .then(r => r.json())
      .then(seed => {
        _local = {
          student:       seed.student,
          fees:          seed.fees,
          internships:   seed.internships,
          notifications: seed.notifications,
          tuition_rates: seed.tuition_rates,
          housing_rates: seed.housing_rates,
          inquiries:     [],
          applications:  [],
          drafts:        {}
        };
        _localSave();
      })
      .catch(() => {
        _local = { student: {}, fees: [], internships: [], notifications: [],
                   tuition_rates: {}, housing_rates: {}, inquiries: [],
                   applications: [], drafts: {} };
      });
  }

  /* ══════════════════════════════════════════════════════
     STUDENT
     ══════════════════════════════════════════════════════ */
  async function getStudent() {
    if (_sb) {
      const { data } = await _sb.from('students').select('*').limit(1).single();
      return data || {};
    }
    return _local ? _local.student : {};
  }

  /* ══════════════════════════════════════════════════════
     FEES
     ══════════════════════════════════════════════════════ */
  async function getFees() {
    if (_sb) {
      const { data } = await _sb.from('fees').select('*').order('due_date', { ascending: true });
      // Map DB columns to the shape the UI expects
      return (data || []).map(f => ({
        id: f.id, type: f.type, amount: parseFloat(f.amount),
        due: f.due_date, status: f.status, paid_date: f.paid_date
      }));
    }
    return (_local && _local.fees) || [];
  }

  async function payFee(feeId) {
    if (_sb) {
      const { data, error } = await _sb.from('fees')
        .update({ status: 'paid', paid_date: new Date().toISOString() })
        .eq('id', feeId)
        .select()
        .single();
      if (error) console.error('payFee error:', error);
      return data;
    }
    const list = _local.fees;
    const idx = list.findIndex(f => f.id === feeId);
    if (idx !== -1) {
      list[idx].status = 'paid';
      list[idx].paid_date = new Date().toISOString();
      _localSave();
      return list[idx];
    }
    return null;
  }

  async function getOutstandingBalance() {
    const fees = await getFees();
    return fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
  }

  /* ══════════════════════════════════════════════════════
     NOTIFICATIONS
     ══════════════════════════════════════════════════════ */
  async function getNotifications() {
    if (_sb) {
      const { data } = await _sb.from('notifications').select('*').order('created_at', { ascending: false });
      return (data || []).map(n => ({
        id: n.id, title: n.title, body: n.body,
        time: n.time_label, icon: n.icon, read: n.read
      }));
    }
    return (_local && _local.notifications) || [];
  }

  async function markNotifRead(id) {
    if (_sb) {
      const { data } = await _sb.from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();
      return data;
    }
    const list = _local.notifications;
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) { list[idx].read = true; _localSave(); return list[idx]; }
    return null;
  }

  async function getUnreadCount() {
    const notifs = await getNotifications();
    return notifs.filter(n => !n.read).length;
  }

  /* ══════════════════════════════════════════════════════
     INTERNSHIPS
     ══════════════════════════════════════════════════════ */
  async function getInternships() {
    if (_sb) {
      const { data } = await _sb.from('internships').select('*').order('deadline', { ascending: true });
      return data || [];
    }
    return (_local && _local.internships) || [];
  }

  /* ══════════════════════════════════════════════════════
     INQUIRIES (Contact Form)
     ══════════════════════════════════════════════════════ */
  async function submitInquiry(formData) {
    if (_sb) {
      const { data, error } = await _sb.from('inquiries').insert({
        first_name: formData['first-name'] || formData.first_name,
        last_name:  formData['last-name']  || formData.last_name,
        major:      formData.major || null,
        message:    formData.message,
        status:     'new'
      }).select().single();
      if (error) { console.error('submitInquiry error:', error); return null; }
      return data;
    }
    // Fallback
    const entry = { id: _uid(), ...formData, status: 'new', _created: new Date().toISOString() };
    _local.inquiries.push(entry);
    _localSave();
    return entry;
  }

  /* ══════════════════════════════════════════════════════
     APPLICATIONS (Internship Form)
     ══════════════════════════════════════════════════════ */
  async function submitApplication(formData) {
    if (_sb) {
      const { data, error } = await _sb.from('applications').insert({
        full_name:   formData['full-name']   || formData.full_name,
        student_id:  formData['student-id']  || formData.student_id,
        email:       formData.email,
        major:       formData.major || null,
        gpa:         formData.gpa || null,
        graduation:  formData.graduation || null,
        portfolio:   formData.portfolio || null,
        statement:   formData.statement || null,
        resume_name: formData['resume-name'] || formData.resume_name || null,
        position:    formData.position || null,
        company:     formData.company || null,
        status:      'submitted'
      }).select().single();
      if (error) { console.error('submitApplication error:', error); return null; }
      return data;
    }
    const entry = { id: _uid(), ...formData, status: 'submitted', _created: new Date().toISOString() };
    _local.applications.push(entry);
    _localSave();
    return entry;
  }

  async function getApplications() {
    if (_sb) {
      const { data } = await _sb.from('applications').select('*').order('created_at', { ascending: false });
      return data || [];
    }
    return (_local && _local.applications) || [];
  }

  /* ══════════════════════════════════════════════════════
     DRAFTS
     ══════════════════════════════════════════════════════ */
  async function saveDraft(formId, formData) {
    if (_sb) {
      const { error } = await _sb.from('drafts').upsert({
        id:       formId,
        data:     formData,
        saved_at: new Date().toISOString()
      });
      if (error) console.error('saveDraft error:', error);
      return;
    }
    if (!_local.drafts) _local.drafts = {};
    _local.drafts[formId] = { ...formData, _saved: new Date().toISOString() };
    _localSave();
  }

  async function loadDraft(formId) {
    if (_sb) {
      const { data } = await _sb.from('drafts').select('data').eq('id', formId).single();
      return data ? data.data : null;
    }
    return (_local && _local.drafts && _local.drafts[formId]) || null;
  }

  async function clearDraft(formId) {
    if (_sb) {
      await _sb.from('drafts').delete().eq('id', formId);
      return;
    }
    if (_local && _local.drafts) { delete _local.drafts[formId]; _localSave(); }
  }

  /* ══════════════════════════════════════════════════════
     TUITION CALCULATOR (static rates — no DB call needed)
     ══════════════════════════════════════════════════════ */
  function calculateTuition(residency, housing) {
    const r = TUITION_RATES[residency] || TUITION_RATES['out_of_state'];
    const h = HOUSING_RATES[housing] || 0;
    return {
      tuition: r.tuition,
      fees:    r.fees,
      housing: h,
      total:   r.tuition + r.fees + h
    };
  }

  /* ══════════════════════════════════════════════════════
     GENERIC CRUD (for any table)
     ══════════════════════════════════════════════════════ */
  async function getAll(collection) {
    if (_sb) {
      const { data } = await _sb.from(collection).select('*');
      return data || [];
    }
    return (_local && _local[collection]) || [];
  }

  async function getById(collection, id) {
    if (_sb) {
      const { data } = await _sb.from(collection).select('*').eq('id', id).single();
      return data || null;
    }
    const list = (_local && _local[collection]) || [];
    return list.find(item => item.id === id) || null;
  }

  async function insert(collection, record) {
    if (_sb) {
      const { data, error } = await _sb.from(collection).insert(record).select().single();
      if (error) { console.error(`insert(${collection}) error:`, error); return null; }
      return data;
    }
    if (!_local[collection]) _local[collection] = [];
    const entry = { id: _uid(), ...record, _created: new Date().toISOString() };
    _local[collection].push(entry);
    _localSave();
    return entry;
  }

  async function update(collection, id, changes) {
    if (_sb) {
      const { data, error } = await _sb.from(collection)
        .update(changes).eq('id', id).select().single();
      if (error) { console.error(`update(${collection}) error:`, error); return null; }
      return data;
    }
    const list = (_local && _local[collection]) || [];
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return null;
    Object.assign(list[idx], changes, { _updated: new Date().toISOString() });
    _localSave();
    return list[idx];
  }

  async function remove(collection, id) {
    if (_sb) {
      const { error } = await _sb.from(collection).delete().eq('id', id);
      return !error;
    }
    if (!_local[collection]) return false;
    const before = _local[collection].length;
    _local[collection] = _local[collection].filter(item => item.id !== id);
    _localSave();
    return _local[collection].length < before;
  }

  /* ══════════════════════════════════════════════════════
     DEBUG / RESET
     ══════════════════════════════════════════════════════ */
  async function reset() {
    if (_sb) {
      console.log('To reset Supabase data, re-run db/schema.sql in the SQL Editor.');
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    _local = null;
    return _localInit();
  }

  async function dump() {
    if (_sb) {
      const tables = ['students','fees','internships','inquiries','applications','notifications','drafts'];
      const result = {};
      for (const t of tables) {
        const { data } = await _sb.from(t).select('*');
        result[t] = data;
      }
      return result;
    }
    return JSON.parse(JSON.stringify(_local));
  }

  /* ══════════════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════════════ */
  return {
    init, getAll, getById, insert, update, remove,
    getStudent, getFees, payFee, getOutstandingBalance,
    getNotifications, markNotifRead, getUnreadCount,
    getInternships,
    submitInquiry, submitApplication, getApplications,
    saveDraft, loadDraft, clearDraft,
    calculateTuition, reset, dump
  };
})();
