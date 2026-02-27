const ACCENT = "#00D4FF";
const ACCENT_DIM = "#0099BB";
const ACCENT_GLOW = "rgba(0, 212, 255, 0.15)";

export const Colors = {
  background: "#000000",
  backgroundSecondary: "#0A0A0F",
  backgroundTertiary: "#0F0F1A",
  surface: "#0D0D1A",
  surfaceElevated: "#141428",
  border: "rgba(0, 212, 255, 0.12)",
  borderBright: "rgba(0, 212, 255, 0.3)",
  accent: ACCENT,
  accentDim: ACCENT_DIM,
  accentGlow: ACCENT_GLOW,
  accentSoft: "rgba(0, 212, 255, 0.08)",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.6)",
  textMuted: "rgba(255, 255, 255, 0.35)",
  userBubble: "#001E2E",
  userBubbleBorder: "rgba(0, 212, 255, 0.25)",
  aiBubble: "#080818",
  aiBubbleBorder: "rgba(255, 255, 255, 0.06)",
  success: "#00FF88",
  warning: "#FFB800",
  error: "#FF3860",
  inputBg: "rgba(255, 255, 255, 0.04)",
  inputBorder: "rgba(255, 255, 255, 0.1)",
  inputBorderFocused: ACCENT,
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.accent,
    tabIconDefault: Colors.textMuted,
    tabIconSelected: Colors.accent,
  },
};
