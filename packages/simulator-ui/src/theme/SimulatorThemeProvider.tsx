import React, { createContext, useContext } from "react";

export type SimulatorTheme = "dark" | "vscode";

interface ThemeContextValue {
  theme: SimulatorTheme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark" });

export function useSimulatorTheme() {
  return useContext(ThemeContext);
}

const DARK_VARS = `
  --sim-bg: #111111;
  --sim-card: #1c1c1c;
  --sim-card-border: #2a2a2a;
  --sim-surface: #141414;
  --sim-border: #2a2a2a;
  --sim-border-light: #333333;
  --sim-text: #888888;
  --sim-text-dim: #444444;
  --sim-text-dimmer: #333333;
  --sim-text-bright: #aaaaaa;
  --sim-accent: #4a9eff;
  --sim-accent-dim: rgba(74, 158, 255, 0.1);
  --sim-success: #22c55e;
  --sim-danger: #ef4444;
`;

const VSCODE_VARS = `
  --sim-bg: var(--vscode-editor-background);
  --sim-card: var(--vscode-panel-background, var(--vscode-editor-background));
  --sim-card-border: var(--vscode-panel-border, var(--vscode-widget-border));
  --sim-surface: var(--vscode-input-background);
  --sim-border: var(--vscode-widget-border, var(--vscode-panel-border));
  --sim-border-light: var(--vscode-focusBorder);
  --sim-text: var(--vscode-foreground);
  --sim-text-dim: var(--vscode-descriptionForeground);
  --sim-text-dimmer: var(--vscode-disabledForeground);
  --sim-text-bright: var(--vscode-editor-foreground);
  --sim-accent: var(--vscode-button-background);
  --sim-accent-dim: var(--vscode-button-secondaryBackground);
  --sim-success: var(--vscode-testing-iconPassed);
  --sim-danger: var(--vscode-testing-iconFailed);
`;

interface Props {
  theme: SimulatorTheme;
  children: React.ReactNode;
}

export function SimulatorThemeProvider({ theme, children }: Props) {
  const vars = theme === "vscode" ? VSCODE_VARS : DARK_VARS;

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div className="sim-theme-root" style={{ display: "contents" }}>
        <style>{`:root { ${vars} }`}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
