import { useEffect, useState, useMemo, useRef } from "react";

/* =========================================================
   소망교회 — 설교 통합 목업 (5 페이지)
   - 모든 페이지 max-width: 1280px
   - 전체 설교 페이지: PC 좌측 필터 사이드바 (240px)
   - 모바일: BottomSheet 필터
   - 라우팅: state 기반
   ========================================================= */

const PRIMITIVE = {
  beige: { 50: "#FAFAF8", 100: "#F5F4F2", 150: "#F2F0EB", 200: "#F0EEE9", 300: "#E8E6E1" },
  gray:  { 400: "#9CA3AF", 500: "#6B7280", 700: "#374151", 900: "#111827" },
  white: "#FFFFFF",
  navy:  { 900: "#0A1218", 700: "#1C2B3A", 500: "#2C3E50", 300: "#3D5166" },
  gold:  { 500: "#C4924A", 100: "#F5EDE0" },
  cream: { 500: "#F5F0E6", 700: "#EDE6D7" },
};

const C = {
  bg: PRIMITIVE.beige[50], surface: PRIMITIVE.white, surfaceAlt: PRIMITIVE.beige[100],
  darkDeep: PRIMITIVE.navy[900], dark: PRIMITIVE.navy[700],
  primary: PRIMITIVE.navy[500], primaryHover: PRIMITIVE.navy[300], primaryLight: PRIMITIVE.beige[200],
  gold: PRIMITIVE.gold[500], goldLight: PRIMITIVE.gold[100],
  toneSoft: "#FAF6EE",
  text: PRIMITIVE.gray[900], textSec: PRIMITIVE.gray[700], textTer: PRIMITIVE.gray[500],
  border: PRIMITIVE.beige[200], borderLight: PRIMITIVE.beige[150],
};

const PAGE_MAX = 1280;
const PAGE_PAD = 56;

const MAIN_NAV = ["교회 소개", "예배 안내", "말씀", "양육과 교육", "커뮤니티"];

/* =========================================================
   데이터
   ========================================================= */

const SERIES_DATA = {
  "series-001": { id: "series-001", slug: "sermon-on-the-mount", title: "산상수훈 강해",
    description: "예수님께서 갈릴리 산 위에서 전하신 가르침을 한 본문씩 깊이 묵상합니다.",
    preacher: "김도현 목사", started_at: "2026-01-12", ended_at: null,
    is_active: true, cover_tone: "warm", progress: 8, total: 24 },
  "series-002": { id: "series-002", slug: "psalms-of-david", title: "다윗의 시편",
    description: "다윗이 인생의 굴곡 속에서 하나님께 드린 노래와 기도를 함께 읽습니다.",
    preacher: "이상민 부목사", started_at: "2025-09-07", ended_at: null,
    is_active: true, cover_tone: "cool", progress: 12, total: 18 },
  "series-003": { id: "series-003", slug: "acts", title: "사도행전 강해",
    description: "초대 교회가 어떻게 세워졌는가, 성령의 역사를 따라가는 여정입니다.",
    preacher: "박지영 부목사", started_at: "2026-03-08", ended_at: null,
    is_active: true, cover_tone: "earth", progress: 5, total: 28 },
  "series-004": { id: "series-004", slug: "romans", title: "로마서 강해",
    description: "복음의 핵심을 다루는 로마서를 한 본문씩 강해한 시리즈입니다.",
    preacher: "김도현 목사", started_at: "2024-01-07", ended_at: "2025-12-28",
    is_active: false, cover_tone: "warm", progress: 26, total: 26 },
  "series-005": { id: "series-005", slug: "john", title: "요한복음 강해",
    description: "예수님의 정체성과 사역을 깊이 묵상한 요한복음 강해 시리즈입니다.",
    preacher: "이상민 부목사", started_at: "2024-03-03", ended_at: "2025-08-31",
    is_active: false, cover_tone: "cool", progress: 21, total: 21 },
};

const SERMONS_DATA = [
  { id: 1, title: "심령이 가난한 자는 복이 있나니", sermon_date: "2026-05-05",
    preacher: { name: "김도현", title: "담임목사" }, series_id: "series-001", series_order: 8,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "42:00",
    scripture: "마태복음 5:3", scripture_text: "심령이 가난한 자는 복이 있나니 천국이 그들의 것임이요",
    summary: "예수님이 산상수훈에서 처음 선포하신 복은 '심령이 가난한 자'를 향한 것이었습니다.\n\n이 복은 우리의 약함과 부족함을 인정할 때 시작됩니다. 자기 안의 빈 자리를 솔직히 마주하는 사람만이 하나님께 자리를 내어드릴 수 있기 때문입니다.\n\n오늘 본문에서 예수님은 천국을 소유하는 사람들에 대해 말씀하십니다. 가난한 자, 부족한 자, 자신의 한계를 아는 자. 그들이 바로 천국의 주인이라고 선언하시는 것입니다.",
    service_type: "주일오전예배", is_featured: true },
  { id: 2, title: "애통하는 자는 복이 있나니", sermon_date: "2026-04-28",
    preacher: { name: "김도현", title: "담임목사" }, series_id: "series-001", series_order: 7,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "39:00",
    scripture: "마태복음 5:4", scripture_text: "애통하는 자는 복이 있나니 그들이 위로를 받을 것임이요",
    summary: "예수님은 두 번째 복으로 '애통하는 자'를 말씀하셨습니다.", service_type: "주일오전예배" },
  { id: 3, title: "온유한 자는 복이 있나니", sermon_date: "2026-04-21",
    preacher: { name: "김도현", title: "담임목사" }, series_id: "series-001", series_order: 6,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "41:00",
    scripture: "마태복음 5:5", scripture_text: "온유한 자는 복이 있나니 그들이 땅을 기업으로 받을 것임이요",
    summary: "온유는 약함이 아니라 길들여진 힘입니다.", service_type: "주일오전예배" },
  { id: 4, title: "부활의 첫 열매", sermon_date: "2026-04-14",
    preacher: { name: "김도현", title: "담임목사" }, series_id: null, series_order: null,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "45:00",
    scripture: "고린도전서 15:20", scripture_text: "그러나 이제 그리스도께서 죽은 자 가운데서 다시 살아나사 잠자는 자들의 첫 열매가 되셨도다",
    summary: "고린도전서 15장은 부활의 위대한 진리를 담고 있는 장입니다.\n\n바울은 그리스도의 부활이 모든 신자의 부활을 약속하는 첫 열매라고 선언합니다.", service_type: "주일오전예배" },
  { id: 5, title: "팔복의 서론", sermon_date: "2026-04-07",
    preacher: { name: "김도현", title: "담임목사" }, series_id: "series-001", series_order: 5,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "37:00",
    scripture: "마태복음 5:1-2", scripture_text: "예수께서 무리를 보시고 산에 올라가 앉으시니",
    summary: "산상수훈 시리즈를 시작하며 팔복의 전체 구조를 살펴봅니다.", service_type: "주일오전예배" },
  { id: 6, title: "겟세마네의 기도", sermon_date: "2026-03-31",
    preacher: { name: "이상민", title: "부목사" }, series_id: null, series_order: null,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "38:00",
    scripture: "마태복음 26:36-46", scripture_text: "내 아버지여 만일 할 만하시거든 이 잔을 내게서 지나가게 하옵소서",
    summary: "고난 주간을 앞두고 예수님의 겟세마네 기도를 깊이 묵상합니다.", service_type: "주일오전예배" },
  { id: 7, title: "주는 나의 목자시니", sermon_date: "2026-03-10",
    preacher: { name: "이상민", title: "부목사" }, series_id: "series-002", series_order: 12,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "36:00",
    scripture: "시편 23편", scripture_text: "여호와는 나의 목자시니 내가 부족함이 없으리로다",
    summary: "다윗의 가장 사랑받는 시 23편을 깊이 묵상합니다.", service_type: "주일오전예배" },
  { id: 8, title: "여호와는 나의 빛이요", sermon_date: "2026-03-03",
    preacher: { name: "이상민", title: "부목사" }, series_id: "series-002", series_order: 11,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "38:00",
    scripture: "시편 27편", scripture_text: "여호와는 나의 빛이요 나의 구원이시니",
    summary: "두려움 속에서 빛이 되시는 하나님을 노래합니다.", service_type: "주일오전예배" },
  { id: 9, title: "내가 산을 향하여", sermon_date: "2026-02-24",
    preacher: { name: "이상민", title: "부목사" }, series_id: "series-002", series_order: 10,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "40:00",
    scripture: "시편 121편", scripture_text: "내가 산을 향하여 눈을 들리라",
    summary: "순례자의 노래 - 도움이 어디서 올까.", service_type: "주일오전예배" },
  { id: 10, title: "성령강림의 날", sermon_date: "2026-04-05",
    preacher: { name: "박지영", title: "부목사" }, series_id: "series-003", series_order: 2,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "44:00",
    scripture: "사도행전 2:1-4", scripture_text: "오순절 날이 이미 이르매 그들이 다 같이 한 곳에 모였더니",
    summary: "성령강림의 사건과 그 의미를 살펴봅니다.", service_type: "주일오전예배" },
  { id: 11, title: "성령을 기다리는 자들", sermon_date: "2026-04-12",
    preacher: { name: "박지영", title: "부목사" }, series_id: "series-003", series_order: 1,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "42:00",
    scripture: "사도행전 1:1-11", scripture_text: "오직 성령이 너희에게 임하시면 너희가 권능을 받고",
    summary: "사도행전의 시작 - 성령을 기다리는 자들.", service_type: "주일오전예배" },
  { id: 12, title: "산 위의 가르침의 시작", sermon_date: "2026-02-09",
    preacher: { name: "김도현", title: "담임목사" }, series_id: "series-001", series_order: 4,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "40:00",
    scripture: "마태복음 4:23", scripture_text: "예수께서 온 갈릴리에 두루 다니사",
    summary: "산상수훈의 무대와 청중에 대한 배경.", service_type: "주일오전예배" },
  { id: 13, title: "복 있는 사람의 모습", sermon_date: "2026-02-02",
    preacher: { name: "김도현", title: "담임목사" }, series_id: "series-001", series_order: 3,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "38:00",
    scripture: "시편 1:1-3", scripture_text: "복 있는 사람은 악인들의 꾀를 따르지 아니하며",
    summary: "시편 1편을 통해 본 복 있는 사람의 모습.", service_type: "주일오전예배" },
  { id: 14, title: "예수의 십자가의 길", sermon_date: "2026-03-17",
    preacher: { name: "이상민", title: "부목사" }, series_id: null, series_order: null,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "44:00",
    scripture: "마가복음 15:21-32", scripture_text: "그들이 예수를 십자가에 못 박을 때에",
    summary: "고난 주간 예수님의 십자가의 길을 묵상합니다.", service_type: "주일오전예배" },
  { id: 15, title: "주를 찬양하라", sermon_date: "2026-02-17",
    preacher: { name: "이상민", title: "부목사" }, series_id: "series-002", series_order: 9,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "37:00",
    scripture: "시편 150편", scripture_text: "할렐루야 그의 성소에서 하나님을 찬양하며",
    summary: "시편의 마지막 - 모든 호흡 있는 자의 찬양.", service_type: "주일오전예배" },
  { id: 16, title: "초대 교회의 모습", sermon_date: "2026-03-29",
    preacher: { name: "박지영", title: "부목사" }, series_id: "series-003", series_order: 3,
    video_provider: "youtube", video_id: "dQw4w9WgXcQ", duration: "41:00",
    scripture: "사도행전 2:42-47", scripture_text: "그들이 사도의 가르침을 받아 서로 교제하고",
    summary: "초대 교회 공동체의 다섯 가지 특징.", service_type: "주일오전예배" },
];

function expandSermon(s) {
  return s ? { ...s, series: s.series_id ? SERIES_DATA[s.series_id] : null } : null;
}

