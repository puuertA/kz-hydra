function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });
}

const HYDRA_CLIENT_CONFIG = {
  serverConnectAddress: "45.179.91.41:30100"
};

const recentPlayerPreviewState = {
  cache: new Map(),
  element: null,
  activeLink: null,
  hideTimer: null,
  viewportBound: false
};

function initServerConnectLink() {
  const connectButton = document.getElementById("connect-server-btn");
  if (!connectButton) return;

  const address = String(HYDRA_CLIENT_CONFIG.serverConnectAddress || "").trim();
  connectButton.setAttribute("href", address ? `steam://connect/${address}` : "#");
}

function initBrandNavigation() {
  const brand = document.querySelector(".brand");
  if (!brand) return;

  const goHome = () => {
    window.location.href = "index.html";
  };

  brand.setAttribute("role", "link");
  brand.setAttribute("tabindex", "0");

  brand.addEventListener("click", goHome);
  brand.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    goHome();
  });
}

function initHomeGifBackground() {
  if (document.body.dataset.page !== "home") return;

  const homeGifs = [
    "assets/gifs/1.gif"
  ];

  if (!homeGifs.length) return;

  const randomIndex = Math.floor(Math.random() * homeGifs.length);
  const selectedGif = homeGifs[randomIndex];

  let gifLayer = document.querySelector(".home-gif-bg");
  if (!gifLayer) {
    gifLayer = document.createElement("div");
    gifLayer.className = "home-gif-bg";
    document.body.prepend(gifLayer);
  }

  gifLayer.style.backgroundImage = `url("${selectedGif}")`;
}

function fmtDate(dateLike) {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
}

function fmtSeconds(totalSeconds) {
  if (typeof totalSeconds !== "number") return "-";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${seconds}`;
}

function fmtRuntimeTotal(totalSeconds) {
  const value = Math.floor(asNumber(totalSeconds));
  if (value <= 0) return "-";

  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  const totalHours = Math.floor(value / 3600);
  return `${totalHours}h ${minutes}m ${seconds}s`;
}

function playerName(entry) {
  return entry.player_alias || entry.player_name || entry.name || entry.steamid64 || "-";
}

function playerProfileHref(entry) {
  const steamid64 = String(entry?.steamid64 || "").trim();
  if (/^\d{17}$/.test(steamid64)) {
    return `players.html?steamid64=${encodeURIComponent(steamid64)}`;
  }

  const query = String(entry?.player_alias || entry?.player_name || entry?.name || "").trim();
  if (query) {
    return `players.html?q=${encodeURIComponent(query)}`;
  }

  return "players.html";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function steamAvatarUrl(avatarHash) {
  if (!avatarHash || typeof avatarHash !== "string") return "";
  return `https://avatars.steamstatic.com/${avatarHash}_full.jpg`;
}

function steamProfileUrl(steamid64) {
  if (!steamid64) return "";
  return `https://steamcommunity.com/profiles/${encodeURIComponent(String(steamid64))}`;
}

