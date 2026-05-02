import { useState, useEffect } from "react";

/* =========================================================
   소망교회 — 예배 안내 v3
   상단: 예배 시간/장소 (3섹션) → 하단: 예배의 의미 (Insight)
   ========================================================= */

const C = {
  bg: "#FAFAF8", dark: "#1A1A18", darkMid: "#2A2A26",
  surface: "#FFFFFF", surfaceAlt: "#F5F4F2",
  primary: "#5B7553", primaryLight: "#E8EFE6", primaryDark: "#3D5238",
  accent: "#C4834C", accentLight: "#FFF3E8",
  text: "#1A1A18", textSec: "#6B6B66", textTer: "#9C9C96",
  border: "#E8E6E1", borderLight: "#F0EEE9",
  gold: "#B8976A", goldLight: "#F5EDE0",
};

const MAIN_NAV = ["교회 소개", "예배 안내", "말씀", "양육과 교육", "커뮤니티"];

const SUB_TABS = [
  { id: "service", label: "예배 시간" },
  { id: "school", label: "교회학교" },
  { id: "online", label: "온라인 예배" },
  { id: "first", label: "처음 오신 분" },
];

const SUNDAY = [
  {
    name: "주일낮예배",
    time: "오전 11:00",
    place: "대예배실",
    desc: "온 성도가 함께 드리는 대표 예배입니다",
    duration: "약 90분",
    primary: true,
  },
  {
    name: "주일저녁예배",
    time: "오후 06:00",
    place: "대예배실",
    desc: "한 주를 정리하며 드리는 저녁 예배입니다",
    duration: "약 70분",
  },
];

const WEEKDAY = [
  {
    name: "수요기도회",
    day: "수요일",
    time: "오후 07:00",
    place: "대예배실",
    desc: "말씀과 기도로 한 주의 중심을 잡습니다",
  },
  {
    name: "금요기도회",
    day: "금요일",
    time: "오후 08:00",
    place: "대예배실",
    desc: "통성기도와 중보기도의 시간입니다",
  },
  {
    name: "새벽기도회",
    day: "월–토",
    time: "오전 05:30",
    place: "소예배실",
    desc: "매일 아침 말씀과 기도로 시작합니다",
  },
];

const SCHOOL = [
  { name: "유치부", age: "5–7세", time: "오전 09:00", place: "소예배실" },
  { name: "초등부", age: "1–6학년", time: "오전 09:00", place: "교육관 유초등부실" },
  { name: "중고등부", age: "중1–고3", time: "오전 09:00", place: "교육관 중고등부실" },
  { name: "청년부", age: "20–30대", time: "오후 01:30", place: "대예배실" },
];

const INSIGHTS = [
  {
    num: "01",
    icon: "📖",
    iconBg: C.primaryLight,
    title: "예배의 본질",
    sub: "WHY",
    desc: "예배는 형식이나 의식이 아니라, 살아계신 하나님과의 인격적인 만남입니다. 우리는 영과 진리로 하나님 앞에 나아가, 그분의 영광을 높이고 그분이 베푸신 은혜를 기억합니다.",
  },
  {
    num: "02",
    icon: "✝︎",
    iconBg: C.goldLight,
    title: "예배의 방식",
    sub: "HOW",
    desc: "말씀의 선포와 성례의 집행을 중심으로, 개혁주의 전통을 따라 예배를 드립니다. 찬양과 기도, 신앙고백과 봉헌을 통해 온 회중이 함께 하나님을 예배합니다.",
  },
  {
    num: "03",
    icon: "🤝",
    iconBg: C.accentLight,
    title: "예배의 자리",
    sub: "WHO",
    desc: "신자와 구도자, 처음 오신 분 모두 함께 드립니다. 정해진 복장이나 자격은 없습니다. 그저 마음을 열고 오시면, 따뜻한 환영이 기다리고 있습니다.",
  },
];

/* ============================
   PC VERSION
   ============================ */

