import AudioPlayer from './AudioPlayer'; // 注意，这里不需要写 components 了！
import React from 'react';
import { useState, useEffect, useRef } from "react";
import examDatabase from './catti_database.json';
const ALL_EXAMS = examDatabase.exam_database.exams;

function Motion(p) {
  var ref = useRef(null), hs = useState(false), ts = useState(false), m = useRef(false);
  useEffect(function() {
    var el = ref.current; if (!el) return;
    var t = ts[0] && p.whileTap ? Object.assign({}, p.animate, p.whileTap) : hs[0] && p.whileHover ? Object.assign({}, p.animate, p.whileHover) : p.animate;
    if (!m.current && p.initial) { sA(el, p.initial, true); m.current = true; requestAnimationFrame(function() { requestAnimationFrame(function() { sA(el, t, false, p.transition); }); }); }
    else { sA(el, t, false, p.transition); }
  }, [JSON.stringify(p.animate), hs[0], ts[0]]);
  return React.createElement("div", { ref: ref, className: p.className, style: Object.assign({ willChange: "transform,opacity" }, p.style || {}), onClick: p.onClick,
    onMouseEnter: function() { hs[1](true); }, onMouseLeave: function() { hs[1](false); ts[1](false); }, onMouseDown: function() { ts[1](true); }, onMouseUp: function() { ts[1](false); } }, p.children);
}
function sA(el, t, i, tr) {
  if (!t) return;
  if (!i) { var d = (tr && tr.duration) || 0.4, e = (tr && tr.type === "spring") ? "cubic-bezier(0.34,1.56,0.64,1)" : "cubic-bezier(0.4,0,0.2,1)"; el.style.transition = "all " + d + "s " + e; } else el.style.transition = "none";
  var tf = []; Object.keys(t).forEach(function(k) { var v = t[k]; if (k === "opacity") el.style.opacity = v; else if (k === "scale") tf.push("scale(" + v + ")"); else if (k === "y") tf.push("translateY(" + v + "px)"); else if (k === "x") tf.push("translateX(" + v + "px)"); else if (k === "rotate") tf.push("rotate(" + v + "deg)"); });
  if (tf.length) el.style.transform = tf.join(" ");
}

function Waveform(p) {
  var c = useRef(null), a = useRef(null), ph = useRef(0);
  useEffect(function() { var cv = c.current; if (!cv) return; var ctx = cv.getContext("2d"); var w = cv.width = 400, h = cv.height = 100;
    function draw() { ctx.clearRect(0, 0, w, h); ph.current += p.active ? 0.06 : 0.02; var amp = p.active ? 30 : 6;
      ["rgba(99,102,241,0.6)", "rgba(168,85,247,0.4)", "rgba(236,72,153,0.3)"].forEach(function(col, i) { ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 2.5 - i * 0.5;
        for (var x = 0; x < w; x++) { var y = h / 2 + Math.sin(x * 0.02 + ph.current + i * 1.2) * amp * (1 + Math.sin(x * 0.005 + ph.current * 0.5) * 0.5); if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); });
      a.current = requestAnimationFrame(draw); } draw(); return function() { cancelAnimationFrame(a.current); }; }, [p.active]);
  return React.createElement("canvas", { ref: c, style: { width: "100%", maxWidth: 400, height: 100 } });
}

function ScoreRing(p) { var pct = p.score / p.total, r = 54, ci = 2 * Math.PI * r, os = useState(ci);
  useEffect(function() { setTimeout(function() { os[1](ci * (1 - pct)); }, 100); }, [pct]);
  var col = pct >= 0.8 ? "#22c55e" : pct >= 0.6 ? "#f59e0b" : "#ef4444";
  return React.createElement("div", { style: { position: "relative", width: 140, height: 140 } },
    React.createElement("svg", { width: "140", height: "140", viewBox: "0 0 140 140" },
      React.createElement("circle", { cx: "70", cy: "70", r: r, fill: "none", stroke: "#f0f0f0", strokeWidth: "10" }),
      React.createElement("circle", { cx: "70", cy: "70", r: r, fill: "none", stroke: col, strokeWidth: "10", strokeLinecap: "round", strokeDasharray: ci, strokeDashoffset: os[0], transform: "rotate(-90 70 70)", style: { transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" } })),
    React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } },
      React.createElement("span", { style: { fontSize: 36, fontWeight: 800, color: col } }, p.score), React.createElement("span", { style: { fontSize: 14, color: "#999" } }, "/ " + p.total)));
}

function UInput(p) { var fs = useState(false), f = fs[0], hv = p.value && p.value.length > 0;
  return React.createElement("div", { style: { position: "relative", marginBottom: 28 } },
    React.createElement("label", { style: { position: "absolute", left: 0, top: (f || hv) ? -2 : 18, fontSize: (f || hv) ? 11 : 15, fontWeight: 500, color: f ? "#7c3aed" : "#aaa", transition: "all 0.2s ease", pointerEvents: "none", letterSpacing: 0.5 } }, p.label),
    React.createElement("input", { type: p.type || "text", value: p.value, onChange: p.onChange, onFocus: function(e) { fs[1](true); if (p.onFocus) p.onFocus(e); }, onBlur: function(e) { fs[1](false); if (p.onBlur) p.onBlur(e); }, spellCheck: false, autoComplete: "off",
      style: { width: "100%", padding: "16px 28px 8px 0", fontSize: 16, border: "none", borderBottom: "2px solid " + (f ? "#111" : "#e0e0e0"), outline: "none", background: "transparent", color: "#111", transition: "border-color 0.3s", boxSizing: "border-box", fontFamily: "inherit" } }),
    p.rightIcon ? React.createElement("div", { style: { position: "absolute", right: 0, top: 14, cursor: "pointer", color: "#999", fontSize: 18 }, onClick: p.onRightIconClick }, p.rightIcon) : null);
}

function Btn(p) { var v = p.variant || "primary", ss = { primary: { background: "#111", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }, secondary: { background: "#fff", color: "#111", border: "1px solid #e0e0e0" }, ghost: { background: "transparent", color: "#7c3aed", border: "none", padding: "8px 16px" }, danger: { background: "#ef4444", color: "#fff", border: "none" } };
  return React.createElement(Motion, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 400, damping: 17 } },
    React.createElement("button", { onClick: p.disabled ? undefined : p.onClick, style: Object.assign({ padding: "13px 28px", borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.5 : 1, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }, ss[v] || {}, p.style || {}) }, p.children));
}

