/* ═══════════════════════════════════════════════════════
   Supabase Configuration
   ═══════════════════════════════════════════════════════

   HOW TO SET UP:
   1. Create a free project at https://supabase.com
   2. Go to SQL Editor → paste and run db/schema.sql
   3. Go to Settings → API → copy your Project URL and anon key
   4. Paste them below
   ═══════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'YOUR_SUPABASE_URL';   // e.g. https://abcxyz.supabase.co
const SUPABASE_KEY  = 'YOUR_SUPABASE_ANON_KEY';

// Set to true to force localStorage fallback (useful for offline dev)
const FORCE_LOCAL   = false;

// Auto-detect: use Supabase if configured, otherwise fall back to localStorage
const USE_SUPABASE  = !FORCE_LOCAL
  && SUPABASE_URL  !== 'YOUR_SUPABASE_URL'
  && SUPABASE_KEY  !== 'YOUR_SUPABASE_ANON_KEY';