function PCNav() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250,250,248,.96)", backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.borderLight}`,
    }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto", padding: "0 48px",
        display: "flex", alignItems: "center", height: 68,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginRight: 56 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>소망교회</span>
          <span style={{ fontSize: 10, color: C.textTer, letterSpacing: "0.1em", fontWeight: 500 }}>SOMANG CHURCH</span>
        </div>
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {MAIN_NAV.map((label, i) => (
            <button key={i} style={{
              padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
              background: i === 1 ? C.primaryLight : "transparent",
              color: i === 1 ? C.primary : C.textSec,
              fontSize: 15, fontWeight: i === 1 ? 600 : 500,
            }}>{label}</button>
          ))}
        </div>
        <button style={{
          padding: "9px 22px", borderRadius: 8, border: "none",
          background: C.dark, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>방문 등록</button>
      </div>
    </div>
  );
}

function PCHero({ activeTab }) {
  const activeLabel = SUB_TABS.find(t => t.id === activeTab)?.label || "";
  return (
    <div style={{
      background: `linear-gradient(180deg, ${C.dark}, ${C.darkMid})`,
      padding: "32px 48px 48px", position: "relative",
    }}>
      {/* Breadcrumb (top-left) */}
      <div style={{
        maxWidth: 1240, margin: "0 auto",
        fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: "0.05em",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ cursor: "pointer" }}>홈</span>
        <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
        <span style={{ cursor: "pointer" }}>예배 안내</span>
        <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
        <span style={{ color: C.gold, fontWeight: 500 }}>{activeLabel}</span>
      </div>

      {/* Center title */}
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <div style={{ fontSize: 13, color: C.gold, fontWeight: 500, letterSpacing: "0.1em", marginBottom: 10 }}>
          WORSHIP
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          예배 안내
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", margin: 0, lineHeight: 1.6 }}>
          하나님 앞에 함께 나아가는 시간을 안내드립니다
        </p>
      </div>
    </div>
  );
}

function PCSubNav({ active, onChange }) {
  return (
    <div style={{
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      position: "sticky", top: 68, zIndex: 40,
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px", display: "flex", gap: 4 }}>
        {SUB_TABS.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            padding: "14px 20px", border: "none", cursor: "pointer", background: "transparent",
            fontSize: 14, fontWeight: active === tab.id ? 600 : 400,
            color: active === tab.id ? C.primary : C.textSec,
            borderBottom: active === tab.id ? `2px solid ${C.primary}` : "2px solid transparent",
            transition: "all .12s",
          }}>{tab.label}</button>
        ))}
      </div>
    </div>
  );
}

/* --- Section header (공통) --- */
function SectionHeader({ label, title, action }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 22, paddingBottom: 14, borderBottom: `1px solid ${C.borderLight}`,
    }}>
      <div>
        <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, letterSpacing: "0.15em", marginBottom: 6 }}>
          {label}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* --- 섹션 1: 주일예배 (2컬럼) --- */
