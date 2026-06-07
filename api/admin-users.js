import { createClient } from '@supabase/supabase-js';

function clean(value) {
  return String(value || '').trim();
}

function adminEmailList() {
  return clean(process.env.ADMIN_EMAIL)
    .toLowerCase()
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

async function requireAdmin(req) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { error: 'Variáveis SUPABASE não configuradas no Vercel.', status: 500 };
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return { error: 'Sessão em falta. Faça login novamente.', status: 401 };

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) {
    return { error: 'Sessão inválida. Faça login novamente.', status: 401 };
  }

  const allowed = adminEmailList();
  const userEmail = clean(data.user.email).toLowerCase();

  if (!allowed.length || !allowed.includes(userEmail)) {
    return {
      error: 'Sem permissão de administrador. Entre com o email definido em ADMIN_EMAIL no Vercel.',
      status: 403
    };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return { admin, user: data.user };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const { data, error } = await auth.admin
      .from('profiles')
      .select('id, username, email, role, nome, telefone, cidade, estado, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      admin_email: auth.user.email,
      users: data || []
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Erro interno ao carregar utilizadores.'
    });
  }
}