function Tabs(p) { return React.createElement("div", { style: Object.assign({ display: "flex", gap: 4, background: "#f5f5f5", borderRadius: 12, padding: 4, flexWrap: "wrap" }, p.style || {}) },
  p.tabs.map(function(t) { return React.createElement("button", { key: t.key, onClick: function() { p.onChange(t.key); }, style: { padding: "10px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: p.active === t.key ? "#111" : "transparent", color: p.active === t.key ? "#fff" : "#888", transition: "all 0.3s", whiteSpace: "nowrap", fontFamily: "inherit" } }, t.label); })); }

function Card(p) { return React.createElement("div", { onClick: p.onClick, style: Object.assign({ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }, p.style || {}) }, p.children); }

function MonsterScene(p) {
  var c = p.inputState === "password";
  var l = p.inputState === "username";
  var eyeH = c ? 4 : 16;
  var eyeH2 = c ? 3 : 10;
  var eyeH3 = c ? 3 : 12;
  var eyeH4 = c ? 3 : 10;

  var purple = React.createElement("div", { style: { position: "relative", zIndex: 2, marginRight: -30, marginBottom: 20 } },
    React.createElement("div", { style: { width: 120, height: 160, background: "#7c5cf7", borderRadius: "20px 60px 30px 10px", transform: "rotate(-8deg)", position: "relative" } },
      React.createElement(Motion, { animate: { y: c ? 8 : 0 }, transition: { type: "spring", stiffness: 300, damping: 18 }, style: { position: "absolute", top: 35, left: 25, display: "flex", gap: 18 } },
        React.createElement("div", { style: { width: 12, height: eyeH, borderRadius: 8, background: "#1a1a2e", transition: "height 0.4s" } }),
        React.createElement("div", { style: { width: 12, height: eyeH, borderRadius: 8, background: "#1a1a2e", transition: "height 0.4s" } })
      ),
      React.createElement("div", { style: { position: "absolute", top: 70, left: 38, width: 16, height: 8, borderRadius: "0 0 10px 10px", background: "#5b3cc4" } })
    )
  );

  var orange = React.createElement("div", { style: { position: "relative", zIndex: 1 } },
    React.createElement("div", { style: { width: 180, height: 110, background: "#f4915e", borderRadius: "100px 100px 20px 20px", position: "relative" } },
      React.createElement(Motion, { animate: { y: c ? 6 : 0 }, transition: { type: "spring", stiffness: 300, damping: 18 }, style: { position: "absolute", top: 30, left: 50, display: "flex", gap: 24 } },
        React.createElement("div", { style: { width: 10, height: eyeH2, borderRadius: "50%", background: "#1a1a2e", transition: "height 0.4s" } }),
        React.createElement("div", { style: { width: 10, height: eyeH2, borderRadius: "50%", background: "#1a1a2e", transition: "height 0.4s" } })
      ),
      React.createElement("div", { style: { position: "absolute", top: 58, left: 80, width: 20, height: 10, borderRadius: "0 0 12px 12px", border: "2px solid #c46a3a", borderTop: "none" } })
    )
  );

  var black = React.createElement("div", { style: { position: "relative", zIndex: 3, marginLeft: -30, marginBottom: 10 } },
    React.createElement("div", { style: { width: 70, height: 110, background: "#2a2a3a", borderRadius: "14px 14px 10px 10px", position: "relative" } },
      React.createElement(Motion, { animate: { x: c ? -3 : (l ? 3 : 0) }, transition: { type: "spring", stiffness: 300, damping: 18 }, style: { position: "absolute", top: 28, left: 14, display: "flex", gap: 12 } },
        React.createElement("div", { style: { width: 9, height: eyeH3, borderRadius: 6, background: "#fff", transition: "height 0.4s" } }),
        React.createElement("div", { style: { width: 9, height: eyeH3, borderRadius: 6, background: "#fff", transition: "height 0.4s" } })
      )
    )
  );

  var yellow = React.createElement("div", { style: { position: "relative", zIndex: 2, marginLeft: -15, marginBottom: 5 } },
    React.createElement("div", { style: { width: 80, height: 95, background: "#f0d060", borderRadius: "16px 16px 40px 40px", position: "relative" } },
      React.createElement(Motion, { animate: { rotate: c ? 5 : (l ? -3 : 0) }, transition: { type: "spring", stiffness: 300, damping: 18 }, style: { position: "absolute", top: 30, left: 20, display: "flex", gap: 14 } },
        React.createElement("div", { style: { width: 8, height: eyeH4, borderRadius: 5, background: "#8a7020", transition: "height 0.4s" } }),
        React.createElement("div", { style: { width: 8, height: eyeH4, borderRadius: 5, background: "#8a7020", transition: "height 0.4s" } })
      ),
      React.createElement("svg", { style: { position: "absolute", top: 52, left: 22 }, width: "36", height: "12", viewBox: "0 0 36 12" },
        React.createElement("path", { d: "M2 6 Q10 2 18 6 Q26 10 34 6", fill: "none", stroke: "#8a7020", strokeWidth: "2", strokeLinecap: "round" })
      )
    )
  );

  return React.createElement("div", {
    style: { position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 40, overflow: "hidden" }
  }, purple, orange, black, yellow);
}

/* ============ MOCK DATA ============ */
/* ================================================================
   标准真题数据驱动模板 (JSON Schema)
   ================================================================
   未来上传真实真题时，请按照此结构准备 JSON 数据：
   {
     examId: "CATTI-2-ORAL-2025",
     year: 2025,
     type: "interpreting_p2",       // interpreting_p2 | interpreting_p3 | translation_p2
     category: "二级口译",
     audioUrl: "https://example.com/exam-audio.mp3",  // 完整音频文件地址
     segments: [
       {
         id: "seg-1",
         label: "第一段：全球经济增长",
         audioStartTime: 0,         // 该段在音频中的起始秒数
         audioEndTime: 45,          // 该段在音频中的结束秒数
         maxRecordTime: 120,        // 用户录音最长时限（秒）
         referenceAnswer: "中国经济在过去几十年实现了快速增长...",
         mockRecognized: "（模拟ASR识别文本，未来由Whisper返回）"
       }
     ],
     mockScore: { ... }            // 模拟打分数据
   }
   ================================================================ */

var MOCK_EXAM_TEMPLATE = {
  examId: "CATTI-2-ORAL-2025",
  year: 2025,
  type: "interpreting_p2",
  category: "二级口译",
  audioUrl: null,
  segments: [
    {
      id: "seg-1",
      label: "第一段：全球经济增长",
      audioStartTime: 0,
      audioEndTime: 45,
      maxRecordTime: 120,
      referenceAnswer: "中国经济在过去几十年实现了快速增长，为全球经济稳定做出了重要贡献。这一增长为国际合作与发展创造了前所未有的机遇。",
      mockRecognized: "中国经济在过去几十年实现了快速增长，为全球经济稳定做出了重要贡献。"
    },
    {
      id: "seg-2",
      label: "第二段：可持续发展",
      audioStartTime: 46,
      audioEndTime: 96,
      maxRecordTime: 120,
      referenceAnswer: "联合国可持续发展目标为各国提供了共同行动框架，在消除贫困和应对气候变化等领域，国际合作至关重要。",
      mockRecognized: "联合国可持续发展目标为各国提供了共同行动框架，在消除贫困和应对气候变化等领域至关重要。"
    },
    {
      id: "seg-3",
      label: "第三段：数字经济",
      audioStartTime: 97,
      audioEndTime: 137,
      maxRecordTime: 90,
      referenceAnswer: "数字经济正在重塑全球产业格局，人工智能、大数据和云计算等新兴技术不断推动着传统产业的数字化转型升级。",
      mockRecognized: "数字经济正在重塑全球产业格局，人工智能和大数据不断推动着传统产业转型升级。"
    }
  ]
};

var MOCK_AUDIO_URL = "https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3";



var MOCK_BANK = {};

/* end of auto-generated bank data */

var MOCK_TERMS = [
  { id: 1, en: "autonomous systems", zh: "自主系统", cat: "科技", date: "2025-03-20" },
  { id: 2, en: "algorithmic bias", zh: "算法偏见", cat: "科技", date: "2025-03-18" },
  { id: 3, en: "artificial intelligence", zh: "人工智能", cat: "科技", date: "2025-03-17" },
  { id: 4, en: "machine learning", zh: "机器学习", cat: "科技", date: "2025-03-15" },
  { id: 5, en: "deep learning", zh: "深度学习", cat: "科技", date: "2025-03-14" },
  { id: 6, en: "neural network", zh: "神经网络", cat: "科技", date: "2025-03-13" },
  { id: 7, en: "cloud computing", zh: "云计算", cat: "科技", date: "2025-03-12" },
  { id: 8, en: "big data analytics", zh: "大数据分析", cat: "科技", date: "2025-03-10" },
  { id: 9, en: "Internet of Things", zh: "物联网", cat: "科技", date: "2025-03-08" },
  { id: 10, en: "digital transformation", zh: "数字化转型", cat: "科技", date: "2025-03-01" },
  { id: 11, en: "5G commercialization", zh: "5G商用化", cat: "科技", date: "2025-02-28" },
  { id: 12, en: "blockchain technology", zh: "区块链技术", cat: "科技", date: "2025-02-25" },
  { id: 20, en: "carbon neutrality", zh: "碳中和", cat: "环保", date: "2025-03-15" },
  { id: 21, en: "sustainable development", zh: "可持续发展", cat: "环保", date: "2025-03-12" },
  { id: 22, en: "greenhouse gas emissions", zh: "温室气体排放", cat: "环保", date: "2025-03-10" },
  { id: 23, en: "renewable energy", zh: "可再生能源", cat: "环保", date: "2025-03-08" },
  { id: 24, en: "peak carbon emissions", zh: "碳达峰", cat: "环保", date: "2025-03-05" },
  { id: 25, en: "ecological civilization", zh: "生态文明", cat: "环保", date: "2025-03-01" },
  { id: 26, en: "energy transition", zh: "能源转型", cat: "环保", date: "2025-02-28" },
  { id: 27, en: "biodiversity conservation", zh: "生物多样性保护", cat: "环保", date: "2025-02-25" },
  { id: 28, en: "circular economy", zh: "循环经济", cat: "环保", date: "2025-02-22" },
  { id: 30, en: "Belt and Road Initiative", zh: "一带一路倡议", cat: "政治", date: "2025-03-10" },
  { id: 31, en: "multilateral cooperation", zh: "多边合作", cat: "政治", date: "2025-03-08" },
  { id: 32, en: "community of shared future", zh: "人类命运共同体", cat: "政治", date: "2025-03-06" },
  { id: 33, en: "governance capacity", zh: "治理能力", cat: "政治", date: "2025-03-04" },
  { id: 34, en: "political consultation", zh: "政治协商", cat: "政治", date: "2025-03-02" },
  { id: 35, en: "rule of law", zh: "法治", cat: "政治", date: "2025-02-28" },
  { id: 36, en: "peaceful development", zh: "和平发展", cat: "政治", date: "2025-02-26" },
  { id: 37, en: "diplomatic relations", zh: "外交关系", cat: "政治", date: "2025-02-24" },
  { id: 40, en: "supply chain resilience", zh: "供应链韧性", cat: "经济", date: "2025-03-05" },
  { id: 41, en: "economic globalization", zh: "经济全球化", cat: "经济", date: "2025-03-03" },
  { id: 42, en: "trade liberalization", zh: "贸易自由化", cat: "经济", date: "2025-03-01" },
  { id: 43, en: "fiscal policy", zh: "财政政策", cat: "经济", date: "2025-02-28" },
  { id: 44, en: "monetary policy", zh: "货币政策", cat: "经济", date: "2025-02-26" },
  { id: 45, en: "foreign direct investment", zh: "外国直接投资", cat: "经济", date: "2025-02-24" },
  { id: 46, en: "GDP growth rate", zh: "国内生产总值增长率", cat: "经济", date: "2025-02-22" },
  { id: 47, en: "inflation rate", zh: "通货膨胀率", cat: "经济", date: "2025-02-20" },
  { id: 48, en: "trade surplus", zh: "贸易顺差", cat: "经济", date: "2025-02-18" },
  { id: 49, en: "market access", zh: "市场准入", cat: "经济", date: "2025-02-15" },
  { id: 50, en: "just-in-time manufacturing", zh: "准时制生产", cat: "经济", date: "2025-02-12" }
];

// 💡 【全新动态引擎】：实时读取数据库里的术语，并自动生成分类卡片
function getDynamicCategories() {
  // 1. 从浏览器的本地保险箱里把刚刚存的词全部拿出来
  var savedTerms = JSON.parse(localStorage.getItem('catti_my_terms') || '[]');

  // 2. 这是你原本漂亮的 4 个默认“基础分类”
  var catMap = {
    "政治政工": { key: "政治", icon: "🏛", label: "政治政工", color: "#ef4444", gradient: "linear-gradient(135deg, #fef2f2, #fee2e2)", count: 0 },
    "经济贸易": { key: "经济", icon: "📈", label: "经济贸易", color: "#8b5cf6", gradient: "linear-gradient(135deg, #f5f3ff, #ede9fe)", count: 0 },
    "绿色环保": { key: "环保", icon: "🌱", label: "绿色环保", color: "#22c55e", gradient: "linear-gradient(135deg, #f0fdf4, #dcfce7)", count: 0 },
    "科技前沿": { key: "科技", icon: "💻", label: "科技前沿", color: "#6366f1", gradient: "linear-gradient(135deg, #eef2ff, #e0e7ff)", count: 0 }
  };

  // 3. 核心魔法：遍历所有的词，计算数量。如果是新分类，自动给它配个新皮肤！
  savedTerms.forEach(function(item) {
    var c = item.category;
    // 如果碰到了你新建的分类（比如“国家”），基础分类里没有，就当场为它建一个新方块！
    if (!catMap[c]) {
      catMap[c] = { 
        key: c, 
        icon: "🏷️", // 默认新分类的图标
        label: c, 
        color: "#f59e0b", // 默认新分类的主题色（漂亮的橙黄色）
        gradient: "linear-gradient(135deg, #fffbeb, #fef3c7)", 
        count: 0 
      };
    }
    // 这个分类下的词条数量 +1
    catMap[c].count++;
  });

  // 把对象转换成数组返回给页面渲染
  return Object.values(catMap);
}

// 每次页面刷新或渲染时，调用函数获取最新的真实数据！
var TERM_CATEGORIES_DATA = getDynamicCategories();
var MOCK_FAVORITES = [
  { id: 1, title: "2025 二级口译 第一段", original: "China has achieved rapid economic growth...", reference: "中国经济在过去几十年实现了快速增长...", type: "错题", date: "2025-03-20" },
  { id: 2, title: "2024 二级笔译 全文", original: "Climate change represents one of the most pressing...", reference: "气候变化是当今时代最紧迫的挑战之一...", type: "收藏", date: "2025-03-15" },
  { id: 3, title: "2025 三级口译 第一段", original: "China's urbanization process has achieved...", reference: "中国的城市化进程取得了显著成就...", type: "错题", date: "2025-03-10" }
];
var MOCK_HISTORY = [
  { id: 1, title: "2025 二级口译", score: 7, total: 15, date: "2025-03-20", category: "oral2", year: 2025 },
  { id: 2, title: "2024 二级笔译", score: 12, total: 15, date: "2025-03-18", category: "written2", year: 2024 },
  { id: 3, title: "2025 三级口译", score: 13, total: 15, date: "2025-03-15", category: "oral3", year: 2025 },
  { id: 4, title: "2023 二级口译", score: 10, total: 15, date: "2025-03-12", category: "oral2", year: 2023 },
  { id: 5, title: "2022 二级笔译", score: 10, total: 15, date: "2025-03-08", category: "written2", year: 2022 }
];
var CATS = ["政治", "经济", "环保", "科技", "法律", "医疗", "文化", "外交"];
var CAT_COLORS = { "政治": "#ef4444", "经济": "#8b5cf6", "环保": "#22c55e", "科技": "#6366f1", "法律": "#f97316", "医疗": "#ec4899", "文化": "#f59e0b", "外交": "#14b8a6" };

/* ============ SIDEBAR ============ */
function Sidebar(p) {
  var items = [
    { key: "dashboard", label: "题库大厅", icon: "📚" },
    { key: "practice", label: "练习室", icon: "🎯" },
    { key: "terms", label: "术语库", icon: "🏷" },
    { key: "favorites", label: "收藏", icon: "⭐" },
    { key: "history", label: "数据中心", icon: "📊" }
  ];
  return React.createElement("div", { style: { width: 220, minHeight: "100vh", background: "#fff", borderRight: "1px solid #f0f0f0", padding: "28px 0", flexShrink: 0, display: "flex", flexDirection: "column" } },
    React.createElement("div", { style: { padding: "0 24px 28px", display: "flex", alignItems: "center", gap: 10 } },
      React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 32 32" },
        React.createElement("path", { d: "M16 2 L18 12 L28 14 L18 16 L16 26 L14 16 L4 14 L14 12 Z", fill: "#111" }),
        React.createElement("circle", { cx: "24", cy: "6", r: "3", fill: "#111" })),
      React.createElement("span", { style: { fontWeight: 800, fontSize: 16, color: "#111" } }, "CATTI 备考")),
    React.createElement("div", { style: { flex: 1 } },
      items.map(function(it) {
        var active = p.active === it.key;
        return React.createElement(Motion, { key: it.key, animate: { scale: 1 }, whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 400, damping: 17 } },
          React.createElement("div", { onClick: function() { p.onChange(it.key); }, style: { padding: "12px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: active ? "#f5f3ff" : "transparent", borderRight: active ? "3px solid #7c3aed" : "3px solid transparent", color: active ? "#7c3aed" : "#666", fontWeight: active ? 700 : 500, fontSize: 14, transition: "all 0.2s" } },
            React.createElement("span", { style: { fontSize: 18 } }, it.icon), it.label));
      })
    ),
    // Profile button at bottom
    React.createElement(Motion, { animate: { scale: 1 }, whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 400, damping: 17 } },
      React.createElement("div", { onClick: function() { p.onProfile(); }, style: {
        margin: "12px 16px", padding: "12px 16px", borderRadius: 14, cursor: "pointer",
        background: p.active === "profile" ? "#f5f3ff" : "#f9fafb",
        border: "1px solid " + (p.active === "profile" ? "#e9e5ff" : "#f0f0f0"),
        display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
      } },
        p.avatarUrl
          ? React.createElement("div", { style: { width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 } },
              React.createElement("img", { src: p.avatarUrl, alt: "avatar", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }))
          : React.createElement("div", { style: {
              width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0
            } }, (p.userName || "U").charAt(0).toUpperCase()),
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#111" } }, p.userName || "用户"),
          React.createElement("div", { style: { fontSize: 11, color: "#bbb" } }, "个人中心")))
    ),
    React.createElement("div", { style: { padding: "8px 16px" } },
      React.createElement("div", { style: { padding: "10px", borderRadius: 10, background: "#f9fafb", fontSize: 11, color: "#ccc", textAlign: "center" } }, "v0.2 Preview"))
  );
}

/* ============ LOGIN ============ */
function LoginPage(p) {
  var ms = useState(p.initialMode || "login"), mode = ms[0], setMode = ms[1];
  var is2 = useState("idle"), inputState = is2[0], setIS = is2[1];
  var us = useState(""), un = us[0], setUn = us[1];
  var ps = useState(""), pw = ps[0], setPw = ps[1];
  var es = useState(""), em = es[0], setEm = es[1];
  var qs = useState(""), sq = qs[0], setSq = qs[1];
  var as2 = useState(""), sa = as2[0], setSa = as2[1];
  var ls = useState(false), ld = ls[0], setLd = ls[1];
  var sv = useState(false), sp = sv[0], setSp = sv[1];
  var titles = { login: "欢迎回来！", register: "创建账号", forgot: "重置密码" };
  var subs = { login: "请输入你的账号信息", register: "注册一个新账号开始学习", forgot: "验证密保问题重置密码" };

  function submit() { if (mode === "login" && (!un || !pw)) return; setLd(true); setTimeout(function() { setLd(false); if (mode === "login") p.onLogin(); else setMode("login"); }, 1000); }

  var fields = [];
  if (mode === "login" || mode === "register") {
    fields.push(React.createElement(UInput, { key: "e", label: "Email / 用户名", value: un, onChange: function(e) { setUn(e.target.value); }, onFocus: function() { setIS("username"); }, onBlur: function() { setIS("idle"); } }));
  }
  if (mode === "register") {
    fields.push(React.createElement(UInput, { key: "em", label: "邮箱", value: em, onChange: function(e) { setEm(e.target.value); } }));
  }
  if (mode === "login" || mode === "register") {
    fields.push(React.createElement(UInput, { key: "pw", label: "密码", type: sp ? "text" : "password", value: pw, onChange: function(e) { setPw(e.target.value); }, onFocus: function() { setIS("password"); }, onBlur: function() { setIS("idle"); }, rightIcon: sp ? "🙈" : "👁", onRightIconClick: function() { setSp(!sp); } }));
  }
  if (mode === "register") {
    fields.push(React.createElement(UInput, { key: "sq", label: "设置密保问题（如：你的高中班主任名字）", value: sq, onChange: function(e) { setSq(e.target.value); } }));
    fields.push(React.createElement(UInput, { key: "sa", label: "密保答案", value: sa, onChange: function(e) { setSa(e.target.value); } }));
  }
  if (mode === "forgot") {
    fields.push(React.createElement(UInput, { key: "fu", label: "你的用户名", value: un, onChange: function(e) { setUn(e.target.value); } }));
    fields.push(React.createElement(UInput, { key: "fq", label: "密保问题：你的高中班主任名字", value: sa, onChange: function(e) { setSa(e.target.value); } }));
    fields.push(React.createElement(UInput, { key: "fp", label: "设置新密码", type: "password", value: pw, onChange: function(e) { setPw(e.target.value); }, onFocus: function() { setIS("password"); }, onBlur: function() { setIS("idle"); } }));
  }

  var rememberRow = mode === "login" ? React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, fontSize: 13 } },
    React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, color: "#666", cursor: "pointer" } },
      React.createElement("input", { type: "checkbox", defaultChecked: true, style: { accentColor: "#111" } }), "记住我 30 天"),
    React.createElement("span", { onClick: function() { setMode("forgot"); }, style: { color: "#7c3aed", cursor: "pointer", fontWeight: 500 } }, "忘记密码?")) : null;

  var google = mode === "login" ? React.createElement(Btn, { variant: "secondary", style: { width: "100%", padding: "13px", borderRadius: 10, fontSize: 14 } },
    React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24" },
      React.createElement("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" }),
      React.createElement("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
      React.createElement("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
      React.createElement("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })),
    "使用 Google 登录") : null;

  var bottom = mode === "login"
    ? React.createElement("div", { style: { textAlign: "center", marginTop: 24, fontSize: 13, color: "#999" } }, "还没有账号？ ", React.createElement("span", { onClick: function() { setMode("register"); }, style: { color: "#111", fontWeight: 700, cursor: "pointer", textDecoration: "underline" } }, "注册"))
    : React.createElement("div", { style: { textAlign: "center", marginTop: 24, fontSize: 13 } }, React.createElement("span", { onClick: function() { setMode("login"); }, style: { color: "#111", fontWeight: 700, cursor: "pointer", textDecoration: "underline" } }, "返回登录"));

  var btnLabel = ld ? React.createElement("span", { style: { display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" } }) : (mode === "login" ? "登  录" : mode === "register" ? "注  册" : "重置密码");

  return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20, background: "#1a1a2e" } },
    React.createElement("style", null, "@keyframes spin{to{transform:rotate(360deg)}}"),
    React.createElement(Motion, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
      React.createElement("div", { style: { display: "flex", width: "100%", maxWidth: 880, minHeight: 540, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" } },
        React.createElement("div", { style: { flex: "0 0 45%", background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" } },
          React.createElement(MonsterScene, { inputState: inputState })),
        React.createElement("div", { style: { flex: 1, background: "#fff", padding: "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", maxHeight: "90vh" } },
          React.createElement("div", { style: { marginBottom: 20, display: "flex", justifyContent: "center" } },
            React.createElement("svg", { width: "28", height: "28", viewBox: "0 0 32 32" }, React.createElement("path", { d: "M16 2 L18 12 L28 14 L18 16 L16 26 L14 16 L4 14 L14 12 Z", fill: "#111" }), React.createElement("circle", { cx: "24", cy: "6", r: "3", fill: "#111" }))),
          React.createElement("h1", { style: { fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 4px", textAlign: "center" } }, titles[mode]),
          React.createElement("p", { style: { color: "#999", fontSize: 14, margin: "0 0 24px", textAlign: "center" } }, subs[mode]),
          fields, rememberRow,
          React.createElement(Btn, { onClick: submit, disabled: ld, style: { width: "100%", padding: "14px", borderRadius: 10, fontSize: 15, marginBottom: 12 } }, btnLabel),
          google, bottom))));
}

/* ============ DASHBOARD ============ */
/* ============ 核心过滤魔法升级版 ============ */

/* ============ DASHBOARD 精修版 ============ */

// 🚀 升级版分拣员：精准区分 二级 和 三级
/* ============ DASHBOARD 完全修复版 ============ */

// 1. 升级版分拣员：精准识别 二级 vs 三级
/* ============ DASHBOARD 终极修复版 ============ */

/* ==================== 🚀 DASHBOARD 完全修复版 ==================== */

/**
 * 💡 辅助函数：分拣员
 * 作用：根据当前选择的 Tab（二级/三级），从年份数据里挑出正确的段落。
 */
function extractParagraphs(exam, tabMode) {
  var allParagraphs = [];
  if (exam && exam.sections) {
    exam.sections.forEach(function(section) {
      var sType = section.type || "";
      
      // 🎯 精准匹配暗号：
      // 如果点的是“二级口译”，只拿包含“二级”字样的板块
      if (tabMode === "oral2" && !sType.includes("二级")) return;
      
      // 如果点的是“三级口译”，只拿包含“三级”字样的板块
      if (tabMode === "oral3" && !sType.includes("三级")) return;
      
      // 如果是笔译（预留逻辑）
      if (tabMode.includes("written") && !sType.includes("笔译")) return;
      if (tabMode === "sh_advanced" && !sType.includes("高口")) return;

      if (section.papers) {
        section.papers.forEach(function(paper) {
          if (paper.paragraphs) {
            allParagraphs = allParagraphs.concat(paper.paragraphs);
          }
        });
      }
    });
  }
  return allParagraphs;
}

/**
 * 💡 主组件：题库大厅
 */
function DashboardPage(p) {
  // 状态管理
  var cs = useState("oral2"), activeTab = cs[0], setActiveTab = cs[1];
  var ms = useState(null), modal = ms[0], setModal = ms[1];
  
  // Tab 配置
  var tabs = [
    { key: "oral2", label: "二级口译" },
    { key: "oral3", label: "三级口译" },
    { key: "written2", label: "二级笔译" },
    { key: "sh_advanced", label: "上海高口" }
  ];

  // 💡 数据源：统一从 ALL_EXAMS 拿，因为三级已经合进去了
  var exams = ALL_EXAMS || [];

  // 生成卡片列表
  var examCards = exams.map(function(exam, i) {
    // 关键：调用上面的分拣员
    var mParagraphs = extractParagraphs(exam, activeTab);
    var segCount = mParagraphs.length;
    
    // 💡 智能过滤：如果当前分类下没题（比如 2018 年还没录三级），就不显示这个年份的卡片
    if (segCount === 0) return null;

    var title = (exam.year || "") + " " + (exam.season || "");
    var isOral = activeTab.includes("oral") || activeTab === "sh_advanced";
    var catLabel = tabs.find(function(t){return t.key === activeTab;}).label;

    return React.createElement(Motion, { key: i + "-" + activeTab, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
      React.createElement(Motion, { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } },
        React.createElement(Card, { onClick: function() { setModal(i); }, style: { padding: 24, cursor: "pointer", textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 40, marginBottom: 8 } }, isOral ? "🎧" : "📝"),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 4 } }, title),
          React.createElement("div", { style: { color: "#999", fontSize: 13 } }, catLabel),
          React.createElement("div", { style: { color: "#bbb", fontSize: 12, marginTop: 6 } }, segCount + " 段")
        )
      )
    );
  });

  // 过滤掉 null
  var filteredCards = examCards.filter(function(c) { return c !== null; });

  // 弹窗逻辑
  var modalEl = null;
  if (modal !== null && exams[modal]) {
    var exam = exams[modal];
    var mTitle = (exam.year || "") + " " + (exam.season || "");
    var mIsOral = activeTab.includes("oral") || activeTab === "sh_advanced";
    var mParagraphs = extractParagraphs(exam, activeTab);
    var mSegCount = mParagraphs.length;

    modalEl = React.createElement("div", { onClick: function() { setModal(null); }, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 } },
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.9, y: 30 }, animate: { opacity: 1, scale: 1, y: 0 } },
        React.createElement(Card, { onClick: function(e) { e.stopPropagation(); }, style: { maxWidth: 380, width: "100%", padding: 36, textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 48, marginBottom: 14 } }, mIsOral ? "🎙" : "✍"),
          React.createElement("h2", { style: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 6 } }, mTitle),
          React.createElement("p", { style: { color: "#999", fontSize: 14, marginBottom: 8 } }, mIsOral ? "口译：听音频 → 录音 → AI识别" : "笔译：阅读原文 → 输入译文"),
          React.createElement("p", { style: { color: "#7c3aed", fontSize: 13, fontWeight: 600, marginBottom: 20 } }, "共 " + mSegCount + " 个段落"),
          React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center" } },
            React.createElement(Btn, { variant: "secondary", onClick: function() { setModal(null); } }, "取消"),
            React.createElement(Btn, { onClick: function() {
              setModal(null);
              p.onStartExam({
                category: activeTab,
                year: exam.year,
                type: mIsOral ? "interpreting" : "translation",
                data: {
                  segments: mParagraphs,
                  // 这里的音频自动指向当前年份三级/二级的 mp3
                  audio_url: exam.audio_url || (mParagraphs[0] && mParagraphs[0].audio_url)
                }
              });
            } }, "开始挑战"))
        )
      )
    );
  }

  // 最终渲染
  return React.createElement("div", { style: { padding: "32px 24px" } },
    React.createElement("h1", { style: { fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 4px" } }, "题库大厅"),
    React.createElement("p", { style: { color: "#999", fontSize: 14, margin: "0 0 24px" } }, "选择科目与年份，开始挑战"),
    React.createElement(Tabs, { tabs: tabs, active: activeTab, onChange: function(key) { setActiveTab(key); setModal(null); }, style: { marginBottom: 24 } }),
    filteredCards.length > 0
      ? React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 } }, filteredCards)
      : React.createElement("div", { style: { textAlign: "center", padding: "60px 20px" } }, 
          React.createElement("div", { style: { fontSize: 56, marginBottom: 16 } }, "📭"),
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6 } }, "暂无数据"),
          React.createElement("p", { style: { color: "#999", fontSize: 14 } }, "该分类的真题正在录入中，敬请期待！")
        ),
    modalEl
  );
}

