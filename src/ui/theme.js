// Palette, fonts and shared button styles.
export const FONT = "'Heebo', 'Assistant', Arial, sans-serif";
export const MONO = "ui-monospace, Menlo, Consolas, monospace";
if (typeof document !== "undefined" && !document.getElementById("heebo-font")) {
  const l = document.createElement("link"); l.id = "heebo-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800&display=swap";
  document.head.appendChild(l);
}
export const INK = "#3a3330", BODY = "#cba07e", SKIN = "#d9b591";
export const HA = { bg: "#fff", panel: "#f6f5f2", line: "#e4e1da", ink: "#1a1a1a", sub: "#6b6b6b", accent: "#2b2b2b", green: "#3f8f5f", red: "#c0453a", hint: "#b5842a" };
export const NUC = { A: "#3f8f5f", C: "#2f6fb0", G: "#b5842a", T: "#c0453a" };
export const btn = (bg, col) => ({ background: bg, color: col, border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT });
export const btnS = (bg, col) => ({ background: bg, color: col, border: "none", borderRadius: 6, padding: "7px 13px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT });
export const closeBtn = { background: "transparent", border: "none", color: "#8a8378", fontSize: 17, fontWeight: 700, cursor: "pointer", lineHeight: 1, padding: "2px 6px" };
export const linkBtn = { background: "none", border: "none", color: HA.sub, textDecoration: "underline", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, padding: 0 };
export const toggleIn = (arr, x, max) => arr.includes(x) ? arr.filter((k) => k !== x) : arr.length >= max ? [...arr.slice(1), x] : [...arr, x];
