import { createClient } from '@supabase/supabase-js';

function clean(value) {
  return String(value || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return res.status(500).json({ error: 'Variáveis SUPABASE não configuradas no Vercel.' });
    }

    const login = clean(req.body?.login).toLowerCase();
    const password = String(req.body?.password || '');

    if (!login) return res.status(400).json({ error: 'Indique o username ou email.' });
    if (!password) return res.status(400).json({ error: 'Indique a password.' });

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    let email = login;

    if (!login.includes('@')) {
      const { data: profileByUsername, error: lookupError } = await admin
        .from('profiles')
        .select('email')
        .eq('username', login)
        .maybeSingle();

      if (lookupError) throw lookupError;
      if (!profileByUsername?.email) {
        return res.status(401).json({ error: 'Username/email ou password inválidos.' });
      }
      email = profileByUsername.email;
    }

    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      return res.status(401).json({ error: 'Username/email ou password inválidos.' });
    }

    const userId = signInData?.user?.id;
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    return res.status(200).json({
      ok: true,
      user: {
        id: signInData.user.id,
        email: signInData.user.email
      },
      profile,
      access_token: signInData.session?.access_token || null,
      refresh_token: signInData.session?.refresh_token || null,
      expires_at: signInData.session?.expires_at || null
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erro interno no login.' });
  }
}