/* ============ TERMS PAGE ============ */
/* ============ TERMS PAGE (中英双轨真数据版) ============ */
/* ============ TERMS PAGE (CATTI 原生极简风 + 中英 Tab 双轨) ============ */
/* ============ TERMS PAGE (真·等宽双栏表格满血版) ============ */
/* ============ TERMS PAGE (新增术语 & AI文件解析终极版) ============ */
/* ============ TERMS PAGE (背单词模式终极满血版) ============ */
/* ============ TERMS PAGE (专业级自适应背单词满血版) ============ */
/* ============ TERMS PAGE (带音标+原声语音+3星复习 终极满血版) ============ */
function TermsPage() {
  var sc = useState(null), selCat = sc[0], setSelCat = sc[1];
  var tabState = useState("zh2en"), activeTermTab = tabState[0], setActiveTermTab = tabState[1];
  var rk = useState(0), refreshKey = rk[0], setRefreshKey = rk[1];
  var tms = useState(false), termMod = tms[0], setTM = tms[1];
  var tt = useState(""), tText = tt[0], setTT = tt[1];
  var td = useState(""), tDef = td[0], setTD = td[1];
  var tp = useState(""), tPho = tp[0], setTP = tp[1]; // 💡 新增：手动录入音标
  var catState = useState("政工类"), tCat = catState[0], setTC = catState[1];
  var catsListState = useState(["政工类", "经济类", "科技类", "通用口语"]), catsList = catsListState[0], setCatsList = catsListState[1];
  var isNewCatState = useState(false), isNewCat = isNewCatState[0], setIsNewCat = isNewCatState[1];
  var newCatNameState = useState(""), newCatName = newCatNameState[0], setNewCatName = newCatNameState[1];
  var sv2 = useState(false), saved = sv2[0], setSaved = sv2[1];
  var upState = useState(false), fileUploading = upState[0], setFileUploading = upState[1];

  // 🎓 背单词状态机
  var lp = useState(null), learnPhase = lp[0], setLearnPhase = lp[1]; 
  var lc = useState("all"), learnCat = lc[0], setLearnCat = lc[1];
  var ln = useState(20), learnCount = ln[0], setLearnCount = ln[1];
  var lm = useState("mixed"), learnMode = lm[0], setLearnMode = lm[1]; 
  var lq = useState([]), learnQueue = lq[0], setLearnQueue = lq[1];
  var li = useState(0), learnIdx = li[0], setLearnIdx = li[1];
  var linp = useState(""), learnInput = linp[0], setLearnInput = linp[1];
  var lsa = useState(false), learnShowAns = lsa[0], setLearnShowAns = lsa[1];
  var lst = useState({known:0, correct:0, wrong:0}), learnStats = lst[0], setLearnStats = lst[1];
  var lf = useState(null), learnFeedback = lf[0], setLearnFeedback = lf[1];

  // 🔊 浏览器原生语音引擎
  var speakText = function(text, accent) {
    if (!window.speechSynthesis) return alert("您的浏览器不支持语音播报功能！");
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  var renderAudioBtns = function(text) {
    return React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginTop: 16 } },
      React.createElement("button", { onClick: function(e){ e.stopPropagation(); speakText(text, 'us'); }, style: { background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" } }, "🇺🇸 美音"),
      React.createElement("button", { onClick: function(e){ e.stopPropagation(); speakText(text, 'uk'); }, style: { background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" } }, "🇬🇧 英音")
    );
  };

  var savedTerms = [];
  try { savedTerms = JSON.parse(localStorage.getItem('catti_my_terms') || '[]'); } catch(e) { savedTerms = []; }

  var baseCategories = {
    "政工类": { key: "政工类", icon: "🏛", label: "政治政工", color: "#ef4444", gradient: "linear-gradient(135deg, #fef2f2, #fee2e2)" },
    "经济类": { key: "经济类", icon: "📈", label: "经济贸易", color: "#8b5cf6", gradient: "linear-gradient(135deg, #f5f3ff, #ede9fe)" },
    "科技类": { key: "科技类", icon: "💻", label: "科技前沿", color: "#6366f1", gradient: "linear-gradient(135deg, #eef2ff, #e0e7ff)" },
    "通用口语": { key: "通用口语", icon: "💬", label: "通用口语", color: "#3b82f6", gradient: "linear-gradient(135deg, #eff6ff, #dbeafe)" }
  };
  var dynamicCatCounts = {}; var dynamicCategoriesMap = Object.assign({}, baseCategories);
  savedTerms.forEach(function(termItem) {
    var catName = termItem.category || "未分类"; dynamicCatCounts[catName] = (dynamicCatCounts[catName] || 0) + 1;
    if (!dynamicCategoriesMap[catName]) {
      dynamicCategoriesMap[catName] = { key: catName, icon: "🏷️", label: catName, color: "#f59e0b", gradient: "linear-gradient(135deg, #fffbeb, #fef3c7)" };
      if (!catsList.includes(catName)) { catsList.push(catName); }
    }
  });
  var DYNAMIC_CATEGORIES_DATA = Object.values(dynamicCategoriesMap);
  var totalTerms = savedTerms.length;

  var handleFileUpload = function(e) {
    var file = e.target.files[0]; if (!file) return;
    setFileUploading(true); var formData = new FormData(); formData.append("file", file);
    fetch('http://localhost:3000/api/upload-terms', { method: 'POST', body: formData })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      var currentTerms = JSON.parse(localStorage.getItem('catti_my_terms') || '[]');
      var newTerms = data.terms.map(function(t, idx) { t.time = Date.now() + idx; return t; });
      localStorage.setItem('catti_my_terms', JSON.stringify(currentTerms.concat(newTerms)));
      setFileUploading(false); setRefreshKey(Date.now());
      alert("✅ AI 智能解析完成！\n成功提取并自动归类了 " + newTerms.length + " 个术语。"); e.target.value = "";
    }).catch(function(err) {
      setFileUploading(false); e.target.value = ""; alert("🚨 解析文件失败！请检查后端或网络。");
    });
  };

  // 🎓 重复 3 次算法逻辑
  var startLearnSession = function() {
    var pool = savedTerms;
    if (learnCat !== "all") { pool = pool.filter(function(t) { return t.category === learnCat; }); }
    if (pool.length === 0) { alert("📭 该分类下没有词条，换个分类试试吧！"); return; }
    var shuffled = pool.slice().sort(function() { return 0.5 - Math.random(); });
    var limit = Math.min(parseInt(learnCount) || 10, shuffled.length);
    var q = shuffled.slice(0, limit).map(function(t) { return { data: t, progress: 0 }; });
    setLearnQueue(q); setLearnIdx(0); setLearnStats({known: 0, correct: 0, wrong: 0});
    setLearnInput(""); setLearnShowAns(false); setLearnPhase("learning");
  };

  var processNextCard = function(newQueue) {
    var nextIdx = -1;
    for(var i=1; i<=newQueue.length; i++) {
      var idx = (learnIdx + i) % newQueue.length;
      if (newQueue[idx].progress < 3) { nextIdx = idx; break; }
    }
    if (nextIdx === -1) { setLearnPhase("result"); } 
    else { setLearnIdx(nextIdx); setLearnInput(""); setLearnShowAns(false); setLearnFeedback(null); }
  };

  var handleCorrect = function() {
    var q = learnQueue.slice(); q[learnIdx].progress += 1;
    setLearnQueue(q); setLearnFeedback("correct");
    if (q[learnIdx].progress >= 3) { setLearnStats(function(s) { return Object.assign({}, s, {correct: s.correct + 1}); }); }
    setTimeout(function(){ processNextCard(q); }, 600);
  };

  var handleWrong = function() {
    var q = learnQueue.slice(); q[learnIdx].progress = 0;
    setLearnQueue(q); setLearnStats(function(s) { return Object.assign({}, s, {wrong: s.wrong + 1}); });
    processNextCard(q);
  };

  var handleKill = function() {
    var q = learnQueue.slice(); q[learnIdx].progress = 3;
    setLearnQueue(q); setLearnStats(function(s) { return Object.assign({}, s, {known: s.known + 1}); });
    processNextCard(q);
  };

  var checkAnswer = function() {
    if (!learnInput.trim()) return;
    var cw = learnQueue[learnIdx].data; var aText = "";
    if (learnMode === "zh2en") { aText = cw.type === 'zh2en' ? cw.definition : cw.term; } 
    else if (learnMode === "en2zh") { aText = cw.type === 'zh2en' ? cw.term : cw.definition; } 
    else { aText = cw.definition; }

    if (learnInput.trim().toLowerCase() === aText.trim().toLowerCase()) { handleCorrect(); } 
    else { setLearnShowAns(true); }
  };

  // --- 🎨 背单词【结果页】 ---
  if (learnPhase === "result") {
    return React.createElement("div", { style: { padding: "40px 24px", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" } },
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 200, damping: 20 } },
        React.createElement(Card, { style: { width: 420, padding: 40, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" } },
          React.createElement("div", { style: { fontSize: 64, marginBottom: 16 } }, "🏆"),
          React.createElement("h2", { style: { fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 8 } }, "今日背单词通关！"),
          React.createElement("p", { style: { color: "#666", marginBottom: 32 } }, "所有的伟大，都源于每一次的坚持"),
          React.createElement(Btn, { onClick: function() { setLearnPhase(null); }, style: { width: "100%", padding: 14, borderRadius: 16, background: "#111", fontSize: 16 } }, "返回术语大厅")
        )
      )
    );
  }

  // --- 🎨 背单词【答题页】 ---
  if (learnPhase === "learning") {
    var cwItem = learnQueue[learnIdx];
    var currentWord = cwItem ? cwItem.data : null;
    var currentProgress = cwItem ? cwItem.progress : 0;
    var masterCount = learnQueue.filter(function(item) { return item.progress >= 3; }).length;
    var stars = ""; for(var i=0; i<3; i++) { stars += (i < currentProgress ? "★" : "☆"); }

    var qText = "", aText = "", qLabel = "", aLabel = "", enWordText = "", currentPhonetic = "";
    if (currentWord) {
      var isSrcZh = currentWord.type === 'zh2en';
      enWordText = isSrcZh ? currentWord.definition : currentWord.term;
      currentPhonetic = currentWord.phonetic || ""; // 💡 提取音标

      if (learnMode === "zh2en") {
        qText = isSrcZh ? currentWord.term : currentWord.definition;
        aText = isSrcZh ? currentWord.definition : currentWord.term;
        qLabel = "🇨🇳 看中文"; aLabel = "🇺🇸 写英文";
      } else if (learnMode === "en2zh") {
        qText = isSrcZh ? currentWord.definition : currentWord.term;
        aText = isSrcZh ? currentWord.term : currentWord.definition;
        qLabel = "🇺🇸 看英文"; aLabel = "🇨🇳 写中文";
      } else {
        qText = currentWord.term; aText = currentWord.definition;
        qLabel = isSrcZh ? "🇨🇳 看中文" : "🇺🇸 看英文"; aLabel = isSrcZh ? "🇺🇸 写英文" : "🇨🇳 写中文";
      }
    }

    return React.createElement("div", { style: { padding: "40px 24px", maxWidth: 650, margin: "0 auto" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 } },
        React.createElement("button", { onClick: function() { setLearnPhase("setup"); }, style: { background: "none", border: "none", color: "#999", fontSize: 15, cursor: "pointer", fontWeight: 600 } }, "✕ 提前结束"),
        React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } },
          React.createElement("span", { style: { color: "#f59e0b", fontSize: 18, letterSpacing: 2 } }, stars),
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "6px 14px", borderRadius: 20 } }, "已掌握: " + masterCount + " / " + learnQueue.length)
        )
      ),

      React.createElement(Motion, { key: learnIdx + "-" + currentProgress, initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { type: "spring", stiffness: 300, damping: 25 } },
        React.createElement(Card, { style: { padding: "50px 40px", textAlign: "center", boxShadow: learnFeedback === "correct" ? "0 0 0 4px #10b981" : "0 10px 30px rgba(0,0,0,0.05)", transition: "box-shadow 0.3s" } },
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 } }, qLabel),
          
          // 💡 题干区显示音标
          React.createElement("h2", { style: { fontSize: 32, fontWeight: 800, color: "#111", margin: 0, lineHeight: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" } }, 
            qText, 
            (qText === enWordText && currentPhonetic) ? React.createElement("span", { style: { fontSize: 20, color: "#8b5cf6", fontWeight: 500, fontFamily: "sans-serif" } }, "[" + currentPhonetic + "]") : null
          ),
          
          (qLabel.indexOf("🇺🇸") !== -1 || qText === enWordText) ? renderAudioBtns(enWordText) : React.createElement("div", { style: { height: 20 } }),
          React.createElement("div", { style: { marginBottom: 28 } }),

          !learnShowAns ? React.createElement("div", null,
            React.createElement("input", { 
              value: learnInput, onChange: function(e) { setLearnInput(e.target.value); }, onKeyDown: function(e) { if(e.key === 'Enter') checkAnswer(); },
              placeholder: "✍️ 请输入对应的" + aLabel + "...", autoFocus: true,
              style: { width: "100%", padding: "18px 20px", borderRadius: 16, border: "2px solid #e2e8f0", fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 20, background: "#f8fafc", transition: "border 0.2s" }
            }),
            React.createElement("div", { style: { display: "flex", gap: 12 } },
              React.createElement(Btn, { variant: "ghost", onClick: handleKill, style: { flex: 1, padding: 14, borderRadius: 16, background: "#f1f5f9", color: "#64748b" } }, "⚡️ 彻底记住了，直接秒杀"),
              React.createElement(Btn, { onClick: checkAnswer, disabled: !learnInput.trim(), style: { flex: 1, padding: 14, borderRadius: 16, background: "#7c3aed", color: "#fff" } }, "✅ 提交答案")
            )
          ) 
          
          : React.createElement(Motion, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
            React.createElement("div", { style: { textAlign: "left", background: "#f8fafc", padding: 24, borderRadius: 16, marginBottom: 24, border: "1px solid #e2e8f0" } },
              React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 4, fontWeight: 700 } }, "你的回答"),
              React.createElement("div", { style: { fontSize: 16, color: "#ef4444", textDecoration: "line-through", marginBottom: 16 } }, learnInput || "(空白)"),
              React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 4, fontWeight: 700 } }, "标准答案"),
              
              // 💡 答案区显示音标
              React.createElement("div", { style: { fontSize: 20, color: "#10b981", fontWeight: 800, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, 
                aText,
                (aText === enWordText && currentPhonetic) ? React.createElement("span", { style: { fontSize: 16, color: "#8b5cf6", fontWeight: 500, fontFamily: "sans-serif" } }, "[" + currentPhonetic + "]") : null
              ),

              (aLabel.indexOf("🇺🇸") !== -1 || aText === enWordText) ? renderAudioBtns(enWordText) : null
            ),
            React.createElement("div", { style: { display: "flex", gap: 12 } },
              React.createElement(Btn, { onClick: handleWrong, style: { flex: 1, padding: 14, borderRadius: 16, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" } }, "❌ 确实记错了 (进度清零)"),
              React.createElement(Btn, { onClick: handleCorrect, style: { flex: 1, padding: 14, borderRadius: 16, background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0" } }, "✅ 意思对了，算我对！")
            )
          )
        )
      )
    );
  }

  // --- 🎨 背单词【配置页】 ---
  if (learnPhase === "setup") {
    return React.createElement("div", { style: { padding: "40px 24px", maxWidth: 500, margin: "0 auto" } },
      React.createElement(Motion, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
        React.createElement(Card, { style: { padding: "32px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" } },
          React.createElement("div", { style: { textAlign: "center", marginBottom: 32 } },
            React.createElement("div", { style: { fontSize: 48, marginBottom: 12 } }, "🎯"),
            React.createElement("h2", { style: { fontSize: 22, fontWeight: 800, color: "#111", margin: 0 } }, "制定背单词计划")
          ),
          React.createElement("div", { style: { marginBottom: 24 } },
            React.createElement("label", { style: { display: "block", fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 } }, "📂 选择复习词书"),
            React.createElement("select", { value: learnCat, onChange: function(e) { setLearnCat(e.target.value); }, style: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #ddd", fontSize: 15, background: "#f8fafc", outline: "none", cursor: "pointer" } },
              React.createElement("option", { value: "all" }, "📚 整个术语库 (全部分类)"),
              DYNAMIC_CATEGORIES_DATA.map(function(c) { return React.createElement("option", { key: c.key, value: c.key }, c.icon + " " + c.label); })
            )
          ),
          React.createElement("div", { style: { marginBottom: 24 } },
            React.createElement("label", { style: { display: "block", fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 } }, "🎯 今日挑战数量 (每词需拼对3次)"),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
              React.createElement("input", { type: "number", min: 1, value: learnCount, onChange: function(e) { setLearnCount(e.target.value); }, style: { flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #ddd", fontSize: 15, background: "#f8fafc", outline: "none" } }),
              React.createElement("span", { style: { color: "#666", fontSize: 14, fontWeight: 600 } }, "个术语")
            )
          ),
          React.createElement("div", { style: { marginBottom: 32 } },
            React.createElement("label", { style: { display: "block", fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 } }, "🔄 抽查模式"),
            React.createElement("select", { value: learnMode, onChange: function(e) { setLearnMode(e.target.value); }, style: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #ddd", fontSize: 15, background: "#f8fafc", outline: "none", cursor: "pointer" } },
              React.createElement("option", { value: "mixed" }, "🎲 顺其自然 (按原提取方向)"),
              React.createElement("option", { value: "en2zh" }, "🇺🇸 ➔ 🇨🇳 看英译中"),
              React.createElement("option", { value: "zh2en" }, "🇨🇳 ➔ 🇺🇸 看中译英")
            )
          ),
          React.createElement("div", { style: { display: "flex", gap: 12 } },
            React.createElement(Btn, { variant: "secondary", onClick: function() { setLearnPhase(null); }, style: { flex: 1, padding: 14, borderRadius: 14 } }, "取消"),
            React.createElement(Btn, { onClick: startLearnSession, style: { flex: 2, padding: 14, borderRadius: 14, background: "#7c3aed", color: "#fff", fontSize: 16 } }, "🚀 立即开始挑战")
          )
        )
      )
    );
  }

  // --- 详情页 (Level 2) ---
  if (selCat) {
    var catData = DYNAMIC_CATEGORIES_DATA.filter(function(c) { return c.key === selCat; })[0];
    var catTerms = savedTerms.filter(function(t) { return t.category === selCat; });
    var catLabel = catData ? catData.label : selCat; var catColor = catData ? catData.color : "#888"; var catIcon = catData ? catData.icon : "📂";

    var en2zhTerms = catTerms.filter(function(t) { return t.type !== 'zh2en'; });
    var zh2enTerms = catTerms.filter(function(t) { return t.type === 'zh2en'; });
    var currentList = activeTermTab === "zh2en" ? zh2enTerms : en2zhTerms;
    var col1Header = activeTermTab === "zh2en" ? "中文" : "ENGLISH";
    var col2Header = activeTermTab === "zh2en" ? "ENGLISH" : "中文";

    var termRows = currentList.map(function(t, i) {
      // 💡 在列表页的英文旁边也展示音标
      var showPho1 = (activeTermTab !== "zh2en" && t.phonetic) ? React.createElement("span", { style: { color: "#a78bfa", marginLeft: 8, fontSize: 13, fontWeight: "normal" } }, "[" + t.phonetic + "]") : null;
      var showPho2 = (activeTermTab === "zh2en" && t.phonetic) ? React.createElement("span", { style: { color: "#a78bfa", marginLeft: 8, fontSize: 13, fontWeight: "normal" } }, "[" + t.phonetic + "]") : null;

      return React.createElement(Motion, { key: t.time || i, initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
        React.createElement("div", { style: { display: "flex", width: "100%", background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f0f0f0" } },
          React.createElement("div", { style: { flex: 1, padding: "16px 20px", borderRight: "1px solid #f0f0f0", fontSize: 15, fontWeight: 600, color: "#111" } }, t.term, showPho1),
          React.createElement("div", { style: { flex: 1, padding: "16px 20px", fontSize: 15, color: "#333" } }, t.definition, showPho2)
        )
      );
    });

    return React.createElement("div", { style: { padding: "32px 24px" } },
      React.createElement(Motion, { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
        React.createElement("div", null,
          React.createElement(Motion, { animate: { scale: 1 }, whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 400, damping: 17 } },
            React.createElement("button", { onClick: function() { setSelCat(null); }, style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "1px solid #e5e5e5", background: "#fff", color: "#7c3aed", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" } }, "← 返回全部分类")
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 24 } },
            React.createElement("div", { style: { width: 48, height: 48, borderRadius: 14, background: catColor + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 } }, catIcon),
            React.createElement("div", null,
              React.createElement("h1", { style: { fontSize: 22, fontWeight: 800, color: "#111", margin: 0 } }, catLabel + " 专属词库"),
              React.createElement("p", { style: { color: "#999", fontSize: 13, margin: "2px 0 0" } }, "本分类共收录 " + catTerms.length + " 个术语")
            )
          ),
          React.createElement("div", { style: { display: "flex", gap: 24, borderBottom: "1px solid #eee", marginBottom: 16 } },
            React.createElement("div", { onClick: function() { setActiveTermTab("zh2en"); }, style: { padding: "0 4px 12px", cursor: "pointer", fontSize: 15, transition: "all 0.2s", fontWeight: activeTermTab === "zh2en" ? 800 : 600, color: activeTermTab === "zh2en" ? "#7c3aed" : "#999", borderBottom: activeTermTab === "zh2en" ? "3px solid #7c3aed" : "3px solid transparent" } }, "中 ➔ 英 (" + zh2enTerms.length + ")"),
            React.createElement("div", { onClick: function() { setActiveTermTab("en2zh"); }, style: { padding: "0 4px 12px", cursor: "pointer", fontSize: 15, transition: "all 0.2s", fontWeight: activeTermTab === "en2zh" ? 800 : 600, color: activeTermTab === "en2zh" ? "#7c3aed" : "#999", borderBottom: activeTermTab === "en2zh" ? "3px solid #7c3aed" : "3px solid transparent" } }, "英 ➔ 中 (" + en2zhTerms.length + ")")
          ),
          React.createElement(Card, { style: { marginTop: 0, overflow: "hidden", border: "1px solid #e5e5e5", borderRadius: 12, boxShadow: "none" } },
            React.createElement("div", { style: { display: "flex", width: "100%", background: "#f8fafc", borderBottom: "1px solid #e5e5e5" } },
              React.createElement("div", { style: { flex: 1, padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#64748b", borderRight: "1px solid #e5e5e5", textTransform: "uppercase", letterSpacing: 0.5 } }, col1Header),
              React.createElement("div", { style: { flex: 1, padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 } }, col2Header)
            ),
            currentList.length === 0 ? React.createElement("div", { style: { padding: "60px 20px", textAlign: "center", color: "#cbd5e1", fontSize: 14, fontWeight: 600 } }, "暂无该方向的词条 📭") : termRows
          )
        )
      )
    );
  }

  // --- 大厅页 (Level 1) ---
  var catCards = DYNAMIC_CATEGORIES_DATA.map(function(cat) {
    var count = dynamicCatCounts[cat.key] || 0;
    return React.createElement(Motion, { key: cat.key, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
      React.createElement(Motion, { animate: { scale: 1 }, whileHover: { scale: 1.04 }, whileTap: { scale: 0.97 }, transition: { type: "spring", stiffness: 400, damping: 18 } },
        React.createElement("div", { onClick: function() { setSelCat(cat.key); setActiveTermTab("zh2en"); }, style: { padding: 28, borderRadius: 20, background: cat.gradient, border: "1px solid " + cat.color + "20", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 4px 16px " + cat.color + "10", transition: "box-shadow 0.3s" } },
          React.createElement("div", { style: { position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: cat.color + "08" } }),
          React.createElement("div", { style: { position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: "50%", background: cat.color + "06" } }),
          React.createElement("div", { style: { width: 56, height: 56, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16, boxShadow: "0 2px 8px " + cat.color + "15", position: "relative", zIndex: 1 } }, cat.icon),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 6, position: "relative", zIndex: 1 } }, cat.label),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1 } },
            React.createElement("span", { style: { padding: "3px 10px", borderRadius: 20, background: cat.color + "18", color: cat.color, fontSize: 12, fontWeight: 700 } }, count + " 个词条"),
            React.createElement("span", { style: { fontSize: 12, color: "#bbb" } }, "点击查看 →")
          )
        )
      )
    );
  });

  return React.createElement("div", { style: { padding: "32px 24px" } },
    React.createElement(Motion, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
      React.createElement("div", null,
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 } },
          React.createElement("div", null,
            React.createElement("h1", { style: { fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 4px" } }, "我的术语库"),
            React.createElement("p", { style: { color: "#999", fontSize: 14, margin: 0 } }, "共 " + totalTerms + " 个术语，分布在 " + DYNAMIC_CATEGORIES_DATA.length + " 个分类中")
          ),
          React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
            React.createElement("input", { type: "file", id: "term-file-upload", accept: ".doc,.docx,.xls,.xlsx,.csv,.pdf,.txt", style: { display: "none" }, onChange: handleFileUpload }),
            React.createElement(Motion, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } },
              React.createElement(Btn, { onClick: function() { setLearnPhase("setup"); }, style: { borderRadius: 12, padding: "10px 18px", fontSize: 14, background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", display: "flex", alignItems: "center", gap: 8, border: "none", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" } }, "🎓 开启背单词模式")
            ),
            React.createElement(Btn, { variant: "secondary", onClick: function() { document.getElementById('term-file-upload').click(); }, style: { borderRadius: 12, padding: "10px 14px", fontSize: 14, background: "#fff", border: "1px solid #e5e5e5", color: "#333" } }, "📤 导入"),
            React.createElement(Btn, { onClick: function() { setTM(true); setTT(""); setTD(""); setTP(""); setSaved(false); }, style: { borderRadius: 12, padding: "10px 14px", fontSize: 14, background: "#111", color: "#fff" } }, "➕ 新增")
          )
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 } }, catCards)
      )
    ),
    fileUploading ? React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 } }, React.createElement(Card, { style: { padding: 40, textAlign: "center", width: 320 } }, React.createElement("style", null, "@keyframes spin{to{transform:rotate(360deg)}}"), React.createElement("div", { style: { width: 40, height: 40, border: "4px solid #f3f0ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" } }), React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, margin: "0 0 8px" } }, "AI 正在解析文档..."), React.createElement("p", { style: { color: "#666", fontSize: 14, margin: 0 } }, "自动提取音标并归类，请稍候"))) : null,
    
    // 💡 改进的新增弹窗（支持录入音标）
    termMod ? React.createElement("div", { onClick: function() { setTM(false); }, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 } }, 
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 25 } }, 
        React.createElement(Card, { onClick: function(e) { e.stopPropagation(); }, style: { maxWidth: 400, width: "100%", padding: "28px 24px" } }, 
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 20, textAlign: "center" } }, "🏷️ 新增至术语库"), 
          saved ? React.createElement("div", { style: { textAlign: "center", padding: "20px 0" } }, 
            React.createElement("div", { style: { fontSize: 50, marginBottom: 12 } }, "✅"), 
            React.createElement("p", { style: { fontWeight: 700, color: "#10b981", fontSize: 16 } }, "已成功存入分类！")) 
          : React.createElement("div", null, (function() { 
              var isZh = /[\u4e00-\u9fa5]/.test(tText); var originalLabel = isZh ? "中文术语" : "英文术语 (ENGLISH)"; var defLabel = isZh ? "英文释义 (ENGLISH)" : "中文释义"; 
              return React.createElement(React.Fragment, null, 
                React.createElement("div", { style: { marginBottom: 14 } }, 
                  React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, originalLabel), 
                  React.createElement("input", { value: tText, onChange: function(e) { setTT(e.target.value); }, style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", fontSize: 14 } })), 
                React.createElement("div", { style: { marginBottom: 14 } }, 
                  React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, defLabel), 
                  React.createElement("input", { value: tDef, onChange: function(e) { setTD(e.target.value); }, placeholder: "请输入释义...", style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", fontSize: 14 } })), 
                
                // 💡 手动填音标（可选）
                React.createElement("div", { style: { marginBottom: 14 } }, 
                  React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, "音标 (选填)"), 
                  React.createElement("input", { value: tPho, onChange: function(e) { setTP(e.target.value); }, placeholder: "如: ˈæpl", style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", fontSize: 14 } })), 

                React.createElement("div", { style: { marginBottom: 20 } }, 
                  React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, "分类标签"), 
                  isNewCat ? React.createElement("div", { style: { display: "flex", gap: 8 } }, 
                    React.createElement("input", { value: newCatName, onChange: function(e) { setNewCatName(e.target.value); }, placeholder: "输入新类别...", autoFocus: true, style: { flex: 1, padding: "10px 14px", borderRadius: 10, border: "2px solid #7c3aed", outline: "none", boxSizing: "border-box", fontSize: 14 } }), 
                    React.createElement(Btn, { variant: "secondary", onClick: function() { setIsNewCat(false); setNewCatName(""); }, style: { padding: "0 14px", borderRadius: 10 } }, "取消")) 
                  : React.createElement("select", { value: tCat, onChange: function(e) { if (e.target.value === "___NEW___") { setIsNewCat(true); } else { setTC(e.target.value); } }, style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", background: "#f8fafc", fontSize: 14, cursor: "pointer" } }, 
                    catsList.map(function(c) { return React.createElement("option", { key: c, value: c }, c); }), 
                    React.createElement("option", { value: "___NEW___", style: { color: "#7c3aed", fontWeight: "bold" } }, "➕ 自定义新类别..."))), 
                React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 24 } }, 
                  React.createElement(Btn, { variant: "secondary", onClick: function() { setTM(false); }, style: { flex: 1, borderRadius: 12 } }, "取消"), 
                  React.createElement(Btn, { onClick: function() { 
                    var finalCat = tCat; 
                    if (isNewCat && newCatName.trim() !== "") { finalCat = newCatName.trim(); if (!catsList.includes(finalCat)) { setCatsList(catsList.concat(finalCat)); } setTC(finalCat); } 
                    var newTermItem = { term: tText, definition: tDef, phonetic: tPho, category: finalCat, type: isZh ? 'zh2en' : 'en2zh', time: Date.now() }; 
                    var sTerms = JSON.parse(localStorage.getItem('catti_my_terms') || '[]'); sTerms.push(newTermItem); localStorage.setItem('catti_my_terms', JSON.stringify(sTerms)); 
                    setRefreshKey(Date.now()); setSaved(true); 
                  }, style: { flex: 1, borderRadius: 12, background: "#7c3aed", color: "#fff" } }, "💾 存入术语库"))); 
            })())))) : null
  );
}
/* ============ INTERPRETING EXAM (重构：手动控制台) ============ */
/* ============ INTERPRETING EXAM (严格复刻 UI 版) ============ */
/* ============ INTERPRETING EXAM (已激活进度条拖拽) ============ */
/* ============ INTERPRETING EXAM (18段丝滑翻页版) ============ */
/* ============ INTERPRETING EXAM (完美 UI + 全功能版) ============ */
/* ============ INTERPRETING EXAM (完美 UI + 修复负数Bug + 修复音频Bug) ============ */
/* ============ INTERPRETING EXAM (打通交卷闭环的终极版) ============ */
/* ============ INTERPRETING EXAM (全卷多段录音保存版) ============ */
function InterpExam(p) {
  // ==========================================
  // 🌟 核心：自定义自由输入的倒计时引擎
  // ==========================================
  var st = useState(false), isStarted = st[0], setIsStarted = st[1];
  var customMinState = useState(30), customMin = customMinState[0], setCustomMin = customMinState[1]; // 默认填 30 分钟
  var ts = useState(1800), timeLeft = ts[0], setTimeLeft = ts[1];

  React.useEffect(function() {
    if (!isStarted) return; // 没点开始，绝不走字
    var timer = setInterval(function() {
      setTimeLeft(function(prev) {
        if (prev <= 1) {
          clearInterval(timer);
          alert("⏳ 考试时间到！系统正在为您强制交卷...");
          if (typeof handleSubmitExam !== "undefined") handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return function() { clearInterval(timer); };
  }, [isStarted]);

  // 格式化时间为 MM : SS
  var m = Math.floor(timeLeft / 60);
  var s = timeLeft % 60;
  var timeDisplay = (m < 10 ? "0" + m : m) + " : " + (s < 10 ? "0" + s : s);
  var segs = (p.examData && p.examData.paragraphs) || (p.examData && p.examData.segments) || [];
  var [idx, setIdx] = useState(p.currentIdx || 0);
  var cur = (segs && segs[idx]) ? segs[idx] : {};
  
  var [phase, setPhase] = useState("idle"); 
  var [prog, setProg] = useState(0);
  var [recElapsed, setRecElapsed] = useState(0);
  var maxRec = 120;

  var recTimerRef = useRef(null);
  var mediaRecRef = useRef(null); 
  var chunksRef = useRef([]); 
  var speechRecRef = useRef(null); 
  var finalTxtRef = useRef(""); 

  // --- 【核心修改 1：用对象字典存下每一段的答案】 ---
  var [answers, setAnswers] = useState({});

  function updateAns(key, val) {
    setAnswers(function(prev) {
      var next = Object.assign({}, prev);
      if (!next[idx]) next[idx] = {};
      next[idx][key] = val;
      return next;
    });
  }

  // 获取当前段落的答案，如果没有就为空
  var currentAudio = answers[idx] ? answers[idx].audio : null;
  var currentText = answers[idx] ? answers[idx].text : "";

  var start = cur.start_time !== undefined ? cur.start_time : (cur.audioStartTime || 0);
  var end = cur.end_time !== undefined ? cur.end_time : (cur.audioEndTime || 10);
  var audioDur = Math.max(0, Math.round(end - start));
  var aUrl = p.examData.audio_url || p.examData.audioUrl || cur.audio_url || (segs[0] && segs[0].audio_url) || "/audios/2014_spring_full.mp3";

  // 清理状态时，绝对不清理 answers，保留用户的作答记录！
  function cleanup() {
    if (window.cattiPlayer) window.cattiPlayer.pause();
    if (window.cattiTimer) clearInterval(window.cattiTimer);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      mediaRecRef.current.stop();
      mediaRecRef.current.stream.getTracks().forEach(function(t){ t.stop(); });
    }
    if (speechRecRef.current) speechRecRef.current.stop();
    setPhase("idle");
    setProg(0);
    setRecElapsed(0);
  }

  function handleNextSeg() { if (idx < segs.length - 1) { cleanup(); setIdx(idx + 1); } }
  function handlePrevSeg() { if (idx > 0) { cleanup(); setIdx(idx - 1); } }

  function handlePlay() {
    if (phase === "playing") {
      if (window.cattiPlayer) window.cattiPlayer.pause();
      if (window.cattiTimer) clearInterval(window.cattiTimer);
      setPhase("paused");
      return;
    }
    if (phase === "paused") {
      if (window.cattiPlayer) window.cattiPlayer.play();
      setPhase("playing");
    } else {
      if (window.cattiPlayer) window.cattiPlayer.pause();
      window.cattiPlayer = new Audio(aUrl);
      window.cattiPlayer.currentTime = start;
      window.cattiPlayer.play();
      setPhase("playing");
    }
    if (window.cattiTimer) clearInterval(window.cattiTimer);
    window.cattiTimer = setInterval(function() {
      if (!window.cattiPlayer) return;
      var c = window.cattiPlayer.currentTime;
      var cp = Math.min(((c - start) / (end - start)) * 100, 100);
      setProg(cp);
      if (c >= end) { window.cattiPlayer.pause(); clearInterval(window.cattiTimer); setPhase("idle"); }
    }, 100);
  }

  function startRecTimer() {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    recTimerRef.current = setInterval(function() {
      setRecElapsed(function(prev) {
        if (prev >= maxRec) { handleStopRec(); return maxRec; }
        return prev + 1;
      });
    }, 1000);
  }

  function handleStartRec() {
    if (window.cattiPlayer) window.cattiPlayer.pause();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      var mr = new MediaRecorder(stream);
      mediaRecRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = function(e) { if (e.data.size > 0) chunksRef.current.push(e.data); };
      
      // 🚀 核心改造：当录音结束时，直接打包发给咱们的 Node.js 后端
      mr.onstop = function() {
        var blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        updateAns("audio", URL.createObjectURL(blob)); // 保存本段录音用于网页回放

        // 1. 把录音文件转换成 Base64 格式（机器能读懂的字符串）
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
          var base64data = reader.result;

          // 2. 呼叫我们刚才在 server.cjs 里写好的新接口！
          fetch('http://localhost:3000/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64data, mimeType: blob.type })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            // 3. 拿到 Gemini 听写的真实文字！
            updateAns("text", data.text || "（未能识别到清晰语音，请确认麦克风正常或朗读声音够大）");
            setPhase("review"); // 停止转圈，进入修改页面
          })
          .catch(function(err) {
            console.error("🚨 听写请求失败:", err);
            updateAns("text", "（语音转文字失败，请检查你的 node server.cjs 是否还在运行）");
            setPhase("review");
          });
        };
      };
      mr.start();

      // 🗑️ 之前的 webkitSpeechRecognition 垃圾代码已经被彻底删除了！

      setPhase("recording");
      setRecElapsed(0);
      startRecTimer();
    }).catch(function(err) {
      alert("🚨 必须允许麦克风权限，才能录音和识别哦！");
    });
  }

  function handleStopRec() {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      setPhase("recognizing"); // 立即让界面开始转圈圈，提示 "AI 正在识别语音..."
      
      // 执行 stop 后，会自动触发上面的 mr.onstop，然后自动发给后端
      mediaRecRef.current.stop(); 
      mediaRecRef.current.stream.getTracks().forEach(function(t) { t.stop(); });
    }
    // 🗑️ 之前用 setTimeout 假装等待 1.5 秒的代码已经被删除了！现在是真正的网络请求。
  }

  function handleReRecord() { cleanup(); handleStartRec(); }

  function handleSeek(e) {
    if (!window.cattiPlayer || phase === "recording" || phase === "recognizing" || phase === "review") return;
    var rect = e.currentTarget.getBoundingClientRect();
    var percent = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    window.cattiPlayer.currentTime = start + (end - start) * percent;
    setProg(percent * 100);
  }

  function fmt(s) {
    var m = Math.floor(s / 60); var rs = s % 60;
    return (m < 10 ? "0"+m : m) + ":" + (rs < 10 ? "0"+rs : rs);
  }

  var cardContent = null;

  // 💡 【全能超级大招】：提前交卷函数，提出来让所有界面都能用！
  // 💡 【全能超级大招】：提前交卷函数
  var handleSubmitExam = function() { 
    // 🚨 核心修复：坚决不调用 cleanup()，防止它重置界面！只做必要的物理静音。
    if (window.cattiPlayer) window.cattiPlayer.pause();
    if (mediaRecRef && mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      mediaRecRef.current.stop();
    }
    
    if (p.onSubmit) {
      // 🌟 稳稳当当切入高逼格紫色转圈圈界面！
      setPhase("evaluating"); 

      // 🌟 修改这里的映射逻辑，把数据库里的音频数据“带走”
      var segmentsResult = segs.map(function(s, i) {
        var ans = answers[i] || {};
        var finalMyTrans = (i === idx) ? (typeof currentText !== "undefined" ? currentText : (ans.text || "（未作答）")) : (ans.text || "（未作答）");
        
        return {
          label: s.label || ("第 " + (i+1) + " 段"),
          originalText: s.source_text || "（暂无英文原文）",
          myTranslation: finalMyTrans,
          userAudio: ans.audio || null,
          referenceText: s.reference_text || "（暂无参考译文）",
          
          // ✅ 【核心新增】必须要加这三行，批改页面的按钮才会显示！
          audio_url: s.audio_url, 
          start_time: s.start_time,
          end_time: s.end_time
        };
      });

      var systemPrompt = `你现在是一位严格、专业且极具同理心的 CATTI 阅卷考官。
请根据考生提交的作答数据，进行极具深度的双语翻译批改。满分为 100 分。

🚨【最高优先级警告：防作弊与空白检测】🚨
如果考生的“我的译文”是空白、"（未作答）"、包含"未能识别"字样，或完全是没有意义的乱码：
1. 请直接将该段判定为 0 分！总分判定为 0 分！
2. 并在 deductions 中扣 100 分，原因是：“未作答或未识别到有效录音，无法给分”。
3. 绝对、绝对不允许给未作答的试卷打高分或 100 分！！！

【严格扣分标准】（极其重要，请绝对严格执行）：
1. 若为“英译汉”：句子意思理解错误扣5分；细节单词漏译/缺失、逻辑混乱、语法错误、文理不通、语向不连贯扣2分；用词不准、用词不妥、错别字扣1分。
2. 若为“汉译英”：句子意思理解错误扣5分；细节单词漏译/缺失、逻辑混乱、语法错误、文理不通、语句不连贯扣2分；用词不准、用词不妥、拼写错误扣1分。

【批改核心要求】：
1. 逐段批改：必须在每一个段落的评估中，单独列出该段的“扣分明细”和“亮点表扬”。
2. 赏罚分明：如有精妙之处，务必在 highlights 中大力表扬。
3. 扣分话术：在 reason 字段中，必须严格输出：“此处‘xxx’为何种错误，应扣X分。正确应改为‘xxx’”。

【必须严格返回的纯 JSON 格式模板】：
{
  "totalScore": 85,
  "paragraphEvaluations": [
    {
      "paragraphId": "段落标识",
      "deductions": [
        {
          "type": "错误类型",
          "original": "原句",
          "correction": "修改",
          "penalty": 2,
          "reason": "此处‘xxx’为...错误，应扣...分。正确应改为‘xxx’"
        }
      ],
      "highlights": [
        {
          "phrase": "优秀片段",
          "praise": "表扬说明"
        }
      ]
    }
  ],
  "overallSummary": {
    "contentLevel": "内容层面：结合长难句、数字、排比、译出率、框架5个维度进行详细点评...",
    "expressionLevel": "表达层面：结合语言完整性、语流状态推测、语法、推测能力进行详细点评...",
    "optimizationLevel": "优化层面：结合细节词、动词高级感、句式多样性（形式主语/被动等）进行详细点评..."
  }
}`;

      var userDataForAI = JSON.stringify(segmentsResult.map(function(s) {
        return { 段落: s.label, 原文: s.originalText, 参考答案: s.referenceText, 我的译文: s.myTranslation };
      }), null, 2);

      fetch('https://api.catti-pro.work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: systemPrompt, userData: userDataForAI })
      })
      .then(function(res) { return res.json(); })
      .then(function(aiReport) {
        var finalDeductions = [];
        if (aiReport.paragraphEvaluations && aiReport.paragraphEvaluations.length > 0) {
          aiReport.paragraphEvaluations.forEach(function(para) {
            if (para.deductions) { finalDeductions = finalDeductions.concat(para.deductions); }
          });
        } else if (aiReport.deductions) { finalDeductions = aiReport.deductions; }

        p.onSubmit({
          score: aiReport.totalScore || aiReport.score || 0, 
          total: 100, 
          segmentsResult: segmentsResult,
          paragraphEvaluations: aiReport.paragraphEvaluations || [],
          deductions: finalDeductions, 
          analysis: { 
            content: (aiReport.overallSummary && aiReport.overallSummary.contentLevel) || "点评生成失败", 
            expression: (aiReport.overallSummary && aiReport.overallSummary.expressionLevel) || "点评生成失败", 
            improvement: (aiReport.overallSummary && aiReport.overallSummary.optimizationLevel) || "点评生成失败" 
          }
        });
      })
      .catch(function(err) {
        console.error("批改请求失败:", err);
        setPhase("review"); 
        alert("🚨 呼叫考官失败！请检查您的网络梯子，或 node server.cjs 是否在运行。");
      });
    } else { p.onBack(); }
  };

  // 界面状态 0：🌟 全新增加的“正在批阅”高逼格动画界面（之前漏掉的就是这段！）
  if (phase === "evaluating") {
    cardContent = React.createElement("div", { style: { padding: "50px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" } },
      React.createElement("style", null, "@keyframes pulseGlow{0%{box-shadow:0 0 0 0 rgba(124,58,237,0.4)}70%{box-shadow:0 0 0 20px rgba(124,58,237,0)}100%{box-shadow:0 0 0 0 rgba(124,58,237,0)}}"),
      React.createElement("div", { style: { width: 70, height: 70, borderRadius: "50%", background: "#7c3aed", animation: "pulseGlow 2s infinite", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 } }, "👨‍🏫"),
      React.createElement("h3", { style: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 12 } }, "魔鬼考官正在疯狂批阅中..."),
      React.createElement("div", { style: { color: "#666", fontSize: 15, lineHeight: 1.8, maxWidth: 380 } },
        React.createElement("div", null, "正在进行多维度深度分析（长难句、逻辑、术语）"),
        React.createElement("div", { style: { marginTop: 8, fontWeight: "bold", color: "#7c3aed" } }, "预计需要 10 ~ 20 秒，请喝口水耐心等待 ☕️")
      )
    );
  }
  // 界面状态 1：正在识别转圈圈
  else if (phase === "recognizing") {
    cardContent = React.createElement("div", { style: { padding: "60px 0", textAlign: "center" } },
      React.createElement("style", null, "@keyframes spin{to{transform:rotate(360deg)}}"),
      React.createElement("div", { style: { width: 50, height: 50, border: "4px solid #f3f0ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" } }),
      React.createElement("h3", { style: { fontSize: 20, fontWeight: 800, color: "#111" } }, "AI 正在识别语音..."),
      React.createElement("p", { style: { color: "#999", fontSize: 14, marginTop: 8 } }, "正在生成文字稿，请稍候")
    );
  } 
  // 界面状态 2：录音完成，正在改错别字
  else if (phase === "review") {
    cardContent = React.createElement("div", { style: { textAlign: "left" } },
      React.createElement("div", { style: { marginBottom: 30, textAlign: "center" } },
         React.createElement("span", { style: { background: "#f0fdf4", color: "#22c55e", padding: "6px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700 } }, "✅ 本段录音完成")
      ),
      React.createElement("h3", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 12 } }, "🎧 本段录音回放"),
      React.createElement("audio", { src: currentAudio, controls: true, style: { width: "100%", marginBottom: 24, height: 44, outline: "none" } }),
      React.createElement("h3", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 12 } }, "✍️ 识别结果（可手动修改）"),
      React.createElement("textarea", { 
        value: currentText, onChange: function(e) { updateAns("text", e.target.value); },
        style: { width: "100%", height: 140, padding: 16, borderRadius: 12, border: "1px solid #e5e5e5", background: "#fafafa", fontSize: 15, lineHeight: 1.6, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 24 }
      }),
      React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center" } },
        React.createElement(Btn, { variant: "secondary", onClick: function() { cleanup(); }, style: { flex: 1, borderRadius: 12 } }, "🗑 重新录音"),
        
        idx < segs.length - 1 
          ? React.createElement(Btn, { onClick: handleNextSeg, style: { flex: 1, borderRadius: 12, background: "#7c3aed", color: "#fff" } }, "保存并下一段 ➡️")
          : null,

        // 💡 放在修改界面的交卷按钮
        React.createElement(Btn, { 
          onClick: handleSubmitExam, 
          style: { flex: 1, borderRadius: 12, background: "#22c55e", color: "#fff" } 
        }, "立即提交批改 ✅")
      )
    );
  } 
  // 界面状态 3：刚进题目，准备录音
  else {
    cardContent = React.createElement(React.Fragment, null,
      React.createElement("div", { style: { marginBottom: 30 } },
        React.createElement("span", { style: { background: "#f3f0ff", color: "#7c3aed", padding: "6px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700 } }, "第 " + (idx + 1) + " / " + segs.length + " 段")),
      React.createElement("p", { style: { color: "#999", fontSize: 14, marginBottom: 40 } }, "音频时长 " + audioDur + "s | 录音限时 " + maxRec + "s"),
      React.createElement("div", { style: { marginBottom: 40 } }, React.createElement(Waveform, { active: phase === "playing" || phase === "recording" })),
      
      React.createElement("div", { style: { marginBottom: 40 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: phase === "recording" ? "#ef4444" : "#bbb", marginBottom: 8, fontWeight: 700 } },
          React.createElement("span", null, phase === "recording" ? "🔴 正在录音..." : "原题播放"),
          React.createElement("span", null, phase === "recording" ? fmt(recElapsed) + " / " + fmt(maxRec) : Math.round(prog) + "%")),
        React.createElement("div", { onClick: phase === "recording" ? null : handleSeek, style: { width: "100%", height: 10, background: "#f1f1f1", borderRadius: 10, cursor: phase === "recording" ? "default" : "pointer", overflow: "hidden" } },
          React.createElement("div", { style: { height: "100%", width: (phase === "recording" ? (recElapsed/maxRec*100) : Math.max(0, prog)) + "%", background: phase === "recording" ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #a855f7)", borderRadius: 10, transition: "width 0.1s linear" } }))
      ),

      React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 12, alignItems: "center" } },
        React.createElement(Btn, { 
          onClick: handlePlay, disabled: phase === "recording",
          style: { width: 130, height: 90, borderRadius: 24, background: phase === "playing" ? "#111" : "#7c3aed", color: "#fff", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 10px 20px rgba(124, 58, 237, 0.2)", opacity: phase === "recording" ? 0.5 : 1 } 
        }, 
          React.createElement("span", { style: { fontSize: 24 } }, phase === "playing" ? "⏸" : "▶️"),
          React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, phase === "playing" ? "暂停播放" : "播放原音")),

          React.createElement(Btn, { 
            onClick: function() { 
              // 🌟 核心修改：改用 window.cattiPlayer 而不是 audioRef
              var player = window.cattiPlayer;
              var currentSeg = segs[idx];
  
              if (player && currentSeg) {
                player.pause();
                // 1. 强制跳回当前段落的起点 (例如 21.5 秒)
                player.currentTime = currentSeg.start_time || 0;
                
                // 2. 重新开始播放
                player.play().then(function() {
                  setPhase("playing");
                }).catch(function(err) {
                  console.error("播放失败:", err);
                });
              } else {
                // 如果还没点过“播放”，那就直接执行一次 handlePlay
                handlePlay();
              }
            }, 
            disabled: phase === "recording",
            style: { 
              width: 100, height: 90, borderRadius: 24, 
              background: "#f8fafc", color: "#555", 
              display: "flex", flexDirection: "column", gap: 8, 
              border: "none",
              opacity: phase === "recording" ? 0.4 : 1
            } 
          }, 
            React.createElement("span", { style: { fontSize: 20 } }, "🔄"),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700 } }, "重播原题")),
        React.createElement(Btn, { 
          onClick: phase === "recording" ? handleStopRec : handleStartRec, 
          style: { width: 100, height: 90, borderRadius: 24, background: phase === "recording" ? "#ef4444" : "#f8fafc", color: phase === "recording" ? "#fff" : "#555", display: "flex", flexDirection: "column", gap: 8, border: "none" } 
        }, 
          React.createElement("span", { style: { fontSize: 20 } }, phase === "recording" ? "⏹" : "🎤"),
          React.createElement("span", { style: { fontSize: 11, fontWeight: 700 } }, phase === "recording" ? "结束录音" : "开始录音")),

        React.createElement(Btn, { 
          onClick: handleReRecord, disabled: phase !== "recording",
          style: { width: 100, height: 90, borderRadius: 24, background: "#f8fafc", color: "#555", display: "flex", flexDirection: "column", gap: 8, border: "none", opacity: phase !== "recording" ? 0.4 : 1 } 
        }, 
          React.createElement("span", { style: { fontSize: 20 } }, "🗑"),
          React.createElement("span", { style: { fontSize: 11, fontWeight: 700 } }, "重新录音"))
      ),
      
      // 💡 放在最底部的悬浮交卷大按钮！刚进题目没录音也能点！
      React.createElement("div", { style: { marginTop: 30, display: "flex", justifyContent: "center" } },
        React.createElement(Btn, { 
          onClick: handleSubmitExam, 
          disabled: phase === "recording",
          style: { padding: "12px 40px", borderRadius: 12, background: phase === "recording" ? "#e5e5e5" : "#22c55e", color: phase === "recording" ? "#999" : "#fff", fontSize: 15, fontWeight: "bold", boxShadow: phase === "recording" ? "none" : "0 8px 16px rgba(34, 197, 94, 0.2)", transition: "all 0.2s" } 
        }, "✅ 随时提交全卷批改")
      )
    );
  }

  return React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" } },
    React.createElement("div", { style: { padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
        React.createElement("span", { style: { fontSize: 22 } }, "🎙️"),
        React.createElement("span", { style: { fontWeight: 700, fontSize: 18, color: "#111" } }, "口译模式")),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 20 } },
        // 💡 倒计时数字 + 考前设置弹窗（绑定在一起，点进题目才出现！）
        React.createElement(React.Fragment, null,
          // 右上角跳动的时间（最后5分钟变红）
          React.createElement("span", { 
            style: { 
              fontSize: 28, fontWeight: 800, fontFamily: "monospace", 
              transition: "color 0.3s",
              color: timeLeft <= 300 ? "#ef4444" : "#111" 
            } 
          }, timeDisplay),

          // 悬浮弹窗：没点开始前，遮罩拦截并要求输入时间
          (!isStarted) ? React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 } },
            React.createElement(Motion, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
              React.createElement(Card, { style: { width: 400, padding: "32px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } },
                React.createElement("div", { style: { fontSize: 56, marginBottom: 12 } }, "⏱️"),
                React.createElement("h2", { style: { fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 8px" } }, "设定模考倒计时"),
                React.createElement("p", { style: { color: "#666", marginBottom: 24, fontSize: 14 } }, "请输入您期望的考试时长（分钟）。倒计时归零后将强制自动交卷。"),
                
                // 自由输入框
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, background: "#f8fafc", padding: "12px 20px", borderRadius: 12, border: "2px solid #e2e8f0" } },
                  React.createElement("input", { 
                    type: "number", min: 1,
                    value: customMin, 
                    onChange: function(e) { setCustomMin(e.target.value); }, 
                    style: { flex: 1, border: "none", background: "transparent", fontSize: 24, fontWeight: 800, color: "#7c3aed", outline: "none", textAlign: "center" } 
                  }),
                  React.createElement("span", { style: { fontSize: 16, fontWeight: 700, color: "#64748b" } }, "分钟")
                ),
                
                // 确认按钮
                React.createElement(Btn, { 
                  onClick: function() { 
                    var finalSecs = (parseInt(customMin) || 30) * 60; // 把输入的分钟转成秒
                    setTimeLeft(finalSecs); 
                    setIsStarted(true); // 弹窗消失，计时开始！
                  }, 
                  style: { width: "100%", padding: 14, borderRadius: 14, background: "#ef4444", color: "#fff", fontSize: 16, fontWeight: 800 } 
                }, "🚨 锁定时间并开考")
              )
            )
          ) : null
        ),
        React.createElement(Btn, { variant: "danger", onClick: function() { cleanup(); p.onBack(); }, style: { padding: "10px 24px", borderRadius: 12 } }, "放弃"))
    ),

    React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 60px" } },
      React.createElement(Btn, { variant: "ghost", onClick: handlePrevSeg, disabled: idx === 0 || phase === "recording" || phase === "recognizing", style: { fontSize: 32, padding: 20, color: (idx === 0 || phase === "recording" || phase === "recognizing") ? "#eee" : "#ccc" } }, "‹"),

      React.createElement(Card, { style: { flex: 1, maxWidth: 700, minHeight: 460, padding: "60px 40px", textAlign: "center", margin: "0 20px" } },
        cardContent
      ),

      React.createElement(Btn, { variant: "ghost", onClick: handleNextSeg, disabled: idx === segs.length - 1 || phase === "recording" || phase === "recognizing", style: { fontSize: 32, padding: 20, color: (idx === segs.length - 1 || phase === "recording" || phase === "recognizing") ? "#eee" : "#ccc" } }, "›")
    )
  );
}

