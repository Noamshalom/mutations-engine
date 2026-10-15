// Two tabs: the extended game, and the sequence tool.
import React, { useState } from "react";
import { FONT, HA, linkBtn } from "./ui/theme.js";
import { GameApp } from "./ui/game/GameApp.jsx";
import { SequenceTool } from "./ui/tool/SequenceTool.jsx";
import { STR } from "./ui/tool/strings.js";

export default function App() {
  const [tab, setTab] = useState("game"); const lang = "he"; const t = STR[lang];
  const tabBtn = (on) => ({ background: on ? HA.ink : "#fff", color: on ? "#fff" : HA.ink, border: `1.5px solid ${HA.ink}`, borderRadius: 7, padding: "7px 16px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: FONT });
  return (<div dir={t.dir} style={{ background: HA.bg, minHeight: "100vh", color: HA.ink, fontFamily: FONT }}>
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "18px 16px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: `2px solid ${HA.ink}`, paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 160 }}><div style={{ fontSize: 11.5, letterSpacing: 3, color: HA.hint, fontWeight: 800 }}>MUTATIONS LAB</div><div style={{ fontSize: 24, fontWeight: 800, fontFamily: FONT }}>{lang === "he" ? "מוטציות" : "Mutations"}</div></div>
        <button onClick={() => setTab("tool")} style={tabBtn(tab === "tool")}>{t.tabTool}</button>
        <button onClick={() => setTab("game")} style={tabBtn(tab === "game")}>{t.tabGame}</button>
      </div>
      {tab === "tool" ? <SequenceTool lang={lang} /> : <div dir="rtl"><GameApp /></div>}
    </div>
  </div>);
}