function SundaySection() {
  return (
    <section style={{ marginBottom: 56 }}>
      <SectionHeader label="SUNDAY" title="주일예배" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {SUNDAY.map((s, i) => (
          <div key={i} style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "32px 32px",
            position: "relative", overflow: "hidden",
          }}>
            {s.primary && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3, background: C.primary,
              }} />
            )}
            {/* Top label */}
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: s.primary ? C.primary : C.textTer,
              letterSpacing: "0.12em", marginBottom: 10,
            }}>
              {s.primary ? "● 대표 예배" : "주일 저녁"}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                {s.name}
              </span>
            </div>

            <div style={{
              fontSize: 32, fontWeight: 700, color: C.text,
              fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
              marginBottom: 18, lineHeight: 1,
            }}>
              {s.time}
            </div>

            <div style={{
              display: "flex", gap: 24, paddingTop: 18,
              borderTop: `1px solid ${C.borderLight}`,
              marginBottom: 14,
            }}>
              <div>
                <div style={{
                  fontSize: 11, color: C.textTer, marginBottom: 4,
                  letterSpacing: "0.08em", fontWeight: 600,
                }}>
                  장소
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                  {s.place}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 11, color: C.textTer, marginBottom: 4,
                  letterSpacing: "0.08em", fontWeight: 600,
                }}>
                  소요시간
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                  {s.duration}
                </div>
              </div>
            </div>

            <p style={{
              fontSize: 13.5, color: C.textSec, margin: 0, lineHeight: 1.6,
            }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- 섹션 2: 평일예배 (3컬럼) --- */
function WeekdaySection() {
  return (
    <section style={{ marginBottom: 56 }}>
      <SectionHeader label="WEEKDAY" title="평일예배" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {WEEKDAY.map((s, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "26px 24px",
          }}>
            <div style={{
              fontSize: 11, color: C.gold, fontWeight: 600,
              letterSpacing: "0.1em", marginBottom: 10,
            }}>
              {s.day.toUpperCase()} · {s.day}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              {s.name}
            </div>
            <div style={{
              fontSize: 24, fontWeight: 700, color: C.text,
              fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
              marginBottom: 16, lineHeight: 1,
            }}>
              {s.time}
            </div>
            <div style={{
              fontSize: 13, color: C.textSec, paddingTop: 14,
              borderTop: `1px solid ${C.borderLight}`, marginBottom: 10,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.textTer }} />
              {s.place}
            </div>
            <p style={{
              fontSize: 12.5, color: C.textTer, margin: 0, lineHeight: 1.6,
            }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- 섹션 3: 교회학교 (4컬럼) --- */
function SchoolSection() {
  return (
    <section style={{ marginBottom: 72 }}>
      <SectionHeader
        label="SUNDAY SCHOOL"
        title="교회학교 예배"
        action={
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: C.primary, fontWeight: 600,
            textDecoration: "none", padding: "8px 14px",
            border: `1px solid ${C.border}`, borderRadius: 8,
            background: C.surface,
          }}>
            교회학교 페이지
            <span style={{ fontSize: 14 }}>→</span>
          </a>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {SCHOOL.map((s, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "22px 20px",
          }}>
            <div style={{
              display: "inline-block", fontSize: 10.5, fontWeight: 700,
              color: C.gold, background: C.goldLight,
              padding: "3px 8px", borderRadius: 4,
              letterSpacing: "0.05em", marginBottom: 12,
            }}>
              {s.age}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              {s.name}
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700, color: C.text,
              fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
              marginBottom: 12,
            }}>
              {s.time}
            </div>
            <div style={{
              fontSize: 12, color: C.textSec, paddingTop: 12,
              borderTop: `1px solid ${C.borderLight}`,
              lineHeight: 1.5,
            }}>
              {s.place}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- Insight 섹션 (하단, 비전 페이지 패턴) --- */
function InsightSection() {
  return (
    <section style={{ background: C.surfaceAlt, padding: "72px 0 80px", borderTop: `1px solid ${C.borderLight}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 13, color: C.gold, fontWeight: 600, letterSpacing: "0.12em", marginBottom: 8 }}>
            ABOUT WORSHIP
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
            우리가 드리는 예배
          </h2>
          <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
            소망교회는 개혁주의 전통 위에서, 영과 진리로 하나님을 예배합니다.
          </p>
        </div>

        {/* Verse box (dark) */}
        <div style={{
          background: C.dark, borderRadius: 16, padding: "32px 36px",
          marginBottom: 40, textAlign: "center",
        }}>
          <div style={{
            fontSize: 12, color: C.gold, fontWeight: 500,
            letterSpacing: "0.12em", marginBottom: 10,
          }}>
            요한복음 4 : 24
          </div>
          <p style={{
            fontSize: 18, color: "#fff", fontWeight: 600, lineHeight: 1.7,
            margin: 0, letterSpacing: "-0.005em",
          }}>
            "하나님은 영이시니 예배하는 자가<br />
            영과 진리로 예배할지니라."
          </p>
        </div>

        {/* 1열 인사이트 리스트 */}
        <div>
          {INSIGHTS.map((it, i) => (
            <div key={i} style={{
              display: "flex", gap: 28, padding: "32px 0",
              borderBottom: i < INSIGHTS.length - 1 ? `1px solid ${C.borderLight}` : "none",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: it.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}>
                {it.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{it.num}</span>
                  <span style={{ fontSize: 19, fontWeight: 700, color: C.text }}>{it.title}</span>
                  <span style={{
                    fontSize: 10, color: C.textTer, fontWeight: 600,
                    letterSpacing: "0.15em", marginLeft: 4,
                  }}>
                    · {it.sub}
                  </span>
                </div>
                <p style={{
                  fontSize: 14.5, color: C.textSec, lineHeight: 1.85, margin: 0,
                  wordBreak: "keep-all", maxWidth: 880,
                }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PCFooter() {
  return (
    <div style={{ background: C.dark }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto", padding: "36px 48px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,.7)", marginRight: 16 }}>소망교회</span>
          서울시 마포구 소망로 123 · 02-1234-5678
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>© 2026 소망교회. All Rights Reserved.</div>
      </div>
    </div>
  );
}

function PCView() {
  const [active, setActive] = useState("service");
  return (
    <div style={{ background: C.bg, fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <PCNav />
      <PCHero activeTab={active} />
      <PCSubNav active={active} onChange={setActive} />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 48px 24px" }}>
        <SundaySection />
        <WeekdaySection />
        <SchoolSection />
      </div>
      <InsightSection />
      <PCFooter />
    </div>
  );
}

/* ============================
   MOBILE VERSION
   ============================ */

function MHeader() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250,250,248,.96)", backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${C.borderLight}`,
      padding: "0 16px", display: "flex", alignItems: "center", height: 54, gap: 10,
    }}>
      <button style={{
        width: 36, height: 36, borderRadius: 8,
        border: `1px solid ${C.border}`, background: "transparent",
        fontSize: 16, color: C.textSec,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>←</button>
      <span style={{ fontSize: 16, fontWeight: 700, color: C.text, flex: 1 }}>예배 안내</span>
      <button style={{
        width: 32, height: 32, borderRadius: 6,
        border: `1px solid ${C.border}`, background: "transparent",
        fontSize: 13, color: C.textTer,
      }}>가+</button>
    </div>
  );
}

function MSubTabs({ active, onChange }) {
  return (
    <div style={{
      position: "sticky", top: 54, zIndex: 40, background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      display: "flex", overflowX: "auto", scrollbarWidth: "none", padding: "0 4px",
    }}>
      {SUB_TABS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "13px 16px", border: "none", cursor: "pointer", background: "transparent",
          fontSize: 14, fontWeight: active === t.id ? 600 : 400,
          color: active === t.id ? C.primary : C.textTer,
          borderBottom: active === t.id ? `2px solid ${C.primary}` : "2px solid transparent",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function MBanner() {
  return (
    <div style={{
      background: `linear-gradient(180deg,${C.dark},${C.darkMid})`,
      padding: "32px 20px 28px", textAlign: "center",
    }}>
      <div style={{ fontSize: 11, color: C.gold, fontWeight: 500, letterSpacing: "0.1em", marginBottom: 8 }}>
        WORSHIP
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        예배 안내
      </h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: 0, lineHeight: 1.55 }}>
        하나님 앞에 함께 나아가는 시간
      </p>
    </div>
  );
}

function MSectionHead({ label, title, action }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.borderLight}`,
    }}>
      <div>
        <div style={{ fontSize: 10, color: C.primary, fontWeight: 600, letterSpacing: "0.15em", marginBottom: 4 }}>
          {label}
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function MSundaySection() {
  return (
    <section style={{ marginBottom: 36 }}>
      <MSectionHead label="SUNDAY" title="주일예배" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SUNDAY.map((s, i) => (
          <div key={i} style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "18px 18px",
            position: "relative", overflow: "hidden",
          }}>
            {s.primary && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3, background: C.primary,
              }} />
            )}

            {/* Top label */}
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: s.primary ? C.primary : C.textTer,
              letterSpacing: "0.12em", marginBottom: 8,
            }}>
              {s.primary ? "● 대표 예배" : "주일 저녁"}
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                {s.name}
              </span>
              <div style={{
                fontSize: 18, fontWeight: 700, color: C.text,
                fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
              }}>
                {s.time}
              </div>
            </div>
            <div style={{
              fontSize: 12, color: C.textTer, marginBottom: 8,
              display: "flex", gap: 10,
            }}>
              <span>{s.place}</span>
              <span>·</span>
              <span>{s.duration}</span>
            </div>
            <p style={{
              fontSize: 12, color: C.textSec, margin: 0, lineHeight: 1.55,
            }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MWeekdaySection() {
  return (
    <section style={{ marginBottom: 36 }}>
      <MSectionHead label="WEEKDAY" title="평일예배" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {WEEKDAY.map((s, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              minWidth: 56, paddingRight: 12,
              borderRight: `1px solid ${C.borderLight}`,
            }}>
              <div style={{
                fontSize: 9, color: C.gold, fontWeight: 600,
                letterSpacing: "0.1em", marginBottom: 2,
              }}>
                {s.day}
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: C.text,
                fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
              }}>
                {s.time.replace("오전 ", "").replace("오후 ", "")}
              </div>
              <div style={{ fontSize: 9, color: C.textTer, marginTop: 1 }}>
                {s.time.includes("오전") ? "AM" : "PM"}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 11.5, color: C.textTer, marginBottom: 4 }}>
                {s.place}
              </div>
              <p style={{ fontSize: 11.5, color: C.textSec, margin: 0, lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MSchoolSection() {
  return (
    <section>
      <MSectionHead
        label="SUNDAY SCHOOL"
        title="교회학교 예배"
        action={
          <a href="#" style={{
            fontSize: 11.5, color: C.primary, fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 3,
          }}>
            전체 보기 <span style={{ fontSize: 13 }}>→</span>
          </a>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {SCHOOL.map((s, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "14px 14px",
          }}>
            <div style={{
              display: "inline-block", fontSize: 9.5, fontWeight: 700,
              color: C.gold, background: C.goldLight,
              padding: "2px 6px", borderRadius: 3,
              letterSpacing: "0.04em", marginBottom: 8,
            }}>
              {s.age}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              {s.name}
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: C.text,
              fontVariantNumeric: "tabular-nums", marginBottom: 8,
            }}>
              {s.time}
            </div>
            <div style={{
              fontSize: 11, color: C.textSec, paddingTop: 8,
              borderTop: `1px solid ${C.borderLight}`, lineHeight: 1.4,
            }}>
              {s.place}
            </div>
          </div>
        ))}
      </div>

      {/* 교회학교 페이지 이동 링크 (full-width) */}
      <a href="#" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 10, padding: "14px 16px",
        background: C.surfaceAlt, border: `1px solid ${C.borderLight}`,
        borderRadius: 10, textDecoration: "none",
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            교회학교 페이지로 이동
          </div>
          <div style={{ fontSize: 11.5, color: C.textTer, marginTop: 2 }}>
            교사진 · 교과 과정 · 행사 일정 안내
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: C.surface,
          border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.primary, fontSize: 14, fontWeight: 700,
        }}>
          →
        </div>
      </a>
    </section>
  );
}

function MInsightSection() {
  return (
    <section style={{ background: C.surfaceAlt, padding: "40px 18px 44px", borderTop: `1px solid ${C.borderLight}` }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "0.12em", marginBottom: 6 }}>
          ABOUT WORSHIP
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
          우리가 드리는 예배
        </h2>
        <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7, margin: 0 }}>
          소망교회는 개혁주의 전통 위에서<br />
          영과 진리로 하나님을 예배합니다.
        </p>
      </div>

      <div style={{
        background: C.dark, borderRadius: 14, padding: "22px 22px",
        marginBottom: 28, textAlign: "center",
      }}>
        <div style={{
          fontSize: 11, color: C.gold, fontWeight: 500,
          letterSpacing: "0.12em", marginBottom: 8,
        }}>
          요한복음 4 : 24
        </div>
        <p style={{
          fontSize: 14.5, color: "#fff", fontWeight: 600, lineHeight: 1.7, margin: 0,
        }}>
          "하나님은 영이시니<br />
          예배하는 자가 영과 진리로<br />
          예배할지니라."
        </p>
      </div>

      <div>
        {INSIGHTS.map((it, i) => (
          <div key={i} style={{
            display: "flex", gap: 14, padding: "20px 0",
            borderBottom: i < INSIGHTS.length - 1 ? `1px solid ${C.borderLight}` : "none",
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11, flexShrink: 0,
              background: it.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              {it.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>{it.num}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{it.title}</span>
                <span style={{
                  fontSize: 9, color: C.textTer, fontWeight: 600, letterSpacing: "0.12em",
                }}>· {it.sub}</span>
              </div>
              <p style={{
                fontSize: 12.5, color: C.textSec, lineHeight: 1.75, margin: 0, wordBreak: "keep-all",
              }}>
                {it.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MFooter() {
  return (
    <div style={{ background: C.dark, padding: "24px 18px 20px" }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", fontWeight: 700, marginBottom: 4 }}>
        소망교회
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>
        서울시 마포구 소망로 123<br />
        02-1234-5678
      </div>
      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: `1px solid rgba(255,255,255,.08)`,
        fontSize: 11, color: "rgba(255,255,255,.25)",
      }}>
        © 2026 소망교회
      </div>
    </div>
  );
}

function MView() {
  const [active, setActive] = useState("service");
  return (
    <div style={{ background: C.bg, fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <MHeader />
      <MSubTabs active={active} onChange={setActive} />
      <MBanner />
      <div style={{ padding: "24px 18px 28px" }}>
        <MSundaySection />
        <MWeekdaySection />
        <MSchoolSection />
      </div>
      <MInsightSection />
      <MFooter />
    </div>
  );
}

/* ============================
   FRAME
   ============================ */

export default function ChurchWorshipPreviewV4() {
  const [device, setDevice] = useState("both");

  useEffect(() => {
    const id = "church-worship-fonts-v3";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#262524", padding: "20px 16px 60px",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{
        maxWidth: 1640, margin: "0 auto 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "#fff",
      }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          소망교회
          <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 10, fontWeight: 500 }}>
            · 예배 안내 v4 · 위계 정리 + 페이지 링크
          </span>
        </div>
        <div style={{
          display: "flex", gap: 2, padding: 3,
          background: "rgba(255,255,255,.06)",
          border: `1px solid rgba(255,255,255,.08)`,
          borderRadius: 8,
        }}>
          {[
            { id: "both", label: "PC + Mobile" },
            { id: "pc", label: "PC" },
            { id: "mobile", label: "Mobile" },
          ].map(b => (
            <button key={b.id} onClick={() => setDevice(b.id)} style={{
              padding: "7px 14px", border: "none", cursor: "pointer", borderRadius: 5,
              background: device === b.id ? "#fff" : "transparent",
              color: device === b.id ? C.text : "rgba(255,255,255,.7)",
              fontSize: 12, fontWeight: 600,
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: 1640, margin: "0 auto",
        display: "flex", gap: 24, justifyContent: "center",
        alignItems: "flex-start", flexWrap: "wrap",
      }}>
        {(device === "both" || device === "pc") && (
          <div style={{
            flex: device === "both" ? "1 1 1100px" : "1 1 100%",
            minWidth: 0, maxWidth: device === "both" ? 1240 : "100%",
          }}>
            <div style={{
              fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: "0.2em",
              textTransform: "uppercase", marginBottom: 8, paddingLeft: 4, fontWeight: 600,
            }}>
              Desktop · 1240
            </div>
            <div style={{
              background: C.bg, borderRadius: 6, overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,.4)",
              maxHeight: 800, overflowY: "auto",
              border: "1px solid rgba(255,255,255,.06)",
            }}>
              <PCView />
            </div>
          </div>
        )}

        {(device === "both" || device === "mobile") && (
          <div style={{ flex: "0 0 auto" }}>
            <div style={{
              fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: "0.2em",
              textTransform: "uppercase", marginBottom: 8, paddingLeft: 4, fontWeight: 600,
            }}>
              Mobile · 390
            </div>
            <div style={{
              width: 390, background: C.bg, borderRadius: 24, overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,.4)",
              maxHeight: 800, overflowY: "auto",
              border: "1px solid rgba(255,255,255,.06)",
            }}>
              <MView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