/* ============ TRANSLATION EXAM ============ */
function TransExam(p) {
  var trs = useState(""), tr = trs[0], setTr = trs[1];
  var ts2 = useState(3600), time = ts2[0], setTime = ts2[1];
  var cq = useState(false), quit = cq[0], setQuit = cq[1];
  useEffect(function() { if (time <= 0) return; var t = setInterval(function() { setTime(function(s) { return Math.max(0, s - 1); }); }, 1000); return function() { clearInterval(t); }; }, [time > 0]);
  function pad2(n) { var s = String(n); return s.length < 2 ? "0" + s : s; }
  function fmt(s) { return pad2(Math.floor(s / 60)) + ":" + pad2(s % 60); }
  return React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafafa" } },
    React.createElement("div", { style: { padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #f0f0f0", flexWrap: "wrap", gap: 12 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, React.createElement("span", { style: { fontSize: 18 } }, "✍"), React.createElement("span", { style: { fontWeight: 700, color: "#111" } }, "笔译模式")),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
        React.createElement("div", { style: { fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: time < 60 ? "#ef4444" : "#111" } }, fmt(time)),
        React.createElement(Btn, { variant: "danger", onClick: function() { setQuit(true); }, style: { padding: "8px 14px", fontSize: 13 } }, "放弃"))),
    React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 } },
      React.createElement("div", { style: { width: "100%", maxWidth: 750 } },
        React.createElement(Card, { style: { padding: 32 } },
          React.createElement("h3", { style: { fontSize: 14, fontWeight: 700, color: "#7c3aed", marginBottom: 10 } }, "英文原文"),
          React.createElement("div", { style: { padding: 20, borderRadius: 14, background: "#fafafa", border: "1px solid #f0f0f0", lineHeight: 1.9, fontSize: 15, marginBottom: 24, color: "#333" } }, p.examData.originalText),
          React.createElement("h3", { style: { fontSize: 14, fontWeight: 700, color: "#7c3aed", marginBottom: 10 } }, "中文译文"),
          React.createElement("textarea", { value: tr, onChange: function(e) { setTr(e.target.value); }, placeholder: "请在此输入你的翻译...", spellCheck: false, autoComplete: "off",
            style: { width: "100%", minHeight: 180, padding: 20, borderRadius: 14, border: "1px solid #e5e5e5", background: "#fafafa", color: "#111", fontSize: 16, lineHeight: 1.8, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" } })))),
    React.createElement("div", { style: { padding: "14px 24px", display: "flex", justifyContent: "center", background: "#fff", borderTop: "1px solid #f0f0f0" } },
      React.createElement(Btn, { onClick: function() { p.onSubmit(p.examData.mockScore, p.examData); }, style: { padding: "14px 56px", fontSize: 16 } }, "提交批改")),
    quit ? React.createElement("div", { onClick: function() { setQuit(false); }, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 } },
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 22 } },
        React.createElement(Card, { onClick: function(e) { e.stopPropagation(); }, style: { maxWidth: 340, padding: 32, textAlign: "center" } },
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#111" } }, "确认放弃？"),
          React.createElement("p", { style: { color: "#999", fontSize: 14, marginBottom: 20 } }, "进度将不会保存"),
          React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center" } },
            React.createElement(Btn, { variant: "secondary", onClick: function() { setQuit(false); } }, "继续"),
            React.createElement(Btn, { variant: "danger", onClick: p.onBack }, "放弃"))))) : null);
}