function countryFlagHtml(countryCode, className = "country-flag") {
  const code = String(countryCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return `<span class="country-flag-fallback ${className}">🏳️</span>`;
  }
  const codeLower = code.toLowerCase();
  return `<img class="${className}" src="https://flagcdn.com/w40/${codeLower}.png" srcset="https://flagcdn.com/w80/${codeLower}.png 2x" alt="Bandeira ${code}" loading="lazy" />`;
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function modeLabelFromApiMode(mode) {
  if (mode === "kz_timer") return "KZT";
  if (mode === "kz_simple") return "SKZ";
  if (mode === "kz_vanilla") return "VNL";
  return String(mode || "").toUpperCase();
}

function formatModeName(mode) {
  const value = String(mode || "").trim().toUpperCase();
  if (value === "KZ_VANILLA") return "Vanilla";
  if (value === "KZ_SIMPLE") return "Simple KZ";
  if (value === "KZ_TIMER") return "KZ Timer";
  return value || "-";
}

function profileModeToApiMode(mode) {
  const value = String(mode || "").trim().toUpperCase();
  if (value === "VNL") return "kz_vanilla";
  if (value === "SKZ") return "kz_simple";
  if (value === "KZT") return "kz_timer";
  return "kz_simple";
}

function profileModeDisplayName(mode) {
  const value = String(mode || "").trim().toUpperCase();
  if (value === "VNL") return "Vanilla";
  if (value === "SKZ") return "Simple KZ";
  if (value === "KZT") return "KZ Timer";
  return value || "Modo";
}

function apiRankTitleFromPoints(points) {
  const value = asNumber(points);
  if (value >= 250000) return "Legend";
  if (value >= 150000) return "Master";
  if (value >= 100000) return "Professional";
  if (value >= 75000) return "Regular";
  if (value >= 50000) return "Advanced";
  if (value >= 30000) return "Experienced";
  if (value >= 15000) return "Intermediate";
  if (value >= 5000) return "Beginner";
  if (value > 0) return "Rookie";
  return "Unranked";
}

function rankTitleToneClass(rankTitle) {
  const key = String(rankTitle || "").trim().toLowerCase();
  if (key === "legend") return "tone-legend";
  if (key === "master") return "tone-master";
  if (key === "professional") return "tone-professional";
  if (key === "regular") return "tone-regular";
  if (key === "advanced") return "tone-advanced";
  if (key === "experienced") return "tone-experienced";
  if (key === "intermediate") return "tone-intermediate";
  if (key === "beginner") return "tone-beginner";
  if (key === "rookie") return "tone-rookie";
  return "tone-unranked";
}

function ensureRecentPlayerPreviewElement() {
  if (recentPlayerPreviewState.element) return recentPlayerPreviewState.element;

  let element = document.getElementById("recent-player-preview");
  if (!element) {
    element = document.createElement("div");
    element.id = "recent-player-preview";
    element.className = "recent-player-preview";
    element.hidden = true;
    document.body.appendChild(element);
  }

  recentPlayerPreviewState.element = element;
  return element;
}

function modeLabelFromPreviewMode(value) {
  const input = String(value || "").trim();
  if (!input) return "SKZ";

  const upper = input.toUpperCase();
  if (["VNL", "SKZ", "KZT"].includes(upper)) return upper;

  return modeLabelFromApiMode(input);
}

function renderRecentPlayerPreviewLoading() {
  return `<div class="recent-player-preview-loading">Carregando perfil...</div>`;
}

function renderRecentPlayerPreviewError() {
  return `<div class="recent-player-preview-loading">Não foi possível carregar a prévia.</div>`;
}

function renderRecentPlayerPreviewContent(payload) {
  const displayName = escapeHtml(payload.displayName || "Jogador");
  const countryCode = String(payload.countryCode || "--").toUpperCase();
  const modeLabel = escapeHtml(payload.modeLabel || "SKZ");
  const modeName = escapeHtml(payload.modeName || "Modo");
  const ratingDisplay = escapeHtml(payload.ratingDisplay || "-");
  const pointsDisplay = escapeHtml(payload.pointsDisplay || "-");
  const modeTitle = escapeHtml(payload.modeTitle || "Unranked");
  const modeToneClass = escapeHtml(payload.modeToneClass || "tone-unranked");
  const modeRankPosition = payload.modeRank ? ` • #${escapeHtml(payload.modeRank)}` : "";
  const flag = countryFlagHtml(countryCode, "country-flag country-flag-sm recent-player-preview-flag");
  const numericRating = Number(payload.ratingValue);
  const hasNumericRating = Number.isFinite(numericRating);
  const safeRatingValue = hasNumericRating ? numericRating : 0;
  const ratingInteger = Math.max(0, Math.floor(safeRatingValue));
  const ratingProgressInTier = Math.max(0, Math.min(0.99, safeRatingValue - ratingInteger));
  const ratingPercent = ratingProgressInTier * 100;
  const ratingRankIndex = Math.max(0, Math.min(10, ratingInteger));
  const ratingRankPalette = [
    [107, 114, 128],
    [156, 163, 175],
    [148, 163, 184],
    [125, 166, 201],
    [110, 186, 236],
    [125, 211, 252],
    [74, 222, 128],
    [248, 113, 113],
    [250, 204, 21],
    [196, 181, 253],
    [196, 181, 253]
  ];
  const accentRgb = ratingRankPalette[ratingRankIndex];
  const accentColor = `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`;
  const accentSoftColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.3)`;
  const accentGlowColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.55)`;
  const ratingMeterStyle = `--rating-accent:${accentColor}; --rating-accent-soft:${accentSoftColor}; --rating-accent-glow:${accentGlowColor};`;

  return `<div class="recent-player-preview-head">
    <span class="recent-player-preview-avatar-wrap">
      ${payload.avatarUrl ? `<img class="recent-player-preview-avatar" src="${payload.avatarUrl}" alt="Avatar Steam de ${displayName}" loading="lazy" referrerpolicy="no-referrer" />` : ""}
      <span class="recent-player-preview-avatar-fallback" ${payload.avatarUrl ? "hidden" : ""}>👤</span>
      ${flag}
    </span>
    <span class="recent-player-preview-main">
      <strong class="recent-player-preview-name">${displayName}</strong>
      <div class="profile-mode-highlight recent-player-preview-mode ${modeToneClass}">
        <span>${modeName} (${modeLabel})</span>
        <em>${modeTitle}${modeRankPosition}</em>
      </div>
    </span>
  </div>
  <div class="profile-pills recent-player-preview-pills">
    <div class="profile-pill recent-player-preview-points"><span>Pontuação no modo</span><strong>${pointsDisplay} pts</strong></div>
    <div class="profile-pill profile-pill-rating recent-player-preview-rating" style="${ratingMeterStyle}">
      <span>Rating no modo</span>
      <div class="recent-player-preview-rating-row">
        <strong>${ratingDisplay}</strong>
        <span class="recent-player-preview-rating-bar" aria-hidden="true">
          <span class="recent-player-preview-rating-bar-fill" style="width:${hasNumericRating ? ratingPercent.toFixed(1) : "0.0"}%"></span>
        </span>
      </div>
    </div>
  </div>`;
}

function positionRecentPlayerPreview(event) {
  const preview = ensureRecentPlayerPreviewElement();
  if (!preview || preview.hidden) return;

  const viewportPadding = 10;
  const offset = 14;
  const clientX = Number(event?.clientX ?? 0);
  const clientY = Number(event?.clientY ?? 0);

  let left = clientX + offset;
  let top = clientY + offset;

  const rect = preview.getBoundingClientRect();
  if (left + rect.width > window.innerWidth - viewportPadding) {
    left = clientX - rect.width - offset;
  }

  if (top + rect.height > window.innerHeight - viewportPadding) {
    top = clientY - rect.height - offset;
  }

  preview.style.left = `${Math.max(viewportPadding, left)}px`;
  preview.style.top = `${Math.max(viewportPadding, top)}px`;
}

function hideRecentPlayerPreview() {
  const preview = ensureRecentPlayerPreviewElement();
  recentPlayerPreviewState.activeLink = null;
  preview.classList.remove("is-visible");
  preview.hidden = true;
}

function scheduleHideRecentPlayerPreview(delay = 90) {
  if (recentPlayerPreviewState.hideTimer) {
    clearTimeout(recentPlayerPreviewState.hideTimer);
  }

  recentPlayerPreviewState.hideTimer = setTimeout(() => {
    hideRecentPlayerPreview();
  }, delay);
}

