ALOeWorld Mobility TVDE — Google Maps ligado

Esta versão substitui o mapa visual/simulado por Google Maps real nas áreas:
- Registo de Passageiro
- Registo de Motorista

Novos ficheiros/alterações:
- index.html atualizado
- api/google-maps-config.js criado
- .env.example atualizado com GOOGLE_MAPS_API_KEY
- vercel.json atualizado para incluir a nova função API

Configuração obrigatória no Vercel:
1. Project → Settings → Environment Variables
2. Adicionar:
   GOOGLE_MAPS_API_KEY = a sua chave da Google Maps Platform
3. Fazer Redeploy

Na Google Cloud / Google Maps Platform:
1. Criar ou selecionar projeto
2. Ativar billing
3. Ativar Maps JavaScript API
4. Criar API key
5. Restringir a chave por HTTP referrers:
   https://aloeworld-mobility-tvde.vercel.app/*
   https://*.vercel.app/*  (opcional para testes)
6. Restringir a chave à API: Maps JavaScript API

Depois de publicar:
- Abrir a plataforma
- Acesso → Criar registo
- Passageiro ou Motorista
- O mapa deve carregar com rota Google Maps