/* ============ PRACTICE ROOM (自带答疑对质 & 🌟收藏满血版) ============ */
var VOICE_OPTIONS = [
  { id: "us_male", label: "标准美音男声", flag: "🇺🇸", desc: "浑厚沉稳，VOA 常见音色" },
  { id: "us_female", label: "标准美音女声", flag: "🇺🇸", desc: "清晰流畅，CATTI 常驻美音" },
  { id: "uk_male", label: "标准英音男声", flag: "🇬🇧", desc: "正统 BBC 腔调，发音严谨" },
  { id: "uk_female", label: "标准英音女声", flag: "🇬🇧", desc: "典雅清晰，传统英式发音" },
  { id: "cn_male", label: "标准中文男声", flag: "🇨🇳", desc: "央视新闻腔，字正腔圆" },
  { id: "cn_female", label: "标准中文女声", flag: "🇨🇳", desc: "端庄大气，官方播报音色" }
];

function PracticeRoom(p) {
  var ss = useState("input"), stage = ss[0], setStage = ss[1];
  var ts = useState(""), rawText = ts[0], setRawText = ts[1];
  var vs = useState("uk_male"), voice = vs[0], setVoice = vs[1];

  var ps2 = useState("idle"), phase = ps2[0], setPhase = ps2[1];
  var pg = useState(0), prog = pg[0], setProg = pg[1];
  
  var rs = useState(""), recText = rs[0], setRecText = rs[1];
  var au = useState(null), recAudio = au[0], setRecAudio = au[1];
  var rt = useState(0), recElapsed = rt[0], setRecElapsed = rt[1];
  
  var rep = useState(null), aiReport = rep[0], setAiReport = rep[1];
  
  var cs = useState(false), showChat = cs[0], setShowChat = cs[1];
  var ci = useState(""), chatInput = ci[0], setChatInput = ci[1];
  var ch = useState([]), chatHistory = ch[0], setChatHistory = ch[1];
  var ic = useState(false), isChatting = ic[0], setIsChatting = ic[1];

  var fs = useState(false), isFav = fs[0], setIsFav = fs[1];

  var speedState = useState(1.0), rate = speedState[0], setRate = speedState[1];
  var isReqState = useState(false), isReq = isReqState[0], setIsReq = isReqState[1]; 
  
  var audioRef = useRef(null); 
  var recTimerRef = useRef(null);
  var mediaRecRef = useRef(null); 
  var chunksRef = useRef([]); 
  var maxRec = 180;
  
  var isCNVoice = voice.startsWith("cn");
  var audioDur = Math.max(5, Math.round(rawText.length / (isCNVoice ? 4 : 10)));

  React.useEffect(function() {
    return function() {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
        mediaRecRef.current.stop();
        mediaRecRef.current.stream.getTracks().forEach(function(t){ t.stop(); });
      }
    };
  }, []);

  var togglePlay = async function() {
    if (phase === "idle" || prog === 0) {
      if (isReq) return; 
      setIsReq(true); setPhase("playing");
      try {
        // 🌟 这里已经改成了线上的真实接口地址
        var res = await fetch("https://catti-app.vercel.app/api/tts", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText, voiceId: voice })
        });
        if (!res.ok) throw new Error("生成失败");
        var blob = await res.blob();
        var url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.pause();
        var audio = new Audio(url);
        audio.playbackRate = rate; 
        audioRef.current = audio;
        audio.ontimeupdate = function() {
          if (audio.duration) setProg((audio.currentTime / audio.duration) * 100);
        };
        audio.onended = function() { setPhase("idle"); setProg(100); };
        audio.play();
      } catch (e) {
        alert("🚨 呼叫微软云失败！请检查 Node 后端。"); setPhase("idle");
      } finally { setIsReq(false); }
    } else if (phase === "playing") {
      if (audioRef.current) audioRef.current.pause(); setPhase("paused");
    } else if (phase === "paused") {
      if (audioRef.current) audioRef.current.play(); setPhase("playing");
    }
  };

  var handleReplay = function() {
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setPhase("playing"); } 
    else { togglePlay(); }
  };

  var handleStartRec = function() {
    if (audioRef.current) audioRef.current.pause();
    setPhase("recording"); setRecElapsed(0);
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      var mr = new MediaRecorder(stream);
      mediaRecRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = function(e) { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = function() {
        var blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecAudio(URL.createObjectURL(blob));
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
          var base64data = reader.result;
          fetch('http://localhost:3000/api/transcribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64data, mimeType: blob.type })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            setRecText(data.text || "（未能识别到清晰语音，请重试）");
            setStage("review"); setPhase("idle");
          })
          .catch(function(err) {
            setRecText("（语音转文字失败，请检查网络）");
            setStage("review"); setPhase("idle");
          });
        };
      };
      mr.start();
      recTimerRef.current = setInterval(function() {
        setRecElapsed(function(old) { if (old >= maxRec) { handleStopRec(); return old; } return old + 1; });
      }, 1000);
    }).catch(function() { alert("🚨 必须允许麦克风权限哦！"); setPhase("idle"); });
  };

  var handleStopRec = function() {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      setPhase("recognizing");
      mediaRecRef.current.stop();
      mediaRecRef.current.stream.getTracks().forEach(function(t) { t.stop(); });
    }
  };

  var handleSubmitEval = function() {
    setStage("evaluating");
    var systemPrompt = `你现在是一位严格的 CATTI 阅卷考官。请批改考生的作答。满分 100 分。
🚨【最高优先级警告：防作弊与空白检测】🚨
如果考生的“我的译文”是空白、"（未作答）"、包含"未能识别"字样，或完全是没有意义的乱码：
1. 请直接将该段判定为 0 分！总分判定为 0 分！
2. 并在 deductions 中扣 100 分，原因是：“未作答或未识别到有效录音，无法给分”。
3. 绝对不允许给未作答的试卷打满分！！！

【严格扣分标准】（针对正常作答）：
指出细节漏译、错译等问题，严厉扣分。必须返回纯 JSON 格式：
{
  "totalScore": 85,
  "paragraphEvaluations": [ { "deductions": [ { "type": "类型", "original": "原句", "correction": "修改", "penalty": 2, "reason": "原因" } ], "highlights": [ { "phrase": "优秀片段", "praise": "表扬说明" } ] } ],
  "overallSummary": { "contentLevel": "...", "expressionLevel": "...", "optimizationLevel": "..." }
}`;

    var finalMyTrans = recText && recText.trim().length > 0 ? recText : "（未作答）";
    var userDataForAI = JSON.stringify([{ "段落": "自定义练习", "原文": rawText, "我的译文": finalMyTrans }], null, 2);

    fetch('https://api.catti-pro.work', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: systemPrompt, userData: userDataForAI })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      setAiReport(data);
      setStage("report"); 
      setIsFav(false); 
    })
    .catch(function(err) {
      alert("🚨 呼叫 AI 考官失败！请打开浏览器控制台 (Console) 查看具体报错信息。");
      setStage("review");
    });
  };

  var handleSendChat = function() {
    if (!chatInput.trim() || isChatting) return;
    var newHist = chatHistory.concat([{ role: "user", content: chatInput }]);
    setChatHistory(newHist); setChatInput(""); setIsChatting(true);
    var contextStr = "【原题原文】：\n" + rawText + "\n\n【考生的译文】：\n" + recText;

    var chatPrompt = "你是专业的CATTI考官。请根据以下上下文回答考生的疑问：\n" + contextStr;

    fetch('https://catti-app.vercel.app/api/gemini', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: chatPrompt, userData: chatInput })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var replyText = typeof data === 'string' ? data : (data.reply || data.text || JSON.stringify(data));
      setChatHistory(newHist.concat([{ role: "考官", content: replyText }])); setIsChatting(false);
    })
    .catch(function() {
      setChatHistory(newHist.concat([{ role: "考官", content: "🚨 呼叫考官失败，请检查网络！" }])); setIsChatting(false);
    });
  };

  var handleToggleFav = function() {
    var favs = JSON.parse(localStorage.getItem("catti_favs") || "[]");
    if (isFav) {
      favs = favs.filter(function(f) { return f.originalText !== rawText; });
      setIsFav(false);
    } else {
      favs.push({
        id: Date.now(),
        source: "练习室",
        title: "自定义语料实战",
        originalText: rawText,
        myTranslation: recText,
        report: aiReport,
        date: new Date().toLocaleDateString()
      });
      setIsFav(true);
      alert("🌟 收藏成功！可前往侧边栏「收藏」模块查看！");
    }
    localStorage.setItem("catti_favs", JSON.stringify(favs));
  };

  var fmt = function(s) { var m = Math.floor(s/60), sec = s%60; return (m<10?"0"+m:m)+":"+(sec<10?"0"+sec:sec); };

  if (stage === "input") {
    return React.createElement("div", { style: { padding: "40px 60px", maxWidth: 800, margin: "0 auto" } },
      React.createElement(Motion, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
        React.createElement("div", { style: { marginBottom: 32 } },
          React.createElement("h2", { style: { fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 8px" } }, "新建自定义实战"),
          React.createElement("p", { style: { color: "#666", margin: 0 } }, "输入语料，系统将调用 Azure 语音和 Gemini 考官为您进行全真模考")
        ),
        React.createElement("textarea", {
          value: rawText, onChange: function(e) { setRawText(e.target.value); }, placeholder: "粘贴你的英文/中文口译语料到这里...",
          style: { width: "100%", height: 200, padding: 20, borderRadius: 16, border: "2px solid #e2e8f0", fontSize: 16, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 32, fontFamily: "inherit" }
        }),
        React.createElement("div", { style: { marginBottom: 32 } },
          React.createElement("div", { style: { textAlign: "center", marginBottom: 20 } }, React.createElement("h3", { style: { fontSize: 16, fontWeight: 700, margin: 0 } }, "AI 考官音色")),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } },
            VOICE_OPTIONS.map(function(v) {
              var isSel = voice === v.id;
              return React.createElement("div", { key: v.id, onClick: function() { setVoice(v.id); }, style: { padding: "20px", borderRadius: 16, border: isSel ? "2px solid #6366f1" : "2px solid #f1f5f9", background: isSel ? "#e0e7ff" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 } },
                React.createElement("div", { style: { fontSize: 24 } }, v.flag),
                React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: isSel ? "#4f46e5" : "#111" } }, v.label), React.createElement("div", { style: { fontSize: 12, color: isSel ? "#6366f1" : "#94a3b8" } }, v.desc)),
                React.createElement("div", { style: { width: 20, height: 20, borderRadius: "50%", border: isSel ? "6px solid #6366f1" : "2px solid #cbd5e1" } })
              );
            })
          )
        ),
        React.createElement(Btn, { onClick: function() { if (!rawText.trim()) return alert("请输入语料！"); setStage("exam"); setPhase("idle"); setProg(0); }, disabled: !rawText.trim(), style: { width: "100%", padding: 20, borderRadius: 16, background: rawText.trim() ? "#111" : "#94a3b8", color: "#fff", fontSize: 18, fontWeight: 800 } }, "✨ 锁定语料，进入考场")
      )
    );
  }

  if (stage === "exam") {
    return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 40 } },
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
        React.createElement(Card, { style: { width: 600, padding: "50px 40px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" } },
          phase === "recognizing" ? 
          React.createElement("div", { style: { padding: "60px 0" } },
            React.createElement("style", null, "@keyframes spin{to{transform:rotate(360deg)}}"),
            React.createElement("div", { style: { width: 50, height: 50, border: "4px solid #e0e7ff", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" } }),
            React.createElement("h3", { style: { fontSize: 20, fontWeight: 800, color: "#111" } }, "Gemini 正在听写语音..."),
            React.createElement("p", { style: { color: "#999", fontSize: 14, marginTop: 8 } }, "请稍候，正在为您生成文稿")
          ) 
          :
          React.createElement(React.Fragment, null, 
            React.createElement("h2", { style: { fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 12px" } }, "实战录音"),
            React.createElement("p", { style: { color: "#666", margin: "0 0 40px", fontSize: 14 } }, "预计音频 " + audioDur + "s | 录音限时 " + fmt(maxRec)),
            React.createElement("div", { style: { marginBottom: 40 } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 8 } },
                React.createElement("span", null, isReq ? "正在连线微软云..." : (phase === "recording" ? "🔴 正在录音..." : "原题播放")),
                React.createElement("span", null, phase === "recording" ? fmt(recElapsed) : Math.floor(prog) + "%")
              ),
              React.createElement("div", { style: { height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" } },
                React.createElement("div", { style: { height: "100%", width: (phase === "recording" ? (recElapsed/maxRec*100) : prog) + "%", background: phase === "recording" ? "#ef4444" : "#6366f1", transition: "width 0.3s linear" } })
              )
            ),
            React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 } },
              React.createElement("button", { onClick: togglePlay, disabled: phase === "recording" || isReq, style: { width: 80, height: 80, borderRadius: 24, border: "none", background: (phase === "playing" ? "#6366f1" : "#e0e7ff"), color: (phase === "playing" ? "#fff" : "#6366f1"), cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, 
                React.createElement("div", { style: { fontSize: 24 } }, isReq ? "⏳" : (phase === "playing" ? "⏸" : "▶")), React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, "播放")
              ),
              React.createElement("button", { onClick: handleReplay, disabled: phase === "recording" || isReq, style: { width: 80, height: 80, borderRadius: 24, border: "2px solid #f1f5f9", background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, 
                React.createElement("div", { style: { fontSize: 24 } }, "🔄"), React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, "重播")
              ),
              React.createElement("button", { onClick: phase === "recording" ? handleStopRec : handleStartRec, style: { width: 80, height: 80, borderRadius: 24, border: "none", background: phase === "recording" ? "#ef4444" : "#fef2f2", color: phase === "recording" ? "#fff" : "#ef4444", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, 
                React.createElement("div", { style: { fontSize: 24 } }, phase === "recording" ? "⏹" : "🎤"), React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, phase === "recording" ? "停止" : "录音")
              )
            ),
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "#f8fafc", padding: "10px", borderRadius: 16 } },
              React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "#64748b" } }, "倍速:"),
              [0.8, 1.0, 1.2, 1.5].map(function(r) {
                var isSel = rate === r;
                return React.createElement("button", { key: r, onClick: function() { setRate(r); if (audioRef.current) audioRef.current.playbackRate = r; }, style: { padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, border: "none", background: isSel ? "#111" : "transparent", color: isSel ? "#fff" : "#64748b", cursor: "pointer" } }, r + "x");
              })
            ),
            React.createElement("div", { style: { marginTop: 30 } }, React.createElement(Btn, { variant: "secondary", onClick: function(){ setStage("input"); } }, "← 返回修改"))
          )
        )
      )
    );
  }

  if (stage === "review") {
    return React.createElement("div", { style: { padding: "40px 60px", maxWidth: 800, margin: "0 auto" } },
      React.createElement(Card, { style: { padding: 40, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" } },
        React.createElement("h2", { style: { fontSize: 24, fontWeight: 800, margin: "0 0 24px" } }, "✍️ 录音与文稿校对"),
        React.createElement("div", { style: { marginBottom: 24 } },
          React.createElement("div", { style: { fontSize: 13, color: "#64748b", fontWeight: 700, marginBottom: 8 } }, "您的录音回放"),
          React.createElement("audio", { src: recAudio, controls: true, style: { width: "100%", height: 44, outline: "none" } })
        ),
        React.createElement("div", { style: { marginBottom: 24 } },
          React.createElement("div", { style: { fontSize: 13, color: "#64748b", fontWeight: 700, marginBottom: 8 } }, "Gemini 识别结果（可手动精修）"),
          React.createElement("textarea", { value: recText, onChange: function(e) { setRecText(e.target.value); }, style: { width: "100%", height: 160, padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 15, lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" } })
        ),
        React.createElement("div", { style: { display: "flex", gap: 12 } },
          React.createElement(Btn, { variant: "secondary", onClick: function() { setStage("exam"); }, style: { flex: 1, borderRadius: 12 } }, "🗑 重录"),
          React.createElement(Btn, { onClick: handleSubmitEval, style: { flex: 2, borderRadius: 12, background: "#7c3aed", color: "#fff", fontSize: 16 } }, "👨‍🏫 提交考官批改")
        )
      )
    );
  }

  if (stage === "evaluating") {
    return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" } },
      React.createElement("div", { style: { textAlign: "center" } },
        React.createElement("style", null, "@keyframes pulseGlow{0%{box-shadow:0 0 0 0 rgba(124,58,237,0.4)}70%{box-shadow:0 0 0 20px rgba(124,58,237,0)}100%{box-shadow:0 0 0 0 rgba(124,58,237,0)}}"),
        React.createElement("div", { style: { width: 70, height: 70, borderRadius: "50%", background: "#7c3aed", animation: "pulseGlow 2s infinite", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 } }, "👨‍🏫"),
        React.createElement("h3", { style: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 12 } }, "魔鬼考官正在疯狂批阅中..."),
        React.createElement("div", { style: { color: "#666", fontSize: 14 } }, "正在进行多维度深度分析，请耐心等待 ☕️")
      )
    );
  }

  if (stage === "report" && aiReport) {
    var repObj = aiReport.paragraphEvaluations ? aiReport.paragraphEvaluations[0] : aiReport;
    return React.createElement("div", { style: { padding: "40px 60px", maxWidth: 900, margin: "0 auto" } },
      showChat ? React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" } },
        React.createElement("div", { style: { width: 500, height: 600, background: "#fff", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" } },
          React.createElement("div", { style: { padding: "16px 20px", background: "#7c3aed", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800 } }, "👨‍🏫 私教对质室"),
            React.createElement("button", { onClick: function(){setShowChat(false);}, style: { background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" } }, "✕")
          ),
          React.createElement("div", { style: { flex: 1, padding: 20, overflowY: "auto", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 16 } },
            chatHistory.map(function(msg, i) {
              return React.createElement("div", { key: i, style: { alignSelf: msg.role === "user" ? "flex-end" : "flex-start", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" } },
                React.createElement("span", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 4 } }, msg.role === "user" ? "你" : "魔鬼考官"),
                React.createElement("div", { style: { background: msg.role === "user" ? "#7c3aed" : "#fff", color: msg.role === "user" ? "#fff" : "#333", padding: "12px 16px", borderRadius: 16, border: msg.role === "user" ? "none" : "1px solid #e2e8f0", fontSize: 14, lineHeight: 1.6 } }, msg.content)
              );
            }),
            isChatting ? React.createElement("div", { style: { alignSelf: "flex-start", background: "#fff", padding: "12px 16px", borderRadius: 16, border: "1px solid #e2e8f0", color: "#94a3b8", fontSize: 14 } }, "考官正在输入...") : null
          ),
          React.createElement("div", { style: { padding: 16, background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", gap: 12 } },
            React.createElement("input", { value: chatInput, onChange: function(e){setChatInput(e.target.value);}, onKeyDown: function(e){if(e.key==="Enter") handleSendChat();}, placeholder: "输入你不服的理由或疑问...", style: { flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", outline: "none", fontSize: 14 } }),
            React.createElement("button", { onClick: handleSendChat, disabled: isChatting || !chatInput.trim(), style: { padding: "0 24px", background: (isChatting || !chatInput.trim()) ? "#cbd5e1" : "#7c3aed", color: "#fff", borderRadius: 12, border: "none", cursor: (isChatting || !chatInput.trim()) ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 15 } }, "发送")
          )
        )
      ) : null,

      React.createElement(Card, { style: { padding: "40px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", borderTop: "8px solid #7c3aed", position: "relative" } },
        React.createElement("div", { style: { position: "absolute", top: 40, right: 40, display: "flex", gap: 12 } },
          React.createElement("button", { onClick: handleToggleFav, style: { background: isFav ? "#fef08a" : "#f8fafc", color: isFav ? "#ca8a04" : "#64748b", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" } }, isFav ? "🌟 已收藏" : "⭐ 收藏本题"),
          React.createElement("button", { onClick: function() { setShowChat(true); }, style: { background: "#f3f0ff", color: "#7c3aed", border: "1px solid #e0e7ff", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" } }, "💬 不服？问问考官")
        ),
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 24, marginBottom: 24 } },
          React.createElement("div", null,
            React.createElement("h2", { style: { fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 8px" } }, "📋 模考诊断报告"),
            React.createElement("div", { style: { color: "#64748b", fontSize: 14 } }, "自定义语料实战分析")
          ),
          React.createElement("div", { style: { textAlign: "right", marginRight: 280 } },
            React.createElement("div", { style: { fontSize: 48, fontWeight: 900, color: (aiReport.totalScore === 0 ? "#ef4444" : "#7c3aed"), lineHeight: 1 } }, aiReport.totalScore || 0),
            React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#94a3b8" } }, "综合得分 / 100")
          )
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 } },
          [{ t: "内容传达", c: aiReport.overallSummary?.contentLevel || "无", bg: "#eff6ff", col: "#2563eb" },
           { t: "表达逻辑", c: aiReport.overallSummary?.expressionLevel || "无", bg: "#fdf4ff", col: "#c026d3" },
           { t: "优化建议", c: aiReport.overallSummary?.optimizationLevel || "无", bg: "#fff7ed", col: "#ea580c" }].map(function(item, i) {
             return React.createElement("div", { key: i, style: { background: item.bg, padding: 20, borderRadius: 16 } },
               React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: item.col, marginBottom: 8 } }, item.t),
               React.createElement("div", { style: { fontSize: 13, color: "#333", lineHeight: 1.6 } }, item.c)
             );
           })
        ),
        (repObj.deductions && repObj.deductions.length > 0) ? React.createElement("div", { style: { marginBottom: 32 } },
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 800, color: "#111", borderLeft: "4px solid #ef4444", paddingLeft: 12, marginBottom: 16 } }, "🩸 扣分明细"),
          repObj.deductions.map(function(d, i) {
            return React.createElement("div", { key: i, style: { background: "#fff", border: "1px solid #fee2e2", padding: 16, borderRadius: 12, marginBottom: 12 } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 } },
                React.createElement("span", { style: { background: "#fee2e2", color: "#ef4444", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 } }, d.type || "致命错误"),
                React.createElement("span", { style: { color: "#ef4444", fontWeight: 800 } }, "-" + (d.penalty || 0) + " 分")
              ),
              React.createElement("div", { style: { fontSize: 14, color: "#333", marginBottom: 6 } }, React.createElement("strong", null, "原译："), React.createElement("span", { style: { textDecoration: "line-through", color: "#999" } }, d.original || "（无）")),
              React.createElement("div", { style: { fontSize: 14, color: "#16a34a", marginBottom: 8 } }, React.createElement("strong", null, "建议："), d.correction || "（无）"),
              React.createElement("div", { style: { fontSize: 13, color: "#666", background: "#f8fafc", padding: "8px 12px", borderRadius: 8 } }, "💡 " + d.reason)
            );
          })
        ) : null,
        (repObj.highlights && repObj.highlights.length > 0) ? React.createElement("div", { style: { marginBottom: 32 } },
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 800, color: "#111", borderLeft: "4px solid #22c55e", paddingLeft: 12, marginBottom: 16 } }, "✨ 亮点表扬"),
          repObj.highlights.map(function(h, i) {
            return React.createElement("div", { key: i, style: { background: "#f0fdf4", padding: "12px 16px", borderRadius: 12, marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 12 } },
              React.createElement("span", null, "🌟"),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 4 } }, h.phrase),
                React.createElement("div", { style: { fontSize: 13, color: "#15803d" } }, h.praise)
              )
            );
          })
        ) : null,
        React.createElement(Btn, { onClick: function() { setStage("input"); setRawText(""); setRecText(""); setProg(0); setRate(1.0); }, style: { width: "100%", padding: 16, borderRadius: 16, background: "#111", fontSize: 16 } }, "再练一篇 🚀")
      )
    );
  }
  return null;
}