async function fetchRecentPlayerPreviewData(steamid64, previewMode, fallbackName) {
  const modeLabel = modeLabelFromPreviewMode(previewMode);
  const cacheKey = `${steamid64}|${modeLabel}`;

  if (!recentPlayerPreviewState.cache.has(cacheKey)) {
    const pending = (async () => {
      const [playerProfile, modeProfile] = await Promise.all([
        gokzApi.player(steamid64),
        gokzApi.playerModeLeaderboard(steamid64, profileModeToApiMode(modeLabel)).catch(() => null)
      ]);

      const ratingRaw = Number(modeProfile?.rating ?? playerProfile?.rating ?? NaN);
      const pointsRaw = asNumber(modeProfile?.points);

      return {
        displayName: playerProfile?.alias || playerProfile?.name || fallbackName || steamid64,
        avatarUrl: steamAvatarUrl(playerProfile?.avatar_hash),
        countryCode: String(playerProfile?.country || "--").toUpperCase(),
        modeLabel,
        modeName: profileModeDisplayName(modeLabel),
        modeTitle: apiRankTitleFromPoints(pointsRaw),
        modeToneClass: rankTitleToneClass(apiRankTitleFromPoints(pointsRaw)),
        modeRank: modeProfile?.rank ? String(modeProfile.rank) : "",
        ratingValue: Number.isFinite(ratingRaw) ? ratingRaw : null,
        ratingDisplay: Number.isFinite(ratingRaw) ? ratingRaw.toFixed(2) : "-",
        pointsDisplay: Math.round(pointsRaw).toLocaleString("pt-BR")
      };
    })();

    recentPlayerPreviewState.cache.set(cacheKey, pending);
  }

  try {
    return await recentPlayerPreviewState.cache.get(cacheKey);
  } catch (error) {
    recentPlayerPreviewState.cache.delete(cacheKey);
    throw error;
  }
}

async function showRecentPlayerPreview(link, event) {
  const steamid64 = String(link?.dataset.previewSteamid || "").trim();

  const preview = ensureRecentPlayerPreviewElement();
  const previewMode = link.dataset.previewMode || "SKZ";
  const fallbackName = link.dataset.previewName || "";

  if (recentPlayerPreviewState.hideTimer) {
    clearTimeout(recentPlayerPreviewState.hideTimer);
  }

  recentPlayerPreviewState.activeLink = link;
  preview.innerHTML = renderRecentPlayerPreviewLoading();
  preview.hidden = false;
  preview.classList.add("is-visible");
  positionRecentPlayerPreview(event);

  if (!/^\d{17}$/.test(steamid64)) {
    preview.innerHTML = `<div class="recent-player-preview-loading">Prévia indisponível para este jogador.</div>`;
    positionRecentPlayerPreview(event);
    return;
  }

  try {
    const [payload] = await Promise.all([
      fetchRecentPlayerPreviewData(steamid64, previewMode, fallbackName),
      new Promise((resolve) => setTimeout(resolve, 140))
    ]);
    if (recentPlayerPreviewState.activeLink !== link) return;
    preview.innerHTML = renderRecentPlayerPreviewContent(payload);
    positionRecentPlayerPreview(event);
  } catch {
    if (recentPlayerPreviewState.activeLink !== link) return;
    preview.innerHTML = renderRecentPlayerPreviewError();
    positionRecentPlayerPreview(event);
  }
}

function bindHomeRecentPlayerPreviews() {
  if (document.body.dataset.page !== "home") return;

  const links = document.querySelectorAll("#recent-records-body .player-profile-link[data-preview-steamid]");
  if (!links.length) return;

  if (!recentPlayerPreviewState.viewportBound) {
    recentPlayerPreviewState.viewportBound = true;
    window.addEventListener("scroll", () => scheduleHideRecentPlayerPreview(0), { passive: true });
    window.addEventListener("resize", () => scheduleHideRecentPlayerPreview(0));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") scheduleHideRecentPlayerPreview(0);
    });
  }

  links.forEach((link) => {
    if (link.dataset.previewBound === "true") return;
    link.dataset.previewBound = "true";

    link.addEventListener("mouseenter", (event) => {
      showRecentPlayerPreview(link, event);
    });

    link.addEventListener("mousemove", (event) => {
      if (recentPlayerPreviewState.activeLink !== link) return;
      positionRecentPlayerPreview(event);
    });

    link.addEventListener("mouseleave", () => {
      scheduleHideRecentPlayerPreview();
    });

    link.addEventListener("focus", () => {
      const rect = link.getBoundingClientRect();
      showRecentPlayerPreview(link, {
        clientX: rect.left + rect.width / 2,
        clientY: rect.bottom + 8
      });
    });

    link.addEventListener("blur", () => {
      scheduleHideRecentPlayerPreview(0);
    });
  });
}

function isSupportedProfileMode(mode) {
  return ["VNL", "SKZ", "KZT"].includes(String(mode || "").toUpperCase());
}

function buildModeStats(tpRecords, proRecords, uniqueByMode) {
  const modeMap = new Map();
  const modes = ["VNL", "SKZ", "KZT"];

  for (const mode of modes) {
    modeMap.set(mode, {
      mode,
      tp: { points: 0, records: 0, bestTime: null },
      pro: { points: 0, records: 0, bestTime: null },
      uniqueMaps: 0
    });
  }

  function consume(records, key) {
    for (const record of records || []) {
      const mode = modeLabelFromApiMode(record.mode);
      if (!modeMap.has(mode)) continue;
      const current = modeMap.get(mode)[key];
      current.records += 1;
      current.points += asNumber(record.points);
      if (typeof record.time === "number" && (current.bestTime === null || record.time < current.bestTime)) {
        current.bestTime = record.time;
      }
    }
  }

  consume(tpRecords, "tp");
  consume(proRecords, "pro");

  for (const entry of uniqueByMode || []) {
    const mode = String(entry.mode || "").toUpperCase();
    if (!modeMap.has(mode)) continue;
    modeMap.get(mode).uniqueMaps = asNumber(entry.count);
  }

  return modes.map((mode) => {
    const entry = modeMap.get(mode);
    const bestTimeValues = [entry.tp.bestTime, entry.pro.bestTime].filter((value) => typeof value === "number");
    return {
      ...entry,
      totalPoints: entry.tp.points + entry.pro.points,
      totalRecords: entry.tp.records + entry.pro.records,
      bestTime: bestTimeValues.length ? Math.min(...bestTimeValues) : null
    };
  });
}

