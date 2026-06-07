ALOeWORLD MOBILITY TVDE — LOGIN REAL COM SUPABASE
==================================================

Esta versão transforma o login visual em login real com Supabase Auth + base de dados.
Mantém:
- Mapa gratuito OpenStreetMap + Leaflet;
- Email real via Resend;
- Vercel Functions;
- Registos de passageiro, operador, motorista e veículo com username/password.

FICHEIROS PRINCIPAIS
--------------------
index.html
api/register-user.js
api/login-user.js
api/me.js
api/send-registration-email.js
package.json
vercel.json
.env.example

VARIÁVEIS NO VERCEL
-------------------
Manter as existentes:
RESEND_API_KEY
EMAIL_FROM
ADMIN_EMAIL

Adicionar as novas do Supabase:
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

IMPORTANTE:
A SUPABASE_SERVICE_ROLE_KEY é secreta. Nunca colocar no index.html nem partilhar publicamente.
Só deve estar no Vercel como Environment Variable sensível.

SQL PARA SUPABASE
-----------------
No Supabase, vá a SQL Editor e execute:

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  role text not null check (role in ('passageiro','operador','motorista','veiculo')),
  nome text,
  telefone text,
  cidade text,
  estado text not null default 'pendente',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);

PASSOS NO SUPABASE
------------------
1. Criar projeto Supabase.
2. Copiar Project URL para SUPABASE_URL.
3. Copiar anon public key para SUPABASE_ANON_KEY.
4. Copiar service_role key para SUPABASE_SERVICE_ROLE_KEY.
5. Executar o SQL acima no SQL Editor.
6. Confirmar que Email/Password está ativo em Authentication > Providers.

PASSOS NO GITHUB
----------------
Substituir/carregar os ficheiros desta pasta para o repositório aloeworld-mobility-tvde.

A estrutura final recomendada:
api/
  register-user.js
  login-user.js
  me.js
  send-registration-email.js

.env.example
index.html
package.json
vercel.json
README_MAPA_GRATUITO.txt
README_LOGIN_REAL_SUPABASE.txt

PASSOS NO VERCEL
----------------
1. Settings > Environment Variables.
2. Confirmar RESEND_API_KEY, EMAIL_FROM e ADMIN_EMAIL.
3. Adicionar SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.
4. Fazer Redeploy.
5. Testar:
   - Criar registo de passageiro;
   - Iniciar sessão com email ou username + password.

NOTAS
-----
- As contas são criadas como confirmadas para permitir login imediato.
- O estado inicial do perfil fica "pendente" para validação administrativa.
- O login aceita email ou username.
- A password nunca fica gravada na tabela profiles; fica apenas no Supabase Auth.