/* ============ RESULT PAGE ============ */
/* ============ RESULT PAGE (多段循环渲染版) ============ */
/* ============ RESULT PAGE (两端对齐高级排版版) ============ */
/* ============ RESULT PAGE (真正的逐段精批排版版) ============ */
/* ============ RESULT PAGE (带右键划词 & 自定义术语分类 & 分段收藏 终极版) ============ */
function ResultPage(p) {
  var sc = p.scoreData;
  var ts3 = useState("content"), tab = ts3[0], setTab = ts3[1];
  var tms = useState(false), termMod = tms[0], setTM = tms[1];
  var tt = useState(""), tText = tt[0], setTT = tt[1];
  var td = useState(""), tDef = td[0], setTD = td[1];
  var sv2 = useState(false), saved = sv2[0], setSaved = sv2[1];
  
  var catState = useState("政工类"), tCat = catState[0], setTC = catState[1];
  var catsListState = useState(["政工类", "经济类", "科技类", "通用口语"]), catsList = catsListState[0], setCatsList = catsListState[1];
  var isNewCatState = useState(false), isNewCat = isNewCatState[0], setIsNewCat = isNewCatState[1];
  var newCatNameState = useState(""), newCatName = newCatNameState[0], setNewCatName = newCatNameState[1];

  var chatState = useState(null), chatModal = chatState[0], setChatModal = chatState[1];
  var chatInpState = useState(""), chatInput = chatInpState[0], setChatInput = chatInpState[1];
  var chatLdState = useState(false), chatLoading = chatLdState[0], setChatLoading = chatLdState[1];

  // 🌟 新增：独立记录每一段的收藏状态 (用段落 index 作为 key)
  var fs = useState({}), favMap = fs[0], setFavMap = fs[1];

  var tabMap = [{ key: "content", label: "内容层面" }, { key: "expression", label: "表达层面" }, { key: "improvement", label: "优化层面" }];
  var analysis = sc.analysis || { content: "点评生成失败", expression: "点评生成失败", improvement: "点评生成失败" };

  var handleContextMenu = function(e) {
    var selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      e.preventDefault(); 
      setTT(selectedText); 
      setTD(""); 
      setSaved(false);
      setIsNewCat(false); 
      setTM(true); 
    }
  };

  var openChat = function(seg, evalData) {
    var ctx = "【原文】：" + seg.originalText + "\n【考生译文】：" + seg.myTranslation + "\n【参考答案】：" + seg.referenceText + "\n【考官对本段的扣分明细】：" + JSON.stringify(evalData ? evalData.deductions : []);
    setChatModal({
      title: seg.label,
      context: ctx,
      messages: [{ role: "ai", text: "你好！我是本段的阅卷考官。请问你对我的批改哪里有疑问？" }]
    });
  };

  var sendChat = function() {
    if (!chatInput.trim() || chatLoading) return;
    var newMsgs = chatModal.messages.concat({ role: "user", text: chatInput });
    var currentCtx = chatModal.context;
    var currentTitle = chatModal.title;
    var question = chatInput;
    
    setChatModal({ title: currentTitle, context: currentCtx, messages: newMsgs });
    setChatInput(""); setChatLoading(true);

    var chatPrompt = "你是专业的CATTI考官。请根据以下上下文回答考生的疑问：\n" + currentCtx;

    fetch('https://catti-app.vercel.app/api/gemini', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: chatPrompt, userData: question })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var replyText = typeof data === 'string' ? data : (data.reply || data.text || JSON.stringify(data));
      setChatModal({ title: currentTitle, context: currentCtx, messages: newMsgs.concat({ role: "ai", text: replyText || "考官沉默了..." }) });
      setChatLoading(false);
    })
    .catch(function(err) {
      setChatModal({ title: currentTitle, context: currentCtx, messages: newMsgs.concat({ role: "ai", text: "🚨 呼叫考官失败，请检查网络！" }) });
      setChatLoading(false);
    });
  };

  // 🌟 核心新增：分段收藏逻辑
  var handleFavSeg = function(seg, evalData, index) {
    var allFavs = JSON.parse(localStorage.getItem("catti_favs") || "[]");
    
    if (favMap[index]) {
      // 取消收藏
      allFavs = allFavs.filter(function(f) { return f.originalText !== seg.originalText; });
      setFavMap(function(prev) { var n = Object.assign({}, prev); n[index] = false; return n; });
    } else {
      // 存入收藏，把大厅的年份/题目标题（p.title）也一起塞进去
      allFavs.push({
        id: Date.now() + index,
        source: p.title || "题库真题", 
        title: seg.label,
        originalText: seg.originalText,
        myTranslation: seg.myTranslation,
        referenceText: seg.referenceText,
        // 把这段的扣分项伪装成一个完整的报告，方便「收藏页面」读取
        report: { paragraphEvaluations: [evalData || {}], totalScore: "分段片段" },
        date: new Date().toLocaleDateString()
      });
      setFavMap(function(prev) { var n = Object.assign({}, prev); n[index] = true; return n; });
      alert("🌟 收藏成功！可前往左侧「收藏」模块查看本段！");
    }
    localStorage.setItem("catti_favs", JSON.stringify(allFavs));
  };

  return React.createElement("div", { 
    onContextMenu: handleContextMenu, 
    style: { padding: "32px 24px", maxWidth: 850, margin: "0 auto", textAlign: "left" } 
  },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 } },
      React.createElement(Btn, { variant: "ghost", onClick: p.onBack }, "← 返回"),
      React.createElement("h2", { style: { fontSize: 20, fontWeight: 700, color: "#111", margin: 0 } }, "批改报告"),
      React.createElement("div", { style: { width: 80 } })
    ),

    React.createElement(Motion, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
      React.createElement(Card, { style: { padding: 32, marginBottom: 18, textAlign: "center" } },
        React.createElement(ScoreRing, { score: sc.score, total: sc.total })
      )
    ),

    sc.segmentsResult ? sc.segmentsResult.map(function(seg, i) {
      var evalData = (sc.paragraphEvaluations && sc.paragraphEvaluations[i]) ? sc.paragraphEvaluations[i] : null;
      var segDeductions = (evalData && evalData.deductions) ? evalData.deductions : [];
      var segHighlights = (evalData && evalData.highlights) ? evalData.highlights : [];

      return React.createElement(Card, { key: i, style: { padding: 24, marginBottom: 24, textAlign: "left", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: 12, marginBottom: 16 } },
          React.createElement("h3", { style: { fontSize: 16, fontWeight: 800, color: "#111", margin: 0 } }, seg.label),
          
          // 💡 修改：把两个按钮并排放在一起！
          React.createElement("div", { style: { display: "flex", gap: 10 } },
            React.createElement(Btn, { 
              onClick: function() { handleFavSeg(seg, evalData, i); }, 
              style: { padding: "6px 14px", fontSize: 13, background: favMap[i] ? "#fef08a" : "#f8fafc", color: favMap[i] ? "#ca8a04" : "#64748b", borderRadius: 20, fontWeight: "bold", border: "1px solid #e2e8f0", transition: "all 0.2s" } 
            }, favMap[i] ? "🌟 已收藏" : "⭐ 收藏此题"),
            React.createElement(Btn, { 
              onClick: function() { openChat(seg, evalData); }, 
              style: { padding: "6px 14px", fontSize: 13, background: "#f3f0ff", color: "#7c3aed", borderRadius: 20, fontWeight: "bold" } 
            }, "💬 不服？问问考官")
          )
        ),
        
        // --- 请用这段完全闭合的代码替换原来的“原文”区块 ---
        React.createElement("div", { style: { marginBottom: 16 } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 } },
            React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#7c3aed", margin: 0 } }, "原文"),
            (seg.audio_url ? React.createElement(AudioPlayer, { 
              src: seg.audio_url, 
              startTime: seg.start_time, 
              endTime: seg.end_time 
            }) : null)
          ),
          React.createElement("div", { style: { fontSize: 15, color: "#333", lineHeight: 1.8, padding: 16, background: "#fafafa", borderRadius: 12, textAlign: "justify" } }, seg.originalText)
        ),
        
        // 2. 我的译文区块 (保持不变)
        React.createElement("div", { style: { marginBottom: 16 } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#ef4444", marginBottom: 6 } }, "我的译文"),
          React.createElement("div", { style: { fontSize: 15, color: "#333", lineHeight: 1.8, padding: 16, background: "#fef2f2", borderRadius: 12, textAlign: "justify" } }, seg.myTranslation)
        ),
        
        // 3. 我的录音回放 (保持不变)
        seg.userAudio ? React.createElement("div", { style: { marginBottom: 16 } },
          React.createElement(AudioPlayer, { src: seg.userAudio, label: "🎧 回放本段录音" })
        ) : React.createElement("div", { style: { marginBottom: 16, fontSize: 13, color: "#999", fontStyle: "italic" } }, "（本段未提交录音）"),

        // 4. 参考答案区块 (保持不变)
        React.createElement("div", { style: { marginBottom: 20 } },
          React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#22c55e", marginBottom: 6 } }, "参考答案"),
          React.createElement("div", { style: { fontSize: 15, color: "#333", lineHeight: 1.8, padding: 16, background: "#f0fdf4", borderRadius: 12, textAlign: "justify" } }, seg.referenceText)
        ),
        (segDeductions.length > 0 || segHighlights.length > 0) ? React.createElement("div", { style: { paddingTop: 20, borderTop: "2px dashed #e5e5e5" } },
          segDeductions.length > 0 ? React.createElement("div", { style: { marginBottom: segHighlights.length > 0 ? 16 : 0 } },
            React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#ef4444", marginBottom: 10 } }, "🎯 本段扣分明细"),
            segDeductions.map(function(d, j) {
              var penaltyNum = d.penalty || d.severity || 0;
              return React.createElement("div", { key: j, style: { padding: 14, borderRadius: 12, background: penaltyNum >= 5 ? "#fef2f2" : "#fafafa", border: "1px solid " + (penaltyNum >= 5 ? "#fecaca" : "#e5e5e5"), marginBottom: 10 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
                  React.createElement("span", { style: { fontWeight: 700, fontSize: 13, color: "#ef4444" } }, "❌ " + (d.type || d.category || "错误")),
                  React.createElement("span", { style: { fontWeight: 800, fontSize: 14, color: "#ef4444" } }, "-" + penaltyNum + " 分")
                ),
                React.createElement("div", { style: { fontSize: 13, color: "#777", marginBottom: 4 } }, "原译：", React.createElement("span", { style: { textDecoration: "line-through", color: "#ef4444" } }, d.original)),
                React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6 } }, "修正：", React.createElement("span", { style: { fontWeight: 600, color: "#22c55e" } }, d.correction)),
                React.createElement("div", { style: { fontSize: 12, color: "#999", lineHeight: 1.5 } }, "💡 " + (d.reason || d.rule))
              );
            })
          ) : null,
          segHighlights.length > 0 ? React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#10b981", marginBottom: 10 } }, "✨ 本段亮点"),
            segHighlights.map(function(h, k) {
              return React.createElement("div", { key: k, style: { padding: 14, borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", marginBottom: 10 } },
                React.createElement("div", { style: { fontSize: 14, color: "#065f46", marginBottom: 6, fontWeight: 700 } }, "妙译：\"" + h.phrase + "\""),
                React.createElement("div", { style: { fontSize: 13, color: "#059669", lineHeight: 1.5 } }, "👏 " + h.praise)
              );
            })
          ) : null
        ) : React.createElement("div", { style: { paddingTop: 20, borderTop: "1px dashed #e5e5e5", fontSize: 13, color: "#999", textAlign: "center", fontStyle: "italic" } }, "AI 考官：本段暂无扣分或明显亮点。")
      );
    }) : null,

    React.createElement(Card, { style: { padding: 24, marginBottom: 18, textAlign: "left" } },
      React.createElement("h3", { style: { fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 14 } }, "考官深度点评"),
      React.createElement(Tabs, { tabs: tabMap, active: tab, onChange: setTab, style: { marginBottom: 16 } }),
      React.createElement("div", { style: { padding: 20, borderRadius: 12, background: "#fafafa", border: "1px solid #eee", lineHeight: 2, fontSize: 15, color: "#333", whiteSpace: "pre-line", textAlign: "justify" } }, analysis[tab])
    ),

    React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center", paddingBottom: 40, marginTop: 30 } },
      React.createElement(Btn, { variant: "secondary", onClick: function() { setTM(true); setSaved(false); setIsNewCat(false); } }, "🏷 手动添加术语"),
      React.createElement(Btn, { onClick: p.onBack }, "返回题库")),

    chatModal ? React.createElement("div", { onClick: function() { setChatModal(null); }, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 } },
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 25 }, onClick: function(e) { e.stopPropagation(); }, style: { width: "100%", maxWidth: 500, background: "#fff", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" } },
        React.createElement("div", { style: { padding: "16px 24px", background: "#7c3aed", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", null,
            React.createElement("h3", { style: { margin: 0, fontSize: 16, fontWeight: "bold" } }, "🧑‍🏫 与考官对话"),
            React.createElement("div", { style: { fontSize: 12, opacity: 0.8, marginTop: 4 } }, "关于：" + chatModal.title)
          ),
          React.createElement("button", { onClick: function() { setChatModal(null); }, style: { background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", opacity: 0.8 } }, "×")
        ),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 24, background: "#f8fafc", display: "flex", flexDirection: "column", gap: 16 } },
          chatModal.messages.map(function(msg, idx) {
            var isUser = msg.role === "user";
            return React.createElement("div", { key: idx, style: { display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" } },
              React.createElement("div", { style: { maxWidth: "80%", padding: "12px 16px", borderRadius: 16, background: isUser ? "#7c3aed" : "#fff", color: isUser ? "#fff" : "#333", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: 14, lineHeight: 1.6, borderBottomRightRadius: isUser ? 4 : 16, borderBottomLeftRadius: isUser ? 16 : 4, whiteSpace: "pre-wrap" } }, msg.text)
            );
          }),
          chatLoading ? React.createElement("div", { style: { fontSize: 13, color: "#999", fontStyle: "italic", alignSelf: "flex-start" } }, "考官正在思考...") : null
        ),
        React.createElement("div", { style: { padding: 16, background: "#fff", borderTop: "1px solid #eee", display: "flex", gap: 10 } },
          React.createElement("input", { 
            value: chatInput, onChange: function(e) { setChatInput(e.target.value); }, 
            onKeyDown: function(e) { if (e.key === 'Enter') sendChat(); },
            placeholder: "输入你的疑问...",
            style: { flex: 1, padding: "12px 16px", borderRadius: 20, border: "1px solid #ddd", fontSize: 14, outline: "none", background: "#f8fafc" } 
          }),
          React.createElement(Btn, { onClick: sendChat, disabled: chatLoading || !chatInput.trim(), style: { borderRadius: 20, background: chatLoading ? "#ccc" : "#7c3aed", padding: "0 20px" } }, "发送")
        )
      )
    ) : null,

    termMod ? React.createElement("div", { onClick: function() { setTM(false); }, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 } },
      React.createElement(Motion, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 25 } },
        React.createElement(Card, { onClick: function(e) { e.stopPropagation(); }, style: { maxWidth: 400, width: "100%", padding: "28px 24px" } },
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 20, textAlign: "center" } }, "🏷️ 添加至术语库"),
          saved ? React.createElement("div", { style: { textAlign: "center", padding: "20px 0" } },
            React.createElement("div", { style: { fontSize: 50, marginBottom: 12 } }, "✅"),
            React.createElement("p", { style: { fontWeight: 700, color: "#10b981", fontSize: 16 } }, "已成功存入【" + tCat + "】分类！"))
          : React.createElement("div", null,
              (function() {
                var isZh = /[\u4e00-\u9fa5]/.test(tText);
                var originalLabel = isZh ? "🇨🇳 中文术语" : "🇺🇸 英文术语";
                var defLabel = isZh ? "🇺🇸 英文释义" : "🇨🇳 中文释义";

                return React.createElement(React.Fragment, null,
                  React.createElement("div", { style: { marginBottom: 14 } },
                    React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, originalLabel),
                    React.createElement("input", { value: tText, onChange: function(e) { setTT(e.target.value); }, style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", fontSize: 14 } })
                  ),
                  
                  React.createElement("div", { style: { marginBottom: 14 } },
                    React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, defLabel),
                    React.createElement("input", { value: tDef, onChange: function(e) { setTD(e.target.value); }, placeholder: "请输入释义...", style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", fontSize: 14 } })
                  ),
                  
                  React.createElement("div", { style: { marginBottom: 20 } },
                    React.createElement("div", { style: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 } }, "分类标签"),
                    isNewCat ? 
                      React.createElement("div", { style: { display: "flex", gap: 8 } },
                        React.createElement("input", { 
                          value: newCatName, onChange: function(e) { setNewCatName(e.target.value); }, placeholder: "输入新类别名称...", autoFocus: true,
                          style: { flex: 1, padding: "10px 14px", borderRadius: 10, border: "2px solid #7c3aed", outline: "none", boxSizing: "border-box", fontSize: 14 } 
                        }),
                        React.createElement(Btn, { variant: "secondary", onClick: function() { setIsNewCat(false); setNewCatName(""); }, style: { padding: "0 14px", borderRadius: 10 } }, "取消")
                      )
                    : 
                      React.createElement("select", {
                        value: tCat, 
                        onChange: function(e) {
                          if (e.target.value === "___NEW___") { setIsNewCat(true); } 
                          else { setTC(e.target.value); }
                        },
                        style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", outline: "none", boxSizing: "border-box", background: "#f8fafc", fontSize: 14, cursor: "pointer" }
                      },
                        catsList.map(function(c) { return React.createElement("option", { key: c, value: c }, c); }),
                        React.createElement("option", { value: "___NEW___", style: { color: "#7c3aed", fontWeight: "bold" } }, "➕ 自定义新类别...")
                      )
                  ),

                  React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 24 } },
                    React.createElement(Btn, { variant: "secondary", onClick: function() { setTM(false); }, style: { flex: 1, borderRadius: 12 } }, "取消"),
                    React.createElement(Btn, { 
                      onClick: function() { 
                        var finalCat = tCat;
                        if (isNewCat && newCatName.trim() !== "") {
                          finalCat = newCatName.trim();
                          if (!catsList.includes(finalCat)) { setCatsList(catsList.concat(finalCat)); }
                          setTC(finalCat);
                        }
                        
                        var newTermItem = { term: tText, definition: tDef, category: finalCat, type: isZh ? 'zh2en' : 'en2zh', time: new Date().getTime() };
                        var savedTerms = JSON.parse(localStorage.getItem('catti_my_terms') || '[]');
                        savedTerms.push(newTermItem);
                        localStorage.setItem('catti_my_terms', JSON.stringify(savedTerms));

                        setSaved(true); 
                      }, 
                      style: { flex: 1, borderRadius: 12, background: "#7c3aed", color: "#fff" } 
                    }, "💾 存入术语库")
                  )
                );
              })()
            )
        )
      )
    ) : null
  );
}