function renderRows(tbodyId, rows, mapFn) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = rows
    .map((row, index) => {
      const html = mapFn(row, index);
      return html.replace(
        /<tr(\s|>)/,
        `<tr class="table-row-enter" style="animation-delay:${index * 65}ms"$1`
      );
    })
    .join("");
}

function toastError(targetId, error) {
  const message = error?.message || "Erro inesperado";
  setHTML(targetId, `<p class=\"notice\">Não foi possível carregar dados da API: ${message}</p>`);
}

async function initHome() {
  try {
    const [health, status, records] = await Promise.all([
      gokzApi.health(),
      gokzApi.serverStatus(100),
      gokzApi.recentRecords(12)
    ]);

    const servers = status.data || [];
    const playersOnline = servers.reduce((sum, server) => sum + (server.player_count || 0), 0);
    const onlineServers = servers.filter((server) => server.is_online).length;

    setText("kpi-health", health ? "Online" : "Offline");
    setText("kpi-players", playersOnline);
    setText("kpi-servers", `${onlineServers}/${servers.length}`);
    setText("kpi-records", records.length || 0);

    renderRows("recent-records-body", records.slice(0, 8), (record) => {
      const steamid64 = String(record.steamid64 || "").trim();
      const previewMode = modeLabelFromApiMode(record.mode);
      const displayName = playerName(record);

      return `
      <tr>
        <td><a class="player-profile-link" href="${playerProfileHref(record)}" data-preview-steamid="${escapeHtml(steamid64)}" data-preview-mode="${escapeHtml(previewMode)}" data-preview-name="${escapeHtml(displayName)}">${escapeHtml(displayName)}</a></td>
        <td>${record.map_name || "-"}</td>
        <td>${formatModeName(record.mode)}</td>
        <td>${fmtSeconds(record.time)}</td>
        <td>${record.teleports ?? "-"}</td>
        <td>${fmtDate(record.created_on)}</td>
      </tr>
    `;
    });

    bindHomeRecentPlayerPreviews();

    const serverList = servers
      .sort((a, b) => (b.player_count || 0) - (a.player_count || 0))
      .slice(0, 8)
      .map(
        (server) => `<tr>
          <td>${server.hostname || "Servidor"}</td>
          <td>${server.map_name || "-"}</td>
          <td>${server.player_count || 0}/${server.max_players || 0}</td>
          <td><span class=\"${server.is_online ? "status-ok" : "status-danger"}\">${server.is_online ? "Online" : "Offline"}</span></td>
        </tr>`
      );

    setHTML("servers-body", serverList.join(""));
  } catch (error) {
    toastError("home-fallback", error);
  }
}

async function initLeaderboards() {
  const mode = document.getElementById("lb-mode");
  const period = document.getElementById("lb-period");
  const loadingEl = document.getElementById("leaderboards-loading");
  let activeLoadId = 0;

  function setLoadingState(isLoading) {
    if (mode) mode.disabled = isLoading;
    if (period) period.disabled = isLoading;
    if (loadingEl) loadingEl.hidden = !isLoading;
  }

  function setTableLoading(tbodyId, columnCount, label) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="${columnCount}"><div class="leaderboard-loading-cell"><span class="loading-spinner" aria-hidden="true"></span><span>${label}</span></div></td></tr>`;
  }

  function setTableError(tbodyId, message, columnCount) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="${columnCount}">${message}</td></tr>`;
  }

  async function load() {
    const currentLoadId = ++activeLoadId;
    setLoadingState(true);
    setTableLoading("lb-global-body", 5, "Carregando ranking...");
    setTableLoading("lb-fire-body", 5, "Carregando destaques...");

    await new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    try {
      const [globalLb, periodHighlights] = await Promise.all([
        gokzApi.hydraLeaderboard({ mode: mode.value, limit: 50 }),
        gokzApi.hydraPeriodHighlights({ mode: mode.value, period: period.value, limit: 30 })
      ]);

      if (currentLoadId !== activeLoadId) return;

      renderRows("lb-global-body", globalLb.data || [], (row) => `
        <tr>
          <td>#${row.rank}</td>
          <td><a class="player-profile-link" href="${playerProfileHref(row)}">${escapeHtml(playerName(row))}</a></td>
          <td>${row.rating?.toFixed?.(0) ?? row.rating ?? "-"}</td>
          <td>${row.points ?? "-"}</td>
          <td>${row.map_finished ?? "-"}</td>
        </tr>
      `);

      renderRows("lb-fire-body", periodHighlights.data || [], (row) => `
        <tr>
          <td>#${row.rank}</td>
          <td><a class="player-profile-link" href="${playerProfileHref(row)}">${escapeHtml(playerName(row))}</a></td>
          <td>${row.points ?? "-"}</td>
          <td>${row.tp_finishes ?? 0}</td>
          <td>${row.pro_finishes ?? 0}</td>
        </tr>
      `);
    } catch (error) {
      if (currentLoadId !== activeLoadId) return;
      setTableError("lb-global-body", "Falha ao carregar ranking.", 5);
      setTableError("lb-fire-body", "Falha ao carregar destaques.", 5);
      toastError("leaderboards-fallback", error);
    } finally {
      if (currentLoadId === activeLoadId) {
        setLoadingState(false);
      }
    }
  }

  mode?.addEventListener("change", load);
  period?.addEventListener("change", load);
  await load();
}

