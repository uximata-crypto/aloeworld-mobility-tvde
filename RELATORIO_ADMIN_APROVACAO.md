# Relatório — Área de Administração ALOE - GO

## Implementado
- Administração real por API Vercel.
- Listagem de utilizadores da tabela `profiles`.
- Atualização real do campo `estado`.
- Controlo de acesso por `ADMIN_EMAIL`.
- Compatível com login real Supabase já configurado.

## Estados disponíveis
- pendente
- aprovado
- a_rever
- recusado

## APIs adicionadas
- `GET /api/admin-users`
- `POST /api/admin-update-user`

## Variáveis necessárias no Vercel
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