/* ============ PROFILE PAGE ============ */
/* ============ PROFILE PAGE (极简定制满血版) ============ */
function ProfilePage(p) {
  var ns = useState(p.profile.name || ""), name = ns[0], setName = ns[1];
  // 兼容原来的 school 字段，改为 location
  var ls = useState(p.profile.location || p.profile.school || ""), location = ls[0], setLocation = ls[1];
  var as2 = useState(p.profile.avatarIdx || 0), avatarIdx = as2[0], setAvatarIdx = as2[1];
  var sv = useState(false), saved = sv[0], setSaved = sv[1];
  
  // 💡 支持多项选择的目标科目
  var tg = useState(p.profile.targets || (p.profile.target ? [p.profile.target] : ["CATTI 二级口译"])), targetsSel = tg[0], setTargetsSel = tg[1];
  // 💡 用户自定义考试日期
  var ed = useState(p.profile.examDate || "2026-06-21"), examDateStr = ed[0], setExamDateStr = ed[1];
  
  var fileRef = useRef(null);

  var avatars = [
    "linear-gradient(135deg, #6366f1, #a855f7)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #22c55e, #14b8a6)",
    "linear-gradient(135deg, #ec4899, #8b5cf6)",
    "linear-gradient(135deg, #3b82f6, #06b6d4)",
    "linear-gradient(135deg, #f97316, #eab308)"
  ];
  var initials = (name || "U").charAt(0).toUpperCase();
  var availableTargets = ["CATTI 二级口译", "CATTI 三级口译", "CATTI 二级笔译", "CATTI 三级笔译"];
  
  // 💡 动态计算倒数天数
  var examDateObj = new Date(examDateStr);
  var today = new Date();
  today.setHours(0, 0, 0, 0); // 抹平具体时间差，只算天数
  var daysLeft = Math.max(0, Math.ceil((examDateObj - today) / (1000 * 60 * 60 * 24)));

  // 全局头像
  var currentAvatar = p.globalAvatar;

  // 上传本地图片做头像
  function handleFileChange(e) {
    var files = e.target.files;
    if (files && files[0]) {
      var url = URL.createObjectURL(files[0]);
      p.onAvatarChange(url); // 立即通知外部大厅换头像！
    }
  }

  function triggerUpload() {
    if (fileRef.current) fileRef.current.click();
  }

  function handleSave() {
    setSaved(true);
    // 把新的数据结构传出去，外面的 Sidebar 就能立刻拿到新昵称！
    p.onSave({ name: name, location: location, avatarIdx: avatarIdx, targets: targetsSel, examDate: examDateStr });
    setTimeout(function() { setSaved(false); }, 2000);
  }

  // 切换多选目标科目
  function toggleTarget(t) {
    if (targetsSel.includes(t)) {
      if (targetsSel.length > 1) { // 保证至少留一个
        setTargetsSel(targetsSel.filter(function(item) { return item !== t; }));
      }
    } else {
      setTargetsSel(targetsSel.concat(t));
    }
  }

  var fileInput = React.createElement("input", {
    ref: fileRef, type: "file", accept: "image/*",
    onChange: handleFileChange,
    style: { display: "none" }
  });

  // 渲染头像
  var avatarEl = null;
  if (currentAvatar) {
    avatarEl = React.createElement("div", {
      onClick: triggerUpload,
      style: {
        width: 96, height: 96, borderRadius: "50%", overflow: "hidden",
        margin: "0 auto 16px", cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "3px solid #fff"
      }
    }, React.createElement("img", {
      src: currentAvatar, alt: "avatar",
      style: { width: "100%", height: "100%", objectFit: "cover", display: "block" }
    }));
  } else {
    avatarEl = React.createElement("div", {
      onClick: triggerUpload,
      style: {
        width: 96, height: 96, borderRadius: "50%", background: avatars[avatarIdx],
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px", fontSize: 40, fontWeight: 800, color: "#fff",
        boxShadow: "0 8px 24px rgba(99,102,241,0.25)", cursor: "pointer"
      }
    }, initials);
  }

  var targetDisplay = targetsSel.join("、");

  return React.createElement("div", { style: { padding: "32px 24px", maxWidth: 640, margin: "0 auto" } },
    fileInput,
    React.createElement("h1", { style: { fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 4px" } }, "个人中心"),
    React.createElement("p", { style: { color: "#999", fontSize: 14, margin: "0 0 28px" } }, "管理你的备考与考试信息"),

    // 💡 超大倒计时卡片
    React.createElement(Motion, { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
      React.createElement(Card, { style: { padding: "28px 32px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "6px solid #7c3aed" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 8 } }, "距离 " + targetDisplay + " 考试"),
          React.createElement("div", { style: { fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 } }, 
             "我的考试日：",
             React.createElement("input", {
                 type: "date",
                 value: examDateStr,
                 onChange: function(e) { setExamDateStr(e.target.value); },
                 style: { border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", outline: "none", color: "#7c3aed", fontWeight: "bold", fontFamily: "inherit", background: "#f3f0ff", cursor: "pointer" }
             })
          )
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6 } },
          React.createElement("span", { style: { fontSize: 48, fontWeight: 900, color: daysLeft <= 30 ? "#ef4444" : "#7c3aed", lineHeight: 1 } }, isNaN(daysLeft) ? "-" : daysLeft),
          React.createElement("span", { style: { fontSize: 16, fontWeight: 700, color: "#94a3b8" } }, "天")
        )
      )
    ),

    React.createElement(Motion, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 200, damping: 22 } },
      React.createElement(Card, { style: { padding: 36 } },
        React.createElement("div", { style: { textAlign: "center", marginBottom: 28 } },
          avatarEl,
          React.createElement("p", { style: { fontSize: 12, color: "#bbb", marginBottom: 12 } }, "点击头像上传本地照片"),
          !currentAvatar ? React.createElement("div", null,
            React.createElement("p", { style: { fontSize: 12, color: "#999", marginBottom: 8 } }, "或选择纯色主题"),
            React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 8 } },
              avatars.map(function(bg, i) {
                return React.createElement(Motion, { key: i, animate: { scale: avatarIdx === i ? 1.2 : 1 }, whileHover: { scale: 1.15 }, whileTap: { scale: 0.9 }, transition: { type: "spring", stiffness: 400, damping: 17 } },
                  React.createElement("div", { onClick: function() { setAvatarIdx(i); }, style: {
                    width: 28, height: 28, borderRadius: "50%", background: bg, cursor: "pointer",
                    border: avatarIdx === i ? "3px solid #111" : "3px solid transparent", transition: "border-color 0.2s"
                  } }));
              }))) : null
        ),

        React.createElement(UInput, { label: "我的昵称 (Nickname)", value: name, onChange: function(e) { setName(e.target.value); } }),
        React.createElement(UInput, { label: "考试地点 (Exam Location)", value: location, onChange: function(e) { setLocation(e.target.value); } }),
        
        // 💡 全新多选科目胶囊
        React.createElement("div", { style: { position: "relative", marginBottom: 32 } },
          React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, display: "block", marginBottom: 12 } }, "备考科目 (可多选)"),
          React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
            availableTargets.map(function(t) {
              var isSelected = targetsSel.includes(t);
              return React.createElement(Motion, { key: t, animate: { scale: 1 }, whileHover: { scale: 1.03 }, whileTap: { scale: 0.95 } },
                React.createElement("button", {
                  onClick: function() { toggleTarget(t); },
                  style: {
                    padding: "10px 18px", borderRadius: 20, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    background: isSelected ? "#111" : "#f1f5f9", color: isSelected ? "#fff" : "#64748b",
                    boxShadow: isSelected ? "0 4px 10px rgba(0,0,0,0.15)" : "none", transition: "all 0.2s", fontFamily: "inherit"
                  }
                }, t)
              );
            })
          )
        ),

        React.createElement("div", { style: { marginTop: 12 } },
          saved
            ? React.createElement(Motion, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", stiffness: 400, damping: 15 } },
                React.createElement("div", { style: {
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px", borderRadius: 12, background: "#f0fdf4", color: "#22c55e", fontWeight: 800, fontSize: 15
                } }, React.createElement("span", { style: { fontSize: 22 } }, "✅"), "保存成功！信息已同步"))
            : React.createElement(Btn, { onClick: handleSave, style: { width: "100%", padding: "16px", borderRadius: 12, fontSize: 16 } }, "保存所有修改"))
      )
    )
  );
}
/* ============ COLLECTION PAGE (精美收藏夹满血版) ============ */
function CollectionPage(p) {
  var fs = useState([]), favs = fs[0], setFavs = fs[1];

  React.useEffect(function() {
    var data = JSON.parse(localStorage.getItem("catti_favs") || "[]");
    data.sort(function(a, b) { return b.id - a.id; });
    setFavs(data);
  }, []);

  var handleRemove = function(id) {
    if (window.confirm("确定要将这道题移出收藏夹吗？")) {
      var newFavs = favs.filter(function(f) { return f.id !== id; });
      setFavs(newFavs);
      localStorage.setItem("catti_favs", JSON.stringify(newFavs));
    }
  };

  return React.createElement("div", { style: { padding: "40px 60px", maxWidth: 900, margin: "0 auto", textAlign: "left" } },
    React.createElement("h2", { style: { fontSize: 28, fontWeight: 800, marginBottom: 30, display: "flex", alignItems: "center", gap: 12, color: "#111" } }, 
      "🌟 我的私房错题本"
    ),
    favs.length === 0 ? 
      React.createElement(Card, { style: { padding: 80, textAlign: "center", color: "#94a3b8", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" } },
        React.createElement("div", { style: { fontSize: 56, marginBottom: 16 } }, "📭"),
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "#64748b", marginBottom: 8 } }, "收藏夹空空如也"),
        React.createElement("div", { style: { fontSize: 14 } }, "快去题库大厅或练习室，把值得复盘的考题 🌟 进来吧！")
      ) 
    : 
      favs.map(function(f, i) {
        var hasDeductions = f.report && f.report.paragraphEvaluations && f.report.paragraphEvaluations[0] && f.report.paragraphEvaluations[0].deductions && f.report.paragraphEvaluations[0].deductions.length > 0;
        return React.createElement(Card, { key: f.id || i, style: { padding: 30, marginBottom: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.06)", borderTop: "6px solid #f59e0b" } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid #f1f5f9", paddingBottom: 20 } },
            React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" } },
              React.createElement("span", { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "6px 14px", borderRadius: 12, fontSize: 14, fontWeight: 800 } }, "🏷️ " + (f.source || "未知出处")),
              React.createElement("span", { style: { background: "#f3f0ff", color: "#7c3aed", border: "1px solid #e0e7ff", padding: "6px 14px", borderRadius: 12, fontSize: 14, fontWeight: 800 } }, "📄 " + (f.title || "片段")),
              React.createElement("span", { style: { color: "#94a3b8", fontSize: 13, fontWeight: 600, marginLeft: 8 } }, "🕒 " + f.date)
            ),
            React.createElement(Btn, { variant: "ghost", onClick: function(){ handleRemove(f.id); }, style: { color: "#ef4444", padding: "8px 16px", borderRadius: 12, background: "#fef2f2" } }, "🗑 取消收藏")
          ),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } },
            React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#64748b", marginBottom: 8 } }, "原文参考"), React.createElement("div", { style: { fontSize: 15, color: "#333", background: "#f8fafc", padding: 18, borderRadius: 12, lineHeight: 1.8 } }, f.originalText)),
            React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#ef4444", marginBottom: 8 } }, "当时我的译文"), React.createElement("div", { style: { fontSize: 15, color: "#333", background: "#fef2f2", padding: 18, borderRadius: 12, lineHeight: 1.8 } }, f.myTranslation)),
            f.referenceText && f.referenceText.indexOf("暂无官方参考答案") === -1 ? React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#22c55e", marginBottom: 8 } }, "官方标准答案"), React.createElement("div", { style: { fontSize: 15, color: "#333", background: "#f0fdf4", padding: 18, borderRadius: 12, lineHeight: 1.8 } }, f.referenceText)) : null
          ),
          hasDeductions ? React.createElement("div", { style: { marginTop: 24, paddingTop: 20, borderTop: "2px dashed #e2e8f0" } },
            React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#ef4444", marginBottom: 16 } }, "🎯 错题复盘 (当时扣分点)"),
            f.report.paragraphEvaluations[0].deductions.map(function(d, idx) {
              return React.createElement("div", { key: idx, style: { fontSize: 14, color: "#333", background: "#fff", border: "1px solid #fecaca", padding: "16px", borderRadius: 12, marginBottom: 12 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 } }, React.createElement("span", { style: { fontWeight: 800, color: "#ef4444" } }, "❌ " + (d.type || "细节错误")), React.createElement("span", { style: { fontWeight: 900, color: "#ef4444", background: "#fee2e2", padding: "2px 8px", borderRadius: 6 } }, "-" + (d.penalty||1) + " 分")),
                React.createElement("div", { style: { marginBottom: 6 } }, React.createElement("span", { style: { color: "#94a3b8", fontWeight: 700 } }, "原译："), React.createElement("span", { style: { textDecoration: "line-through", color: "#ef4444" } }, d.original)),
                React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("span", { style: { color: "#22c55e", fontWeight: 700 } }, "正解："), React.createElement("span", { style: { fontWeight: 600 } }, d.correction)),
                React.createElement("div", { style: { fontSize: 13, color: "#64748b", background: "#f8fafc", padding: "8px 12px", borderRadius: 8 } }, "💡 " + d.reason)
              );
            })
          ) : null
        );
      })
  );
}

