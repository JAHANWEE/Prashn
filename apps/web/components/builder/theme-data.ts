export type PreviewTheme = "default" | "terminal" | "anime" | "cyberpunk" | "studio" | "gaming" | "retro" | "space" | "nature" | "minimal";

export const THEMES: { id: PreviewTheme; label: string; icon: string; color: string; description: string }[] = [
  { id: "default", label: "Default", icon: "dark_mode", color: "#fca9d4", description: "Clean dark" },
  { id: "terminal", label: "Terminal", icon: "terminal", color: "#22c55e", description: "Hacker mode" },
  { id: "anime", label: "Anime", icon: "auto_awesome", color: "#f472b6", description: "Anime world" },
  { id: "cyberpunk", label: "Cyberpunk", icon: "electric_bolt", color: "#06b6d4", description: "Neon city" },
  { id: "studio", label: "Studio", icon: "palette", color: "#a78bfa", description: "Design studio" },
  { id: "gaming", label: "Gaming", icon: "sports_esports", color: "#f97316", description: "Game UI" },
  { id: "retro", label: "Retro", icon: "radio", color: "#fbbf24", description: "80s vibes" },
  { id: "space", label: "Space", icon: "rocket_launch", color: "#818cf8", description: "Deep space" },
  { id: "nature", label: "Nature", icon: "park", color: "#34d399", description: "Forest calm" },
  { id: "minimal", label: "Minimal", icon: "crop_square", color: "#e4e1eb", description: "Pure white" },
];
