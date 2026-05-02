import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLORS = [
  "#7c6ef5",
  "#4eca8b",
  "#f5a623",
  "#4da6ff",
  "#f07ab0",
  "#f05252",
];

export const EMOJIS = ["📋", "🚀", "💡", "⚙️", "🎯", "🔥", "🌟", "🛠️"];

export const TAGS = [
  { label: "Bug", color: "#f05252", bg: "rgba(240,82,82,0.15)" },
  { label: "Özellik", color: "#4eca8b", bg: "rgba(78,202,139,0.15)" },
  { label: "İyileştirme", color: "#f5a623", bg: "rgba(245,166,35,0.15)" },
  { label: "Tasarım", color: "#f07ab0", bg: "rgba(240,122,176,0.15)" },
  { label: "Acil", color: "#7c6ef5", bg: "rgba(124,110,245,0.15)" },
  { label: "Araştırma", color: "#4da6ff", bg: "rgba(77,166,255,0.15)" },
];

export const PRIORITY_COLORS: Record<string, string> = {
  low: "#60606e",
  mid: "#f5a623",
  high: "#f05252",
};