/* ============ HISTORY PAGE (专业学习数据看板满血版) ============ */
/* ============ HISTORY PAGE (专业学习数据看板满血版) ============ */
/* ============ HISTORY PAGE (含精准类别分布 & 得分曲线满血版) ============ */
/* ============ HISTORY PAGE (高精度曲线 & 垂直网格线版) ============ */
/* ============ HISTORY PAGE (百分比分布 & 实心圆点满血版) ============ */
function HistoryPage(p) {
  var ts = useState("week"), timeRange = ts[0], setTimeRange = ts[1];

  // 1. 模拟历史记录数据
  var histData = [
    { id: 12, date: "2026-03-20 14:30", title: "2022 春季 二级口译", duration: 2000, cat: "二口", score: 75 },
    { id: 11, date: "2026-03-22 19:20", title: "2022 秋季 三级笔译", duration: 2400, cat: "三笔", score: 79 },
    { id: 10, date: "2026-03-25 09:30", title: "2024 春季 二级笔译", duration: 3600, cat: "二笔", score: 85 },
    { id: 9,  date: "2026-03-28 16:45", title: "练习室 - 政治类语料", duration: 1200, cat: "练习室", score: 90 },
    { id: 8,  date: "2026-03-29 20:00", title: "2023 春季 三级口译", duration: 1540, cat: "三口", score: 76 },
    { id: 7,  date: "2026-03-30 10:15", title: "练习室 - 经济类实战", duration: 850,  cat: "练习室", score: 88 },
    { id: 6,  date: "2026-04-01 14:30", title: "2023 秋季 二级口译", duration: 2100, cat: "二口", score: 82 },
    { id: 5,  date: "2026-04-02 10:15", title: "2024 春季 二级笔译", duration: 3500, cat: "二笔", score: 78 },
    { id: 4,  date: "2026-04-03 14:30", title: "2024 秋季 二级口译", duration: 2150, cat: "二口", score: 88 }
  ];

  // 2. 基础数据计算
  var totalSecs = histData.reduce(function(acc, cur) { return acc + cur.duration; }, 0);
  var totalHours = (totalSecs / 3600).toFixed(1);
  var avgScore = Math.round(histData.reduce(function(acc, cur) { return acc + cur.score; }, 0) / histData.length);

  var catCounts = { "二口": 0, "三口": 0, "二笔": 0, "三笔": 0, "练习室": 0 };
  histData.forEach(function(d) {
    if (catCounts[d.cat] !== undefined) catCounts[d.cat]++;
  });

  var catColors = { "二口": "#3b82f6", "三口": "#8b5cf6", "二笔": "#10b981", "三笔": "#f59e0b", "练习室": "#ec4899" };

  var chartData = [];
  if (timeRange === "week") chartData = [{l:"周一",v:40},{l:"周二",v:80},{l:"周三",v:30},{l:"周四",v:100},{l:"周五",v:60},{l:"周六",v:20},{l:"周日",v:90}];
  else if (timeRange === "month") chartData = [{l:"第一周",v:120},{l:"第二周",v:150},{l:"第三周",v:90},{l:"第四周",v:180}];
  else if (timeRange === "year") chartData = [{l:"1月",v:400},{l:"2月",v:300},{l:"3月",v:500},{l:"4月",v:200},{l:"5月",v:0},{l:"6月",v:0}];
  else chartData = [{l:"08:00",v:20},{l:"12:00",v:60},{l:"16:00",v:10},{l:"20:00",v:40}];
  var maxChartVal = Math.max.apply(null, chartData.map(function(d){return d.v;})) || 1;

  function fmtDur(secs) {
    var m = Math.floor(secs / 60); var s = secs % 60;
    return m + "分" + (s < 10 ? "0"+s : s) + "秒";
  }

  // =========================================
  // 🎯 高精度 SVG 折线图绘制引擎 (小实心圆点)
  // =========================================
  var allDates = [];
  histData.forEach(function(d) { var dt = d.date.split(" ")[0]; if(allDates.indexOf(dt) === -1) allDates.push(dt); });
  allDates.sort(); 
  var maxDates = Math.max(allDates.length - 1, 1);

  var w = 800, h = 280; 
  var padT = 40, padB = 40, padL = 40, padR = 40;
  var dW = w - padL - padR, dH = h - padT - padB;

  var yLines = [60, 70, 80, 90, 100].map(function(val) {
    var pct = (val - 60) / 40; 
    var y = padT + dH - pct * dH;
    return React.createElement("g", { key: val },
      React.createElement("line", { x1: padL, y1: y, x2: w - padR, y2: y, stroke: "#f1f5f9", strokeWidth: 1.5, strokeDasharray: "4 4" }),
      React.createElement("text", { x: padL - 10, y: y + 4, fill: "#94a3b8", fontSize: 12, fontWeight: 700, textAnchor: "end", fontFamily: "monospace" }, val)
    );
  });

  var xLines = allDates.map(function(d, i) {
    var x = padL + (i / maxDates) * dW;
    return React.createElement("g", { key: d },
      React.createElement("line", { x1: x, y1: padT, x2: x, y2: padT + dH, stroke: "#f8fafc", strokeWidth: 2 }),
      React.createElement("text", { x: x, y: h - 10, fill: "#94a3b8", fontSize: 12, fontWeight: 700, textAnchor: "middle" }, d.slice(5))
    );
  });

  var linePaths = Object.keys(catCounts).map(function(cat) {
    if (catCounts[cat] === 0) return null; 
    var pts = [];
    allDates.forEach(function(d, i) {
      var dayData = histData.filter(function(hd) { return hd.cat === cat && hd.date.indexOf(d) === 0; });
      if (dayData.length > 0) {
        var avg = dayData.reduce(function(acc, cur) { return acc + cur.score; }, 0) / dayData.length;
        var pct = Math.max(0, Math.min((avg - 60) / 40, 1)); 
        var x = padL + (i / maxDates) * dW;
        var y = padT + dH - pct * dH;
        pts.push({ x: x, y: y, score: Math.round(avg) });
      }
    });
    if (pts.length === 0) return null;
    var color = catColors[cat];

    return React.createElement("g", { key: cat },
      // 💡 略微调细折线，让整个图表显得更清爽精致
      pts.length > 1 ? React.createElement("polyline", { points: pts.map(function(p){return p.x+","+p.y;}).join(" "), fill: "none", stroke: color, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", opacity: 0.85 }) : null,
      
      pts.map(function(pt, idx) {
        return React.createElement("g", { key: idx },
          // 💡 换成小巧的“实心”圆点 (半径缩小到 4，用颜色填满)
          React.createElement("circle", { cx: pt.x, cy: pt.y, r: 4, fill: color, style: { cursor: "pointer", transition: "all 0.2s" } },
            React.createElement("title", null, cat + " 平均得分: " + pt.score + "分")
          ),
          React.createElement("text", { x: pt.x, y: pt.y - 12, fill: color, fontSize: 14, fontWeight: 900, textAnchor: "middle", style: { textShadow: "0px 2px 4px rgba(255,255,255,0.8)" } }, pt.score)
        );
      })
    );
  });

  return React.createElement("div", { style: { padding: "32px 40px", maxWidth: 1000, margin: "0 auto", textAlign: "left" } },
    
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 } },
      React.createElement("div", null,
        React.createElement("h2", { style: { fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 8px" } }, "📊 学习数据中心"),
        React.createElement("p", { style: { color: "#64748b", margin: 0, fontSize: 14 } }, "所有的伟大，都源于每一次的坚持")
      ),
      React.createElement("div", { style: { display: "flex", background: "#f1f5f9", padding: 4, borderRadius: 12 } },
        [{k:"day",l:"今日"},{k:"week",l:"本周"},{k:"month",l:"本月"},{k:"year",l:"全年"}].map(function(t) {
          var isSel = timeRange === t.k;
          return React.createElement("button", { 
            key: t.k, onClick: function() { setTimeRange(t.k); },
            style: { padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: isSel ? 700 : 600, background: isSel ? "#fff" : "transparent", color: isSel ? "#7c3aed" : "#64748b", boxShadow: isSel ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }
          }, t.l);
        })
      )
    ),

    // ✅ 这里的修改：去掉练习次数，把平均分改为四类网格
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 20, marginBottom: 24 } },
      
      // 1. 累计练习时长 (保留)
      React.createElement(Card, { style: { padding: 24, display: "flex", alignItems: "center", gap: 16 } },
        React.createElement("div", { style: { width: 56, height: 56, borderRadius: 16, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 } }, "⏱️"),
        React.createElement("div", null,
          React.createElement("div", { style: { color: "#64748b", fontSize: 13, fontWeight: 700, marginBottom: 4 } }, "累计练习时长"),
          React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } },
            React.createElement("span", { style: { fontSize: 28, fontWeight: 900, color: "#3b82f6", lineHeight: 1 } }, totalHours),
            React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "#94a3b8" } }, "小时")
          )
        )
      ),

      // 2. 四类平均分网格 (替换掉原来的“次数”和“总平均分”)
      React.createElement(Card, { style: { padding: 20 } },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
          [
            { l: "二口平均分", v: 82, c: "#3b82f6" },
            { l: "三口平均分", v: 75, c: "#8b5cf6" },
            { l: "二笔平均分", v: 88, c: "#10b981" },
            { l: "三笔平均分", v: 80, c: "#f59e0b" }
          ].map(function(item) {
            return React.createElement("div", { key: item.l, style: { background: "#f8fafc", padding: "12px", borderRadius: 12, border: "1px solid #f1f5f9" } },
              React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 700 } }, item.l),
              React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } },
                React.createElement("span", { style: { fontSize: 22, fontWeight: 900, color: item.c } }, item.v),
                React.createElement("span", { style: { fontSize: 11, color: "#cbd5e1" } }, "分")
              )
            );
          })
        )
      )
    ),

    React.createElement("div", { style: { display: "flex", gap: 20, marginBottom: 24 } },
      React.createElement(Card, { style: { flex: 2, padding: 24 } },
        React.createElement("h3", { style: { fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 24px" } }, "📈 练习时长趋势"),
        React.createElement("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 180, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" } },
          chartData.map(function(d, i) {
            var h = (d.v / maxChartVal) * 100;
            return React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 } },
              React.createElement("div", { style: { width: "40%", maxWidth: 36, height: h + "%", background: "linear-gradient(180deg, #a855f7, #7c3aed)", borderRadius: "6px 6px 0 0", opacity: d.v === 0 ? 0 : 1, transition: "height 0.5s cubic-bezier(0.4, 0, 0.2, 1)" } }),
              React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", fontWeight: 600 } }, d.l)
            );
          })
        )
      ),

      React.createElement(Card, { style: { flex: 1, padding: 24 } },
        React.createElement("h3", { style: { fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 20px" } }, "🎯 练习类型分布"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } },
          Object.keys(catCounts).map(function(k) {
            if(catCounts[k] === 0) return null;
            // 💡 改成百分比显示
            var pct = (catCounts[k] / (histData.length || 1)) * 100;
            var color = catColors[k] || "#64748b";
            return React.createElement("div", { key: k },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#475569", marginBottom: 8 } }, 
                React.createElement("span", null, k), 
                React.createElement("span", null, pct.toFixed(1) + "%")
              ),
              React.createElement("div", { style: { height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" } }, 
                React.createElement("div", { style: { width: pct + "%", height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" } })
              )
            );
          })
        )
      )
    ),

    React.createElement(Motion, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
      React.createElement(Card, { style: { padding: "28px 24px", marginBottom: 32 } },
        React.createElement("h3", { style: { fontSize: 16, fontWeight: 800, color: "#111", margin: "0 0 16px", textAlign: "center" } }, "🏆 各科目历史得分曲线"),
        
        React.createElement("div", { style: { display: "flex", gap: 20, justifyContent: "center", marginBottom: 24 } },
          Object.keys(catCounts).map(function(k) {
            if(catCounts[k]===0) return null;
            return React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#475569" } },
              React.createElement("span", { style: { width: 12, height: 12, background: catColors[k], borderRadius: "50%" } }), k
            );
          })
        ),
        
        React.createElement("div", { style: { width: "100%", overflowX: "auto" } },
          React.createElement("svg", { viewBox: "0 0 " + w + " " + h, style: { width: "100%", minWidth: 600, height: "auto", display: "block" } },
            yLines, xLines, linePaths
          )
        )
      )
    ),

    React.createElement("h3", { style: { fontSize: 18, fontWeight: 800, color: "#111", margin: "0 0 20px" } }, "📋 最近练习记录"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
      histData.slice().reverse().map(function(row, idx) {
        return React.createElement(Card, { key: row.id, style: { padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid " + (catColors[row.cat] || "#7c3aed") } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 20 } },
            React.createElement("div", { style: { width: 50, textAlign: "center" } },
              React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", fontWeight: 700 } }, row.date.split(" ")[0].slice(5)),
              React.createElement("div", { style: { fontSize: 14, color: "#111", fontWeight: 800 } }, row.date.split(" ")[1])
            ),
            React.createElement("div", { style: { width: 1, height: 30, background: "#e2e8f0" } }),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 4 } }, row.title),
              React.createElement("span", { style: { fontSize: 12, color: catColors[row.cat], background: catColors[row.cat]+"15", padding: "4px 10px", borderRadius: 6, fontWeight: 800 } }, row.cat)
            )
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 32 } },
            React.createElement("div", { style: { textAlign: "right" } },
              React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 2 } }, "用时"),
              React.createElement("div", { style: { fontSize: 15, color: "#333", fontWeight: 800, fontFamily: "monospace" } }, fmtDur(row.duration))
            ),
            React.createElement("div", { style: { textAlign: "right", width: 60 } },
              React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 2 } }, "得分"),
              React.createElement("div", { style: { fontSize: 20, color: row.score >= 80 ? "#10b981" : "#f59e0b", fontWeight: 900 } }, row.score)
            )
          )
        );
      })
    )
  );
}
/* ============ MAIN APP ============ */
export default function App() {
  var ps = useState("login"), page = ps[0], setPage = ps[1];
  var ns = useState("dashboard"), nav = ns[0], setNav = ns[1];
  var pa = useState(true), anim = pa[0], setAnim = pa[1];
  var ed = useState(null), examCtx = ed[0], setExamCtx = ed[1];
  var sd = useState(null), scoreRes = sd[0], setScoreRes = sd[1];
  var wd = useState(null), wCtx = wd[0], setWCtx = wd[1];
  var pf = useState({ name: "学习者", school: "北京外国语大学", avatarIdx: 0, avatarUrl: null, target: "CATTI 二级口译", dailyGoal: "3" }), profile = pf[0], setProfile = pf[1];
  var av = useState(null), globalAvatar = av[0], setGlobalAvatar = av[1];

  function go(pg) { setAnim(false); setTimeout(function() { setPage(pg); setAnim(true); }, 150); }
  function startExam(ctx) { setExamCtx(ctx); go("exam"); }
  function submitExam(score, wData) { setScoreRes(score); setWCtx(wData || null); go("result"); }

  if (page === "login") return React.createElement(LoginPage, { onLogin: function() { go("main"); }, initialMode: "login" });
  if (page === "loginRegister") return React.createElement(LoginPage, { onLogin: function() { go("main"); }, initialMode: "register" });

  if (page === "exam" && examCtx) {
    if (examCtx.type === "interpreting") return React.createElement(InterpExam, { examData: examCtx.data, onSubmit: function(s) { submitExam(s, null); }, onBack: function() { go("main"); } });
    return React.createElement(TransExam, { examData: examCtx.data, onSubmit: function(s, w) { submitExam(s, w); }, onBack: function() { go("main"); } });
  }

  if (page === "result" && scoreRes) return React.createElement("div", { style: { minHeight: "100vh", background: "#fafafa" } },
    React.createElement(ResultPage, { scoreData: scoreRes, writtenData: wCtx, onBack: function() { go("main"); } }));

  var mainContent = null;
  if (nav === "dashboard") mainContent = React.createElement(DashboardPage, { onStartExam: startExam });
  else if (nav === "practice") mainContent = React.createElement(PracticeRoom, null);
  else if (nav === "terms") mainContent = React.createElement(TermsPage, null);
  else if (nav === "favorites") mainContent = React.createElement(CollectionPage, null);
  else if (nav === "history") mainContent = React.createElement(HistoryPage, null);
  else if (nav === "profile") mainContent = React.createElement(ProfilePage, {
    profile: profile,
    globalAvatar: globalAvatar,
    onSave: function(data) { setProfile(Object.assign({}, profile, data)); },
    onAvatarChange: function(url) { setGlobalAvatar(url); },
    onLogout: function() { setGlobalAvatar(null); setProfile({ name: "学习者", school: "北京外国语大学", avatarIdx: 0, target: "CATTI 二级口译", dailyGoal: "3" }); setNav("dashboard"); go("login"); },
    onAddAccount: function() { setGlobalAvatar(null); setProfile({ name: "学习者", school: "北京外国语大学", avatarIdx: 0, target: "CATTI 二级口译", dailyGoal: "3" }); setNav("dashboard"); go("loginRegister"); }
  });

  return React.createElement("div", { style: { display: "flex", minHeight: "100vh", fontFamily: "'Inter',-apple-system,'Segoe UI',sans-serif", background: "#fafafa" } },
    React.createElement(Sidebar, { active: nav, onChange: setNav, userName: profile.name, avatarUrl: globalAvatar, onProfile: function() { setNav("profile"); } }),
    React.createElement(Motion, { animate: { opacity: anim ? 1 : 0 }, transition: { duration: 0.2 }, style: { flex: 1, minHeight: "100vh", overflowY: "auto" } }, mainContent));
}