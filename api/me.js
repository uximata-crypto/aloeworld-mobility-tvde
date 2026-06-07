import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return res.status(500).json({ error: 'Variáveis SUPABASE não configuradas no Vercel.' });
    }

    if (!token) return res.status(401).json({ error: 'Token em falta.' });

    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Sessão inválida.' });

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    return res.status(200).json({ ok: true, user: data.user, profile });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erro interno.' });
  }
}
