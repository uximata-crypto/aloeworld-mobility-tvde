import { createClient } from '@supabase/supabase-js';

const roleMap = {
  passageiro: 'passageiro',
  operador: 'operador',
  motorista: 'motorista',
  veiculo: 'veiculo',
  veículo: 'veiculo',
  vehicle: 'veiculo',
  driver: 'motorista',
  operator: 'operador',
  passenger: 'passageiro'
};

function clean(value) {
  return String(value || '').trim();
}

function normalizeUsername(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function normalizeRole(value) {
  return roleMap[clean(value).toLowerCase()] || 'passageiro';
}

async function sendRegistrationEmail({ payload, userId, emailSentTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !emailFrom) {
    return { sent: false, reason: 'RESEND_API_KEY ou EMAIL_FROM não configurados.' };
  }

  const to = [payload.email];
  if (adminEmail && adminEmail.includes('@')) to.push(adminEmail);

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
      <h2>Novo registo real criado</h2>
      <p><strong>Tipo:</strong> ${payload.role}</p>
      <p><strong>Nome:</strong> ${payload.nome || 'Não indicado'}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Username:</strong> ${payload.username}</p>
      <p><strong>Contacto:</strong> ${payload.telefone || 'Não indicado'}</p>
      <p><strong>Cidade:</strong> ${payload.cidade || 'Não indicada'}</p>
      <p><strong>ID Supabase:</strong> ${userId}</p>
      <p>O registo foi gravado e fica pendente de validação administrativa.</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: emailFrom,
      to,
      subject: `Novo registo ${payload.role} - ALOE - GO`,
      html
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { sent: false, reason: data?.message || data?.error || 'Erro no Resend.' };
  }

  return { sent: true, id: data?.id || null, to: emailSentTo || to };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no Vercel.' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const body = req.body || {};
    const email = clean(body.email).toLowerCase();
    const username = normalizeUsername(body.username);
    const password = String(body.password || '');
    const role = normalizeRole(body.tipo || body.role);

    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email inválido ou em falta.' });
    if (!username || username.length < 3) return res.status(400).json({ error: 'Username inválido. Use pelo menos 3 caracteres.' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });

    const { data: existingUsername, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (usernameError) throw usernameError;
    if (existingUsername) return res.status(409).json({ error: 'Este username já existe.' });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        nome: clean(body.nome),
        role
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message || 'Erro ao criar utilizador no Supabase Auth.' });
    }

    const userId = authData?.user?.id;
    if (!userId) return res.status(500).json({ error: 'Utilizador criado sem ID retornado pelo Supabase.' });

    const profile = {
      id: userId,
      username,
      email,
      role,
      nome: clean(body.nome),
      telefone: clean(body.telefone),
      cidade: clean(body.cidade),
      estado: 'pendente',
      metadata: body.metadata || {}
    };

    const { error: profileError } = await supabase.from('profiles').insert(profile);
    if (profileError) {
      await supabase.auth.admin.deleteUser(userId).catch(() => null);
      return res.status(400).json({ error: profileError.message || 'Erro ao gravar perfil.' });
    }

    const emailResult = await sendRegistrationEmail({ payload: profile, userId });

    return res.status(200).json({
      ok: true,
      user_id: userId,
      profile,
      email_sent: emailResult.sent,
      email_id: emailResult.id || null,
      email_warning: emailResult.sent ? null : emailResult.reason
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erro interno ao criar registo.' });
  }
}