async function initPlayers() {
  const steamInput = document.getElementById("player-steamid");
  const searchBtn = document.getElementById("player-search");
  const searchList = document.getElementById("player-search-list");
  const statsContainer = document.getElementById("player-stats");
  const idleLabel = searchBtn?.dataset.idleLabel || "Buscar perfil";
  const loadingLabel = searchBtn?.dataset.loadingLabel || "Buscando...";
  let selectedMode = "SKZ";
  let latestModeStats = [];
  let latestRecords = [];
  let latestStats = null;
  let latestRecap = null;
  let latestPlayer = null;
  let latestTotalPoints = 0;
  let latestModeApiProfiles = { VNL: null, SKZ: null, KZT: null };
  let latestModeRankMeta = {
    VNL: { globalRank: null, nationalRank: null, regionalRank: null, regionalCode: null, serverRank: null },
    SKZ: { globalRank: null, nationalRank: null, regionalRank: null, regionalCode: null, serverRank: null },
    KZT: { globalRank: null, nationalRank: null, regionalRank: null, regionalCode: null, serverRank: null }
  };
  let selectedSteamId64 = "";
  let searchDebounceTimer = null;
  let isModeSwitchAnimating = false;

  function animateModeSwitch(nextMode) {
    const summaryEl = document.getElementById("player-summary");
    const statsEl = document.getElementById("player-stats");
    const recordsEl = document.getElementById("player-records-body");
    const leaveTargets = [summaryEl, statsEl, recordsEl].filter(Boolean);

    leaveTargets.forEach((element) => {
      element.classList.remove("profile-mode-switch-enter", "is-mode-swapping");
      element.classList.add("profile-mode-switch-leave");
    });

    window.setTimeout(() => {
      selectedMode = nextMode;
      renderProfileSummary();
      renderModeScopedStats();
      renderModeScopedRecords();

      const enterTargets = [
        document.getElementById("player-summary"),
        document.getElementById("player-stats"),
        document.getElementById("player-records-body")
      ].filter(Boolean);

      enterTargets.forEach((element) => {
        element.classList.remove("profile-mode-switch-leave");
        element.classList.add("profile-mode-switch-enter", "is-mode-swapping");
      });

      window.setTimeout(() => {
        enterTargets.forEach((element) => {
          element.classList.remove("profile-mode-switch-enter", "is-mode-swapping");
        });
        isModeSwitchAnimating = false;
      }, 360);
    }, 130);
  }

  function formatRankValue(rankValue) {
    return rankValue ? `#${rankValue}` : "-";
  }

  function hideSearchList() {
    if (!searchList) return;
    searchList.hidden = true;
    searchList.innerHTML = "";
  }

  function renderSearchList(items) {
    if (!searchList) return;
    if (!items.length) {
      searchList.hidden = false;
      searchList.innerHTML = `<div class="search-dropdown-empty">Nenhum perfil encontrado.</div>`;
      return;
    }

    searchList.hidden = false;
    searchList.innerHTML = items
      .slice(0, 10)
      .map((item) => {
        const alias = item.alias || item.name || "Jogador";
        const steamid64 = item.steamid64 || "-";
        const country = countryFlagHtml(item.country, "country-flag country-flag-sm");
        const avatarUrl = steamAvatarUrl(item.avatar_hash);
        const countryLabel = String(item.country || "--").toUpperCase();
        return `<button type="button" class="search-dropdown-item" data-select-steamid="${escapeHtml(item.steamid64)}" data-select-name="${escapeHtml(alias)}">
          <span class="search-dropdown-main">
            <span class="search-dropdown-avatar-wrap">
              ${avatarUrl ? `<img class="search-dropdown-avatar" src="${avatarUrl}" alt="Avatar Steam de ${escapeHtml(alias)}" loading="lazy" referrerpolicy="no-referrer" />` : ""}
              <span class="search-dropdown-avatar-fallback" ${avatarUrl ? "hidden" : ""}>👤</span>
            </span>
            <span class="search-dropdown-texts">
              <span class="search-dropdown-name">${escapeHtml(alias)}</span>
              <span class="search-dropdown-steamid">${escapeHtml(steamid64)}</span>
            </span>
          </span>
          <span class="search-dropdown-country">${country}<span>${escapeHtml(countryLabel)}</span></span>
        </button>`;
      })
      .join("");
  }

  function renderProfileSummary() {
    if (!latestPlayer) return;
    const currentMode = latestModeStats.find((entry) => entry.mode === selectedMode);
    const modeApi = latestModeApiProfiles[selectedMode];
    const modeRanks = latestModeRankMeta[selectedMode] || {};
    const modePointsValue = asNumber(modeApi?.points ?? currentMode?.totalPoints);
    const modePoints = Math.round(modePointsValue).toLocaleString("pt-BR");
    const modeTitle = apiRankTitleFromPoints(modePointsValue);
    const modeToneClass = rankTitleToneClass(modeTitle);
    const modeRankPosition = modeApi?.rank ? ` • #${modeApi.rank}` : "";
    const playtimeHours = (asNumber(latestStats?.total_runtime_seconds) / 3600).toFixed(1);
    const numericRating = Number(latestPlayer.rating);
    const hasNumericRating = Number.isFinite(numericRating);
    const ratingValue = hasNumericRating ? numericRating : 0;
    const ratingDisplay = hasNumericRating ? ratingValue.toFixed(2) : String(latestPlayer.rating ?? "0");
    const ratingInteger = Math.max(0, Math.floor(ratingValue));
    const ratingProgressInTier = Math.max(0, Math.min(0.99, ratingValue - ratingInteger));
    const ratingPercent = ratingProgressInTier * 100;
    const ratingRankIndex = Math.max(0, Math.min(10, ratingInteger));
    const ratingRankPalette = [
      [107, 114, 128],
      [156, 163, 175],
      [148, 163, 184],
      [125, 166, 201],
      [110, 186, 236],
      [125, 211, 252],
      [74, 222, 128],
      [248, 113, 113],
      [250, 204, 21],
      [196, 181, 253],
      [196, 181, 253]
    ];

    const accentRgb = ratingRankPalette[ratingRankIndex];

    const accentColor = `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`;
    const accentSoftColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.3)`;
    const accentGlowColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.55)`;
    const ratingMeterStyle = `--rating-accent:${accentColor}; --rating-accent-soft:${accentSoftColor}; --rating-accent-glow:${accentGlowColor};`;

    setHTML(
      "player-summary",
      `<div class="player-summary-head">
        <img class="player-avatar" src="${steamAvatarUrl(latestPlayer.avatar_hash)}" alt="Avatar Steam de ${latestPlayer.alias || latestPlayer.name || "jogador"}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="player-avatar-fallback" style="display:${latestPlayer.avatar_hash ? "none" : "flex"};">👤</div>
        <div class="profile-identity">
          <div class="profile-name-row">
            ${latestPlayer.steamid64 ? `<a class="tag steam-profile-link" href="${steamProfileUrl(latestPlayer.steamid64)}" target="_blank" rel="noopener noreferrer">Perfil Steam</a>` : `<div class="tag">Perfil Steam</div>`}
            <h4>${countryFlagHtml(latestPlayer.country, "country-flag")} ${latestPlayer.alias || latestPlayer.name || "-"}</h4>
            <div class="profile-mode-highlight ${modeToneClass}">
              <span>${profileModeDisplayName(selectedMode)}</span>
              <strong>${modePoints} pts</strong>
              <em>${modeTitle}${modeRankPosition}</em>
            </div>
          </div>
          <p class="profile-subline">Global #${latestPlayer.rank ?? "-"} • Último login: ${fmtDate(latestPlayer.last_seen)} • Playtime: ${playtimeHours}h</p>
        </div>
      </div>
      <div class="profile-pills">
        <div class="profile-pill"><span>SteamID64</span><strong>${latestPlayer.steamid64 || "-"}</strong></div>
        <div class="profile-pill"><span>Pontuação Total</span><strong>${Math.round(latestTotalPoints).toLocaleString("pt-BR")}</strong></div>
        <div class="profile-pill profile-pill-rating" style="${ratingMeterStyle}">
          <span>Rating</span>
          <div class="rating-pill-row">
            <strong>${ratingDisplay}</strong>
            <span class="rating-mini-meter" aria-label="Rating ${ratingDisplay}, progresso da faixa ${ratingInteger}.00 até ${ratingInteger}.99" data-tooltip="Rating ${ratingDisplay} · progresso ${ratingInteger}.00 → ${ratingInteger}.99">
              <span class="rating-mini-meter-track" aria-hidden="true">
                <span class="rating-mini-meter-fill" style="width:${ratingPercent.toFixed(1)}%"></span>
              </span>
              <span class="rating-mini-meter-value">${ratingInteger}</span>
            </span>
          </div>
        </div>
        <div class="profile-pill"><span>País</span><strong>${countryFlagHtml(latestPlayer.country, "country-flag country-flag-sm")} ${latestPlayer.country || "--"}</strong></div>
      </div>
      <div class="profile-pills profile-pills-ranks">
        <div class="profile-pill"><span>Rank Global</span><strong>${formatRankValue(modeRanks.globalRank)}</strong></div>
        <div class="profile-pill"><span>Rank Nacional</span><strong>${formatRankValue(modeRanks.nationalRank)}</strong></div>
        <div class="profile-pill"><span>Rank Regional</span><strong>${formatRankValue(modeRanks.regionalRank)}${modeRanks.regionalCode ? ` (${modeRanks.regionalCode})` : ""}</strong></div>
        <div class="profile-pill"><span>Rank do Servidor</span><strong>${formatRankValue(modeRanks.serverRank)}</strong></div>
      </div>`
    );
  }

  function renderModeScopedRecords() {
    const scoped = latestRecords.filter((row) => modeLabelFromApiMode(row.mode) === selectedMode).slice(0, 12);
    renderRows("player-records-body", scoped, (row) => `
      <tr>
        <td>${row.map_name || "-"}</td>
        <td>${formatModeName(row.mode)}</td>
        <td>${fmtSeconds(row.time)}</td>
        <td>${row.teleports ?? "-"}</td>
        <td>${row.points ?? "-"}</td>
      </tr>
    `);
  }

  function renderModeScopedStats() {
    const current = latestModeStats.find((entry) => entry.mode === selectedMode);
    if (!current || !statsContainer || !latestStats || !latestRecap) return;

    const currentYear = new Date().getFullYear();
    const recordsByYear = latestRecap.records_by_year || {};
    const recordsCurrentYear =
      recordsByYear[currentYear] ??
      recordsByYear[String(currentYear)] ??
      latestRecap[`records_${currentYear}`] ??
      "-";

    setHTML(
      "player-stats",
      `<ul>
        <li>Total de records: <strong>${latestStats.total_records ?? "-"}</strong></li>
        <li>Tempo total: <strong>${fmtRuntimeTotal(latestStats.total_runtime_seconds)}</strong></li>
        <li>Dias ativos: <strong>${latestStats.active_days ?? "-"}</strong></li>
        <li>Records em ${currentYear}: <strong>${recordsCurrentYear}</strong></li>
      </ul>
      <div class="profile-mode-switch" role="tablist" aria-label="Modo do perfil">
        ${["VNL", "SKZ", "KZT"]
          .map(
            (mode) => `<button type="button" class="profile-mode-btn ${mode === selectedMode ? "is-active" : ""}" data-mode-switch="${mode}">${mode}</button>`
          )
          .join("")}
      </div>
      <div class="mode-stats-grid">
        <article class="mode-stat-card">
          <h4>${current.mode}</h4>
          <div class="mode-stat-split">
            <div class="mode-stat-pane tp">
              <div class="mode-pane-title">TP</div>
              <p>Pontos: <strong>${Math.round(current.tp.points).toLocaleString("pt-BR")}</strong></p>
              <p>Records: <strong>${current.tp.records}</strong></p>
            </div>
            <div class="mode-stat-pane pro">
              <div class="mode-pane-title">PRO</div>
              <p>Pontos: <strong>${Math.round(current.pro.points).toLocaleString("pt-BR")}</strong></p>
              <p>Records: <strong>${current.pro.records}</strong></p>
            </div>
          </div>
          <div class="mode-stat-total">Total: <strong>${Math.round(current.totalPoints).toLocaleString("pt-BR")}</strong> pontos</div>
          <div class="mode-stat-total">Records totais: <strong>${current.totalRecords}</strong> | Mapas únicos: <strong>${current.uniqueMaps}</strong></div>
        </article>
      </div>`
    );
  }

  statsContainer?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode-switch]");
    if (!button) return;
    const nextMode = button.getAttribute("data-mode-switch");
    if (!isSupportedProfileMode(nextMode) || nextMode === selectedMode) return;
    if (isModeSwitchAnimating) return;
    isModeSwitchAnimating = true;
    animateModeSwitch(nextMode);
  });

  function setSearchLoading(isLoading) {
    if (!searchBtn) return;
    searchBtn.disabled = isLoading;
    searchBtn.classList.toggle("is-loading", isLoading);
    const label = searchBtn.querySelector(".btn-label");
    if (label) {
      label.textContent = isLoading ? loadingLabel : idleLabel;
    } else {
      searchBtn.textContent = isLoading ? loadingLabel : idleLabel;
    }
  }

  async function resolveSteamId64(searchValue) {
    if (selectedSteamId64 && String(selectedSteamId64).length === 17) {
      return selectedSteamId64;
    }

    if (/^\d{17}$/.test(searchValue)) return searchValue;

    const result = await gokzApi.playerSearch(searchValue);
    const list = Array.isArray(result) ? result : result ? [result] : [];
    if (!list.length) return "";

    const query = searchValue.toLowerCase();
    const normalized = list.find((entry) => String(entry.steamid64 || "") === searchValue);
    if (normalized?.steamid64) return normalized.steamid64;

    const byExactName = list.find(
      (entry) =>
        String(entry.alias || "").toLowerCase() === query ||
        String(entry.name || "").toLowerCase() === query ||
        String(entry.custom_id || "").toLowerCase() === query
    );
    if (byExactName?.steamid64) return byExactName.steamid64;

    const byContains = list.find(
      (entry) =>
        String(entry.alias || "").toLowerCase().includes(query) ||
        String(entry.name || "").toLowerCase().includes(query) ||
        String(entry.custom_id || "").toLowerCase().includes(query)
    );
    return byContains?.steamid64 || list[0]?.steamid64 || "";
  }

  async function refreshSearchSuggestions() {
    const query = steamInput?.value?.trim() || "";
    selectedSteamId64 = "";
    if (!query || query.length < 2) {
      hideSearchList();
      return;
    }

    try {
      const result = await gokzApi.playerSearch(query);
      const list = Array.isArray(result) ? result : result ? [result] : [];
      renderSearchList(list);
    } catch {
      hideSearchList();
    }
  }

  async function load() {
    const searchValue = steamInput.value.trim();
    if (!searchValue) {
      steamInput.focus();
      return;
    }
    if (searchBtn?.disabled) return;

    setSearchLoading(true);

    try {
      const steamid64 = await resolveSteamId64(searchValue);
      if (!steamid64) {
        throw new Error("Jogador não encontrado. Tente outro nickname ou SteamID64.");
      }

      const getModeApiProfile = async (steamid64Value, profileMode) => {
        try {
          return await gokzApi.playerModeLeaderboard(steamid64Value, profileModeToApiMode(profileMode));
        } catch {
          return null;
        }
      };

      const [player, stats, recap, tpRecords, proRecords, vnlApi, skzApi, kztApi] = await Promise.all([
        gokzApi.player(steamid64),
        gokzApi.playerStats(steamid64),
        gokzApi.playerRecap(steamid64),
        gokzApi.playerTopRecords(steamid64, 2000, true),
        gokzApi.playerTopRecords(steamid64, 2000, false),
        getModeApiProfile(steamid64, "VNL"),
        getModeApiProfile(steamid64, "SKZ"),
        getModeApiProfile(steamid64, "KZT")
      ]);

      const buildRankMeta = async (profileMode, modeApiProfile) => {
        const meta = {
          globalRank: modeApiProfile?.rank ?? null,
          nationalRank: null,
          regionalRank: modeApiProfile?.regional_rank ?? null,
          regionalCode: modeApiProfile?.region_code ?? null,
          serverRank: null
        };

        try {
          const [globalLeaderboard, hydraLeaderboard] = await Promise.all([
            gokzApi.leaderboard({ mode: profileModeToApiMode(profileMode), sortBy: "rating", limit: 5000 }),
            gokzApi.hydraLeaderboard({ mode: profileModeToApiMode(profileMode), limit: 10000 })
          ]);

          const playerEntry = (globalLeaderboard?.data || []).find(
            (entry) => String(entry.steamid64 || "") === String(steamid64)
          );
          const playerCountry = (playerEntry?.player_country || player?.country || "").toUpperCase();
          const globalRank = meta.globalRank || playerEntry?.rank || null;

          if (playerCountry && globalRank) {
            meta.nationalRank = (globalLeaderboard?.data || []).filter(
              (entry) =>
                String(entry.player_country || "").toUpperCase() === playerCountry &&
                Number(entry.rank || 0) > 0 &&
                Number(entry.rank || 0) <= Number(globalRank)
            ).length;
          }

          meta.serverRank =
            (hydraLeaderboard?.data || []).find((entry) => String(entry.steamid64 || "") === String(steamid64))?.rank ?? null;
        } catch {
          return meta;
        }

        return meta;
      };

      const mergedRecords = [...(tpRecords || []), ...(proRecords || [])];
      const sortedRecords = mergedRecords.sort((a, b) => asNumber(b.points) - asNumber(a.points));
      const totalPoints = sortedRecords.reduce((sum, row) => sum + asNumber(row.points), 0);
      const modeStats = buildModeStats(tpRecords, proRecords, stats.unique_map_completions_by_mode);
      const defaultMode = modeLabelFromApiMode(player.primary_mode);

      selectedMode = isSupportedProfileMode(defaultMode) ? defaultMode : "SKZ";
      latestModeStats = modeStats;
      latestRecords = sortedRecords;
      latestStats = stats;
      latestRecap = recap;
      latestPlayer = player;
      latestTotalPoints = totalPoints;
      latestModeApiProfiles = {
        VNL: vnlApi,
        SKZ: skzApi,
        KZT: kztApi
      };
      latestModeRankMeta = {
        VNL: await buildRankMeta("VNL", vnlApi),
        SKZ: await buildRankMeta("SKZ", skzApi),
        KZT: await buildRankMeta("KZT", kztApi)
      };

      selectedSteamId64 = steamid64;
      hideSearchList();

      renderProfileSummary();

      renderModeScopedStats();
      renderModeScopedRecords();
    } catch (error) {
      toastError("players-fallback", error);
    } finally {
      setSearchLoading(false);
    }
  }

  steamInput?.addEventListener("input", () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(refreshSearchSuggestions, 240);
  });

  steamInput?.addEventListener("focus", () => {
    if ((steamInput.value || "").trim().length >= 2) {
      refreshSearchSuggestions();
    }
  });

  searchList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-steamid]");
    if (!button) return;
    const steamid64 = button.getAttribute("data-select-steamid") || "";
    const displayName = button.getAttribute("data-select-name") || steamid64;
    selectedSteamId64 = steamid64;
    steamInput.value = displayName;
    load();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("#player-search-list") || target.closest("#player-steamid")) return;
    hideSearchList();
  });

  steamInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      load();
    }
  });

  searchBtn?.addEventListener("click", load);

  const initialParams = new URLSearchParams(window.location.search);
  const initialSteamId64 = (initialParams.get("steamid64") || "").trim();
  const initialQuery = (initialParams.get("q") || "").trim();

  if (initialSteamId64) {
    selectedSteamId64 = initialSteamId64;
    steamInput.value = initialSteamId64;
    load();
    return;
  }

  if (initialQuery) {
    steamInput.value = initialQuery;
    load();
  }
}

