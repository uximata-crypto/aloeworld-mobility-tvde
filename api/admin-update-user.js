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

function normalizeEstado(value) {
  const v = clean(value).toLowerCase().replace(/\s+/g, '_').replace('-', '_');
  const map = {
    aprovado: 'aprovado',
    aprovar: 'aprovado',
    pendente: 'pendente',
    recusado: 'recusado',
    rejeitado: 'recusado',
    a_rever: 'a_rever',
    rever: 'a_rever'
  };
  return map[v] || null;
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const id = clean(req.body?.id);
    const estado = normalizeEstado(req.body?.estado);

    if (!id) return res.status(400).json({ error: 'ID do utilizador em falta.' });
    if (!estado) return res.status(400).json({ error: 'Estado inválido. Use aprovado, pendente, a_rever ou recusado.' });

    const { data, error } = await auth.admin
      .from('profiles')
      .update({
        estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, username, email, role, nome, telefone, cidade, estado, created_at, updated_at')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Perfil não encontrado.' });

    return res.status(200).json({
      ok: true,
      updated_by: auth.user.email,
      profile: data
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Erro interno ao atualizar utilizador.'
    });
  }
}
