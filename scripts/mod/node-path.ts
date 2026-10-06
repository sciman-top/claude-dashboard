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
// The nvm glob keeps its last (lexically highest) match: a guess, only reached when no shell answers.
export const NODE_LOOKUP_SCRIPT = `
for s in "$SHELL" bash zsh; do
  [ -n "$s" ] && command -v "$s" >/dev/null 2>&1 || continue
  p=$("$s" -lic 'command -v node' </dev/null 2>/dev/null | tail -n 1)
  case "$p" in /*) [ -x "$p" ] && { echo "$p"; exit 0; } ;; esac
done
found=
for p in "$HOME"/.nvm/versions/node/*/bin/node; do [ -x "$p" ] && found=$p; done
[ -n "$found" ] && { echo "$found"; exit 0; }
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

// Interactive rc files may print banners first; the answer is the last absolute path line.
export function parseNodePath(stdout: string): string | null {
  const lines = stdout.split('\n').map(l => l.trim()).filter(l => l.startsWith('/'))
  return lines.at(-1) ?? null
}