async function initMaps() {
  const name = document.getElementById("maps-name");
  const diff = document.getElementById("maps-difficulty");
  const search = document.getElementById("maps-search");
  const top10Btn = document.getElementById("map-top10");
  const selected = document.getElementById("map-selected");

  async function loadMaps() {
    try {
      const maps = await gokzApi.maps({ limit: 60, name: name.value.trim(), difficulty: diff.value });
      renderRows("maps-body", maps, (map) => `
        <tr>
          <td>${map.name}</td>
          <td>${map.difficulty ?? "-"}</td>
          <td>${map.validated ? "Sim" : "Não"}</td>
          <td>${(map.authors || []).map((a) => a.alias || a.name).filter(Boolean).join(", ") || "-"}</td>
          <td>${fmtDate(map.updated_on)}</td>
        </tr>
      `);
      if (maps[0]?.name && !selected.value) selected.value = maps[0].name;
    } catch (error) {
      toastError("maps-fallback", error);
    }
  }

  async function loadTop10() {
    if (!selected.value.trim()) return;
    try {
      const [map, leaderboard, completions] = await Promise.all([
        gokzApi.mapByName(selected.value.trim()),
        gokzApi.mapLeaderboard({ mapName: selected.value.trim(), mode: "kz_timer", stage: 0, limit: 10 }),
        gokzApi.mapPlayerCount({ mapName: selected.value.trim(), mode: "kz_timer", stage: 0 })
      ]);

      setHTML(
        "map-info",
        `<p><span class=\"tag\">Mapa</span> ${map.name} | <span class=\"tag\">Dificuldade</span> ${map.difficulty ?? "-"} | <span class=\"tag\">Conclusões</span> ${completions}</p>`
      );

      renderRows("map-top10-body", leaderboard, (row, index) => `
        <tr>
          <td>#${index + 1}</td>
          <td>${playerName(row)}</td>
          <td>${fmtSeconds(row.time)}</td>
          <td>${row.teleports ?? "-"}</td>
          <td>${row.points ?? "-"}</td>
        </tr>
      `);
    } catch (error) {
      toastError("maps-fallback", error);
    }
  }

  search?.addEventListener("click", loadMaps);
  top10Btn?.addEventListener("click", loadTop10);
  await loadMaps();
}

