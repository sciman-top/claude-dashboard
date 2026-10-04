// scripts/mod/register.tsx
import { atom, read, update } from "claude-code";

// locales/en.json
var en_default = {
  model: {
    opus: "Opus",
    sonnet: "Sonnet",
    haiku: "Haiku"
  },
  labels: {
    "5h": "5h",
    "7d": "7d",
    "7d_all": "7d",
    "7d_sonnet": "7d-S",
    "7d_fable": "7d-F",
    codex: "Codex",
    "1m": "1m"
  },
  time: {
    days: "d",
    hours: "h",
    minutes: "m",
    seconds: "s"
  },
  errors: {
    no_context: "No context yet"
  },
  widgets: {
    tools: "Tools",
    done: "done",
    running: "running",
    agent: "Agent",
    todos: "Tasks",
    claudeMd: "CLAUDE.md",
    agentsMd: "AGENTS.md",
    addedDirs: "+Dirs",
    rules: "Rules",
    mcps: "MCP",
    hooks: "Hooks",
    burnRate: "Rate",
    cache: "Cache",
    tokenSpeedLast: "last",
    cacheMiss: "miss",
    toLimit: "to",
    forecast: "Forecast",
    budget: "Budget",
    performance: "Perf",
    tokenBreakdown: "Tokens",
    todayCost: "Today",
    apiDuration: "API",
    peakHours: "Peak",
    offPeak: "Off-Peak"
  },
  checkUsage: {
    title: "CLI Usage Dashboard",
    recommendation: "Recommendation",
    lowestUsage: "Lowest usage",
    used: "used",
    notInstalled: "not installed",
    errorFetching: "Error fetching data",
    noData: "No usage data available"
  },
  mod: {
    paneTitle: "Dashboard",
    paneOpened: "Dashboard pane opened.",
    paneClosed: "Dashboard pane closed.",
    bandOn: "Dashboard band on \u2014 statusLine hidden for this session (terminal/desktop only).",
    bandOff: "Dashboard band off \u2014 statusLine restored.",
    bandUsage: "Usage: /dashboard-band on|off",
    renderFailed: "Dashboard render failed"
  }
};

// locales/ko.json
var ko_default = {
  model: {
    opus: "Opus",
    sonnet: "Sonnet",
    haiku: "Haiku"
  },
  labels: {
    "5h": "5\uC2DC\uAC04",
    "7d": "7\uC77C",
    "7d_all": "7\uC77C",
    "7d_sonnet": "7\uC77C-S",
    "7d_fable": "7\uC77C-F",
    codex: "Codex",
    "1m": "1\uAC1C\uC6D4"
  },
  time: {
    days: "\uC77C",
    hours: "\uC2DC\uAC04",
    minutes: "\uBD84",
    seconds: "\uCD08"
  },
  errors: {
    no_context: "\uCEE8\uD14D\uC2A4\uD2B8 \uC5C6\uC74C"
  },
  widgets: {
    tools: "\uB3C4\uAD6C",
    done: "\uC644\uB8CC",
    running: "\uC2E4\uD589\uC911",
    agent: "\uC5D0\uC774\uC804\uD2B8",
    todos: "\uD560\uC77C",
    claudeMd: "CLAUDE.md",
    agentsMd: "AGENTS.md",
    addedDirs: "+\uB514\uB809\uD1A0\uB9AC",
    rules: "\uADDC\uCE59",
    mcps: "MCP",
    hooks: "\uD6C5",
    burnRate: "\uC18C\uBAA8\uC728",
    cache: "\uCE90\uC2DC",
    tokenSpeedLast: "\uCD5C\uADFC",
    cacheMiss: "miss",
    toLimit: "\uD6C4",
    forecast: "\uC608\uCE21",
    budget: "\uC608\uC0B0",
    performance: "\uC131\uB2A5",
    tokenBreakdown: "\uD1A0\uD070",
    todayCost: "\uC624\uB298",
    apiDuration: "API",
    peakHours: "\uD53C\uD06C",
    offPeak: "\uBE44\uD53C\uD06C"
  },
  checkUsage: {
    title: "CLI \uC0AC\uC6A9\uB7C9 \uB300\uC2DC\uBCF4\uB4DC",
    recommendation: "\uCD94\uCC9C",
    lowestUsage: "\uAC00\uC7A5 \uC5EC\uC720",
    used: "\uC0AC\uC6A9",
    notInstalled: "\uC124\uCE58\uB418\uC9C0 \uC54A\uC74C",
    errorFetching: "\uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30 \uC624\uB958",
    noData: "\uC0AC\uC6A9\uB7C9 \uB370\uC774\uD130 \uC5C6\uC74C"
  },
  mod: {
    paneTitle: "\uB300\uC2DC\uBCF4\uB4DC",
    paneOpened: "\uB300\uC2DC\uBCF4\uB4DC \uD328\uB110\uC744 \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4.",
    paneClosed: "\uB300\uC2DC\uBCF4\uB4DC \uD328\uB110\uC744 \uB2EB\uC558\uC2B5\uB2C8\uB2E4.",
    bandOn: "\uB300\uC2DC\uBCF4\uB4DC \uBC34\uB4DC \uCF1C\uC9D0 \u2014 \uC774 \uC138\uC158\uC758 statusLine\uC744 \uC228\uAE41\uB2C8\uB2E4 (\uD130\uBBF8\uB110/\uB370\uC2A4\uD06C\uD1B1 \uC804\uC6A9).",
    bandOff: "\uB300\uC2DC\uBCF4\uB4DC \uBC34\uB4DC \uAEBC\uC9D0 \u2014 statusLine\uC744 \uBCF5\uC6D0\uD588\uC2B5\uB2C8\uB2E4.",
    bandUsage: "\uC0AC\uC6A9\uBC95: /dashboard-band on|off",
    renderFailed: "\uB300\uC2DC\uBCF4\uB4DC \uB80C\uB354 \uC2E4\uD328"
  }
};

