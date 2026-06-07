ALOE - GO — Mapa gratuito OpenStreetMap + Leaflet

Esta versão remove a dependência do Google Maps e substitui o mapa por OpenStreetMap + Leaflet.

O que muda:
- Não precisa de GOOGLE_MAPS_API_KEY.
- Não precisa de faturação Google.
- Não precisa de criar chave Google Cloud.
- Mantém mapa interativo dentro das áreas Passageiro e Motorista.
- Mantém localização atual, origem, destino e rota demonstrativa.

Ficheiros que devem ficar no GitHub:
- index.html
- package.json
- vercel.json
- .env.example
- api/send-registration-email.js
- README_MAPA_GRATUITO.txt

Ficheiros que pode remover:
- api/google-maps-config.js
- api/check-env.js
- README_GOOGLE_MAPS.txt

Variáveis necessárias no Vercel:
- RESEND_API_KEY
- EMAIL_FROM
- ADMIN_EMAIL

Não é necessária a variável GOOGLE_MAPS_API_KEY.

Notas:
- O mapa usa tiles públicos do OpenStreetMap via Leaflet.
- A rota é demonstrativa/linha reta entre origem e destino após geocodificação.
- Para rota rodoviária real em produção, será necessário integrar OSRM, OpenRouteService, MapTiler, Mapbox ou serviço equivalente.

Depois de atualizar o GitHub:
1. Confirme a estrutura no repositório.
2. Faça Redeploy no Vercel.
3. Teste Acesso → Criar registo → Passageiro.
4. Teste Acesso → Criar registo → Motorista.


Correção visual: textos dos campos Origem/Destino e notas do mapa foram forçados a cor escura para boa leitura dentro da secção Acesso.