async function initActivity() {
  try {
    const [records, leaderboard] = await Promise.all([
      gokzApi.recentRecords(30),
      gokzApi.leaderboard({ mode: "kz_timer", sortBy: "rating", limit: 20 })
    ]);

    renderRows("activity-records-body", records, (record) => `
      <tr>
        <td>Record</td>
        <td><a class="player-profile-link" href="${playerProfileHref(record)}">${escapeHtml(playerName(record))}</a></td>
        <td>${record.map_name || "-"}</td>
        <td>${fmtSeconds(record.time)}</td>
        <td>${fmtDate(record.created_on)}</td>
      </tr>
    `);

    renderRows("activity-rank-body", leaderboard.data || [], (row) => `
      <tr>
        <td>#${row.rank}</td>
        <td><a class="player-profile-link" href="${playerProfileHref(row)}">${escapeHtml(playerName(row))}</a></td>
        <td>${row.rating?.toFixed?.(2) ?? row.rating ?? "-"}</td>
        <td>${row.map_finished ?? "-"}</td>
      </tr>
    `);
  } catch (error) {
    toastError("activity-fallback", error);
  }
}

async function initRules() {
  try {
    const bans = await gokzApi.bans({ limit: 30, isExpired: false });
    const filteredBans = (bans.data || []).filter((ban) =>
      gokzApi.isHydraServerName(ban.server_name || "")
    );
    renderRows("bans-body", filteredBans, (ban) => `
      <tr>
        <td>${ban.player_name || ban.steamid64}</td>
        <td>${ban.ban_type || "-"}</td>
        <td>${ban.server_name || "-"}</td>
        <td>${ban.expires_on ? fmtDate(ban.expires_on) : "Permanente"}</td>
      </tr>
    `);
  } catch (error) {
    toastError("rules-fallback", error);
  }
}

function initSimplePage() {
  return;
}

async function boot() {
  setActiveNav();
  initBrandNavigation();
  setText("year", new Date().getFullYear());
  initServerConnectLink();

  const page = document.body.dataset.page;
  if (page === "home") {
    await initHome();
  }
  else if (page === "leaderboards") await initLeaderboards();
  else if (page === "players") await initPlayers();
  else if (page === "maps") await initMaps();
  else if (page === "activity") await initActivity();
  else if (page === "rules") await initRules();
  else initSimplePage();
}

boot();
