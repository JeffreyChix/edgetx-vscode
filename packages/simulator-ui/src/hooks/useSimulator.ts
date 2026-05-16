/**
 * useSimulator — DEPRECATED.
 * The simulator now runs in the VS Code extension host (Node.js).
 * State is delivered via VS Code webview messages and managed in App.tsx.
 * This file is kept for import compatibility only.
 */

// No-op export to prevent import errors from any remaining references
export function useSimulator(_radioKey: string, _wasmUrl: string) {
  return {
    runner: null,
    loading: false,
    error: null as string | null,
    progress: 0,
    status: "",
  };
}