// scripts/mod/ansi.ts
var BASIC_HEX = [
  "#000000",
  "#cd0000",
  "#00cd00",
  "#cdcd00",
  "#0000ee",
  "#cd00cd",
  "#00cdcd",
  "#e5e5e5",
  "#7f7f7f",
  "#ff0000",
  "#00ff00",
  "#ffff00",
  "#5c5cff",
  "#ff00ff",
  "#00ffff",
  "#ffffff"
];
var CUBE = [0, 95, 135, 175, 215, 255];
var hex = (r, g, b) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
function ansi256ToHex(n) {
  if (n < 16)
    return BASIC_HEX[n];
  if (n < 232) {
    const i = n - 16;
    return hex(CUBE[Math.floor(i / 36)], CUBE[Math.floor(i / 6) % 6], CUBE[i % 6]);
  }
  const level = 8 + (n - 232) * 10;
  return hex(level, level, level);
}
function applySgr(style, params) {
  const codes = params === "" ? [0] : params.split(";").map(Number);
  let next = { ...style };
  for (let i = 0; i < codes.length; i++) {
    const c = codes[i];
    if (c === 0)
      next = {};
    else if (c === 1)
      next.bold = true;
    else if (c === 2)
      next.dim = true;
    else if (c === 22) {
      delete next.bold;
      delete next.dim;
    } else if (c === 39)
      delete next.color;
    else if (c >= 30 && c <= 37)
      next.color = BASIC_HEX[c - 30];
    else if (c >= 90 && c <= 97)
      next.color = BASIC_HEX[c - 90 + 8];
    else if (c === 38 && codes[i + 1] === 5) {
      next.color = ansi256ToHex(codes[i + 2]);
      i += 2;
    } else if (c === 38 && codes[i + 1] === 2) {
      next.color = hex(codes[i + 2], codes[i + 3], codes[i + 4]);
      i += 4;
    }
  }
  return next;
}
var OSC = /\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g;
var CSI = /\x1b\[([0-9;]*)([A-Za-z])/g;
var TRUNCATED_CSI = /\x1b\[[0-9;]*$/;
var CONTROL = /[\x00-\x08\x0a-\x1f\x7f]/g;
var toText = (raw) => raw.replace(/\t/g, " ").replace(CONTROL, "");
function parseAnsi(line) {
  const clean = line.replace(OSC, "").replace(TRUNCATED_CSI, "");
  const out = [];
  let style = {};
  let last = 0;
  const push = (raw) => {
    const text = toText(raw);
    if (text)
      out.push({ text, ...style });
  };
  for (const m of clean.matchAll(CSI)) {
    push(clean.slice(last, m.index));
    if (m[2] === "m")
      style = applySgr(style, m[1]);
    last = m.index + m[0].length;
  }
  push(clean.slice(last));
  return out;
}

// scripts/mod/stdin-builder.ts
var MODEL_SCOPED = /opus|sonnet|fable/i;
function windowForKind(kind) {
  if (MODEL_SCOPED.test(kind))
    return null;
  if (/^(five_hour|5h|session)$/i.test(kind))
    return "five_hour";
  if (/^(seven_day|7d|weekly)$/i.test(kind))
    return "seven_day";
  return null;
}
function rateLimitsFrom(list) {
  const out = {};
  for (const rl of list) {
    const window = windowForKind(rl.kind);
    const resetsMs = rl.resetsAt ? Date.parse(rl.resetsAt) : NaN;
    if (!window || Number.isNaN(resetsMs))
      continue;
    out[window] = { used_percentage: rl.percentUsed, resets_at: Math.floor(resetsMs / 1e3) };
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function buildStdin(s) {
  const percent = s.context?.percent ?? null;
  const stdin = {
    session_id: s.sessionId,
    model: { id: s.model, display_name: s.model },
    workspace: { current_dir: s.cwd, ...s.root ? { project_dir: s.root } : {} },
    context_window: {
      total_input_tokens: s.context?.tokens ?? 0,
      total_output_tokens: 0,
      context_window_size: s.context?.window ?? 0,
      used_percentage: percent,
      remaining_percentage: percent === null ? null : 100 - percent,
      current_usage: null
    },
    cost: { total_cost_usd: s.costUsd ?? 0 }
  };
  if (s.version)
    stdin.version = s.version;
  if (s.transcriptPath)
    stdin.transcript_path = s.transcriptPath;
  const rateLimits = rateLimitsFrom(s.rateLimits);
  if (rateLimits)
    stdin.rate_limits = rateLimits;
  return stdin;
}

// scripts/mod/register.tsx
var PANE = "claude-dashboard";
var TICK_MS = 6e4;
var RUN_TIMEOUT_MS = 5e3;
var paneLines = atom({ plugin: "claude-dashboard", key: "paneLines" }, []);
var bandLines = atom({ plugin: "claude-dashboard", key: "bandLines" }, []);
var BAND_STORE_KEY = "bandEnabled";
var BAND_SURFACES = /* @__PURE__ */ new Set(["terminal", "desktop"]);
function strings() {
  try {
    return (Intl.DateTimeFormat().resolvedOptions().locale.startsWith("ko") ? ko_default : en_default).mod;
  } catch {
    return en_default.mod;
  }
}
var snapshot = { sessionId: "", model: "", cwd: "", rateLimits: [] };
var isPaneOpen = false;
var isBandOn = false;
var ticker = null;
async function renderLines($, env) {
  try {
    const run = await $.process.run(["node", `${$.plugin.root}/dist/index.js`], {
      stdin: JSON.stringify(buildStdin(snapshot)),
      env: { CLAUDE_DASHBOARD_MOD: "1", ...env },
      timeoutMs: RUN_TIMEOUT_MS
    });
    if (run.exitCode !== 0) {
      $.ui.log(`${strings().renderFailed}: exit ${run.exitCode} ${run.stderr.slice(0, 200)}`);
      return null;
    }
    return run.stdout.split("\n").filter((l) => l.length > 0).map(parseAnsi);
  } catch (err) {
    $.ui.log(`${strings().renderFailed}: ${err.message}`);
    return null;
  }
}
function keepOrWarn(lines) {
  return (prev) => lines ?? (prev.length > 0 ? prev : [[{ text: `\u26A0\uFE0F ${strings().renderFailed}` }]]);
}
async function canDrawBand($) {
  const surfaces = await $.session.surfaces();
  return surfaces.some((s) => BAND_SURFACES.has(s));
}
async function refresh($) {
  if (isPaneOpen) {
    const lines = await renderLines($, { CLAUDE_DASHBOARD_DISPLAY_MODE: "detailed" });
    await update($, paneLines, keepOrWarn(lines));
  }
  if (isBandOn && await canDrawBand($)) {
    const lines = await renderLines($, { CLAUDE_DASHBOARD_BAND_SESSION: snapshot.sessionId });
    await update($, bandLines, keepOrWarn(lines));
  }
}
async function setBand($, on) {
  isBandOn = on;
  await $.store.set(BAND_STORE_KEY, on);
  syncTicker($);
  if (on) {
    await refresh($);
  } else {
    await update($, bandLines, () => []);
    await renderLines($, { CLAUDE_DASHBOARD_BAND_OFF: snapshot.sessionId });
  }
}
function syncTicker($) {
  const needed = isPaneOpen || isBandOn;
  if (needed && !ticker)
    ticker = $.clock.every(TICK_MS, () => void refresh($));
  if (!needed && ticker) {
    ticker.cancel();
    ticker = null;
  }
}
function applyUsage(u) {
  snapshot.context = { tokens: u.context.tokens, window: u.context.window, percent: u.context.percent };
  snapshot.rateLimits = [...u.rateLimits];
  snapshot.costUsd = u.cost?.usd;
}
function drawLines(Box, Text, lines) {
  return /* @__PURE__ */ h(Box, { flexDirection: "column" }, lines.map((line) => /* @__PURE__ */ h(Text, null, line.map((seg) => /* @__PURE__ */ h(Text, { color: seg.color, bold: seg.bold, dimColor: seg.dim }, seg.text)))));
}
function register(on) {
  on("session.start", async ($, e, next) => {
    await $.command.register({ name: "dashboard", description: "Toggle the claude-dashboard pane" });
    snapshot.sessionId = await $.session.id();
    snapshot.model = await $.session.model();
    snapshot.cwd = await $.session.cwd();
    snapshot.root = await $.session.root();
    snapshot.version = (await $.session.version()).version;
    applyUsage(await $.session.usage());
    await $.command.register({
      name: "dashboard-band",
      description: "Show the dashboard above the prompt instead of the statusLine (on|off)"
    });
    if (await $.store.get(BAND_STORE_KEY) === true)
      await setBand($, true);
    return next(e);
  });
  on("classic.SessionStart", ($, e, next) => {
    if (e.transcript_path)
      snapshot.transcriptPath = e.transcript_path;
    return next(e);
  });
  on("session.measure", async ($, e, next) => {
    applyUsage(e);
    snapshot.model = await $.session.model();
    void refresh($);
    return next(e);
  });
  on("command.run", { command: "dashboard" }, async ($) => {
    if (isPaneOpen) {
      isPaneOpen = false;
      await $.ui.close({ id: PANE });
      syncTicker($);
      return { text: strings().paneClosed };
    }
    isPaneOpen = true;
    await $.ui.open({ id: PANE, title: strings().paneTitle });
    syncTicker($);
    await refresh($);
    return { text: strings().paneOpened };
  });
  on("ui.close", { id: "claude-dashboard" }, ($, e, next) => {
    isPaneOpen = false;
    syncTicker($);
    return next(e);
  });
  on("command.run", { command: "dashboard-band" }, async ($, e) => {
    const arg = e.args.trim().toLowerCase();
    if (arg !== "on" && arg !== "off")
      return { text: strings().bandUsage };
    await setBand($, arg === "on");
    return { text: arg === "on" ? strings().bandOn : strings().bandOff };
  });
  on("ui.render", { component: "Pane", requestId: "claude-dashboard" }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e);
    return drawLines(Box, Text, await read($, paneLines));
  });
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (!isBandOn || !BAND_SURFACES.has(e.surface) || e.props.hasSurvey)
      return next(e);
    const lines = await read($, bandLines);
    if (lines.length === 0)
      return next(e);
    const { Box, Text } = $.ui.resolve(e);
    return drawLines(Box, Text, lines);
  });
  on("session.end", async ($, e, next) => {
    if (isBandOn)
      await renderLines($, { CLAUDE_DASHBOARD_BAND_OFF: snapshot.sessionId });
    return next(e);
  });
}
export {
  register
};
