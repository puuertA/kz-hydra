# KZ Hydra Website

Site institucional/comunitário para o servidor brasileiro **KZ Hydra**, com dados em tempo real da API GOKZ.

## ✨ Funcionalidades

- Home com status da API, players online, servidores ativos e records recentes
- Leaderboards com ranking global e destaques por período
- Perfis de jogadores por `SteamID64` com stats e histórico
- Lista de mapas com leaderboard por mapa
- Feed de atividade recente
- Página de regras e bans ativos
- Guia para iniciantes
- Página de contato/Discord/staff

## 🧱 Estrutura do projeto

- `index.html` — Home
- `leaderboards.html` — Rankings
- `players.html` — Perfis
- `maps.html` — Mapas
- `activity.html` — Atividade
- `rules.html` — Regras/Bans
- `guide.html` — Guia
- `contact.html` — Contato
- `assets/css/styles.css` — Estilos globais
- `assets/js/api.js` — Integração com API GOKZ
- `assets/js/main.js` — Lógica principal das páginas
- `assets/js/ux.js` — Interações/animações de UI

## 🛠️ Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- API pública: `https://api.gokz.top/api/v1`

## ▶️ Rodando localmente

Pré-requisito: Python instalado.

```bash
npm start
```

Abra no navegador:

- `http://localhost:5173/index.html`

## ⚙️ Configurações rápidas

### Botão de conexão Steam

Edite em `assets/js/main.js`:

- `HYDRA_CLIENT_CONFIG.serverConnectAddress`

Exemplo:

```js
const HYDRA_CLIENT_CONFIG = {
  serverConnectAddress: "45.179.91.41:30100"
};
```

### Configuração do servidor Hydra na API

Edite em `assets/js/api.js`, bloco `HYDRA_SERVER_CONFIG`:

- `serverName` — nome do servidor
- `groupCustomId` — `custom_id` do grupo (recomendado)
- `globalServerId` — fallback por ID de servidor

## 🔌 Endpoints utilizados

- `/utils/health-check/`
- `/public-servers/status/`
- `/records/recent`
- `/leaderboards/`
- `/leaderboards/fire-power`
- `/maps`
- `/maps/name/{map_name}`
- `/records/map/{map_name}`
- `/records/map/{map_name}/player-count`
- `/players/{steamid64}`
- `/players/{steamid64}/stats`
- `/players/{steamid64}/recap`
- `/records/top`
- `/bans`

## 🚀 Deploy

Por ser um site estático, você pode publicar facilmente em:

- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages

### Netlify (CORS da API)

No Netlify, este projeto usa uma **Netlify Function proxy** para evitar bloqueio de CORS da API GOKZ:

- Function: `netlify/functions/gokz-proxy.js`
- Redirect: `/api/*` → `/.netlify/functions/gokz-proxy/:splat` (em `netlify.toml`)
- O frontend detecta `*.netlify.app` e usa `/api` automaticamente.

## 📌 Próximos passos sugeridos

- Backend próprio para cache/fallback dos endpoints
- Painel admin para editar eventos/staff/regras
- SEO + analytics
- Integração com widget do Discord