/**
 * claude-dashboard mod: runs the unchanged renderer (dist/index.js) as a subprocess with a
 * statusLine-shaped stdin built from mod data, and draws its lines in a Pane.
 * Exported as a function declaration: the engine's validator reads the built dist/mod.js
 * literally and refuses `var register = …`, which an arrow export compiles to.
 */
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import en from '../../locales/en.json'
import ko from '../../locales/ko.json'
import { parseAnsi, type Segment } from './ansi'
import { buildStdin, type ModRateLimit, type ModSnapshot } from './stdin-builder'

const PANE = 'claude-dashboard'
const TICK_MS = 60_000
const RUN_TIMEOUT_MS = 5_000

const paneLines = atom({ plugin: 'claude-dashboard', key: 'paneLines' } as const, [] as Segment[][])

type Strings = typeof en.mod

// The mod cannot read the dashboard config; follow the host locale, falling back to English.
function strings(): Strings {
  try {
    return (Intl.DateTimeFormat().resolvedOptions().locale.startsWith('ko') ? ko : en).mod
  } catch {
    return en.mod
  }
}

interface Usage {
  context: { tokens?: number; window: number; percent?: number }
  rateLimits: readonly ModRateLimit[]
  cost?: { usd: number }
}

// Module state: a reload re-runs register and session.start, so starting over is fine.
const snapshot: ModSnapshot = { sessionId: '', model: '', cwd: '', rateLimits: [] }
let isPaneOpen = false
let stopTicker: (() => void) | null = null

// Helpers that take $ are top-level declarations: the engine's validator follows $ only into those.
async function renderLines($: EngineInterface, env: Record<string, string>): Promise<Segment[][] | null> {
  try {
    const run = await $.process.run(['node', `${$.plugin.root}/dist/index.js`], {
      stdin: JSON.stringify(buildStdin(snapshot)),
      env: { CLAUDE_DASHBOARD_MOD: '1', ...env },
      timeoutMs: RUN_TIMEOUT_MS,
    })
    if (run.exitCode !== 0) {
      $.ui.log(`${strings().renderFailed}: exit ${run.exitCode} ${run.stderr.slice(0, 200)}`)
      return null
    }
    return run.stdout.split('\n').filter(l => l.length > 0).map(parseAnsi)
  } catch (err) {
    $.ui.log(`${strings().renderFailed}: ${(err as Error).message}`)
    return null
  }
}

// Keep the last good lines on failure; show ⚠️ only when there is nothing to keep.
function keepOrWarn(lines: Segment[][] | null) {
  return (prev: Segment[][]) => lines ?? (prev.length > 0 ? prev : [[{ text: `⚠️ ${strings().renderFailed}` }]])
}

async function refresh($: EngineInterface) {
  if (isPaneOpen) {
    const lines = await renderLines($, { CLAUDE_DASHBOARD_DISPLAY_MODE: 'detailed' })
    await update($, paneLines, keepOrWarn(lines))
  }
}

function syncTicker($: EngineInterface) {
  const needed = isPaneOpen
  if (needed && !stopTicker) stopTicker = $.clock.every(TICK_MS, () => void refresh($))
  if (!needed && stopTicker) {
    stopTicker()
    stopTicker = null
  }
}

function applyUsage(u: Usage) {
  snapshot.context = { tokens: u.context.tokens, window: u.context.window, percent: u.context.percent }
  snapshot.rateLimits = [...u.rateLimits]
  snapshot.costUsd = u.cost?.usd
}

export function register(on: Parameters<Register>[0]) {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'dashboard', description: 'Toggle the claude-dashboard pane' })
    snapshot.sessionId = await $.session.id()
    snapshot.model = await $.session.model()
    snapshot.cwd = await $.session.cwd()
    snapshot.root = await $.session.root()
    snapshot.version = (await $.session.version()).version
    applyUsage(await $.session.usage())
    return next(e)
  })

  on('classic.SessionStart', ($, e, next) => {
    if (e.transcript_path) snapshot.transcriptPath = e.transcript_path
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    applyUsage(e)
    snapshot.model = await $.session.model()
    void refresh($)
    return next(e)
  })

  on('command.run', { command: 'dashboard' }, async $ => {
    if (isPaneOpen) {
      isPaneOpen = false
      await $.ui.close({ id: PANE })
      syncTicker($)
      return { text: strings().paneClosed }
    }
    isPaneOpen = true
    await $.ui.open({ id: PANE, title: strings().paneTitle })
    syncTicker($)
    await refresh($)
    return { text: strings().paneOpened }
  })

  on('ui.close', { id: 'claude-dashboard' }, ($, e, next) => {
    isPaneOpen = false
    syncTicker($)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: 'claude-dashboard' }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const lines = await read($, paneLines)
    return (
      <Box flexDirection="column">
        {lines.map(line => (
          <Text>
            {line.map(seg => (
              <Text color={seg.color} bold={seg.bold} dimColor={seg.dim}>{seg.text}</Text>
            ))}
          </Text>
        ))}
      </Box>
    )
  })
}
