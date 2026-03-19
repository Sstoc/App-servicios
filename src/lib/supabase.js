import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://crxnuxqiguudwxlmswxe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_b-e9zIlxcPbOhgQF8px9BQ_o8CHb3yL';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
