const API_BASE = "https://api.gokz.top/api/v1";

const HYDRA_SERVER_CONFIG = {
  serverName: "Hydra KZ",
  groupCustomId: "1886",
  globalServerId: 1761,
  serverNameMatchIncludes: true
};

let serverContextPromise;

async function request(path, { allowStatus = [] } = {}) {
  const response = await fetch(`${API_BASE}${path}`);
  if (allowStatus.includes(response.status)) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao buscar ${path}`);
  }
  return response.json();
}

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function isTargetServerName(serverName) {
  const target = normalize(HYDRA_SERVER_CONFIG.serverName);
  const source = normalize(serverName);
  if (!target) return true;
  return HYDRA_SERVER_CONFIG.serverNameMatchIncludes ? source.includes(target) : source === target;
}

function periodStartDate(period) {
  const now = new Date();
  const start = new Date(now);

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "week") {
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

async function requestLeaderboardGlobalPage(mode, limit, offset) {
  const attempts = ["rating", "points"];

  for (const sortBy of attempts) {
    const query = new URLSearchParams({
      mode: String(mode),
      sort_by: sortBy,
      limit: String(limit),
      offset: String(offset)
    });

    try {
      return await request(`/leaderboards/?${query.toString()}`);
    } catch (error) {
      const message = String(error?.message || "");
      if (!message.includes("Erro 422")) {
        throw error;
      }
    }
  }

  throw new Error(`Não foi possível carregar leaderboard global para o modo '${mode}'.`);
}

async function fetchHydraSteamIds(context, mode) {
  const query = new URLSearchParams({ mode: String(mode), limit: "5000" });
  if (context.groupId) {
    query.set("server_group_id", String(context.groupId));
  } else if (HYDRA_SERVER_CONFIG.globalServerId) {
    query.set("server_id", String(HYDRA_SERVER_CONFIG.globalServerId));
  }

  const recent = await request(`/records/recent?${query.toString()}`);
  const set = new Set();

  for (const row of recent || []) {
    const steamid64 = String(row?.steamid64 || "").trim();
    if (steamid64) set.add(steamid64);
  }

  return set;
}

function aggregateHydraLeaderboard(records, limit = 50, offset = 0) {
  const byPlayer = new Map();

  for (const record of records || []) {
    const steamid64 = record.steamid64;
    if (!steamid64) continue;

    if (!byPlayer.has(steamid64)) {
      byPlayer.set(steamid64, {
        steamid64,
        player_name: record.player_name || "-",
        player_alias: null,
        points: 0,
        mapSet: new Set(),
        tp_finishes: 0,
        pro_finishes: 0,
        best_time: null
      });
    }

    const current = byPlayer.get(steamid64);
    const points = Number(record.points ?? 0);
    current.points += Number.isFinite(points) ? points : 0;

    if (record.map_id !== undefined && record.map_id !== null) {
      current.mapSet.add(record.map_id);
    }

    if ((record.teleports ?? 0) > 0) current.tp_finishes += 1;
    else current.pro_finishes += 1;

    if (typeof record.time === "number") {
      if (current.best_time === null || record.time < current.best_time) {
        current.best_time = record.time;
      }
    }
  }

  const sorted = [...byPlayer.values()]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      rank: index + 1,
      steamid64: entry.steamid64,
      player_name: entry.player_name,
      player_alias: entry.player_alias,
      points: Math.round(entry.points),
      rating: entry.points,
      map_finished: entry.mapSet.size,
      tp_finishes: entry.tp_finishes,
      pro_finishes: entry.pro_finishes,
      best_time: entry.best_time
    }));

  return {
    data: sorted.slice(offset, offset + limit),
    count: sorted.length
  };
}

async function resolveServerContext() {
  if (serverContextPromise) {
    return serverContextPromise;
  }

  serverContextPromise = (async () => {
    if (HYDRA_SERVER_CONFIG.groupCustomId) {
      const scoped = await request(
        `/public-servers/status/${encodeURIComponent(HYDRA_SERVER_CONFIG.groupCustomId)}?limit=100`
      );
      const scopedServers = scoped.data || [];
      if (!scopedServers.length) {
        throw new Error(
          `Grupo '${HYDRA_SERVER_CONFIG.groupCustomId}' sem servidores. Confira o custom_id no arquivo assets/js/api.js.`
        );
      }
      return {
        groupId: scopedServers[0].group_id || null,
        groupCustomId: HYDRA_SERVER_CONFIG.groupCustomId,
        servers: scopedServers
      };
    }

    const allStatus = await request("/public-servers/status/?limit=500");
    const allServers = allStatus.data || [];
    const matchedServer = allServers.find((server) => isTargetServerName(server.hostname));

    if (!matchedServer) {
      throw new Error(
        `Servidor '${HYDRA_SERVER_CONFIG.serverName}' não encontrado. Ajuste serverName/groupCustomId em assets/js/api.js.`
      );
    }

    const sameGroupServers = allServers.filter((server) => server.group_id === matchedServer.group_id);
    return {
      groupId: matchedServer.group_id || null,
      groupCustomId: matchedServer.group_custom_id || null,
      servers: sameGroupServers.length ? sameGroupServers : [matchedServer]
    };
  })();

  return serverContextPromise;
}

const api = {
  health: () => request("/utils/health-check/"),
  serverStatus: async (limit = 100) => {
    const context = await resolveServerContext();
    const data = (context.servers || []).slice(0, limit);
    return { data, count: data.length };
  },
  recentRecords: async (limit = 20) => {
    const context = await resolveServerContext();
    const query = new URLSearchParams({ limit: String(limit) });
    if (context.groupId) query.set("server_group_id", context.groupId);
    return request(`/records/recent?${query.toString()}`);
  },
  leaderboard: ({ mode = "kz_timer", sortBy = "rating", limit = 50, offset = 0 } = {}) =>
    request(`/leaderboards/?mode=${mode}&sort_by=${sortBy}&limit=${limit}&offset=${offset}`),
  firePower: ({ mode = "kz_timer", period = "month", limit = 50 } = {}) =>
    request(`/leaderboards/fire-power?mode=${mode}&period=${period}&limit=${limit}`),
  hydraLeaderboard: async ({ mode = "kz_timer", limit = 50, offset = 0 } = {}) => {
    const context = await resolveServerContext();
    const hydraSteamIds = await fetchHydraSteamIds(context, mode);
    if (!hydraSteamIds.size) {
      return { data: [], count: 0 };
    }

    const neededCount = offset + limit;
    const pageSize = 100;
    let globalOffset = 0;
    let pagesRead = 0;
    const rows = [];
    let totalGlobalCount = 0;

    while (rows.length < neededCount && pagesRead < 30) {
      const response = await requestLeaderboardGlobalPage(mode, pageSize, globalOffset);
      totalGlobalCount = Number(response?.count ?? totalGlobalCount);
      const pageRows = response?.data || [];
      if (!pageRows.length) break;

      for (const row of pageRows) {
        const steamid64 = String(row?.steamid64 || "").trim();
        if (!steamid64 || !hydraSteamIds.has(steamid64)) continue;
        rows.push(row);
      }

      if (pageRows.length < pageSize) break;
      globalOffset += pageRows.length;
      pagesRead += 1;
    }

    return {
      data: rows.map((row, index) => ({
        rank: row.rank ?? offset + index + 1,
        steamid64: row.steamid64,
        player_name: row.player_name || "-",
        player_alias: row.player_alias || null,
        rating: Number(row.rating ?? row.points ?? 0) || 0,
        points: Math.round(Number(row.points ?? row.rating ?? 0) || 0),
        map_finished: Number(row.map_finished ?? 0) || 0,
        tp_finishes: Number(row.tp_finishes ?? 0) || 0,
        pro_finishes: Number(row.pro_finishes ?? 0) || 0,
        best_time: row.best_time ?? null
      })),
      count: Math.min(rows.length, totalGlobalCount || rows.length)
    };
  },
  hydraPeriodHighlights: async ({ mode = "kz_timer", period = "month", limit = 30 } = {}) => {
    const context = await resolveServerContext();
    const query = new URLSearchParams({ mode, limit: "2000" });
    if (context.groupId) {
      query.set("server_group_id", context.groupId);
    } else if (HYDRA_SERVER_CONFIG.globalServerId) {
      query.set("server_id", String(HYDRA_SERVER_CONFIG.globalServerId));
    }

    const recent = await request(`/records/recent?${query.toString()}`);
    const start = periodStartDate(period);
    const filtered = (recent || []).filter((record) => {
      const date = new Date(record.created_on);
      return !Number.isNaN(date.getTime()) && date >= start;
    });

    return aggregateHydraLeaderboard(filtered, limit, 0);
  },
  maps: ({ limit = 100, offset = 0, name = "", difficulty = "" } = {}) => {
    const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (name) query.set("name", name);
    if (difficulty !== "") query.set("difficulty", String(difficulty));
    query.set("is_validated", "true");
    return request(`/maps?${query.toString()}`);
  },
  mapByName: (mapName) => request(`/maps/name/${encodeURIComponent(mapName)}?include_wr_cache=true`),
  mapLeaderboard: async ({ mapName, mode = "kz_timer", stage = 0, limit = 10 }) => {
    const context = await resolveServerContext();
    const query = new URLSearchParams({ mode, stage: String(stage), limit: String(limit) });
    if (context.groupId) query.set("server_group_id", context.groupId);
    return request(`/records/map/${encodeURIComponent(mapName)}?${query.toString()}`);
  },
  mapPlayerCount: async ({ mapName, mode = "kz_timer", stage = 0, hasTeleports = "" }) => {
    const context = await resolveServerContext();
    const query = new URLSearchParams({ mode, stage: String(stage) });
    if (hasTeleports !== "") query.set("has_teleports", String(hasTeleports));
    if (context.groupId) query.set("server_group_id", context.groupId);
    return request(`/records/map/${encodeURIComponent(mapName)}/player-count?${query.toString()}`);
  },
  player: (steamid64) => request(`/players/${steamid64}`),
  playerSearch: (query) => request(`/players/search/${encodeURIComponent(String(query || "").trim())}`),
  playerModeLeaderboard: (steamid64, mode = "kz_simple") =>
    request(`/leaderboards/${encodeURIComponent(String(steamid64))}?mode=${encodeURIComponent(String(mode))}`, {
      allowStatus: [404]
    }),
  playerStats: (steamid64) => request(`/players/${steamid64}/stats`),
  playerRecap: (steamid64) => request(`/players/${steamid64}/recap`),
  playerTopRecords: (steamid64, limit = 15, hasTeleports = "") => {
    const query = new URLSearchParams({ steamid64: String(steamid64), limit: String(limit) });
    if (hasTeleports !== "") query.set("has_teleports", String(hasTeleports));
    return request(`/records/top?${query.toString()}`);
  },
  bans: ({ limit = 100, isExpired = "" } = {}) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (isExpired !== "") query.set("is_expired", String(isExpired));
    return request(`/bans?${query.toString()}`);
  },
  isHydraServerName: isTargetServerName,
  serverConfig: HYDRA_SERVER_CONFIG
};

window.gokzApi = api;