const ALL_SERMONS = SERMONS_DATA.map(expandSermon);
const FEATURED_SERMON = ALL_SERMONS.find(s => s.is_featured);
const RECENT_SERMONS = ALL_SERMONS.filter(s => !s.is_featured)
  .sort((a, b) => b.sermon_date.localeCompare(a.sermon_date))
  .slice(0, 8);
const SERIES_PREVIEW = Object.values(SERIES_DATA).filter(s => s.is_active);

const PREACHERS = ["전체", "김도현 담임목사", "이상민 부목사", "박지영 부목사"];
const SERIES_FILTER_OPTIONS = ["전체", "산상수훈 강해", "다윗의 시편", "사도행전 강해", "로마서 강해", "요한복음 강해"];
const SORT_OPTIONS = ["최신순", "오래된순"];

const RESOURCES = [
  { id: "r1", title: "설교 원고", file_type: "pdf", file_size_bytes: 1240000 },
  { id: "r2", title: "묵상 가이드", file_type: "pdf", file_size_bytes: 580000 },
];

/* =========================================================
   유틸
   ========================================================= */

function formatDate(iso, format = "ymd") {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (format === "long") return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
  if (format === "short") return `${m}.${day}`;
  if (format === "ym") return `${y}.${m}`;
  return `${y}.${m}.${day}`;
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function getCoverGradient(tone) {
  const gradients = {
    warm: `linear-gradient(135deg, #C4924A 0%, #8B6532 100%)`,
    cool: `linear-gradient(135deg, #2C3E50 0%, #0A1218 100%)`,
    earth: `linear-gradient(135deg, #6B7280 0%, #374151 100%)`,
  };
  return gradients[tone] || gradients.warm;
}

function preacherFullName(p) {
  if (typeof p === "string") return p;
  return `${p.name} ${p.title}`;
}

/* =========================================================
   setup
   ========================================================= */

function useSetup() {
  useEffect(() => {
    const id = "church-sermon-all-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const id = "church-sermon-all-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      .v2-btn-primary { transition: background-color 0.18s ease; cursor: pointer; }
      .v2-btn-primary:hover { background-color: ${C.primaryHover} !important; }
      .v2-link { transition: color 0.18s ease; cursor: pointer; }
      .v2-link:hover { color: ${C.primary} !important; }
      .v2-nav-item { transition: color 0.18s ease; cursor: pointer; }
      .v2-nav-item:hover { color: ${C.primary} !important; }

      .video-thumb { cursor: pointer; transition: filter 0.2s ease; }
      .video-thumb:hover { filter: brightness(1.08); }
      .video-thumb:hover .play-circle { transform: scale(1.08); background: rgba(255,255,255,.2); }
      .play-circle { transition: transform 0.18s ease, background-color 0.18s ease; }
      .featured-card { cursor: pointer; }
      .featured-card:hover .play-circle { transform: scale(1.08); background: rgba(255,255,255,.18); }

      .sermon-card-grid { transition: border-color 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
      .sermon-card-grid:hover { border-color: #E0DBD0; box-shadow: 0 4px 12px rgba(0,0,0,.05); }
      .sermon-card-grid:hover .thumb-play { background: rgba(255,255,255,.22); transform: scale(1.06); }
      .thumb-play { transition: background-color 0.18s ease, transform 0.18s ease; }

      .series-grid-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
      .series-grid-card:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.07); }

      .episode-row { transition: background-color 0.15s ease; cursor: pointer; }
      .episode-row:hover { background-color: ${C.bg}; }
      .episode-row.is-current { background-color: ${C.toneSoft}; }
      .episode-row.is-current:hover { background-color: ${C.goldLight}; }
      .episode-row.is-unpublished { cursor: not-allowed; opacity: 0.45; }
      .episode-row.is-unpublished:hover { background-color: transparent; }

      .more-card { transition: border-color 0.15s ease, background-color 0.15s ease; cursor: pointer; }
      .more-card:hover { border-color: ${C.primary}; background-color: ${C.surface}; }

      .filter-chip { transition: background-color 0.15s ease; cursor: pointer; }
      .filter-chip:hover { background-color: ${C.surfaceAlt}; }

      .radio-opt { transition: background-color 0.15s ease; }
      .radio-opt:hover { background-color: ${C.bg}; }
      .radio-opt.is-selected:hover { background-color: ${C.primaryLight}; }

      .pagination-btn { transition: background-color 0.15s ease; cursor: pointer; }
      .pagination-btn:hover:not(:disabled) { background-color: ${C.surfaceAlt}; }
      .pagination-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .pagination-btn.is-active { background-color: ${C.primary}; color: #fff; }

      .icon-btn { transition: background-color 0.15s ease, color 0.15s ease; cursor: pointer; }
      .icon-btn:hover { background-color: ${C.surfaceAlt}; color: ${C.text}; }

      .resource-card { transition: border-color 0.15s ease, background-color 0.15s ease; cursor: pointer; }
      .resource-card:hover { border-color: ${C.primary}; background-color: ${C.bg}; }

      .other-sermon-row { transition: background-color 0.15s ease; cursor: pointer; }
      .other-sermon-row:hover { background-color: ${C.bg}; }

      .carousel { scrollbar-width: none; -ms-overflow-style: none; }
      .carousel::-webkit-scrollbar { display: none; }
      .carousel-arrow { transition: background-color 0.15s ease, color 0.15s ease; cursor: pointer; }
      .carousel-arrow:hover:not(:disabled) { background-color: ${C.surfaceAlt}; color: ${C.text}; }
      .carousel-arrow:disabled { opacity: 0.3; cursor: not-allowed; }

      .carousel-card { transition: border-color 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
      .carousel-card:hover { border-color: #E0DBD0; box-shadow: 0 4px 12px rgba(0,0,0,.05); }
      .carousel-card:hover .thumb-play { background: rgba(255,255,255,.22); transform: scale(1.06); }

      .sidebar-search-input::placeholder { color: ${C.textTer}; }

      .series-cta { transition: background-color 0.18s ease; }
      .series-cta:hover { background-color: ${C.primaryHover}; }

      @media (max-width: 1100px) {
        .recent-grid-3 { grid-template-columns: 1fr 1fr !important; }
        .series-grid-3 { grid-template-columns: 1fr 1fr !important; }
        .episodes-grid-2 { grid-template-columns: 1fr !important; }
        .all-sermons-layout { grid-template-columns: 1fr !important; }
        .youtube-layout { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 720px) {
        .recent-grid-3 { grid-template-columns: 1fr !important; }
        .series-grid-3 { grid-template-columns: 1fr !important; }
        .featured-card-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/* =========================================================
   공통: Nav / Footer / Mobile
   ========================================================= */

function PCNav({ onNavigate }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250,250,248,.96)", backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.borderLight}`,
    }}>
      <div style={{
        maxWidth: PAGE_MAX, margin: "0 auto", padding: `0 ${PAGE_PAD}px`,
        display: "flex", alignItems: "center", height: 68,
      }}>
        <div onClick={() => onNavigate?.("list")} style={{
          display: "flex", alignItems: "baseline", gap: 8, marginRight: 56, cursor: "pointer",
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>소망교회</span>
          <span style={{ fontSize: 11, color: C.textTer, letterSpacing: "0.1em", fontWeight: 500 }}>SOMANG CHURCH</span>
        </div>
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {MAIN_NAV.map((label, i) => (
            <button key={i}
              className={i === 2 ? undefined : "v2-nav-item"}
              onClick={() => i === 2 && onNavigate?.("list")}
              style={{
                padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
                background: i === 2 ? C.primaryLight : "transparent",
                color: i === 2 ? C.primary : C.textSec,
                fontSize: 15, fontWeight: i === 2 ? 600 : 500,
                fontFamily: "inherit",
              }}>{label}</button>
          ))}
        </div>
        <button className="v2-btn-primary" style={{
          padding: "9px 22px", borderRadius: 8, border: "none",
          background: C.primary, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit",
        }}>방문 등록</button>
      </div>
    </div>
  );
}

function PCFooter() {
  return (
    <div style={{ background: C.dark, color: "rgba(255,255,255,.6)" }}>
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: `32px ${PAGE_PAD}px 24px` }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,.1)",
        }}>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.5)" }}>
            <span style={{ fontWeight: 700, color: "rgba(255,255,255,.85)", marginRight: 14 }}>소망교회</span>
            서울시 마포구 소망로 123 · 02-1234-5678
          </div>
          <button style={{
            padding: "8px 14px", background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)", borderRadius: 6,
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>설교 알림 받기</button>
        </div>
        <div style={{
          paddingTop: 16, fontSize: 11, color: "rgba(255,255,255,.35)",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>© 2026 소망교회</span>
          <span>개인정보처리방침 · 이용약관</span>
        </div>
      </div>
    </div>
  );
}

function PCBreadcrumb({ items, maxW = PAGE_MAX }) {
  return (
    <div style={{
      background: C.bg, borderBottom: `1px solid ${C.borderLight}`,
      padding: `12px ${PAGE_PAD}px`,
    }}>
      <div style={{
        maxWidth: maxW, margin: "0 auto",
        fontSize: 12, color: C.textTer,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ opacity: 0.5 }}>›</span>}
            {item.onClick ? (
              <span className="v2-link" onClick={item.onClick}>{item.label}</span>
            ) : (
              <span style={{
                color: C.text, fontWeight: 600,
                maxWidth: 320, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function MHeader({ showBack, onBack, label }) {
  return (
    <div style={{
      background: C.surface, borderBottom: `1px solid ${C.borderLight}`,
      padding: "12px 16px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div onClick={showBack ? onBack : undefined} style={{
        display: "flex", alignItems: "center", gap: 8,
        cursor: showBack ? "pointer" : "default",
      }}>
        {showBack && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        )}
        <span style={{
          fontSize: showBack ? 13 : 16,
          color: showBack ? C.textSec : C.text,
          fontWeight: showBack ? 500 : 700,
          letterSpacing: showBack ? "normal" : "-0.02em",
        }}>{showBack ? (label || "뒤로") : "소망교회"}</span>
      </div>
      <button style={{
        background: "transparent", border: "none", cursor: "pointer", padding: 4, color: C.text,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

function MFooter() {
  return (
    <div style={{ background: C.dark, padding: "24px 20px 20px", color: "rgba(255,255,255,.6)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>소망교회</div>
      <div style={{ fontSize: 11, lineHeight: 1.7 }}>
        서울시 마포구 소망로 123<br/>02-1234-5678
      </div>
      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.1)",
        fontSize: 10, color: "rgba(255,255,255,.35)",
      }}>© 2026 소망교회</div>
    </div>
  );
}

function MBottomNav() {
  const items = [
    { id: "home", label: "홈" }, { id: "worship", label: "예배" },
    { id: "word", label: "말씀" }, { id: "community", label: "공동체" },
    { id: "more", label: "더보기" },
  ];
  return (
    <div style={{
      position: "sticky", bottom: 0, zIndex: 40,
      background: C.surface, borderTop: `1px solid ${C.borderLight}`,
      display: "grid", gridTemplateColumns: "repeat(5, 1fr)", height: 58,
    }}>
      {items.map(item => (
        <button key={item.id} style={{
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 3,
          fontSize: 10.5, fontWeight: 600,
          color: item.id === "word" ? C.primary : C.textTer,
          fontFamily: "inherit",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: item.id === "word" ? C.primary : C.textTer,
            opacity: item.id === "word" ? 1 : 0.4,
          }} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   공통 UI: VideoPlayer, SermonGridCard, SeriesGridCard
   ========================================================= */

function VideoPlayer({ sermon, size = "medium" }) {
  const [loaded, setLoaded] = useState(false);
  if (loaded) {
    const src = sermon.video_provider === "youtube"
      ? `https://www.youtube.com/embed/${sermon.video_id}?autoplay=1`
      : `https://player.vimeo.com/video/${sermon.video_id}?autoplay=1`;
    return (
      <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 14, overflow: "hidden" }}>
        <iframe src={src} style={{ width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen title={sermon.title} />
      </div>
    );
  }
  const playSize = size === "large" ? 88 : 72;
  const iconSize = size === "large" ? 28 : 22;
  return (
    <div className="video-thumb" onClick={(e) => { e.stopPropagation(); setLoaded(true); }}
      style={{
        background: `linear-gradient(135deg, ${C.dark}, ${C.darkDeep})`,
        position: "relative", aspectRatio: "16/9", borderRadius: 14, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
      <div className="play-circle" style={{
        width: playSize, height: playSize, borderRadius: "50%",
        background: "rgba(255,255,255,.14)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={C.gold} style={{ marginLeft: 3 }}>
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div style={{
        position: "absolute", bottom: 16, right: 16,
        padding: "5px 12px", borderRadius: 4, background: "rgba(0,0,0,.65)",
        fontSize: 12, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums",
      }}>{sermon.duration}</div>
    </div>
  );
}

function SermonGridCard({ sermon, onClick }) {
  return (
    <div className="sermon-card-grid" onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "14px 16px", display: "grid", gridTemplateColumns: "130px 1fr",
      gap: 14, alignItems: "center",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.dark}, ${C.darkDeep})`,
        aspectRatio: "16/9", borderRadius: 6, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="thumb-play" style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,.16)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill={C.gold} style={{ marginLeft: 1 }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div style={{
          position: "absolute", bottom: 4, right: 4,
          padding: "1px 6px", borderRadius: 3, background: "rgba(0,0,0,.7)",
          fontSize: 10, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums",
        }}>{sermon.duration}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: C.text,
          letterSpacing: "-0.005em", marginBottom: 6, lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", wordBreak: "keep-all",
        }}>{sermon.title}</div>
        <div style={{ fontSize: 11.5, color: C.primary, fontWeight: 600, marginBottom: 4 }}>
          {sermon.scripture}
        </div>
        <div style={{
          fontSize: 11, color: C.textTer,
          display: "flex", alignItems: "center", gap: 6,
          fontVariantNumeric: "tabular-nums",
        }}>
          <span>{preacherFullName(sermon.preacher)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{formatDate(sermon.sermon_date, "short")}</span>
        </div>
      </div>
    </div>
  );
}

function SeriesGridCard({ series, onClick }) {
  const completed = !series.is_active;
  return (
    <div className="series-grid-card" onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      <div style={{
        aspectRatio: "16/9", background: getCoverGradient(series.cover_tone),
        position: "relative", display: "flex", alignItems: "flex-end",
        padding: 16, opacity: completed ? 0.7 : 1,
      }}>
        <div style={{
          fontSize: 9.5, color: "rgba(255,255,255,.9)", fontWeight: 600,
          letterSpacing: "0.22em", padding: "2px 8px", borderRadius: 100,
          background: "rgba(0,0,0,.32)", backdropFilter: "blur(4px)",
        }}>{completed ? "COMPLETED" : "ON-GOING"}</div>
      </div>
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: C.text,
          margin: "0 0 6px", letterSpacing: "-0.015em", wordBreak: "keep-all",
        }}>{series.title}</h3>
        <div style={{ fontSize: 11.5, color: C.textTer, fontWeight: 500, marginBottom: 10 }}>
          {series.preacher}
        </div>
        <p style={{
          fontSize: 12.5, color: C.textSec, lineHeight: 1.65,
          margin: "0 0 14px", wordBreak: "keep-all", flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{series.description}</p>
        <div style={{
          fontSize: 11.5, color: C.textSec, fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          paddingTop: 10, borderTop: `1px solid ${C.borderLight}`,
          display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
        }}>
          <span>{formatDate(series.started_at)}</span>
          <span style={{ opacity: 0.4 }}>~</span>
          <span style={{ color: completed ? C.textSec : C.primary, fontWeight: completed ? 500 : 700 }}>
            {series.ended_at ? formatDate(series.ended_at) : "진행 중"}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: C.text, fontWeight: 700 }}>{series.progress}편</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   캐러셀
   ========================================================= */

function useCarousel() {
  const ref = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollX: 0, moved: false });
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: "smooth" });
  };

  const onMouseDown = (e) => {
    drag.current = { active: true, startX: e.pageX, scrollX: ref.current.scrollLeft, moved: false };
    if (ref.current) ref.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const dx = e.pageX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    if (ref.current) ref.current.scrollLeft = drag.current.scrollX - dx;
  };
  const stopDrag = () => {
    drag.current.active = false;
    if (ref.current) ref.current.style.cursor = "grab";
  };
  const clickGuard = (e) => {
    if (drag.current.moved) { e.stopPropagation(); e.preventDefault(); drag.current.moved = false; }
  };

  return { ref, scroll, canL, canR, onMouseDown, onMouseMove, stopDrag, clickGuard };
}

function CarouselArrows({ canL, canR, onScroll }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button className="carousel-arrow" onClick={() => onScroll(-1)} disabled={!canL} aria-label="이전" style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `1px solid ${C.border}`, background: C.surface,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.textSec, padding: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className="carousel-arrow" onClick={() => onScroll(1)} disabled={!canR} aria-label="다음" style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `1px solid ${C.border}`, background: C.surface,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.textSec, padding: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

function SermonCarouselCard({ sermon, onClick, width = 240 }) {
  return (
    <div style={{ flex: `0 0 ${width}px` }}>
      <div className="carousel-card" onClick={onClick} style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
        overflow: "hidden",
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.dark}, ${C.darkDeep})`,
          aspectRatio: "16/9", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="thumb-play" style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,.14)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={C.gold} style={{ marginLeft: 1 }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div style={{
            position: "absolute", bottom: 6, right: 6,
            padding: "2px 7px", borderRadius: 3, background: "rgba(0,0,0,.7)",
            fontSize: 10.5, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums",
          }}>{sermon.duration}</div>
        </div>
        <div style={{ padding: "12px 14px 13px" }}>
          <div style={{
            fontSize: 10,
            color: sermon.series ? C.gold : C.textTer,
            fontWeight: sermon.series ? 700 : 600,
            letterSpacing: sermon.series ? "0.12em" : "0.06em",
            marginBottom: 7,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            textTransform: sermon.series ? "none" : "none",
          }}>{sermon.series ? sermon.series.title : sermon.service_type}</div>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: C.text,
            marginBottom: 3, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", wordBreak: "keep-all", minHeight: "2.8em",
          }}>{sermon.title}</div>
          <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, marginBottom: 9 }}>
            {sermon.scripture}
          </div>
          <div style={{
            fontSize: 10.5, color: C.textTer,
            display: "flex", alignItems: "center", gap: 5,
            fontVariantNumeric: "tabular-nums",
            paddingTop: 8, borderTop: `1px solid ${C.borderLight}`,
          }}>
            <span>{preacherFullName(sermon.preacher)}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{formatDate(sermon.sermon_date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ============== 메인 페이지 (목록) ==============
   ========================================================= */

function ListPCHero() {
  return (
    <div style={{ background: `linear-gradient(180deg, ${C.darkDeep}, ${C.dark})`, padding: `32px ${PAGE_PAD}px 36px` }}>
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto" }}>
        <div style={{ fontSize: 12, color: C.gold, fontWeight: 500, letterSpacing: "0.18em", marginBottom: 8 }}>WORD</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>설교</h1>
      </div>
    </div>
  );
}

function ListPCFeatured({ sermon, onClick }) {
  return (
    <div className="featured-card featured-card-grid" onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
      overflow: "hidden", display: "grid", gridTemplateColumns: "580px 1fr",
      cursor: "pointer",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.dark}, ${C.darkDeep})`,
        position: "relative", aspectRatio: "16/9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="play-circle" style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(255,255,255,.14)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={C.gold} style={{ marginLeft: 2 }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div style={{
          position: "absolute", bottom: 14, right: 14,
          padding: "4px 10px", borderRadius: 4, background: "rgba(0,0,0,.55)",
          fontSize: 11, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums",
        }}>{sermon.duration}</div>
      </div>

      <div style={{
        padding: "28px 32px", display: "flex", flexDirection: "column",
        justifyContent: "center", minWidth: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap",
          gap: 8, fontSize: 11.5, marginBottom: 14,
          color: C.textTer, fontVariantNumeric: "tabular-nums",
        }}>
          {sermon.series && (
            <>
              <span style={{ color: C.gold, fontWeight: 700, letterSpacing: "0.1em" }}>
                {sermon.series.title} · {String(sermon.series_order).padStart(2, "0")}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
            </>
          )}
          <span style={{ fontWeight: 600 }}>{formatDate(sermon.sermon_date)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{sermon.service_type}</span>
        </div>
        <h2 style={{
          fontSize: 24, fontWeight: 700, color: C.text,
          margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.32,
          wordBreak: "keep-all",
        }}>{sermon.title}</h2>
        <div style={{ fontSize: 13, color: C.primary, fontWeight: 700, marginBottom: 16 }}>
          {sermon.scripture}
        </div>
        <p style={{
          fontSize: 13, color: C.textSec, lineHeight: 1.7,
          margin: "0 0 18px", wordBreak: "keep-all",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{sermon.summary.split("\n\n")[0]}</p>
        <div style={{ fontSize: 12.5, color: C.textSec, fontWeight: 600 }}>
          {preacherFullName(sermon.preacher)}
        </div>
      </div>
    </div>
  );
}

function MoreCard({ onClick }) {
  return (
    <div className="more-card" onClick={onClick} style={{
      background: C.toneSoft, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "14px 16px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 6, minHeight: 102,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>지난 설교 더 보기</div>
      <div style={{ fontSize: 10.5, color: C.textTer }}>검색·필터·시리즈별 보기</div>
    </div>
  );
}

function ListPCRecent({ onSelectSermon, onSeeMore }) {
  const c = useCarousel();
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.015em" }}>최근 설교</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CarouselArrows canL={c.canL} canR={c.canR} onScroll={c.scroll} />
          <button className="v2-link" onClick={onSeeMore} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 12.5, color: C.primary, fontWeight: 600, padding: 0, fontFamily: "inherit",
          }}>더 보기 →</button>
        </div>
      </div>
      <div
        ref={c.ref}
        className="carousel"
        onMouseDown={c.onMouseDown}
        onMouseMove={c.onMouseMove}
        onMouseUp={c.stopDrag}
        onMouseLeave={c.stopDrag}
        onClickCapture={c.clickGuard}
        style={{
          display: "flex", gap: 12,
          overflowX: "auto", overflowY: "hidden",
          cursor: "grab", userSelect: "none",
          paddingBottom: 4,
        }}>
        {RECENT_SERMONS.map(s => (
          <SermonCarouselCard key={s.id} sermon={s} onClick={() => onSelectSermon(s)} />
        ))}
      </div>
    </div>
  );
}

function ListPCSeriesPreview({ onSelectSeries, onSeeAll }) {
  const c = useCarousel();
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.015em" }}>진행 중인 시리즈</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CarouselArrows canL={c.canL} canR={c.canR} onScroll={c.scroll} />
          <button className="v2-link" onClick={onSeeAll} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 12.5, color: C.primary, fontWeight: 600, padding: 0, fontFamily: "inherit",
          }}>모든 시리즈 →</button>
        </div>
      </div>
      <div
        ref={c.ref}
        className="carousel"
        onMouseDown={c.onMouseDown}
        onMouseMove={c.onMouseMove}
        onMouseUp={c.stopDrag}
        onMouseLeave={c.stopDrag}
        onClickCapture={c.clickGuard}
        style={{
          display: "flex", gap: 16,
          overflowX: "auto", overflowY: "hidden",
          cursor: "grab", userSelect: "none",
          paddingBottom: 4,
        }}>
        {SERIES_PREVIEW.map(s => (
          <div key={s.id} style={{ flex: "0 0 calc((100% - 32px) / 3)" }}>
            <SeriesGridCard series={s} onClick={() => onSelectSeries(s)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListPCBody({ onSelectSermon, onSelectSeries, onSeeAllSermons, onSeeAllSeries }) {
  return (
    <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: `32px ${PAGE_PAD}px 48px` }}>
      <section style={{ marginBottom: 44 }}>
        <h2 style={{
          fontSize: 18, fontWeight: 700, color: C.text,
          margin: "0 0 16px", letterSpacing: "-0.015em",
        }}>이번 주 설교</h2>
        <ListPCFeatured sermon={FEATURED_SERMON} onClick={() => onSelectSermon(FEATURED_SERMON)} />
      </section>
      <section style={{ marginBottom: 40 }}>
        <ListPCRecent onSelectSermon={onSelectSermon} onSeeMore={onSeeAllSermons} />
      </section>
      <section>
        <ListPCSeriesPreview onSelectSeries={onSelectSeries} onSeeAll={onSeeAllSeries} />
      </section>
    </div>
  );
}

/* =========================================================
   ============== 상세 페이지 ==============
   ========================================================= */

function SermonMeta({ sermon, compact = false }) {
  return (
    <div>
      <h1 style={{
        fontSize: compact ? 21 : 26, fontWeight: 700, color: C.text,
        margin: "0 0 12px", letterSpacing: "-0.02em",
        lineHeight: 1.3, wordBreak: "keep-all",
      }}>{sermon.title}</h1>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 16, flexWrap: "wrap",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          fontSize: 13, color: C.textSec, flexWrap: "wrap",
        }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{sermon.scripture}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontWeight: 600, color: C.text }}>{preacherFullName(sermon.preacher)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatDate(sermon.sermon_date)}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="icon-btn" style={{
            padding: "7px 13px", borderRadius: 7,
            border: `1px solid ${C.border}`, background: C.surface,
            color: C.textSec, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            공유
          </button>
          <button className="icon-btn" style={{
            padding: "7px 13px", borderRadius: 7,
            border: `1px solid ${C.border}`, background: C.surface,
            color: C.textSec, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h3 style={{
      fontSize: 13, fontWeight: 700, color: C.text,
      margin: "0 0 14px", letterSpacing: "0.08em", textTransform: "uppercase",
    }}>{children}</h3>
  );
}

function SummarySection({ sermon }) {
  return (
    <div>
      <SectionHeader>설교 요약</SectionHeader>
      <div style={{
        fontSize: 14.5, color: C.textSec, lineHeight: 1.85,
        whiteSpace: "pre-wrap", wordBreak: "keep-all",
      }}>{sermon.summary}</div>
    </div>
  );
}

function ScriptureSection({ sermon }) {
  return (
    <div>
      <SectionHeader>본문 말씀</SectionHeader>
      <div style={{
        background: C.toneSoft, borderRadius: 10,
        padding: "20px 24px", borderLeft: `3px solid ${C.gold}`,
      }}>
        <div style={{
          fontSize: 11.5, color: C.gold, fontWeight: 600,
          letterSpacing: "0.18em", marginBottom: 10,
        }}>{sermon.scripture}</div>
        <p style={{
          fontSize: 15, color: C.text, lineHeight: 1.75,
          margin: 0, wordBreak: "keep-all", fontWeight: 500,
        }}>"{sermon.scripture_text}"</p>
      </div>
    </div>
  );
}

function ResourcesSection() {
  return (
    <div>
      <SectionHeader>함께 보기</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {RESOURCES.map(r => (
          <div key={r.id} className="resource-card" style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: C.toneSoft,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
            }}>{r.file_type.toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 11.5, color: C.textTer, fontVariantNumeric: "tabular-nums" }}>
                {formatFileSize(r.file_size_bytes)}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeriesSidebar({ sermon, onSelectSermon }) {
  const series = sermon.series;
  const completed = !series.is_active;

  const episodes = ALL_SERMONS
    .filter(s => s.series_id === series.id)
    .sort((a, b) => a.series_order - b.series_order);
  const publishedCount = episodes.length;

  return (
    <div>
      <div style={{
        background: C.toneSoft, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 14,
      }}>
        <div style={{
          fontSize: 10, color: C.gold, fontWeight: 600,
          letterSpacing: "0.22em", marginBottom: 10,
        }}>SERIES</div>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: C.text,
          margin: "0 0 8px", letterSpacing: "-0.015em",
        }}>{series.title}</h3>
        <p style={{
          fontSize: 12.5, color: C.textSec, lineHeight: 1.65,
          margin: "0 0 14px", wordBreak: "keep-all",
        }}>{series.description}</p>
        <div style={{
          fontSize: 11, color: C.textSec, fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          paddingTop: 12, borderTop: `1px solid rgba(0,0,0,.06)`,
          display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
        }}>
          <span>{formatDate(series.started_at)}</span>
          <span style={{ opacity: 0.4 }}>~</span>
          <span style={{ color: completed ? C.textSec : C.primary, fontWeight: completed ? 500 : 700 }}>
            {series.ended_at ? formatDate(series.ended_at) : "진행 중"}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: C.text, fontWeight: 700 }}>{publishedCount}편</span>
        </div>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{
          padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}`,
          fontSize: 12, fontWeight: 600, color: C.text, background: C.bg,
        }}>
          전체 회차 ({publishedCount}편)
        </div>
        <div style={{ maxHeight: 480, overflowY: "auto" }}>
          {episodes.map(ep => {
            const isCurrent = ep.series_order === sermon.series_order;
            return (
              <div key={ep.id}
                className={`episode-row ${isCurrent ? "is-current" : ""}`}
                onClick={() => onSelectSermon?.(ep)}
                style={{
                  display: "grid", gridTemplateColumns: "32px 1fr auto",
                  gap: 10, alignItems: "center",
                  padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`,
                }}>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: isCurrent ? C.gold : C.textTer,
                  fontVariantNumeric: "tabular-nums", textAlign: "center",
                }}>{String(ep.series_order).padStart(2, "0")}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? C.text : C.textSec,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{ep.title}</div>
                  <div style={{
                    fontSize: 10.5, color: C.textTer, marginTop: 1, fontVariantNumeric: "tabular-nums",
                  }}>{formatDate(ep.sermon_date)} · {ep.duration}</div>
                </div>
                {isCurrent && (
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: C.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StandaloneSidebar({ sermon, onSelectSermon }) {
  const others = ALL_SERMONS.filter(s => preacherFullName(s.preacher) === preacherFullName(sermon.preacher) && s.id !== sermon.id).slice(0, 3);
  return (
    <div>
      <div style={{
        background: C.toneSoft, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 14,
      }}>
        <div style={{
          fontSize: 10, color: C.gold, fontWeight: 600,
          letterSpacing: "0.22em", marginBottom: 10,
        }}>STANDALONE</div>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: C.text,
          margin: "0 0 8px", letterSpacing: "-0.015em",
        }}>단독 설교</h3>
        <p style={{
          fontSize: 12.5, color: C.textSec, lineHeight: 1.65,
          margin: 0, wordBreak: "keep-all",
        }}>이 설교는 시리즈에 속하지 않는 단독 설교입니다.</p>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{
          padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}`,
          fontSize: 12, fontWeight: 600, color: C.text, background: C.bg,
        }}>{preacherFullName(sermon.preacher)}의 다른 설교</div>
        <div>
          {others.map((s, i) => (
            <div key={s.id} className="other-sermon-row"
              onClick={() => onSelectSermon?.(s)}
              style={{
                padding: "12px 16px",
                borderBottom: i < others.length - 1 ? `1px solid ${C.borderLight}` : "none",
              }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: C.text,
                marginBottom: 4, wordBreak: "keep-all",
              }}>{s.title}</div>
              <div style={{
                fontSize: 11, color: C.textTer,
                display: "flex", alignItems: "center", gap: 6,
                fontVariantNumeric: "tabular-nums",
              }}>
                <span style={{ color: C.primary, fontWeight: 600 }}>{s.scripture}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{formatDate(s.sermon_date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailPCBody({ sermon, onSelectSermon }) {
  return (
    <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: `28px ${PAGE_PAD}px 48px` }}>
      <div className="youtube-layout" style={{
        display: "grid", gridTemplateColumns: "1fr 360px", gap: 32,
      }}>
        <div style={{ minWidth: 0 }}>
          <VideoPlayer sermon={sermon} size="large" />
          <div style={{ marginTop: 24, paddingBottom: 24 }}>
            <SermonMeta sermon={sermon} compact />
          </div>
          <div style={{ paddingTop: 28, borderTop: `1px solid ${C.borderLight}` }}>
            <SummarySection sermon={sermon} />
          </div>
          <div style={{ marginTop: 36 }}><ScriptureSection sermon={sermon} /></div>
          <div style={{ marginTop: 36 }}><ResourcesSection /></div>
        </div>

        <div>
          {sermon.series
            ? <SeriesSidebar sermon={sermon} onSelectSermon={onSelectSermon} />
            : <StandaloneSidebar sermon={sermon} onSelectSermon={onSelectSermon} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ============== 전체 설교 페이지 ==============
   ========================================================= */

function PCSearchInput({ value, onChange }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 100, padding: "11px 22px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="제목, 본문 구절, 설교자로 검색..."
        style={{
          flex: 1, border: "none", outline: "none",
          background: "transparent", fontSize: 14, color: C.text, fontFamily: "inherit",
        }} />
      {value && (
        <button onClick={() => onChange("")} style={{
          background: "transparent", border: "none", cursor: "pointer",
          padding: 0, color: C.textTer, display: "flex", alignItems: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function PCSortDropdown({ value, onChange }) {
  const isActive = value !== "최신순";
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: "7px 30px 7px 13px", borderRadius: 6,
        border: `1px solid ${isActive ? C.primary : C.border}`,
        background: isActive ? C.primaryLight : C.surface,
        fontSize: 12, color: isActive ? C.primary : C.text,
        fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
        appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
      }}>
        {SORT_OPTIONS.map(o => <option key={o} value={o}>정렬: {o}</option>)}
      </select>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke={isActive ? C.primary : C.textTer}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

function RadioOption({ label, count, selected, onClick }) {
  return (
    <button onClick={onClick} className={`radio-opt ${selected ? "is-selected" : ""}`} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "7px 10px", borderRadius: 6,
      border: "none",
      background: selected ? C.primaryLight : "transparent",
      color: selected ? C.primary : C.textSec,
      fontSize: 12.5, fontWeight: selected ? 600 : 500,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        <span style={{
          width: 13, height: 13, borderRadius: "50%",
          border: `1.5px solid ${selected ? C.primary : "#D5D1C8"}`,
          background: selected ? C.primary : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {selected && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}
        </span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </span>
      {count !== undefined && (
        <span style={{
          fontSize: 10.5, color: selected ? C.primary : C.textTer,
          fontVariantNumeric: "tabular-nums", fontWeight: 600,
          opacity: count === 0 ? 0.4 : 1, flexShrink: 0, marginLeft: 8,
        }}>{count}</span>
      )}
    </button>
  );
}

function PCFilterSidebar({
  query, setQuery,
  seriesFilter, setSeriesFilter, preacherFilter, setPreacherFilter,
  seriesCounts, preacherCounts, onReset,
}) {
  const hasActive = seriesFilter !== "전체" || preacherFilter !== "전체" || (query && query.length > 0);
  return (
    <aside style={{ position: "sticky", top: 88, alignSelf: "flex-start" }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: "16px 14px",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 6px", marginBottom: 12, paddingBottom: 11,
          borderBottom: `1px solid ${C.borderLight}`,
        }}>
          <h3 style={{ fontSize: 12.5, fontWeight: 700, color: C.text, margin: 0 }}>필터</h3>
          {hasActive && (
            <button onClick={onReset} className="v2-link" style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 11, color: C.textTer, fontWeight: 500, padding: 0, fontFamily: "inherit",
            }}>초기화</button>
          )}
        </div>

        {/* 검색 */}
        <div style={{ marginBottom: 14, padding: "0 4px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px",
            background: C.bg, border: `1px solid ${C.borderLight}`,
            borderRadius: 7,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="제목·본문·설교자"
              className="sidebar-search-input"
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 12.5, color: C.text, fontFamily: "inherit", minWidth: 0,
              }} />
            {query && (
              <button onClick={() => setQuery("")} style={{
                background: "transparent", border: "none", cursor: "pointer", padding: 0,
                color: C.textTer, display: "flex", alignItems: "center", flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h4 style={{
            fontSize: 10, fontWeight: 700, color: C.textTer,
            margin: "0 8px 4px", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>시리즈</h4>
          <div>
            {SERIES_FILTER_OPTIONS.map(o => (
              <RadioOption key={o} label={o}
                count={seriesCounts?.[o]} selected={seriesFilter === o}
                onClick={() => setSeriesFilter(o)} />
            ))}
          </div>
        </div>

        <div>
          <h4 style={{
            fontSize: 10, fontWeight: 700, color: C.textTer,
            margin: "0 8px 4px", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>설교자</h4>
          <div>
            {PREACHERS.map(p => (
              <RadioOption key={p} label={p}
                count={preacherCounts?.[p]} selected={preacherFilter === p}
                onClick={() => setPreacherFilter(p)} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* 시리즈 필터 선택 시 결과 상단에 표시 */
function SeriesMetaCard({ series, onViewDetail }) {
  const completed = !series.is_active;
  const episodes = ALL_SERMONS.filter(s => s.series_id === series.id);
  return (
    <div style={{
      background: C.toneSoft, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "14px 18px", marginBottom: 16,
      display: "flex", gap: 18, alignItems: "center",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
        }}>
          <span style={{
            fontSize: 9, color: completed ? C.textTer : C.gold, fontWeight: 700,
            letterSpacing: "0.18em",
          }}>SERIES · {completed ? "COMPLETED" : "ON-GOING"}</span>
        </div>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: C.text,
          margin: "0 0 4px", letterSpacing: "-0.015em",
        }}>{series.title}</h3>
        <p style={{
          fontSize: 12, color: C.textSec, lineHeight: 1.55,
          margin: "0 0 6px", wordBreak: "keep-all",
          display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{series.description}</p>
        <div style={{
          fontSize: 11, color: C.textTer,
          display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
          fontVariantNumeric: "tabular-nums",
        }}>
          <span style={{ fontWeight: 600, color: C.textSec }}>{series.preacher}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{formatDate(series.started_at)}</span>
          <span style={{ opacity: 0.4 }}>~</span>
          <span style={{ color: completed ? C.textSec : C.primary, fontWeight: completed ? 500 : 700 }}>
            {series.ended_at ? formatDate(series.ended_at) : "진행 중"}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: C.text, fontWeight: 700 }}>{episodes.length}편</span>
        </div>
      </div>
      <button onClick={onViewDetail} className="v2-link" style={{
        background: "transparent", border: "none", cursor: "pointer",
        padding: "4px 6px", fontFamily: "inherit", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 4,
        fontSize: 12, color: C.primary, fontWeight: 600,
        whiteSpace: "nowrap",
      }}>
        시리즈 상세
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const buttons = [];
  for (let i = 1; i <= totalPages; i++) buttons.push(i);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 28 }}>
      <button className="pagination-btn" disabled={page === 1} onClick={() => onChange(page - 1)}
        style={{
          padding: "7px 11px", borderRadius: 6,
          border: `1px solid ${C.border}`, background: C.surface,
          fontSize: 12, color: C.textSec, fontWeight: 600, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 4,
        }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>이전
      </button>
      {buttons.map(i => (
        <button key={i} className={`pagination-btn ${i === page ? "is-active" : ""}`}
          onClick={() => onChange(i)}
          style={{
            minWidth: 32, padding: "7px 0", borderRadius: 6,
            border: `1px solid ${i === page ? C.primary : C.border}`,
            background: i === page ? C.primary : C.surface,
            fontSize: 12, color: i === page ? "#fff" : C.textSec,
            fontWeight: 600, fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
          }}>{i}</button>
      ))}
      <button className="pagination-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}
        style={{
          padding: "7px 11px", borderRadius: 6,
          border: `1px solid ${C.border}`, background: C.surface,
          fontSize: 12, color: C.textSec, fontWeight: 600, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 4,
        }}>
        다음
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

function AllSermonsPCPage({ onSelectSermon, onSelectSeries }) {
  const [query, setQuery] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("전체");
  const [preacherFilter, setPreacherFilter] = useState("전체");
  const [sort, setSort] = useState("최신순");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const baseFiltered = useMemo(() => {
    let result = ALL_SERMONS.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.scripture.toLowerCase().includes(q) ||
        preacherFullName(s.preacher).toLowerCase().includes(q)
      );
    }
    return result;
  }, [query]);

  const seriesCounts = useMemo(() => {
    const counts = { "전체": baseFiltered.length };
    for (const opt of SERIES_FILTER_OPTIONS) if (opt !== "전체") counts[opt] = 0;
    for (const s of baseFiltered) {
      const t = s.series_id ? SERIES_DATA[s.series_id]?.title : null;
      if (t && counts[t] !== undefined) counts[t]++;
    }
    return counts;
  }, [baseFiltered]);

  const preacherCounts = useMemo(() => {
    const counts = { "전체": baseFiltered.length };
    for (const p of PREACHERS) if (p !== "전체") counts[p] = 0;
    for (const s of baseFiltered) {
      const p = preacherFullName(s.preacher);
      if (counts[p] !== undefined) counts[p]++;
    }
    return counts;
  }, [baseFiltered]);

  const filtered = useMemo(() => {
    let result = baseFiltered;
    if (seriesFilter !== "전체") {
      result = result.filter(s => s.series_id && SERIES_DATA[s.series_id]?.title === seriesFilter);
    }
    if (preacherFilter !== "전체") {
      result = result.filter(s => preacherFullName(s.preacher) === preacherFilter);
    }
    result = result.slice();
    if (sort === "최신순") result.sort((a, b) => b.sermon_date.localeCompare(a.sermon_date));
    else result.sort((a, b) => a.sermon_date.localeCompare(b.sermon_date));
    return result;
  }, [baseFiltered, seriesFilter, preacherFilter, sort]);

  useEffect(() => { setPage(1); }, [query, seriesFilter, preacherFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedSeries = useMemo(() => {
    if (seriesFilter === "전체") return null;
    return Object.values(SERIES_DATA).find(s => s.title === seriesFilter);
  }, [seriesFilter]);

  return (
    <>
      <div style={{ background: `linear-gradient(180deg, ${C.darkDeep}, ${C.dark})`, padding: `28px ${PAGE_PAD}px 32px` }}>
        <div style={{ maxWidth: PAGE_MAX, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: C.gold, fontWeight: 500, letterSpacing: "0.18em", marginBottom: 8 }}>WORD</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>전체 설교</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: 0 }}>지난 설교를 검색하고 찾아보세요</p>
        </div>
      </div>

      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: `28px ${PAGE_PAD}px 40px` }}>
        <div className="all-sermons-layout" style={{
          display: "grid", gridTemplateColumns: "240px 1fr",
          gap: 28, alignItems: "flex-start",
        }}>
          <PCFilterSidebar
            query={query} setQuery={setQuery}
            seriesFilter={seriesFilter} setSeriesFilter={setSeriesFilter}
            preacherFilter={preacherFilter} setPreacherFilter={setPreacherFilter}
            seriesCounts={seriesCounts} preacherCounts={preacherCounts}
            onReset={() => { setSeriesFilter("전체"); setPreacherFilter("전체"); setQuery(""); }} />

          <main style={{ minWidth: 0 }}>
            {query.trim() && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", marginBottom: 16,
                background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span style={{ fontSize: 12.5, color: C.textSec, minWidth: 0 }}>
                  <b style={{ color: C.text, fontWeight: 700 }}>"{query.trim()}"</b>
                  <span style={{ marginLeft: 6 }}>검색 결과 · </span>
                  <span style={{ color: C.text, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{filtered.length}개</span>
                </span>
                <button onClick={() => setQuery("")} style={{
                  marginLeft: "auto", background: "transparent", border: "none",
                  cursor: "pointer", padding: "2px 4px", color: C.textTer,
                  fontFamily: "inherit", fontSize: 11.5, fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  검색어 지우기
                </button>
              </div>
            )}

            {selectedSeries && (
              <SeriesMetaCard series={selectedSeries} onViewDetail={() => onSelectSeries(selectedSeries)} />
            )}

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 12,
              borderBottom: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ fontSize: 13, color: C.textSec }}>
                {query.trim() ? "결과" : "총"} <b style={{ color: C.text, fontVariantNumeric: "tabular-nums" }}>{filtered.length}</b>개 설교
                {totalPages > 1 && (
                  <span style={{ marginLeft: 10, color: C.textTer, fontSize: 12 }}>
                    {safePage} / {totalPages} 페이지
                  </span>
                )}
              </div>
              <PCSortDropdown value={sort} onChange={setSort} />
            </div>

            {paginated.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {paginated.map(s => (
                  <SermonGridCard key={s.id} sermon={s} onClick={() => onSelectSermon(s)} />
                ))}
              </div>
            ) : (
              <div style={{
                padding: "60px 20px", textAlign: "center",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                color: C.textTer, fontSize: 14,
              }}>
                검색 결과가 없습니다.
                <div style={{ marginTop: 12, fontSize: 12 }}>다른 키워드나 필터로 시도해보세요.</div>
              </div>
            )}

            {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />}
          </main>
        </div>
      </div>
    </>
  );
}

/* === FilterBottomSheet (모바일) === */

function FilterOption({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "12px 16px", borderRadius: 8, border: "none",
      background: selected ? C.primaryLight : "transparent",
      color: selected ? C.primary : C.text,
      fontSize: 13.5, fontWeight: selected ? 600 : 500,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <span>{label}</span>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </button>
  );
}

function FilterBottomSheet({ open, onClose, seriesFilter, setSeriesFilter, preacherFilter, setPreacherFilter, sort, setSort }) {
  const hasActive = seriesFilter !== "전체" || preacherFilter !== "전체" || sort !== "최신순";
  const handleReset = () => {
    setSeriesFilter("전체"); setPreacherFilter("전체"); setSort("최신순");
  };
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18,
        zIndex: 101, maxHeight: "82vh",
        display: "flex", flexDirection: "column",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
        boxShadow: "0 -8px 32px rgba(0,0,0,.15)",
      }}>
        <div style={{ padding: "10px 0 4px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 100, background: C.border }} />
        </div>
        <div style={{
          padding: "10px 20px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${C.borderLight}`,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>필터</h3>
          {hasActive && (
            <button onClick={handleReset} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 12, color: C.textTer, fontWeight: 500, padding: 0, fontFamily: "inherit",
            }}>초기화</button>
          )}
        </div>
        <div style={{ padding: "16px 12px 20px", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 18 }}>
            <h4 style={{
              fontSize: 11, fontWeight: 700, color: C.textTer,
              margin: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>시리즈</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SERIES_FILTER_OPTIONS.map(o => (
                <FilterOption key={o} label={o} selected={seriesFilter === o} onClick={() => setSeriesFilter(o)} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <h4 style={{
              fontSize: 11, fontWeight: 700, color: C.textTer,
              margin: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>설교자</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {PREACHERS.map(p => (
                <FilterOption key={p} label={p} selected={preacherFilter === p} onClick={() => setPreacherFilter(p)} />
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: 11, fontWeight: 700, color: C.textTer,
              margin: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>정렬</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SORT_OPTIONS.map(o => (
                <FilterOption key={o} label={o} selected={sort === o} onClick={() => setSort(o)} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${C.borderLight}` }}>
          <button onClick={onClose} className="v2-btn-primary" style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: C.primary, color: "#fff", fontSize: 13.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>결과 보기</button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ============== 모든 시리즈 페이지 ==============
   ========================================================= */

function FilterChip({ active, label, onClick }) {
  return (
    <button className="filter-chip" onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 100,
      border: `1px solid ${active ? C.primary : C.border}`,
      background: active ? C.primaryLight : C.surface,
      color: active ? C.primary : C.textSec,
      fontSize: 11.5, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

function PCSeriesFilterSidebar({
  statusFilter, setStatusFilter, preacherFilter, setPreacherFilter, yearFilter, setYearFilter,
  statusCounts, preacherCounts, yearCounts, yearOptions, onReset,
}) {
  const hasActive = statusFilter !== "전체" || preacherFilter !== "전체" || yearFilter !== "전체";
  return (
    <aside style={{ position: "sticky", top: 88, alignSelf: "flex-start" }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: "16px 14px",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 6px", marginBottom: 12, paddingBottom: 11,
          borderBottom: `1px solid ${C.borderLight}`,
        }}>
          <h3 style={{ fontSize: 12.5, fontWeight: 700, color: C.text, margin: 0 }}>필터</h3>
          {hasActive && (
            <button onClick={onReset} className="v2-link" style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 11, color: C.textTer, fontWeight: 500, padding: 0, fontFamily: "inherit",
            }}>초기화</button>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <h4 style={{
            fontSize: 10, fontWeight: 700, color: C.textTer,
            margin: "0 8px 4px", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>상태</h4>
          <div>
            {["전체", "진행 중", "완료"].map(o => (
              <RadioOption key={o} label={o}
                count={statusCounts?.[o]} selected={statusFilter === o}
                onClick={() => setStatusFilter(o)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h4 style={{
            fontSize: 10, fontWeight: 700, color: C.textTer,
            margin: "0 8px 4px", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>설교자</h4>
          <div>
            {PREACHERS.map(p => (
              <RadioOption key={p} label={p}
                count={preacherCounts?.[p]} selected={preacherFilter === p}
                onClick={() => setPreacherFilter(p)} />
            ))}
          </div>
        </div>

        <div>
          <h4 style={{
            fontSize: 10, fontWeight: 700, color: C.textTer,
            margin: "0 8px 4px", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>연도</h4>
          <div>
            {yearOptions.map(y => (
              <RadioOption key={y} label={y}
                count={yearCounts?.[y]} selected={yearFilter === y}
                onClick={() => setYearFilter(y)} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function yearOverlap(series, year) {
  if (year === "전체") return true;
  const start = parseInt(series.started_at.slice(0, 4));
  const end = series.ended_at ? parseInt(series.ended_at.slice(0, 4)) : new Date().getFullYear();
  const y = parseInt(year);
  return y >= start && y <= end;
}

function AllSeriesPCPage({ onSelectSeries }) {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [preacherFilter, setPreacherFilter] = useState("전체");
  const [yearFilter, setYearFilter] = useState("전체");

  const allSeries = useMemo(() => Object.values(SERIES_DATA), []);

  const yearOptions = useMemo(() => {
    const set = new Set(["전체"]);
    for (const s of allSeries) {
      const start = parseInt(s.started_at.slice(0, 4));
      const end = s.ended_at ? parseInt(s.ended_at.slice(0, 4)) : new Date().getFullYear();
      for (let y = start; y <= end; y++) set.add(String(y));
    }
    const sortedYears = [...set].filter(y => y !== "전체").sort((a, b) => b.localeCompare(a));
    return ["전체", ...sortedYears];
  }, [allSeries]);

  const statusCounts = useMemo(() => {
    const counts = { "전체": allSeries.length, "진행 중": 0, "완료": 0 };
    for (const s of allSeries) {
      if (s.is_active) counts["진행 중"]++; else counts["완료"]++;
    }
    return counts;
  }, [allSeries]);

  const preacherCounts = useMemo(() => {
    const counts = { "전체": allSeries.length };
    for (const p of PREACHERS) if (p !== "전체") counts[p] = 0;
    for (const s of allSeries) {
      if (counts[s.preacher] !== undefined) counts[s.preacher]++;
    }
    return counts;
  }, [allSeries]);

  const yearCounts = useMemo(() => {
    const counts = { "전체": allSeries.length };
    for (const y of yearOptions) if (y !== "전체") counts[y] = 0;
    for (const s of allSeries) {
      for (const y of yearOptions) {
        if (y !== "전체" && yearOverlap(s, y)) counts[y]++;
      }
    }
    return counts;
  }, [allSeries, yearOptions]);

  const filtered = useMemo(() => {
    let result = allSeries.slice();
    if (statusFilter === "진행 중") result = result.filter(s => s.is_active);
    if (statusFilter === "완료") result = result.filter(s => !s.is_active);
    if (preacherFilter !== "전체") result = result.filter(s => s.preacher === preacherFilter);
    if (yearFilter !== "전체") result = result.filter(s => yearOverlap(s, yearFilter));
    result.sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return b.started_at.localeCompare(a.started_at);
    });
    return result;
  }, [allSeries, statusFilter, preacherFilter, yearFilter]);

  return (
    <>
      <div style={{ background: `linear-gradient(180deg, ${C.darkDeep}, ${C.dark})`, padding: `28px ${PAGE_PAD}px 32px` }}>
        <div style={{ maxWidth: PAGE_MAX, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: C.gold, fontWeight: 500, letterSpacing: "0.18em", marginBottom: 8 }}>WORD</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>모든 시리즈</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: 0 }}>설교 시리즈로 말씀을 따라가세요</p>
        </div>
      </div>

      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: `28px ${PAGE_PAD}px 40px` }}>
        <div className="all-sermons-layout" style={{
          display: "grid", gridTemplateColumns: "240px 1fr",
          gap: 28, alignItems: "flex-start",
        }}>
          <PCSeriesFilterSidebar
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            preacherFilter={preacherFilter} setPreacherFilter={setPreacherFilter}
            yearFilter={yearFilter} setYearFilter={setYearFilter}
            statusCounts={statusCounts} preacherCounts={preacherCounts}
            yearCounts={yearCounts} yearOptions={yearOptions}
            onReset={() => { setStatusFilter("전체"); setPreacherFilter("전체"); setYearFilter("전체"); }} />

          <main style={{ minWidth: 0 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 12,
              borderBottom: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ fontSize: 13, color: C.textSec }}>
                총 <b style={{ color: C.text, fontVariantNumeric: "tabular-nums" }}>{filtered.length}</b>개 시리즈
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="series-grid-3" style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18,
              }}>
                {filtered.map(s => <SeriesGridCard key={s.id} series={s} onClick={() => onSelectSeries(s)} />)}
              </div>
            ) : (
              <div style={{
                padding: "60px 20px", textAlign: "center",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                color: C.textTer, fontSize: 14,
              }}>
                해당 조건의 시리즈가 없습니다.
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ============== 시리즈 상세 페이지 ==============
   ========================================================= */

function SeriesEpisodeCard({ sermon, onClick }) {
  const isUnpub = sermon.is_unpublished;
  return (
    <div className={`episode-row ${isUnpub ? "is-unpublished" : ""}`}
      onClick={isUnpub ? undefined : onClick}
      style={{
        display: "grid", gridTemplateColumns: "32px 130px 1fr",
        gap: 14, alignItems: "center",
        padding: "14px 16px",
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10,
      }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.textTer,
        fontVariantNumeric: "tabular-nums", textAlign: "center",
      }}>{String(sermon.series_order).padStart(2, "0")}</div>

      <div style={{
        background: `linear-gradient(135deg, ${C.dark}, ${C.darkDeep})`,
        aspectRatio: "16/9", borderRadius: 6, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: isUnpub ? 0.3 : 1,
      }}>
        {!isUnpub && (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={C.gold} style={{ marginLeft: 1 }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
            <div style={{
              position: "absolute", bottom: 4, right: 4,
              padding: "1px 6px", borderRadius: 3, background: "rgba(0,0,0,.7)",
              fontSize: 9.5, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums",
            }}>{sermon.duration}</div>
          </>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: C.text,
          letterSpacing: "-0.005em", marginBottom: 4,
          wordBreak: "keep-all", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{sermon.title}</div>
        <div style={{
          fontSize: 11, color: C.textTer,
          display: "flex", alignItems: "center", gap: 6,
          fontVariantNumeric: "tabular-nums", flexWrap: "wrap",
        }}>
          {sermon.scripture && (
            <>
              <span style={{ color: C.primary, fontWeight: 600 }}>{sermon.scripture}</span>
              <span style={{ opacity: 0.4 }}>·</span>
            </>
          )}
          <span>{sermon.sermon_date ? formatDate(sermon.sermon_date) : "예정"}</span>
        </div>
      </div>
    </div>
  );
}

function SeriesDetailPCPage({ series, onSelectSermon }) {
  const episodes = ALL_SERMONS
    .filter(s => s.series_id === series.id)
    .sort((a, b) => a.series_order - b.series_order);
  const publishedCount = episodes.length;
  const completed = !series.is_active;

  return (
    <>
      <div style={{
        background: getCoverGradient(series.cover_tone),
        position: "relative", padding: `48px ${PAGE_PAD}px 44px`, overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.25)" }} />
        <div style={{ position: "relative", maxWidth: PAGE_MAX, margin: "0 auto" }}>
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,.85)", fontWeight: 600,
            letterSpacing: "0.22em", marginBottom: 14,
          }}>SERIES · {completed ? "COMPLETED" : "ON-GOING"}</div>
          <h1 style={{
            fontSize: 36, fontWeight: 700, color: "#fff",
            margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>{series.title}</h1>
          <p style={{
            fontSize: 14.5, color: "rgba(255,255,255,.85)",
            margin: "0 0 22px", lineHeight: 1.65, maxWidth: 720, wordBreak: "keep-all",
          }}>{series.description}</p>
          <div style={{
            display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10,
            fontSize: 13, color: "rgba(255,255,255,.95)",
            fontVariantNumeric: "tabular-nums",
            paddingTop: 18, borderTop: `1px solid rgba(255,255,255,.15)`,
            maxWidth: 720,
          }}>
            <span style={{ fontWeight: 600 }}>{series.preacher}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{formatDate(series.started_at)}</span>
            <span style={{ opacity: 0.4 }}>~</span>
            <span style={{ fontWeight: 700 }}>{series.ended_at ? formatDate(series.ended_at) : "진행 중"}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontWeight: 700 }}>{publishedCount}편</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: `32px ${PAGE_PAD}px 48px` }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 18,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.015em" }}>회차 목록</h2>
          <div style={{ fontSize: 12, color: C.textTer }}>
            총 <b style={{ color: C.text }}>{publishedCount}편</b>
          </div>
        </div>

        <div className="episodes-grid-2" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        }}>
          {episodes.map(ep => (
            <SeriesEpisodeCard key={ep.id} sermon={ep} onClick={() => onSelectSermon(ep)} />
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ============== Mobile 페이지 ==============
   ========================================================= */

function MListBanner() {
  return (
    <div style={{ background: `linear-gradient(180deg,${C.darkDeep},${C.dark})`, padding: "24px 20px 22px" }}>
      <div style={{ fontSize: 11, color: C.gold, fontWeight: 500, letterSpacing: "0.18em", marginBottom: 6 }}>WORD</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>설교</h1>
    </div>
  );
}

function MListFeatured({ sermon, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      overflow: "hidden", cursor: "pointer",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.dark}, ${C.darkDeep})`,
        aspectRatio: "16/9", position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={C.gold} style={{ marginLeft: 2 }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          padding: "3px 9px", borderRadius: 3, background: "rgba(0,0,0,.6)",
          fontSize: 11, color: "#fff", fontWeight: 600,
        }}>{sermon.duration}</div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6,
          fontSize: 10.5, marginBottom: 10,
          color: C.textTer, fontVariantNumeric: "tabular-nums",
        }}>
          {sermon.series && (
            <>
              <span style={{ color: C.gold, fontWeight: 700, letterSpacing: "0.1em" }}>
                {sermon.series.title} · {String(sermon.series_order).padStart(2, "0")}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
            </>
          )}
          <span style={{ fontWeight: 600 }}>{formatDate(sermon.sermon_date)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{sermon.service_type}</span>
        </div>
        <h2 style={{
          fontSize: 17, fontWeight: 700, color: C.text,
          margin: "0 0 8px", letterSpacing: "-0.015em",
          lineHeight: 1.35, wordBreak: "keep-all",
        }}>{sermon.title}</h2>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 700, marginBottom: 8 }}>{sermon.scripture}</div>
        <div style={{ fontSize: 11.5, color: C.textTer }}>{preacherFullName(sermon.preacher)}</div>
      </div>
    </div>
  );
}

function MListRecent({ onSelectSermon, onSeeMore }) {
  const c = useCarousel();
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>최근 설교</h2>
        <button className="v2-link" onClick={onSeeMore} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: 11, color: C.primary, fontWeight: 600, padding: 0, fontFamily: "inherit",
        }}>더 보기 →</button>
      </div>
      <div
        ref={c.ref}
        className="carousel"
        onMouseDown={c.onMouseDown}
        onMouseMove={c.onMouseMove}
        onMouseUp={c.stopDrag}
        onMouseLeave={c.stopDrag}
        onClickCapture={c.clickGuard}
        style={{
          display: "flex", gap: 10,
          overflowX: "auto", overflowY: "hidden",
          cursor: "grab", userSelect: "none",
          paddingBottom: 4,
          marginLeft: -16, marginRight: -16,
          paddingLeft: 16, paddingRight: 16,
        }}>
        {RECENT_SERMONS.map(s => (
          <SermonCarouselCard key={s.id} sermon={s} onClick={() => onSelectSermon(s)} width={210} />
        ))}
      </div>
    </div>
  );
}

function MListSeriesPreview({ onSelectSeries, onSeeAll }) {
  const c = useCarousel();
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>진행 중인 시리즈</h2>
        <button className="v2-link" onClick={onSeeAll} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: 11, color: C.primary, fontWeight: 600, padding: 0, fontFamily: "inherit",
        }}>모든 →</button>
      </div>
      <div
        ref={c.ref}
        className="carousel"
        onMouseDown={c.onMouseDown}
        onMouseMove={c.onMouseMove}
        onMouseUp={c.stopDrag}
        onMouseLeave={c.stopDrag}
        onClickCapture={c.clickGuard}
        style={{
          display: "flex", gap: 10,
          overflowX: "auto", overflowY: "hidden",
          cursor: "grab", userSelect: "none",
          paddingBottom: 4,
          marginLeft: -16, marginRight: -16,
          paddingLeft: 16, paddingRight: 16,
        }}>
        {SERIES_PREVIEW.map(s => (
          <div key={s.id} style={{ flex: "0 0 260px" }}>
            <SeriesGridCard series={s} onClick={() => onSelectSeries(s)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MListBody({ onSelectSermon, onSelectSeries, onSeeAllSermons, onSeeAllSeries }) {
  return (
    <div style={{ padding: "18px 16px 24px" }}>
      <section style={{ marginBottom: 22 }}>
        <h2 style={{
          fontSize: 14, fontWeight: 700, color: C.text,
          margin: "0 0 12px", letterSpacing: "-0.015em",
          paddingBottom: 8, borderBottom: `1px solid ${C.borderLight}`,
        }}>이번 주 설교</h2>
        <MListFeatured sermon={FEATURED_SERMON} onClick={() => onSelectSermon(FEATURED_SERMON)} />
      </section>
      <section style={{ marginBottom: 24 }}>
        <MListRecent onSelectSermon={onSelectSermon} onSeeMore={onSeeAllSermons} />
      </section>
      <section>
        <MListSeriesPreview onSelectSeries={onSelectSeries} onSeeAll={onSeeAllSeries} />
      </section>
    </div>
  );
}

function MobileTabs({ sermon, onSelectSermon }) {
  const [tab, setTab] = useState("summary");
  const tabs = [
    { id: "summary", label: "설교 요약" },
    { id: "scripture", label: "본문 말씀" },
    { id: "resources", label: "함께 보기" },
  ];
  return (
    <div>
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.borderLight}`,
        background: C.surface, position: "sticky", top: 47, zIndex: 10,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "13px 0", background: "transparent", border: "none",
            borderBottom: `2px solid ${tab === t.id ? C.primary : "transparent"}`,
            color: tab === t.id ? C.text : C.textTer,
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            fontFamily: "inherit", cursor: "pointer",
            marginBottom: -1, letterSpacing: "-0.01em",
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ padding: "22px 18px 24px" }}>
        {tab === "summary" && <SummarySection sermon={sermon} />}
        {tab === "scripture" && <ScriptureSection sermon={sermon} />}
        {tab === "resources" && <ResourcesSection />}
      </div>
    </div>
  );
}

function MDetailBody({ sermon, onSelectSermon }) {
  return (
    <div>
      <div style={{ padding: "12px 16px 0" }}><VideoPlayer sermon={sermon} /></div>
      <div style={{ padding: "20px 18px 22px" }}><SermonMeta sermon={sermon} compact /></div>
      <MobileTabs sermon={sermon} />
      <div style={{ padding: "0 18px 24px" }}>
        {sermon.series
          ? <SeriesSidebar sermon={sermon} onSelectSermon={onSelectSermon} />
          : <StandaloneSidebar sermon={sermon} onSelectSermon={onSelectSermon} />}
      </div>
    </div>
  );
}

function AllSermonsMPage({ onSelectSermon, onSelectSeries }) {
  const [query, setQuery] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("전체");
  const [preacherFilter, setPreacherFilter] = useState("전체");
  const [sort, setSort] = useState("최신순");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    let result = ALL_SERMONS.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.scripture.toLowerCase().includes(q) ||
        preacherFullName(s.preacher).toLowerCase().includes(q)
      );
    }
    if (seriesFilter !== "전체") result = result.filter(s => s.series_id && SERIES_DATA[s.series_id]?.title === seriesFilter);
    if (preacherFilter !== "전체") result = result.filter(s => preacherFullName(s.preacher) === preacherFilter);
    if (sort === "최신순") result.sort((a, b) => b.sermon_date.localeCompare(a.sermon_date));
    else result.sort((a, b) => a.sermon_date.localeCompare(b.sermon_date));
    return result;
  }, [query, seriesFilter, preacherFilter, sort]);

  useEffect(() => { setPage(1); }, [query, seriesFilter, preacherFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(0, safePage * PAGE_SIZE);

  const activeFilterCount =
    (seriesFilter !== "전체" ? 1 : 0) +
    (preacherFilter !== "전체" ? 1 : 0) +
    (sort !== "최신순" ? 1 : 0);

  const selectedSeries = useMemo(() => {
    if (seriesFilter === "전체") return null;
    return Object.values(SERIES_DATA).find(s => s.title === seriesFilter);
  }, [seriesFilter]);

  return (
    <>
      <div style={{ background: `linear-gradient(180deg,${C.darkDeep},${C.dark})`, padding: "24px 20px 22px" }}>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 500, letterSpacing: "0.18em", marginBottom: 6 }}>WORD</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>전체 설교</h1>
      </div>

      <div style={{ padding: "18px 16px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 100, padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10, minWidth: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="제목·본문·설교자"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", fontSize: 13,
                color: C.text, fontFamily: "inherit", minWidth: 0,
              }} />
            {query && (
              <button onClick={() => setQuery("")} style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: 0, color: C.textTer, flexShrink: 0, display: "flex", alignItems: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <button onClick={() => setSheetOpen(true)} style={{
            position: "relative", flexShrink: 0,
            width: 44, height: 44, borderRadius: "50%",
            border: `1px solid ${activeFilterCount > 0 ? C.primary : C.border}`,
            background: activeFilterCount > 0 ? C.primaryLight : C.surface,
            color: activeFilterCount > 0 ? C.primary : C.textSec,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {activeFilterCount > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2,
                minWidth: 18, height: 18, borderRadius: 100,
                background: C.gold, color: "#fff",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 5px", border: `2px solid ${C.bg}`,
                fontVariantNumeric: "tabular-nums",
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {query.trim() && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", marginBottom: 14,
            background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 8,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize: 11.5, color: C.textSec, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <b style={{ color: C.text, fontWeight: 700 }}>"{query.trim()}"</b>
              <span style={{ marginLeft: 4 }}>· </span>
              <span style={{ color: C.text, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{filtered.length}개</span>
            </span>
            <button onClick={() => setQuery("")} style={{
              marginLeft: "auto", background: "transparent", border: "none",
              cursor: "pointer", padding: 2, color: C.textTer, flexShrink: 0,
              display: "flex", alignItems: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {selectedSeries && onSelectSeries && (
          <SeriesMetaCard series={selectedSeries} onViewDetail={() => onSelectSeries(selectedSeries)} />
        )}

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${C.borderLight}`,
          fontSize: 11.5, color: C.textSec,
        }}>
          <span>{query.trim() ? "결과" : "총"} <b style={{ color: C.text }}>{filtered.length}</b>개</span>
          <span style={{ color: C.textTer }}>{sort}</span>
        </div>

        {paginated.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {paginated.map(s => <SermonGridCard key={s.id} sermon={s} onClick={() => onSelectSermon(s)} />)}
          </div>
        ) : (
          <div style={{
            padding: "40px 20px", textAlign: "center",
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            color: C.textTer, fontSize: 12,
          }}>검색 결과가 없습니다.</div>
        )}

        {safePage < totalPages && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <button onClick={() => setPage(safePage + 1)} style={{
              padding: "10px 20px", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.surface,
              fontSize: 12, color: C.text, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>더 보기 ({filtered.length - paginated.length}개 더)</button>
          </div>
        )}
      </div>

      <FilterBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
        seriesFilter={seriesFilter} setSeriesFilter={setSeriesFilter}
        preacherFilter={preacherFilter} setPreacherFilter={setPreacherFilter}
        sort={sort} setSort={setSort} />
    </>
  );
}

function SeriesFilterBottomSheet({
  open, onClose,
  statusFilter, setStatusFilter,
  preacherFilter, setPreacherFilter,
  yearFilter, setYearFilter, yearOptions,
}) {
  const hasActive = statusFilter !== "전체" || preacherFilter !== "전체" || yearFilter !== "전체";
  const handleReset = () => {
    setStatusFilter("전체"); setPreacherFilter("전체"); setYearFilter("전체");
  };
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18,
        zIndex: 101, maxHeight: "82vh",
        display: "flex", flexDirection: "column",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
        boxShadow: "0 -8px 32px rgba(0,0,0,.15)",
      }}>
        <div style={{ padding: "10px 0 4px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 100, background: C.border }} />
        </div>
        <div style={{
          padding: "10px 20px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${C.borderLight}`,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>필터</h3>
          {hasActive && (
            <button onClick={handleReset} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 12, color: C.textTer, fontWeight: 500, padding: 0, fontFamily: "inherit",
            }}>초기화</button>
          )}
        </div>
        <div style={{ padding: "16px 12px 20px", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 18 }}>
            <h4 style={{
              fontSize: 11, fontWeight: 700, color: C.textTer,
              margin: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>상태</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["전체", "진행 중", "완료"].map(o => (
                <FilterOption key={o} label={o} selected={statusFilter === o} onClick={() => setStatusFilter(o)} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <h4 style={{
              fontSize: 11, fontWeight: 700, color: C.textTer,
              margin: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>설교자</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {PREACHERS.map(p => (
                <FilterOption key={p} label={p} selected={preacherFilter === p} onClick={() => setPreacherFilter(p)} />
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: 11, fontWeight: 700, color: C.textTer,
              margin: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>연도</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {yearOptions.map(y => (
                <FilterOption key={y} label={y} selected={yearFilter === y} onClick={() => setYearFilter(y)} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${C.borderLight}` }}>
          <button onClick={onClose} className="v2-btn-primary" style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: C.primary, color: "#fff", fontSize: 13.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>결과 보기</button>
        </div>
      </div>
    </>
  );
}

function AllSeriesMPage({ onSelectSeries }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [preacherFilter, setPreacherFilter] = useState("전체");
  const [yearFilter, setYearFilter] = useState("전체");
  const [sheetOpen, setSheetOpen] = useState(false);

  const allSeries = useMemo(() => Object.values(SERIES_DATA), []);

  const yearOptions = useMemo(() => {
    const set = new Set();
    for (const s of allSeries) {
      const start = parseInt(s.started_at.slice(0, 4));
      const end = s.ended_at ? parseInt(s.ended_at.slice(0, 4)) : new Date().getFullYear();
      for (let y = start; y <= end; y++) set.add(String(y));
    }
    const sortedYears = [...set].sort((a, b) => b.localeCompare(a));
    return ["전체", ...sortedYears];
  }, [allSeries]);

  const filtered = useMemo(() => {
    let result = allSeries.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.preacher.toLowerCase().includes(q)
      );
    }
    if (statusFilter === "진행 중") result = result.filter(s => s.is_active);
    if (statusFilter === "완료") result = result.filter(s => !s.is_active);
    if (preacherFilter !== "전체") result = result.filter(s => s.preacher === preacherFilter);
    if (yearFilter !== "전체") result = result.filter(s => yearOverlap(s, yearFilter));
    result.sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return b.started_at.localeCompare(a.started_at);
    });
    return result;
  }, [allSeries, query, statusFilter, preacherFilter, yearFilter]);

  const activeFilterCount =
    (statusFilter !== "전체" ? 1 : 0) +
    (preacherFilter !== "전체" ? 1 : 0) +
    (yearFilter !== "전체" ? 1 : 0);

  return (
    <>
      <div style={{ background: `linear-gradient(180deg,${C.darkDeep},${C.dark})`, padding: "24px 20px 22px" }}>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 500, letterSpacing: "0.18em", marginBottom: 6 }}>WORD</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>모든 시리즈</h1>
      </div>

      <div style={{ padding: "18px 16px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 100, padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10, minWidth: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="시리즈 검색"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", fontSize: 13,
                color: C.text, fontFamily: "inherit", minWidth: 0,
              }} />
            {query && (
              <button onClick={() => setQuery("")} style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: 0, color: C.textTer, flexShrink: 0, display: "flex", alignItems: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <button onClick={() => setSheetOpen(true)} style={{
            position: "relative", flexShrink: 0,
            width: 44, height: 44, borderRadius: "50%",
            border: `1px solid ${activeFilterCount > 0 ? C.primary : C.border}`,
            background: activeFilterCount > 0 ? C.primaryLight : C.surface,
            color: activeFilterCount > 0 ? C.primary : C.textSec,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {activeFilterCount > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2,
                minWidth: 18, height: 18, borderRadius: 100,
                background: C.gold, color: "#fff",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 5px", border: `2px solid ${C.bg}`,
                fontVariantNumeric: "tabular-nums",
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {query.trim() && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", marginBottom: 14,
            background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 8,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize: 11.5, color: C.textSec, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <b style={{ color: C.text, fontWeight: 700 }}>"{query.trim()}"</b>
              <span style={{ marginLeft: 4 }}>· </span>
              <span style={{ color: C.text, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{filtered.length}개</span>
            </span>
            <button onClick={() => setQuery("")} style={{
              marginLeft: "auto", background: "transparent", border: "none",
              cursor: "pointer", padding: 2, color: C.textTer, flexShrink: 0,
              display: "flex", alignItems: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${C.borderLight}`,
          fontSize: 11.5, color: C.textSec,
        }}>
          <span>{query.trim() ? "결과" : "총"} <b style={{ color: C.text }}>{filtered.length}</b>개</span>
        </div>

        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(s => <SeriesGridCard key={s.id} series={s} onClick={() => onSelectSeries(s)} />)}
          </div>
        ) : (
          <div style={{
            padding: "40px 20px", textAlign: "center",
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            color: C.textTer, fontSize: 12,
          }}>검색 결과가 없습니다.</div>
        )}
      </div>

      <SeriesFilterBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        preacherFilter={preacherFilter} setPreacherFilter={setPreacherFilter}
        yearFilter={yearFilter} setYearFilter={setYearFilter}
        yearOptions={yearOptions} />
    </>
  );
}

function SeriesDetailMPage({ series, onSelectSermon }) {
  const episodes = ALL_SERMONS
    .filter(s => s.series_id === series.id)
    .sort((a, b) => a.series_order - b.series_order);
  const publishedCount = episodes.length;
  const completed = !series.is_active;
  return (
    <>
      <div style={{ background: getCoverGradient(series.cover_tone), position: "relative", padding: "28px 20px 26px" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.25)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.85)", fontWeight: 600, letterSpacing: "0.22em", marginBottom: 10 }}>
            SERIES · {completed ? "COMPLETED" : "ON-GOING"}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{series.title}</h1>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.85)", margin: "0 0 16px", lineHeight: 1.65, wordBreak: "keep-all" }}>{series.description}</p>
          <div style={{
            fontSize: 11.5, color: "rgba(255,255,255,.95)",
            fontVariantNumeric: "tabular-nums",
            paddingTop: 14, borderTop: `1px solid rgba(255,255,255,.15)`,
            display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
          }}>
            <span style={{ fontWeight: 600 }}>{series.preacher}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{formatDate(series.started_at)}</span>
            <span style={{ opacity: 0.4 }}>~</span>
            <span style={{ fontWeight: 700 }}>{series.ended_at ? formatDate(series.ended_at) : "진행 중"}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontWeight: 700 }}>{publishedCount}편</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 16px 24px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${C.borderLight}`,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>회차 목록</h2>
          <div style={{ fontSize: 11, color: C.textTer }}>총 {publishedCount}편</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {episodes.map(ep => <SeriesEpisodeCard key={ep.id} sermon={ep} onClick={() => onSelectSermon(ep)} />)}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ============== App Wrapper ==============
   ========================================================= */

const NAV_HISTORY = []; // 단순 history (back용)

export default function ChurchSermonAll() {
  useSetup();
  const [page, setPage] = useState("list");
  const [sermon, setSermon] = useState(null);
  const [series, setSeries] = useState(null);
  const [device, setDevice] = useState("both");

  const navigate = (target) => {
    NAV_HISTORY.push(page);
    setPage(target);
    window.scrollTo?.(0, 0);
  };

  const handleSelectSermon = (s) => { setSermon(s); navigate("detail"); };
  const handleSelectSeries = (s) => { setSeries(s); navigate("series-detail"); };
  const handleNavigate = (target) => {
    NAV_HISTORY.length = 0;
    setPage(target);
    setSermon(null); setSeries(null);
  };
  const handleBack = () => {
    const prev = NAV_HISTORY.pop() || "list";
    setPage(prev);
  };

  // breadcrumb 생성
  const buildBreadcrumb = () => {
    const items = [
      { label: "홈", onClick: () => handleNavigate("list") },
      { label: "설교", onClick: () => handleNavigate("list") },
    ];
    if (page === "detail" && sermon) {
      items.push({ label: sermon.title });
    } else if (page === "all-sermons") {
      items.push({ label: "전체 설교" });
    } else if (page === "all-series") {
      items.push({ label: "시리즈" });
    } else if (page === "series-detail" && series) {
      items.push({ label: "시리즈", onClick: () => handleNavigate("all-series") });
      items.push({ label: series.title });
    } else if (page === "list") {
      items.pop(); // 마지막 "설교"를 active로
      items.push({ label: "설교" });
    }
    return items;
  };

  let PCContent, MContent, MLabel = "설교";
  if (page === "list") {
    PCContent = (
      <>
        <ListPCHero />
        <PCBreadcrumb items={buildBreadcrumb()} />
        <ListPCBody
          onSelectSermon={handleSelectSermon}
          onSelectSeries={handleSelectSeries}
          onSeeAllSermons={() => handleNavigate("all-sermons")}
          onSeeAllSeries={() => handleNavigate("all-series")} />
      </>
    );
    MContent = (
      <>
        <MListBanner />
        <MListBody
          onSelectSermon={handleSelectSermon}
          onSelectSeries={handleSelectSeries}
          onSeeAllSermons={() => handleNavigate("all-sermons")}
          onSeeAllSeries={() => handleNavigate("all-series")} />
      </>
    );
  } else if (page === "detail" && sermon) {
    PCContent = (
      <>
        <PCBreadcrumb items={buildBreadcrumb()} />
        <DetailPCBody sermon={sermon} onSelectSermon={(s) => { setSermon(s); }} />
      </>
    );
    MContent = <MDetailBody sermon={sermon} onSelectSermon={(s) => setSermon(s)} />;
    MLabel = "설교";
  } else if (page === "all-sermons") {
    PCContent = (
      <>
        <AllSermonsPCPage onSelectSermon={handleSelectSermon} onSelectSeries={handleSelectSeries} />
      </>
    );
    MContent = <AllSermonsMPage onSelectSermon={handleSelectSermon} onSelectSeries={handleSelectSeries} />;
  } else if (page === "all-series") {
    PCContent = <AllSeriesPCPage onSelectSeries={handleSelectSeries} />;
    MContent = <AllSeriesMPage onSelectSeries={handleSelectSeries} />;
  } else if (page === "series-detail" && series) {
    PCContent = (
      <>
        <PCBreadcrumb items={buildBreadcrumb()} />
        <SeriesDetailPCPage series={series} onSelectSermon={handleSelectSermon} />
      </>
    );
    MContent = <SeriesDetailMPage series={series} onSelectSermon={handleSelectSermon} />;
    MLabel = "시리즈";
  }

  const PCPage = (
    <div style={{ background: C.bg, fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <PCNav onNavigate={handleNavigate} />
      {PCContent}
      <PCFooter />
    </div>
  );

  const MPage = (
    <div style={{ background: C.bg, fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <MHeader showBack={page !== "list"} onBack={handleBack} label={MLabel} />
      {MContent}
      <MFooter />
      <MBottomNav />
    </div>
  );

  const PAGES_INFO = [
    { id: "list", label: "메인 (목록)" },
    { id: "detail", label: "상세" },
    { id: "all-sermons", label: "전체 설교" },
    { id: "all-series", label: "모든 시리즈" },
    { id: "series-detail", label: "시리즈 상세" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#262524",
      padding: "20px 16px 40px", fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ maxWidth: PAGE_MAX + 360, margin: "0 auto 18px", color: "#fff" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            소망교회 — 설교 통합 목업
            <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 10, fontWeight: 500 }}>
              · 5 페이지 · 1280px · 사이드바 필터
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ id: "pc", label: "PC" }, { id: "mobile", label: "Mobile" }, { id: "both", label: "Both" }].map(b => (
              <button key={b.id} onClick={() => setDevice(b.id)} style={{
                padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                background: device === b.id ? "#fff" : "transparent",
                color: device === b.id ? "#262524" : "#fff",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              }}>{b.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PAGES_INFO.map(p => (
            <button key={p.id}
              onClick={() => {
                if (p.id === "detail") { setSermon(FEATURED_SERMON); setPage("detail"); }
                else if (p.id === "series-detail") { setSeries(SERIES_PREVIEW[0]); setPage("series-detail"); }
                else { setPage(p.id); setSermon(null); setSeries(null); }
                window.scrollTo?.(0, 0);
              }}
              style={{
                padding: "8px 14px", borderRadius: 6,
                border: page === p.id ? `1px solid ${C.gold}` : "1px solid rgba(255,255,255,.1)",
                cursor: "pointer",
                background: page === p.id ? "rgba(196,146,74,.18)" : "rgba(255,255,255,.04)",
                color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start" }}>
        {(device === "pc" || device === "both") && (
          <div style={{
            flex: device === "both" ? "1 1 auto" : "0 0 auto",
            maxWidth: device === "both" ? PAGE_MAX + 40 : 1680,
            background: C.bg, borderRadius: 12, overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0,0,0,.35)",
          }}>{PCPage}</div>
        )}
        {(device === "mobile" || device === "both") && (
          <div style={{
            flex: "0 0 380px",
            background: C.bg, borderRadius: 12, overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0,0,0,.35)",
          }}>{MPage}</div>
        )}
      </div>
    </div>
  );
}
