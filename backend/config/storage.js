
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME;

if (!supabaseUrl || !supabaseSecretKey || !bucketName) {
  throw new Error(
    'Missing Supabase configuration. Check SUPABASE_URL, SUPABASE_SECRET_KEY and SUPABASE_BUCKET_NAME in backend/.env'
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = {
  supabase,
  bucketName,
};
