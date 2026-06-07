ALOE - GO — Área de Administração para Aprovação de Utilizadores

Funcionalidade adicionada:
- Área Admin ligada ao Supabase.
- Lista utilizadores reais da tabela public.profiles.
- Permite alterar o estado para:
  - aprovado
  - pendente
  - a_rever
  - recusado

Segurança:
- Só consegue usar a área Admin quem iniciar sessão com o email configurado na variável ADMIN_EMAIL do Vercel.
- A escrita na tabela profiles é feita por funções Vercel usando SUPABASE_SERVICE_ROLE_KEY.
- Nunca coloque SUPABASE_SERVICE_ROLE_KEY no GitHub.

Ficheiros novos:
- api/admin-users.js
- api/admin-update-user.js
- README_ADMIN_APROVACAO.txt

Ficheiros atualizados:
- index.html
- .env.example

Passos:
1. Substitua/carregue os ficheiros no GitHub.
2. Confirme as variáveis no Vercel:
   RESEND_API_KEY
   EMAIL_FROM
   ADMIN_EMAIL
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
3. Faça Redeploy no Vercel.
4. Entre no site com o email igual ao ADMIN_EMAIL.
5. Abra o separador Admin e clique em “Atualizar lista”.
6. Aprove, recuse ou coloque utilizadores em revisão.

Notas:
- A tabela public.profiles deve existir.
- As permissões da tabela devem permitir acesso ao service_role.
