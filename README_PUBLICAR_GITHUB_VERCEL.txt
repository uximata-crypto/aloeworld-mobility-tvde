ALOeworld Mobility TVDE — Pacote final testado para GitHub/Vercel

Ficheiros:
- index.html
- api/send-registration-email.js
- package.json
- vercel.json
- .env.example
- RELATORIO_TESTE_FINAL.md

Como publicar:
1. Extraia este ZIP.
2. No GitHub, envie todos os ficheiros e a pasta api.
3. Faça commit.
4. No Vercel, importe o repositório.
5. Configure Environment Variables:
   - RESEND_API_KEY
   - EMAIL_FROM
   - ADMIN_EMAIL, opcional
6. Faça Deploy/Redeploy.

Nota:
- GitHub Pages não executa API. Para email real automático, tem de usar Vercel.
- Sem configurar RESEND_API_KEY e EMAIL_FROM, o site continua a funcionar visualmente, mas o email real falha.
