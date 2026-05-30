export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { tipo, email, username, nome, origem } = req.body || {};

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email inválido ou em falta." });
    }

    if (!username) {
      return res.status(400).json({ error: "Username em falta." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const adminEmail = process.env.ADMIN_EMAIL || "";

    if (!apiKey) {
      return res.status(500).json({ error: "RESEND_API_KEY não configurada no Vercel." });
    }

    if (!from) {
      return res.status(500).json({ error: "EMAIL_FROM não configurado no Vercel." });
    }

    const safeTipo = tipo || "registo";
    const safeNome = nome || "Utilizador";
    const subject = "Confirmação de registo — Aloeworld Mobility TVDE";

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="color:#020617">Aloeworld Mobility TVDE</h2>
        <p>Recebemos o seu pedido de registo na plataforma.</p>
        <p><strong>Tipo de registo:</strong> ${safeTipo}</p>
        <p><strong>Nome:</strong> ${safeNome}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>O seu registo ficará sujeito a validação, sempre que aplicável.</p>
        <hr />
        <p style="font-size:12px;color:#64748b">
          Esta mensagem foi enviada automaticamente por ${origem || "Aloeworld Mobility TVDE"}.
        </p>
      </div>
    `;

    const to = [email];
    if (adminEmail && adminEmail.includes("@")) {
      to.push(adminEmail);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, html })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || "Erro ao enviar email via Resend.",
        details: data
      });
    }

    return res.status(200).json({
      ok: true,
      id: data.id || null,
      sentTo: to
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erro interno ao enviar email." });
  }
}
