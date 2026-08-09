import { useState, useCallback, useEffect } from "react";

// ── Persistent state hook ──────────────────────────────────────────────────
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

const EMP_TYPES = [
  {
    id: 1,
    label: "学生 (Student)",
    short: "学生",
    maxHours: 28,
    color: "#3B82F6",
  },
  {
    id: 2,
    label: "フリーランス (Free Lance)",
    short: "フリー",
    maxHours: 48,
    color: "#10B981",
  },
  {
    id: 3,
    label: "学生許可 (Student Allow)",
    short: "学生許可",
    maxHours: 40,
    color: "#8B5CF6",
  },
];
const DAYS_JP = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS_JP = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];
const SHOP_LOCATION = {
  lat: 34.65793078887488,
  lng: 135.49822321329515,
};
const SHOP_LOCATION_URL = `https://www.google.com/maps/search/?api=1&query=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}`;
const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - 2 + i,
);
const HRS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDow = (y, m) => new Date(y, m, 1).getDay();
function calcHours(tin, tout) {
  if (!tin || !tout) return null;
  const [th, tm] = tin.split(":").map(Number);
  const [oh, om] = tout.split(":").map(Number);
  let diff = oh * 60 + om - (th * 60 + tm);
  if (diff < 0) diff += 1440;
  return +(diff / 60).toFixed(2);
}
function fmtHours(h) {
  if (h == null) return "";
  const hrs = Math.floor(h),
    mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h${mins}m` : `${hrs}h`;
}

// ── Drum-roll time picker (no free-text, confirm required) ─────────────────
function TimePicker({ label, color, value, onConfirm, theme }) {
  // value = "HH:MM" or ""
  const initH = value ? value.split(":")[0] : "09";
  const initM = value ? value.split(":")[1] : "00";
  const [draftH, setDraftH] = useState(initH);
  const [draftM, setDraftM] = useState(initM);
  const [open, setOpen] = useState(false);

  const confirmed = !!value;

  const handleConfirm = () => {
    onConfirm(`${draftH}:${draftM}`);
    setOpen(false);
  };
  const handleClear = (e) => {
    e.stopPropagation();
    onConfirm("");
    setOpen(false);
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          color: theme.subtle,
          marginBottom: 5,
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      {/* Display button — opens picker */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDraftH(value ? value.split(":")[0] : "09");
          setDraftM(value ? value.split(":")[1] : "00");
          setOpen((o) => !o);
        }}
        style={{
          width: "100%",
          background: confirmed ? `${color}22` : theme.inputBg,
          border: `2px solid ${
            open ? color
            : confirmed ? color + "88"
            : theme.inputBorder
          }`,
          borderRadius: 10,
          padding: "12px 10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "all 0.2s",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: confirmed ? color : theme.muted,
            letterSpacing: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {confirmed ? value : "--:--"}
        </span>
        <span style={{ fontSize: 12, color: open ? color : theme.muted }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Picker dropdown */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 6,
            background: theme.surfaceAlt,
            border: `1px solid ${color}55`,
            borderRadius: 12,
            padding: 14,
            boxShadow: `0 12px 40px ${theme.shadow}`,
            zIndex: 10,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {/* Hour column */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: theme.subtle,
                  textAlign: "center",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                時 (Hour)
              </div>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  scrollbarWidth: "thin",
                }}
              >
                {HRS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setDraftH(h)}
                    style={{
                      padding: "7px 0",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 15,
                      fontVariantNumeric: "tabular-nums",
                      background:
                        draftH === h ?
                          `linear-gradient(135deg,${color},${color}bb)`
                        : theme.panel,
                      color: draftH === h ? "#fff" : theme.muted,
                      transition: "all 0.12s",
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 22,
                color: theme.muted,
                paddingTop: 20,
              }}
            >
              :
            </div>
            {/* Minute column */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: theme.subtle,
                  textAlign: "center",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                分 (Min)
              </div>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  scrollbarWidth: "thin",
                }}
              >
                {MINS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setDraftM(m)}
                    style={{
                      padding: "7px 0",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 15,
                      fontVariantNumeric: "tabular-nums",
                      background:
                        draftM === m ?
                          `linear-gradient(135deg,${color},${color}bb)`
                        : theme.panel,
                      color: draftM === m ? "#fff" : theme.muted,
                      transition: "all 0.12s",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Draft preview */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 10,
              fontSize: 26,
              fontWeight: 800,
              color,
              letterSpacing: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {draftH}:{draftM}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {confirmed && (
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.4)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                クリア
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
              }}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.panel,
                color: theme.muted,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 2,
                padding: "9px 0",
                borderRadius: 8,
                border: "none",
                background: `linear-gradient(135deg,${color},${color}bb)`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: `0 4px 14px ${color}44`,
              }}
            >
              ✓ 確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const now = new Date();
  // ── Persisted across page refreshes ──────────────────────────────────────
  const [calYear, setCalYear] = useLocalStorage(
    "mm_calYear",
    now.getFullYear(),
  );
  const [calMonth, setCalMonth] = useLocalStorage(
    "mm_calMonth",
    now.getMonth(),
  );
  const [employees, setEmployees] = useLocalStorage("mm_employees", []);
  const [schedule, setSchedule] = useLocalStorage("mm_schedule", {});
  // ── Session-only UI state ─────────────────────────────────────────────────
  const [showYMPicker, setShowYMPicker] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState(1);
  const [expandedEmp, setExpandedEmp] = useState(null);
  const [empCal, setEmpCal] = useState({});
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [printWeek, setPrintWeek] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isDarkMode, setIsDarkMode] = useLocalStorage("mm_theme", true);

  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const theme =
    isDarkMode ?
      {
        pageBg: "#1F2937",
        headerBg: "rgba(30,41,59,0.95)",
        panel: "rgba(255,255,255,0.05)",
        panelStrong: "rgba(255,255,255,0.08)",
        card: "rgba(255,255,255,0.06)",
        cardStrong: "rgba(255,255,255,0.1)",
        border: "rgba(255,255,255,0.12)",
        text: "#f8fafc",
        muted: "#cbd5e1",
        subtle: "#94a3b8",
        soft: "#cbd5e1",
        shadow: "rgba(0,0,0,0.35)",
        modal: "rgba(15,23,42,0.82)",
        inputBg: "rgba(255,255,255,0.06)",
        inputBorder: "rgba(255,255,255,0.14)",
        inputText: "#f8fafc",
        grid: "rgba(255,255,255,0.06)",
        surface: "rgba(30,41,59,0.88)",
        surfaceAlt: "rgba(30,41,59,0.72)",
      }
    : {
        pageBg: "#F9FAFB",
        headerBg: "rgba(255,255,255,0.92)",
        panel: "rgba(255,255,255,0.78)",
        panelStrong: "rgba(255,255,255,0.96)",
        card: "rgba(255,255,255,0.84)",
        cardStrong: "rgba(255,255,255,0.96)",
        border: "rgba(15,23,42,0.12)",
        text: "#0f172a",
        muted: "#475569",
        subtle: "#64748b",
        soft: "#334155",
        shadow: "rgba(148,163,184,0.24)",
        modal: "rgba(15,23,42,0.5)",
        inputBg: "rgba(255,255,255,0.95)",
        inputBorder: "rgba(15,23,42,0.12)",
        inputText: "#0f172a",
        grid: "rgba(15,23,42,0.06)",
        surface: "rgba(255,255,255,0.88)",
        surfaceAlt: "rgba(248,250,252,0.95)",
      };

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };
  const toggleTheme = () => setIsDarkMode((v) => !v);

  // ── Shift window constants (minutes from midnight) ──────────────────────
  // Day shift:        06:00 (360) – 17:00 (1020)  → max 2 staff
  // Night shift:      22:00 (1320) – 02:00 (1560)  → max 1 staff
  // Owner-only:       02:00 (1560*) – 06:30 (390)  → 0 staff (owner only)
  // *night window wraps midnight, so we compare on a 48h timeline (add 1440 for post-midnight)

  // Normalise a HH:MM time to minutes (0-1439)
  const toMins = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Check whether a shift [startM, endM] (both in 0-2879 space for overnight) overlaps [winS, winE]
  const overlaps = (startM, endM, winS, winE) => startM < winE && endM > winS;

  // Count staff (including the override candidate) whose shift overlaps a given window
  const countInWindow = (
    year,
    month,
    day,
    winS,
    winE,
    overrideEmpId,
    overrideTin,
    overrideTout,
  ) => {
    let count = 0;
    for (const emp of employees) {
      let tin, tout;
      if (emp.id === overrideEmpId) {
        tin = overrideTin;
        tout = overrideTout;
      } else {
        const e = schedule[`${year}-${month}-${day}-${emp.id}`];
        tin = e?.tin || null;
        tout = e?.tout || null;
      }
      if (!tin || !tout) continue;
      let start = toMins(tin),
        end = toMins(tout);
      if (end <= start) end += 1440; // overnight
      if (overlaps(start, end, winS, winE)) count++;
    }
    return count;
  };

  // Count overlaps per 1-hour bucket (0-23) including the override candidate
  const hourlyOverlapCounts = (
    year,
    month,
    day,
    overrideEmpId,
    overrideTin,
    overrideTout,
  ) => {
    const counts = Array(24).fill(0);
    const considerShift = (tin, tout) => {
      if (!tin || !tout) return;
      let start = toMins(tin);
      let end = toMins(tout);
      if (end <= start) end += 1440; // overnight
      const startBucket = Math.floor(start / 60);
      const endBucket = Math.floor((end - 1) / 60);
      for (let b = startBucket; b <= endBucket; b++) {
        counts[b % 24] += 1;
      }
    };
    for (const emp of employees) {
      if (emp.id === overrideEmpId) {
        considerShift(overrideTin, overrideTout);
      } else {
        const e = schedule[`${year}-${month}-${day}-${emp.id}`];
        considerShift(e?.tin, e?.tout);
      }
    }
    return counts;
  };

  // Classify which rule windows a proposed shift touches
  const classifyShift = (tin, tout) => {
    let start = toMins(tin),
      end = toMins(tout);
    if (end <= start) end += 1440;
    // Day:   06:00(360)–17:00(1020)
    // Night: 22:00(1320)–02:00(1560, overnight +1440)
    // Owner: 02:00(120)–06:30(390) normal, or 02:00(1560)–06:30(1830) overnight
    const hitsDay = overlaps(start, end, 360, 1020);
    const hitsNight = overlaps(start, end, 1320, 1560);
    const hitsOwner =
      overlaps(start, end, 120, 390) || overlaps(start, end, 1560, 1830);
    return { hitsDay, hitsNight, hitsOwner };
  };

  const addEmployee = () => {
    if (!newName.trim()) {
      showToast("名前を入力してください", "error");
      return;
    }
    if (employees.find((e) => e.name === newName.trim())) {
      showToast("同じ名前が存在します", "error");
      return;
    }
    const emp = { id: Date.now(), name: newName.trim(), typeId: newType };
    setEmployees((p) => [...p, emp]);
    setNewName("");
    showToast(`「${emp.name}」を追加しました ✓`, "success");
  };
  const removeEmployee = (id) => {
    setEmployees((p) => p.filter((e) => e.id !== id));
    setSchedule((p) => {
      const n = { ...p };
      Object.keys(n).forEach((k) => {
        if (k.endsWith(`-${id}`)) delete n[k];
      });
      return n;
    });
    if (expandedEmp === id) setExpandedEmp(null);
  };

  const getEmpCal = (empId) =>
    empCal[empId] || { year: calYear, month: calMonth, selectedDay: null };
  const setEmpCalField = (empId, fields) =>
    setEmpCal((p) => ({ ...p, [empId]: { ...getEmpCal(empId), ...fields } }));

  const getWeeklyBreakdown = useCallback(
    (empId, y, m) => {
      const fy = y || calYear,
        fm = m !== undefined ? m : calMonth;
      const fd2 = firstDow(fy, fm),
        days = daysInMonth(fy, fm);
      const weeks = {};
      for (let d = 1; d <= days; d++) {
        const wk = Math.floor((fd2 + d - 1) / 7);
        if (!weeks[wk]) weeks[wk] = 0;
        const e = schedule[`${fy}-${fm}-${d}-${empId}`];
        if (e) {
          const h = calcHours(e.tin, e.tout);
          if (h) weeks[wk] += h;
        }
      }
      return weeks;
    },
    [schedule, calYear, calMonth],
  );

  const doSaveShift = (year, month, day, empId, updated) => {
    const key = `${year}-${month}-${day}-${empId}`;
    if (updated.tin && updated.tout) {
      const addH = calcHours(updated.tin, updated.tout);
      const emp = employees.find((e) => e.id === empId);
      const type = EMP_TYPES.find((t) => t.id === emp.typeId);
      const fd2 = firstDow(year, month);
      const wk = Math.floor((fd2 + day - 1) / 7);
      const wks = getWeeklyBreakdown(empId, year, month);
      const prevH =
        schedule[key] ?
          calcHours(schedule[key].tin, schedule[key].tout) || 0
        : 0;
      const total = (wks[wk] || 0) - prevH + addH;
      if (total > type.maxHours)
        showToast(
          `⚠️ ${emp.name}（${type.short}）週間上限 ${type.maxHours}h 超過！（この週: ${fmtHours(total)}）`,
          "error",
        );
    }
    setSchedule((p) => {
      const n = { ...p };
      if (Object.keys(updated).length === 0) delete n[key];
      else n[key] = updated;
      return n;
    });
  };

  const confirmShiftTime = (year, month, day, empId, field, value) => {
    const key = `${year}-${month}-${day}-${empId}`;
    const prev = schedule[key] || {};
    const updated = { ...prev, [field]: value || undefined };
    if (!updated.tin) delete updated.tin;
    if (!updated.tout) delete updated.tout;

    const hasTin = !!updated.tin;
    const hasTout = !!updated.tout;
    if (hasTin !== hasTout) {
      showToast("⚠ 出勤・退勤時間を入力してください", "error");
    }

    if (hasTin && hasTout) {
      const emp = employees.find((e) => e.id === empId);
      const { hitsDay, hitsNight, hitsOwner } = classifyShift(
        updated.tin,
        updated.tout,
      );
      const dateLabel = `${year}年${MONTHS_JP[month]}${day}日`;

      // ── Per-hour (1時間) slot check: normally max 2 staff per 1-hour slot ──
      const hourCounts = hourlyOverlapCounts(
        year,
        month,
        day,
        empId,
        updated.tin,
        updated.tout,
      );
      for (let h = 0; h < 24; h++) {
        if (hourCounts[h] >= 3) {
          const startLabel = String(h).padStart(2, "0") + ":00";
          const endLabel = String((h + 1) % 24).padStart(2, "0") + ":00";
          if (hourCounts[h] === 3) {
            setConfirmDialog({
              level: "warn",
              title: "⚠️ 1時間枠の上限超過",
              message: `${dateLabel} の ${startLabel}〜${endLabel} に\n従業員が2名越えました。\n追加してもよろしいですか？`,
              badge: "従業員が2名越えました",
              onConfirm: () => {
                doSaveShift(year, month, day, empId, updated);
                setConfirmDialog(null);
              },
            });
            return;
          }
          // 4名以上など大幅超過
          setConfirmDialog({
            level: "over",
            title: "🚨 1時間枠 上限大幅超過",
            message: `${dateLabel} の ${startLabel}〜${endLabel} に\n既に ${hourCounts[h] - 1}名 が登録されています。\n「${emp.name}」を追加すると ${hourCounts[h]}名 になります。`,
            badge: "🚨 1時間枠上限を超えています",
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
      }

      // ── OWNER-ONLY WINDOW: 02:00–06:30 (no staff allowed) ─────────────────
      if (hitsOwner) {
        const ownerCount =
          countInWindow(
            year,
            month,
            day,
            120,
            390,
            empId,
            updated.tin,
            updated.tout,
          ) +
          countInWindow(
            year,
            month,
            day,
            1560,
            1830,
            empId,
            updated.tin,
            updated.tout,
          );
        if (ownerCount === 1) {
          // First staff in owner window → single confirm
          setConfirmDialog({
            level: "warn",
            title: "⚠️ オーナー専用時間帯",
            message: `${dateLabel} の 02:00〜06:30 は
オーナー専用の時間帯です。

「${emp.name}」のシフトがこの時間帯に重なっています。

オーナーの承認が必要です。追加しますか？`,
            badge: "🌙 02:00〜06:30 はオーナー専用",
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
        if (ownerCount >= 2) {
          // 2+ staff in owner window → double confirm required
          setConfirmDialog({
            level: "over",
            title: "🚨 オーナー専用時間帯 — 2名目",
            message: `${dateLabel} の 02:00〜06:30 は
オーナー専用の時間帯です。

既に ${ownerCount - 1}名 がこの時間帯に登録されています。
「${emp.name}」を追加すると ${ownerCount}名 になります。

この操作にはオーナーの二重確認が必要です。`,
            badge: "🚨 オーナー二重確認が必要",
            requireDouble: true,
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
      }

      // ── NIGHT SHIFT WINDOW: 22:00–02:00 (max 1 staff) ────────────────────
      if (hitsNight) {
        const nightCount = countInWindow(
          year,
          month,
          day,
          1320,
          1560,
          empId,
          updated.tin,
          updated.tout,
        );
        if (nightCount === 2) {
          // 2 staff: warn + confirm
          setConfirmDialog({
            level: "warn",
            title: "⚠️ 夜間シフト超過の確認",
            message: `${dateLabel}（22:00〜02:00）に
既に 1名 の夜間スタッフが登録されています。

「${emp.name}」を追加すると 2名 になります。

オーナーのルールでは夜間は1名が上限です。
本当に追加しますか？`,
            badge: "🌙 22:00〜02:00 は通常1名まで",
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
        if (nightCount >= 3) {
          setConfirmDialog({
            level: "over",
            title: "🚨 夜間スタッフ上限超過",
            message: `${dateLabel}（22:00〜02:00）に
既に ${nightCount - 1}名 が登録されています。

「${emp.name}」を追加すると ${nightCount}名 になります。

オーナー設定の上限（1名）を大幅に超えています。`,
            badge: "🚨 夜間上限を超えています",
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
      }

      // ── DAY SHIFT WINDOW: 06:00–17:00 (max 2 staff) ─────────────────────
      if (hitsDay) {
        const dayCount = countInWindow(
          year,
          month,
          day,
          360,
          1020,
          empId,
          updated.tin,
          updated.tout,
        );
        if (dayCount === 3) {
          setConfirmDialog({
            level: "warn",
            title: "⚠️ 日中スタッフ超過の確認",
            message: `${dateLabel}（06:00〜17:00）に
既に 2名 のスタッフが登録されています。

「${emp.name}」を追加すると 3名 になります。

オーナーのルールでは通常2名が上限です。
本当に追加しますか？`,
            badge: "☀️ 06:00〜17:00 は通常2名まで",
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
        if (dayCount >= 4) {
          setConfirmDialog({
            level: "over",
            title: "🚨 日中スタッフ上限超過",
            message: `${dateLabel}（06:00〜17:00）に
既に ${dayCount - 1}名 が登録されています。

「${emp.name}」を追加すると ${dayCount}名 になります。

オーナー設定の上限（2名）を大幅に超えています。`,
            badge: "🚨 日中上限を超えています",
            onConfirm: () => {
              doSaveShift(year, month, day, empId, updated);
              setConfirmDialog(null);
            },
          });
          return;
        }
      }
    }

    doSaveShift(year, month, day, empId, updated);
  };

  const dim = daysInMonth(calYear, calMonth);
  const fd = firstDow(calYear, calMonth);

  const exportCSV = () => {
    if (!employees.length) {
      showToast("スタッフを追加してください", "error");
      return;
    }
    const header = ["スタッフ名", "種別", "週間上限"]
      .concat(
        Array.from(
          { length: dim },
          (_, i) => `${i + 1}日(${DAYS_JP[(fd + i) % 7]})`,
        ),
      )
      .concat(["月合計"]);
    const rows = employees.map((emp) => {
      const type = EMP_TYPES.find((t) => t.id === emp.typeId);
      const row = [emp.name, type.short, `${type.maxHours}h`];
      let total = 0;
      for (let d = 1; d <= dim; d++) {
        const e = schedule[`${calYear}-${calMonth}-${d}-${emp.id}`];
        if (e && e.tin && e.tout) {
          const h = calcHours(e.tin, e.tout);
          row.push(`${e.tin}〜${e.tout}(${fmtHours(h)})`);
          total += h || 0;
        } else row.push("");
      }
      row.push(fmtHours(total));
      return row;
    });
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ミニマート_シフト表_${calYear}年${calMonth + 1}月.csv`;
    a.click();
    showToast("✓ CSVをダウンロードしました", "success");
  };

  // ── EmpMiniCalendar ────────────────────────────────────────────────────────
  const EmpMiniCalendar = ({ empId }) => {
    const ec = getEmpCal(empId);
    const { year, month, selectedDay } = ec;
    const fdl = firstDow(year, month),
      diml = daysInMonth(year, month);
    const prevM = () => {
      if (month === 0) {
        setEmpCalField(empId, { year: year - 1, month: 11, selectedDay: null });
      } else setEmpCalField(empId, { month: month - 1, selectedDay: null });
    };
    const nextM = () => {
      if (month === 11) {
        setEmpCalField(empId, { year: year + 1, month: 0, selectedDay: null });
      } else setEmpCalField(empId, { month: month + 1, selectedDay: null });
    };
    return (
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <button
            onClick={prevM}
            style={{
              background: theme.panel,
              border: "none",
              color: theme.text,
              width: 26,
              height: 26,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ‹
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
            {year}年 {MONTHS_JP[month]}
          </span>
          <button
            onClick={nextM}
            style={{
              background: theme.panel,
              border: "none",
              color: theme.text,
              width: 26,
              height: 26,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ›
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 2,
            marginBottom: 2,
          }}
        >
          {DAYS_JP.map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                color:
                  i === 0 ? "#ef4444"
                  : i === 6 ? "#3b82f6"
                  : "#64748b",
                padding: "2px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 2,
          }}
        >
          {Array.from({ length: fdl }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: diml }, (_, i) => {
            const d = i + 1,
              dow = (fdl + i) % 7;
            const isSun = dow === 0,
              isSat = dow === 6;
            const isSelected = selectedDay === d;
            const e = schedule[`${year}-${month}-${d}-${empId}`];
            const hasEntry = e && (e.tin || e.tout);
            const isToday =
              d === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear();
            return (
              <button
                key={d}
                onClick={() => setEmpCalField(empId, { selectedDay: d })}
                style={{
                  aspectRatio: "1",
                  borderRadius: 6,
                  border: `1px solid ${
                    isSelected ? "#f59e0b"
                    : hasEntry ? "rgba(59,130,246,0.5)"
                    : theme.border
                  }`,
                  background:
                    isSelected ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                    : isToday ? "rgba(245,158,11,0.15)"
                    : hasEntry ? "rgba(59,130,246,0.12)"
                    : theme.card,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  transition: "all 0.12s",
                  padding: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 800 : 600,
                    color:
                      isSelected ? "#fff"
                      : isSun ? "#ef4444"
                      : isSat ? "#3b82f6"
                      : theme.text,
                  }}
                >
                  {d}
                </span>
                {hasEntry && !isSelected && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#3b82f6",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── EmpTimePanel ────────────────────────────────────────────────────────────
  const EmpTimePanel = ({ empId }) => {
    const ec = getEmpCal(empId);
    const { year, month, selectedDay: day } = ec;
    if (!day)
      return (
        <div
          style={{
            textAlign: "center",
            color: "#475569",
            padding: "16px 0",
            fontSize: 12,
          }}
        >
          ↑ カレンダーから日付を選択してください
        </div>
      );
    const dow = (firstDow(year, month) + day - 1) % 7;
    const isSun = dow === 0,
      isSat = dow === 6;
    const key = `${year}-${month}-${day}-${empId}`;
    const entry = schedule[key] || {};
    const hrs = calcHours(entry.tin, entry.tout);
    const emp = employees.find((e) => e.id === empId);
    const type = EMP_TYPES.find((t) => t.id === emp.typeId);
    const wks = getWeeklyBreakdown(empId, year, month);
    const wkNum = Math.floor((firstDow(year, month) + day - 1) / 7);
    const wkTotal = wks[wkNum] || 0;
    const isOver = wkTotal > type.maxHours;

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.card,
          border: `1px solid ${isOver ? "rgba(239,68,68,0.4)" : theme.border}`,
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        {/* Date header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>
              {year}年{MONTHS_JP[month]} {day}日
            </span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 13,
                fontWeight: 700,
                color:
                  isSun ? "#ef4444"
                  : isSat ? "#3b82f6"
                  : theme.muted,
              }}
            >
              {DAYS_JP[dow]}曜日
            </span>
          </div>
          {hrs != null && (
            <div
              style={{
                background:
                  isOver ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)",
                border: `1px solid ${isOver ? "rgba(239,68,68,0.5)" : "rgba(245,158,11,0.4)"}`,
                borderRadius: 8,
                padding: "6px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: isOver ? "#ef4444" : "#f59e0b",
                }}
              >
                {fmtHours(hrs)}
              </div>
              <div style={{ fontSize: 9, color: theme.subtle }}>勤務時間</div>
            </div>
          )}
        </div>

        {/* Two side-by-side pickers */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <TimePicker
            label="🟢 出勤時刻 (Time In)"
            color="#10b981"
            value={entry.tin || ""}
            onConfirm={(v) =>
              confirmShiftTime(year, month, day, empId, "tin", v)
            }
            theme={theme}
          />
          <TimePicker
            label="🔴 退勤時刻 (Time Out)"
            color="#ef4444"
            value={entry.tout || ""}
            onConfirm={(v) =>
              confirmShiftTime(year, month, day, empId, "tout", v)
            }
            theme={theme}
          />
        </div>

        {/* Weekly progress */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: theme.subtle }}>
              第{wkNum + 1}週の合計
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isOver ? "#ef4444" : theme.muted,
              }}
            >
              {fmtHours(wkTotal)} / {type.maxHours}h{isOver ? " ⚠️ 超過" : ""}
            </span>
          </div>
          <div
            style={{
              background: theme.grid,
              borderRadius: 4,
              height: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, (wkTotal / type.maxHours) * 100)}%`,
                background:
                  isOver ?
                    "linear-gradient(90deg,#ef4444,#f97316)"
                  : "linear-gradient(90deg,#3b82f6,#10b981)",
                borderRadius: 4,
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ── ConfirmDialog ────────────────────────────────────────────────────────
  const ConfirmDialog = () => {
    const [doubleConfirmed, setDoubleConfirmed] = useState(false);
    if (!confirmDialog) return null;
    const isOver = confirmDialog.level === "over";
    const needDouble = !!confirmDialog.requireDouble;
    const accent = isOver ? "#ef4444" : "#f59e0b";
    const accentBg = isOver ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.1)";
    const accentBorder =
      isOver ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)";

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: theme.modal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            background: theme.surfaceAlt,
            border: `2px solid ${accent}`,
            borderRadius: 16,
            padding: 28,
            width: "100%",
            maxWidth: 440,
            boxShadow: `0 24px 64px ${theme.shadow}, 0 0 0 1px ${accentBorder}`,
          }}
        >
          {/* Icon + Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              {isOver ? "🚨" : "⚠️"}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: accent,
                lineHeight: 1.35,
              }}
            >
              {confirmDialog.title}
            </div>
          </div>

          {/* Message */}
          <div
            style={{
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 14,
              fontSize: 13,
              color: theme.text,
              lineHeight: 1.85,
              whiteSpace: "pre-line",
            }}
          >
            {confirmDialog.message}
          </div>

          {/* Badge / rule reminder */}
          {confirmDialog.badge && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: "9px 12px",
                marginBottom: 16,
              }}
            >
              <span
                style={{ fontSize: 11, color: theme.text, fontWeight: 600 }}
              >
                {confirmDialog.badge}
              </span>
            </div>
          )}

          {/* Double-confirm checkbox (owner-only window) */}
          {needDouble && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={doubleConfirmed}
                onChange={(e) => setDoubleConfirmed(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                  accentColor: "#ef4444",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.4 }}>
                オーナーとして、この時間帯へのスタッフ追加を
                <strong style={{ color: "#ef4444" }}>二重確認</strong>しました
              </span>
            </label>
          )}

          {/* Shift windows reference */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
              marginBottom: 18,
            }}
          >
            {[
              {
                icon: "☀️",
                label: "日中",
                time: "06:00〜17:00",
                rule: "2名まで",
                color: "#f59e0b",
              },
              {
                icon: "🌙",
                label: "夜間",
                time: "22:00〜02:00",
                rule: "1名まで",
                color: "#6366f1",
              },
              {
                icon: "🔒",
                label: "専用",
                time: "02:00〜06:30",
                rule: "オーナーのみ",
                color: "#ef4444",
              },
            ].map((w) => (
              <div
                key={w.label}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 14 }}>{w.icon}</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: w.color,
                    marginTop: 2,
                  }}
                >
                  {w.label}
                </div>
                <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>
                  {w.time}
                </div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>
                  {w.rule}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                setConfirmDialog(null);
                setDoubleConfirmed(false);
              }}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "#94a3b8",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                if (needDouble && !doubleConfirmed) return;
                confirmDialog.onConfirm();
                setDoubleConfirmed(false);
              }}
              disabled={needDouble && !doubleConfirmed}
              style={{
                flex: 2,
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background:
                  needDouble && !doubleConfirmed ?
                    "rgba(255,255,255,0.06)"
                  : `linear-gradient(135deg,${accent},${isOver ? "#dc2626" : "#d97706"})`,
                color: needDouble && !doubleConfirmed ? "#475569" : "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor:
                  needDouble && !doubleConfirmed ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow:
                  needDouble && !doubleConfirmed ? "none" : (
                    `0 4px 14px ${accent}44`
                  ),
              }}
            >
              {needDouble ?
                doubleConfirmed ?
                  "🚨 二重確認して追加"
                : "☑️ 上のチェックを入れてください"
              : isOver ?
                "🚨 確認して追加"
              : "✓ 追加する"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── DayModal (schedule tab) ──────────────────────────────────────────────
  const DayModal = () => {
    if (!modal) return null;
    const { day } = modal;
    const dow = (fd + day - 1) % 7;
    const isSun = dow === 0,
      isSat = dow === 6;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: theme.modal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        onClick={() => setModal(null)}
      >
        <div
          style={{
            background: theme.surfaceAlt,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 560,
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: `0 24px 64px ${theme.shadow}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {calYear}年{MONTHS_JP[calMonth]} {day}日
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 2,
                  color:
                    isSun ? "#ef4444"
                    : isSat ? "#3b82f6"
                    : theme.muted,
                }}
              >
                {DAYS_JP[dow]}曜日
              </div>
            </div>
            <button
              onClick={() => setModal(null)}
              style={{
                background: theme.panel,
                border: "none",
                color: theme.muted,
                width: 32,
                height: 32,
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ×
            </button>
          </div>
          {employees.length === 0 ?
            <div
              style={{
                textAlign: "center",
                color: theme.muted,
                padding: 24,
                fontSize: 13,
              }}
            >
              スタッフタブでスタッフを登録してください
            </div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {employees.map((emp) => {
                const type = EMP_TYPES.find((t) => t.id === emp.typeId);
                const key = `${calYear}-${calMonth}-${day}-${emp.id}`;
                const entry = schedule[key] || {};
                const hrs = calcHours(entry.tin, entry.tout);
                const wks = getWeeklyBreakdown(emp.id, calYear, calMonth);
                const wkNum = Math.floor((fd + day - 1) / 7);
                const wkTotal = wks[wkNum] || 0;
                const isOver = wkTotal > type.maxHours;
                return (
                  <div
                    key={emp.id}
                    style={{
                      background: theme.card,
                      border: `1px solid ${isOver ? "rgba(239,68,68,0.4)" : theme.border}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: type.color,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: theme.text,
                          }}
                        >
                          {emp.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            background: `${type.color}22`,
                            color: type.color,
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 600,
                          }}
                        >
                          {type.short}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {hrs != null && (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: isOver ? "#ef4444" : "#f59e0b",
                            }}
                          >
                            {fmtHours(hrs)}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: theme.subtle }}>
                          週{type.maxHours}h{isOver ? "⚠️" : ""}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <TimePicker
                        label="🟢 出勤 (Time In)"
                        color="#10b981"
                        value={entry.tin || ""}
                        onConfirm={(v) =>
                          confirmShiftTime(
                            calYear,
                            calMonth,
                            day,
                            emp.id,
                            "tin",
                            v,
                          )
                        }
                        theme={theme}
                      />
                      <TimePicker
                        label="🔴 退勤 (Time Out)"
                        color="#ef4444"
                        value={entry.tout || ""}
                        onConfirm={(v) =>
                          confirmShiftTime(
                            calYear,
                            calMonth,
                            day,
                            emp.id,
                            "tout",
                            v,
                          )
                        }
                        theme={theme}
                      />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontSize: 10, color: theme.subtle }}>
                          第{wkNum + 1}週
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: isOver ? "#ef4444" : theme.subtle,
                            fontWeight: 700,
                          }}
                        >
                          {fmtHours(wkTotal)}/{type.maxHours}h
                        </span>
                      </div>
                      <div
                        style={{
                          background: theme.grid,
                          borderRadius: 4,
                          height: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, (wkTotal / type.maxHours) * 100)}%`,
                            background:
                              isOver ? "#ef4444" : (
                                "linear-gradient(90deg,#3b82f6,#10b981)"
                              ),
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      </div>
    );
  };

  // ── YMPicker ──────────────────────────────────────────────────────────────
  const YMPicker = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: theme.modal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={() => setShowYMPicker(false)}
    >
      <div
        style={{
          background: theme.surfaceAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 380,
          boxShadow: `0 24px 64px ${theme.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 16,
            color: "#f59e0b",
          }}
        >
          📅 年・月を選択
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: theme.subtle, marginBottom: 8 }}>
            年
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setCalYear(y)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  background:
                    calYear === y ?
                      "linear-gradient(135deg,#f59e0b,#ef4444)"
                    : theme.panel,
                  color: calYear === y ? "#fff" : theme.muted,
                }}
              >
                {y}年
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: theme.subtle, marginBottom: 8 }}>
            月
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 8,
            }}
          >
            {MONTHS_JP.map((m, i) => (
              <button
                key={i}
                onClick={() => setCalMonth(i)}
                style={{
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  background:
                    calMonth === i ?
                      "linear-gradient(135deg,#f59e0b,#ef4444)"
                    : theme.panel,
                  color: calMonth === i ? "#fff" : theme.muted,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowYMPicker(false)}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#f59e0b,#ef4444)",
            border: "none",
            color: "#fff",
            padding: "12px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          確定
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
        color: theme.text,
        transition: "background 1.5s ease, color 1.5s ease",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background:
              toast.type === "error" ? "#ef4444"
              : toast.type === "success" ? "#10b981"
              : "#3b82f6",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            fontSize: 14,
            maxWidth: 380,
            animation: "slideIn 0.3s ease",
            lineHeight: 1.5,
          }}
        >
          {toast.msg}
        </div>
      )}
      {showYMPicker && <YMPicker />}
      {modal && <DayModal />}
      <ConfirmDialog />

      {/* Header */}
      <div
        style={{
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.border}`,
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              onClick={() => window.open(SHOP_LOCATION_URL, "_blank")}
              title="ミニマートの場所を表示"
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              🏪
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    letterSpacing: 1,
                    color: theme.text,
                  }}
                >
                  ミニマート
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: theme.subtle,
                    letterSpacing: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  SHIFT MANAGER{" "}
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#10b981" }}>自動保存</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Switch theme"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 54,
                  height: 30,
                  padding: 3,
                  borderRadius: 999,
                  border: `1px solid ${theme.border}`,
                  background:
                    isDarkMode ?
                      "linear-gradient(90deg,#334155,#475569)"
                    : "linear-gradient(90deg,#dbeafe,#e2e8f0)",
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow:
                    isDarkMode ?
                      "inset 0 1px 2px rgba(0,0,0,0.25), 0 4px 10px rgba(15,23,42,0.16)"
                    : "inset 0 1px 2px rgba(255,255,255,0.7), 0 4px 10px rgba(148,163,184,0.2)",
                  transition: "background 1.5s ease, box-shadow 1.5s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: isDarkMode ? "auto" : 3,
                    right: isDarkMode ? 3 : "auto",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 3px 8px rgba(15,23,42,0.2)",
                    transition:
                      "left 1.5s ease, right 1.5s ease, background 1.5s ease",
                  }}
                />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              ["schedule", "📅 シフト"],
              ["staff", "👥 スタッフ"],
              ["summary", "📊 集計"],
              ["print", "🖨 印刷"],
            ].map(([t, l]) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    activeTab === t ?
                      "linear-gradient(135deg,#f59e0b,#ef4444)"
                    : "transparent",
                  color: activeTab === t ? "#fff" : theme.subtle,
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 16px" }}>
        {/* Month navigator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "10px 16px",
            boxShadow: `0 10px 24px ${theme.shadow}`,
          }}
        >
          <button
            onClick={() => {
              if (calMonth === 0) {
                setCalYear((y) => y - 1);
                setCalMonth(11);
              } else setCalMonth((m) => m - 1);
            }}
            style={{
              background: theme.panelStrong,
              border: "none",
              color: theme.text,
              width: 25,
              height: 25,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ‹
          </button>
          <button
            onClick={() => setShowYMPicker(true)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 2,
                color: theme.text,
                textAlign: "center",
              }}
            >
              {calYear}年 {MONTHS_JP[calMonth]}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#f59e0b",
                textAlign: "center",
                marginTop: 2,
              }}
            >
              タップして年月を変更 ▾
            </div>
          </button>
          <button
            onClick={() => {
              if (calMonth === 11) {
                setCalYear((y) => y + 1);
                setCalMonth(0);
              } else setCalMonth((m) => m + 1);
            }}
            style={{
              background: theme.panelStrong,
              border: "none",
              color: theme.text,
              width: 25,
              height: 25,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ›
          </button>
        </div>

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                gap: 4,
                marginBottom: 4,
              }}
            >
              {DAYS_JP.map((d, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    fontStyle: "normal",
                    fontWeight: 700,
                    padding: "6px 0",
                    color:
                      i === 0 ? "#ef4444"
                      : i === 6 ? "#3b82f6"
                      : theme.subtle,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                gap: 4,
              }}
            >
              {Array.from({ length: fd }, (_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: dim }, (_, i) => {
                const d = i + 1,
                  dow = (fd + i) % 7;
                const isSun = dow === 0,
                  isSat = dow === 6;
                const isToday =
                  d === now.getDate() &&
                  calMonth === now.getMonth() &&
                  calYear === now.getFullYear();
                const count = employees.filter((emp) => {
                  const e = schedule[`${calYear}-${calMonth}-${d}-${emp.id}`];
                  return e && (e.tin || e.tout);
                }).length;
                return (
                  <button
                    key={d}
                    onClick={() => setModal({ day: d })}
                    style={{
                      aspectRatio: "1",
                      background:
                        isToday ? "rgba(245,158,11,0.15)"
                        : count > 0 ? "rgba(59,130,246,0.1)"
                        : theme.card,
                      border: `1px solid ${
                        isToday ? "rgba(245,158,11,0.5)"
                        : count > 0 ? "rgba(59,130,246,0.3)"
                        : theme.border
                      }`,
                      borderRadius: 10,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      transition: "all 0.12s",
                      padding: 4,
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.06)";
                      e.currentTarget.style.background = theme.panelStrong;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.background =
                        isToday ? "rgba(245,158,11,0.15)"
                        : count > 0 ? "rgba(59,130,246,0.1)"
                        : theme.card;
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontStyle: "normal",
                        fontWeight: isToday ? 800 : 600,
                        color:
                          isSun ? "#ef4444"
                          : isSat ? "#3b82f6"
                          : theme.text,
                      }}
                    >
                      {d}
                    </span>
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "#3b82f6",
                          color: "#fff",
                          borderRadius: 10,
                          padding: "1px 5px",
                          fontWeight: 700,
                        }}
                      >
                        {count}人
                      </span>
                    )}
                    {isToday && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 3,
                          fontSize: 8,
                          color: "#f59e0b",
                          fontWeight: 700,
                        }}
                      >
                        今日
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                color: theme.subtle,
                textAlign: "center",
              }}
            >
              日付をタップしてシフト入力
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === "staff" && (
          <div>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 12,
                  color: "#f59e0b",
                }}
              >
                ▸ スタッフ追加
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEmployee()}
                  placeholder="名前を入力..."
                  style={{
                    flex: 1,
                    minWidth: 140,
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: theme.inputText,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(+e.target.value)}
                  style={{
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: theme.inputText,
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  {EMP_TYPES.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      style={{ background: "#1e293b" }}
                    >
                      {t.label}（週{t.maxHours}h上限）
                    </option>
                  ))}
                </select>
                <button
                  onClick={addEmployee}
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                    border: "none",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  追加 +
                </button>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {EMP_TYPES.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: `${t.color}18`,
                    border: `1px solid ${t.color}33`,
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: t.color,
                      fontSize: 12,
                      marginBottom: 2,
                    }}
                  >
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    週間上限:{" "}
                    <span style={{ color: "#f1f5f9", fontWeight: 700 }}>
                      {t.maxHours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {employees.length === 0 ?
              <div
                style={{
                  textAlign: "center",
                  color: theme.soft,
                  padding: 40,
                  fontSize: 13,
                  background: theme.card,
                  border: `1px dashed ${theme.border}`,
                  borderRadius: 12,
                }}
              >
                スタッフが登録されていません
              </div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {employees.map((emp) => {
                  const type = EMP_TYPES.find((t) => t.id === emp.typeId);
                  const wks = getWeeklyBreakdown(emp.id, calYear, calMonth);
                  const over = Object.values(wks).some(
                    (h) => h > type.maxHours,
                  );
                  const isExpanded = expandedEmp === emp.id;
                  return (
                    <div
                      key={emp.id}
                      style={{
                        background: theme.card,
                        border: `2px solid ${
                          isExpanded ? type.color
                          : over ? "rgba(239,68,68,0.4)"
                          : theme.border
                        }`,
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "border-color 0.2s",
                      }}
                    >
                      {/* Header row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                        }}
                      >
                        <button
                          onClick={() =>
                            setExpandedEmp(isExpanded ? null : emp.id)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            flex: 1,
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: "50%",
                              background: type.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: theme.text,
                            }}
                          >
                            {emp.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              background: `${type.color}22`,
                              color: type.color,
                              padding: "2px 8px",
                              borderRadius: 20,
                              fontWeight: 600,
                            }}
                          >
                            {type.short}
                          </span>
                          {over && (
                            <span
                              style={{
                                fontSize: 11,
                                background: "rgba(239,68,68,0.15)",
                                color: "#ef4444",
                                padding: "2px 8px",
                                borderRadius: 20,
                                fontWeight: 600,
                              }}
                            >
                              ⚠️ 超過
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 12,
                              color: isExpanded ? type.color : theme.muted,
                              transform:
                                isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.25s",
                              display: "inline-block",
                              marginLeft: 4,
                            }}
                          >
                            ▼
                          </span>
                        </button>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 11, color: theme.muted }}>
                            週{type.maxHours}h上限
                          </span>
                          <button
                            onClick={() => removeEmployee(emp.id)}
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.25)",
                              color: "#ef4444",
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {/* Expanded panel */}
                      {isExpanded && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            borderTop: `1px solid ${type.color}33`,
                            padding: "16px 16px 18px",
                            background: "rgba(0,0,0,0.2)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              color: theme.muted,
                              marginBottom: 10,
                              fontWeight: 600,
                            }}
                          >
                            📅 日付を選んで出退勤時間を入力
                          </div>
                          <EmpMiniCalendar empId={emp.id} />
                          <EmpTimePanel empId={emp.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div>
            {employees.length === 0 ?
              <div
                style={{
                  textAlign: "center",
                  color: theme.soft,
                  padding: 60,
                  fontSize: 13,
                }}
              >
                スタッフが登録されていません
              </div>
            : <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {employees.map((emp) => {
                  const type = EMP_TYPES.find((t) => t.id === emp.typeId);
                  const wks = getWeeklyBreakdown(emp.id, calYear, calMonth);
                  const total = Object.values(wks).reduce((a, b) => a + b, 0);
                  return (
                    <div
                      key={emp.id}
                      style={{
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: type.color,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: theme.text,
                            }}
                          >
                            {emp.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              background: `${type.color}22`,
                              color: type.color,
                              padding: "2px 8px",
                              borderRadius: 20,
                              fontWeight: 600,
                            }}
                          >
                            {type.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: theme.subtle }}>
                          月合計:{" "}
                          <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                            {fmtHours(total)}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {Object.entries(wks).map(([wk, h]) => {
                          const isOver = h > type.maxHours;
                          return (
                            <div
                              key={wk}
                              style={{
                                flex: 1,
                                minWidth: 90,
                                background:
                                  isOver ?
                                    "rgba(239,68,68,0.08)"
                                  : "rgba(255,255,255,0.04)",
                                border: `1px solid ${isOver ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.07)"}`,
                                borderRadius: 8,
                                padding: "10px 12px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#64748b",
                                  marginBottom: 5,
                                }}
                              >
                                第{+wk + 1}週
                              </div>
                              <div
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  borderRadius: 4,
                                  height: 5,
                                  marginBottom: 5,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${Math.min(100, (h / type.maxHours) * 100)}%`,
                                    background:
                                      isOver ?
                                        "linear-gradient(90deg,#ef4444,#f97316)"
                                      : "linear-gradient(90deg,#3b82f6,#10b981)",
                                    borderRadius: 4,
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: isOver ? "#ef4444" : theme.text,
                                    fontSize: 12,
                                  }}
                                >
                                  {fmtHours(h)}
                                </span>
                                <span
                                  style={{ fontSize: 10, color: theme.muted }}
                                >
                                  /{type.maxHours}h
                                </span>
                              </div>
                              {isOver && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#ef4444",
                                    marginTop: 3,
                                    fontWeight: 600,
                                  }}
                                >
                                  ⚠️ +{fmtHours(h - type.maxHours)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* ═══ PRINT TAB ═══ */}
        {activeTab === "print" &&
          (() => {
            const fd = firstDow(calYear, calMonth);
            const dim = daysInMonth(calYear, calMonth);
            const weeks = {};
            for (let d = 1; d <= dim; d += 1) {
              const wk = Math.floor((fd + d - 1) / 7);
              if (!weeks[wk]) weeks[wk] = [];
              weeks[wk].push(d);
            }
            const weekKeys = Object.keys(weeks)
              .map(Number)
              .sort((a, b) => a - b);
            const currentWeekIndex =
              weekKeys.length === 0 ?
                0
              : Math.min(printWeek, weekKeys.length - 1);
            const currentWeekKey = weekKeys[currentWeekIndex];
            const currentDays =
              currentWeekKey !== undefined ? weeks[currentWeekKey] : [];
            const isFirstWeek = currentWeekIndex === 0;
            const isLastWeek = currentWeekIndex >= weekKeys.length - 1;
            const weekLabel =
              currentDays.length ?
                `${currentDays[0]}日〜${currentDays[currentDays.length - 1]}日`
              : "";

            return (
              <div>
                {/* Print controls bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 16,
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 10,
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ fontSize: 13, color: theme.muted }}>
                    <span style={{ fontWeight: 700, color: theme.text }}>
                      {calYear}年 {MONTHS_JP[calMonth]}
                    </span>{" "}
                    の1週間シフトプレビュー
                    {weekLabel && (
                      <span style={{ marginLeft: 6, color: theme.text }}>
                        ({weekLabel})
                      </span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      onClick={() => setPrintWeek((w) => Math.max(0, w - 1))}
                      disabled={isFirstWeek}
                      style={{
                        background: theme.panel,
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                        padding: "10px 16px",
                        borderRadius: 8,
                        cursor: isFirstWeek ? "not-allowed" : "pointer",
                        opacity: isFirstWeek ? 0.5 : 1,
                        fontWeight: 700,
                      }}
                    >
                      ‹ 前の週
                    </button>
                    <button
                      onClick={() =>
                        setPrintWeek((w) =>
                          Math.min(w + 1, weekKeys.length - 1),
                        )
                      }
                      disabled={isLastWeek}
                      style={{
                        background: theme.panel,
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                        padding: "10px 16px",
                        borderRadius: 8,
                        cursor: isLastWeek ? "not-allowed" : "pointer",
                        opacity: isLastWeek ? 0.5 : 1,
                        fontWeight: 700,
                      }}
                    >
                      次の週 ›
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                        border: "none",
                        color: "#fff",
                        padding: "10px 22px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      🖨 この週を印刷
                    </button>
                  </div>
                </div>

                <div id="print-area">
                  <div className="print-title" style={{ display: "none" }}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>
                        ミニマート シフト表
                      </div>
                      <div style={{ fontSize: 14, color: "#64748b" }}>
                        {calYear}年 {MONTHS_JP[calMonth]}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      overflowX: "auto",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <table
                      style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        minWidth: 560,
                        fontSize: 12,
                        background: "#1e293b",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              padding: "10px 14px",
                              textAlign: "left",
                              background: "#0f172a",
                              color: "#f59e0b",
                              fontWeight: 700,
                              fontSize: 12,
                              borderBottom: "2px solid rgba(245,158,11,0.4)",
                              borderRight: "1px solid rgba(255,255,255,0.08)",
                              position: "sticky",
                              left: 0,
                              zIndex: 2,
                            }}
                          >
                            スタッフ
                          </th>
                          <th
                            style={{
                              padding: "10px 8px",
                              textAlign: "center",
                              background: "#0f172a",
                              color: "#94a3b8",
                              fontWeight: 700,
                              fontSize: 11,
                              borderBottom: "2px solid rgba(245,158,11,0.4)",
                              borderRight: "1px solid rgba(255,255,255,0.1)",
                              minWidth: 60,
                            }}
                          >
                            種別
                          </th>
                          {currentDays.map((d) => {
                            const dow = (fd + d - 1) % 7;
                            const isSun = dow === 0;
                            const isSat = dow === 6;
                            return (
                              <th
                                key={d}
                                style={{
                                  padding: "8px 5px",
                                  textAlign: "center",
                                  background: "#0f172a",
                                  color:
                                    isSun ? "#ef4444"
                                    : isSat ? "#60a5fa"
                                    : "#94a3b8",
                                  fontWeight: 700,
                                  fontSize: 11,
                                  borderBottom:
                                    "2px solid rgba(245,158,11,0.4)",
                                  borderRight:
                                    "1px solid rgba(255,255,255,0.06)",
                                  minWidth: 60,
                                }}
                              >
                                <div>{d}</div>
                                <div style={{ fontSize: 9, marginTop: 1 }}>
                                  {DAYS_JP[dow]}
                                </div>
                              </th>
                            );
                          })}
                          <th
                            style={{
                              padding: "10px 8px",
                              textAlign: "center",
                              background: "#0f172a",
                              color: "#f59e0b",
                              fontWeight: 700,
                              fontSize: 11,
                              borderBottom: "2px solid rgba(245,158,11,0.4)",
                            }}
                          >
                            週計
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp, ei) => {
                          const type = EMP_TYPES.find(
                            (t) => t.id === emp.typeId,
                          );
                          const wks = getWeeklyBreakdown(
                            emp.id,
                            calYear,
                            calMonth,
                          );
                          const weeklyHours =
                            currentWeekKey !== undefined ?
                              wks[currentWeekKey] || 0
                            : 0;
                          const overWeek = weeklyHours > type.maxHours;
                          return (
                            <tr
                              key={emp.id}
                              style={{
                                background:
                                  ei % 2 === 0 ?
                                    "rgba(255,255,255,0.01)"
                                  : "transparent",
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px 14px",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.06)",
                                  borderRight:
                                    "1px solid rgba(255,255,255,0.08)",
                                  position: "sticky",
                                  left: 0,
                                  background: "#1a2740",
                                  zIndex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 12,
                                    color: "#f1f5f9",
                                  }}
                                >
                                  {emp.name}
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "8px 10px",
                                  textAlign: "center",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.06)",
                                  borderRight:
                                    "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10,
                                    background: `${type.color}22`,
                                    color: type.color,
                                    padding: "2px 6px",
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {type.short}
                                </span>
                              </td>
                              {currentDays.map((d) => {
                                const e =
                                  schedule[
                                    `${calYear}-${calMonth}-${d}-${emp.id}`
                                  ];
                                const hasShift = e?.tin && e?.tout;
                                const gap = hasShift ? 6 : 0;
                                return (
                                  <td
                                    key={d}
                                    style={{
                                      padding: "8px 4px",
                                      textAlign: "center",
                                      borderBottom:
                                        "1px solid rgba(255,255,255,0.06)",
                                      borderRight:
                                        "1px solid rgba(255,255,255,0.05)",
                                      verticalAlign: "middle",
                                      minWidth: 60,
                                    }}
                                  >
                                    {hasShift ?
                                      <div
                                        style={{
                                          display: "grid",
                                          gap: gap,
                                          color: "#f1f5f9",
                                          fontSize: 10,
                                        }}
                                      >
                                        <span style={{ fontWeight: 700 }}>
                                          {e.tin}
                                        </span>
                                        <span style={{ color: "#94a3b8" }}>
                                          〜
                                        </span>
                                        <span style={{ fontWeight: 700 }}>
                                          {e.tout}
                                        </span>
                                      </div>
                                    : <span
                                        style={{
                                          color: "rgba(255,255,255,0.25)",
                                          fontSize: 10,
                                        }}
                                      >
                                        ―
                                      </span>
                                    }
                                  </td>
                                );
                              })}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  textAlign: "center",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.06)",
                                  background:
                                    overWeek ?
                                      "rgba(239,68,68,0.08)"
                                    : "rgba(245,158,11,0.08)",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: overWeek ? "#f87171" : "#f59e0b",
                                    fontSize: 12,
                                  }}
                                >
                                  {fmtHours(weeklyHours)}
                                </div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: overWeek ? "#fca5a5" : "#94a3b8",
                                  }}
                                >
                                  /{type.maxHours}h
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              padding: "10px 14px",
                              background: "#0f172a",
                              color: "#64748b",
                              fontSize: 11,
                              fontWeight: 700,
                              borderTop: "2px solid rgba(255,255,255,0.1)",
                              position: "sticky",
                              left: 0,
                            }}
                          >
                            出勤人数
                          </td>
                          {currentDays.map((d) => {
                            const count = employees.filter((emp) => {
                              const e =
                                schedule[
                                  `${calYear}-${calMonth}-${d}-${emp.id}`
                                ];
                              return e?.tin && e?.tout;
                            }).length;
                            return (
                              <td
                                key={d}
                                style={{
                                  padding: "10px 4px",
                                  textAlign: "center",
                                  background: "#0f172a",
                                  borderTop: "2px solid rgba(255,255,255,0.1)",
                                  borderRight:
                                    "1px solid rgba(255,255,255,0.06)",
                                }}
                              >
                                {count > 0 ?
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: count >= 3 ? "#f59e0b" : "#94a3b8",
                                    }}
                                  >
                                    {count}
                                  </span>
                                : <span
                                    style={{
                                      color: "rgba(255,255,255,0.25)",
                                      fontSize: 10,
                                    }}
                                  >
                                    ―
                                  </span>
                                }
                              </td>
                            );
                          })}
                          <td
                            style={{
                              background: "#0f172a",
                              borderTop: "2px solid rgba(255,255,255,0.1)",
                            }}
                          />
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        fontWeight: 700,
                        marginRight: 4,
                      }}
                    >
                      シフト区分:
                    </span>
                    {[
                      {
                        color: "rgba(16,185,129,0.18)",
                        text: "#6ee7b7",
                        label: "日勤 06:00〜17:00",
                      },
                      {
                        color: "rgba(99,102,241,0.18)",
                        text: "#a5b4fc",
                        label: "夜勤 22:00〜02:00",
                      },
                      {
                        color: "rgba(239,68,68,0.15)",
                        text: "#fca5a5",
                        label: "専用 02:00〜06:30",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: s.color,
                            border: `1px solid ${s.text}44`,
                          }}
                        />
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ── Footer bar ── */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#475569",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                boxShadow: "0 0 6px #10b981",
              }}
            />
            データは自動保存されています
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "⚠️ すべてのスタッフとシフトデータを削除しますか？\nこの操作は元に戻せません。",
                  )
                ) {
                  setEmployees([]);
                  setSchedule({});
                  setExpandedEmp(null);
                  showToast("すべてのデータを削除しました", "info");
                }
              }}
              disabled={!employees.length}
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: employees.length ? "#ef4444" : "#475569",
                padding: "10px 18px",
                borderRadius: 10,
                cursor: employees.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              🗑 全データ削除
            </button>
            <button
              onClick={() => {
                if (employees.length) setActiveTab("print");
              }}
              disabled={!employees.length}
              style={{
                background:
                  employees.length ?
                    "linear-gradient(135deg,#f59e0b,#ef4444)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                color: employees.length ? "#fff" : "#475569",
                padding: "12px 22px",
                borderRadius: 10,
                cursor: employees.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              🖨 印刷プレビュー
            </button>
          </div>
        </div>
      </div>
      {/* /maxWidth container */}

      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box}
        select option{background:#1e293b;color:#f1f5f9}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}
        @media print{
          *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .print-title{display:block!important}
          #print-area table{font-size:9pt;width:100%}
          #print-area table th,#print-area table td{padding:3px 4px!important;border:1px solid #aaa!important}
        }
      `}</style>
    </div>
  );
}
