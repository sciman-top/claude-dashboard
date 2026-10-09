/**
 * Finding `node` when the mod's process has no shell PATH. `$.process.run` execs argv[0] off the
 * host process's PATH with no shell, and a host the desktop app starts (Code tab over WSL/SSH)
 * never sources ~/.bashrc, so a node installed by nvm/fnm/volta is missing there while statusLine,
 * which runs through the shell snapshot, still finds it.
 * @handbook 9.1-mod-renderer-subprocess
 * @tested scripts/__tests__/mod-node-path.test.ts
 */

// Run by `sh -c` once `node` failed to start: ask the user's own shell first (login + interactive,
// so nvm in .bashrc/.zshrc loads and its default version wins), then try common install paths.
// Each shell is probed once (each probe sources rc files, seconds each). Every nvm install is
// listed for parseNodePath to pick the highest version: glob order is lexical, putting v9 after v20.
export const NODE_LOOKUP_SCRIPT = `
tried=
for s in "$SHELL" bash zsh; do
  [ -n "$s" ] && s=$(command -v "$s" 2>/dev/null) || continue
  case " $tried " in *" $s "*) continue ;; esac
  tried="$tried $s"
  p=$("$s" -lic 'command -v node' </dev/null 2>/dev/null | tail -n 1)
  case "$p" in /*) [ -x "$p" ] && { echo "$p"; exit 0; } ;; esac
done
found=
for p in "$HOME"/.nvm/versions/node/*/bin/node; do [ -x "$p" ] && { echo "$p"; found=1; }; done
[ -n "$found" ] && exit 0
for p in "$HOME"/.local/share/fnm/aliases/default/bin/node "$HOME"/.volta/bin/node \\
         "$HOME"/.asdf/shims/node /opt/homebrew/bin/node /usr/local/bin/node; do
  [ -x "$p" ] && { echo "$p"; exit 0; }
done
exit 1
`

// The engine's start failure reads `... failed to start: ENOENT: Executable not found in $PATH`.
export function isMissingExecutable(err: unknown): boolean {
  return err instanceof Error && /\bENOENT\b/.test(err.message)
}

const NVM_VERSION = /\/v(\d+)\.(\d+)\.(\d+)\/bin\/node$/

function nvmVersion(nodePath: string): number[] {
  return NVM_VERSION.exec(nodePath)?.slice(1).map(Number) ?? [-1, -1, -1]
}

function isNewer(a: number[], b: number[]): boolean {
  const i = a.findIndex((n, k) => n !== b[k])
  return i !== -1 && a[i] > b[i]
}

// The script prints one path, or every nvm install: the highest nvm version wins (ties keep the first).
export function parseNodePath(stdout: string): string | null {
  const paths = stdout.split('\n').map(l => l.trim()).filter(l => l.startsWith('/'))
  if (paths.length === 0) return null
  return paths.reduce((best, p) => (isNewer(nvmVersion(p), nvmVersion(best)) ? p : best))
}
