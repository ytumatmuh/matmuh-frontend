"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "@/app/components/LocaleLink";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  MapPin,
  Plus,
  TriangleAlert,
  User,
  Wifi,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useMySchedule } from "@/data/useMySchedule";
import { DAYS, TIME_SLOTS, visibleDayIndexes } from "@/data/schedule-grid";
import { WINDOW_LABELS, poolBlocks } from "@/data/schedule-pool";
import { useT } from "@/i18n/useT";
import {
  GOLD_RGB as GOLD,
  NAVY_RGB as NAVY,
  colorOf,
  courseColors,
  blockStyle,
} from "@/data/schedule-colors";

const VISIBLE = 3;
const INLINE_GROUPS = 3;

const startOf = (slot) => TIME_SLOTS[slot]?.split(" - ")[0] ?? "";
const endOf = (slot) => TIME_SLOTS[slot]?.split(" - ")[1] ?? "";
const spanOf = (entry) => Math.max(1, entry.span || 1);
const rangeOf = (entry) =>
  `${startOf(entry.slot)} – ${endOf(entry.slot + spanOf(entry) - 1)}`;

const MINI_BUTTON =
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold transition-colors disabled:opacity-40";

function EnrollAction({ entry }) {
  const t = useT();
  const my = useMySchedule();
  const [clash, setClash] = useState(null);

  if (!my || my.status !== "ready" || !entry.offeringId) return null;

  const busy = my.busyId === entry.offeringId;
  const failed = my.failedId === entry.offeringId;

  if (my.isEnrolled(entry.offeringId)) {
    return (
      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-secondary-700">
          <Check size={9} strokeWidth={2.5} />
          {t("Programımda")}
        </span>
        <button
          type="button"
          onClick={() => void my.remove(entry.offeringId)}
          disabled={busy}
          className={`${MINI_BUTTON} text-primary-500/70 hover:bg-primary-500/6 hover:text-primary-500`}
        >
          {busy ? "…" : t("Kaldır")}
        </button>
      </span>
    );
  }

  const onAdd = () => {
    if (!clash) {
      const found = my.clashOf(entry);
      if (found) {
        setClash(found);
        return;
      }
    }
    void my.add(entry).then((ok) => ok && setClash(null));
  };

  return (
    <span className="mt-1.5 block">
      {clash && (
        <span className="mb-1 flex items-start gap-1 rounded-sm bg-amber-50 px-1.5 py-1 text-[9.5px] leading-snug text-amber-800">
          <TriangleAlert size={9} strokeWidth={2.25} className="mt-px shrink-0" />
          <span>
            {t("{day} {range} · {code} Gr.{group} ile çakışıyor.", {
              day: t(DAYS[clash.day]),
              range: rangeOf(clash),
              code: clash.code,
              group: clash.group,
            })}
          </span>
        </span>
      )}

      <span className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className={`${MINI_BUTTON} border border-secondary-500/40 text-secondary-700 hover:bg-secondary-500/10`}
        >
          {busy ? (
            "…"
          ) : (
            <>
              <Plus size={9} strokeWidth={2.5} />
              {clash ? t("Yine de ekle") : t("Programıma ekle")}
            </>
          )}
        </button>
        {clash && (
          <button
            type="button"
            onClick={() => setClash(null)}
            className={`${MINI_BUTTON} text-primary-500/70 hover:text-primary-500`}
          >
            <X size={9} strokeWidth={2.5} />
            {t("Vazgeç")}
          </button>
        )}
      </span>

      {failed && (
        <span className="mt-1 block text-[9.5px] text-red-700/75">
          {t("İşlem tamamlanamadı.")}
        </span>
      )}
    </span>
  );
}

function metaOf(entry) {
  return [
    entry.instructor && entry.instructor !== "-" ? entry.instructor : null,
    !entry.online && entry.room && entry.room !== "-" ? entry.room : null,
  ].filter(Boolean);
}

function courseBlocks(entries) {
  const blocks = new Map();
  for (const entry of entries) {
    const key = `${entry.day}|${entry.slot}|${spanOf(entry)}|${entry.code}`;
    if (!blocks.has(key)) blocks.set(key, { ...entry, span: spanOf(entry), groups: [] });
    blocks.get(key).groups.push(entry);
  }
  return [...blocks.values()].map((block) => ({
    ...block,
    badge: block.pool?.name ?? block.badge ?? null,
    groups: block.groups.sort((a, b) => (a.group || 0) - (b.group || 0)),
    english: block.groups.every((group) => group.english),
    online: block.groups.every((group) => group.online),
  }));
}

const poolLast = (block) => (block.kind === "pool" ? 1 : 0);

function buildClusters(entries) {
  const byDay = new Map();
  for (const block of poolBlocks(courseBlocks(entries))) {
    if (!byDay.has(block.day)) byDay.set(block.day, []);
    byDay.get(block.day).push(block);
  }

  const clusters = new Map();
  for (const [day, list] of byDay) {
    list.sort(
      (a, b) => a.slot - b.slot || b.span - a.span || a.code.localeCompare(b.code, "tr"),
    );
    const out = [];
    for (const block of list) {
      const end = block.slot + block.span - 1;
      const last = out[out.length - 1];
      if (last && block.slot <= last.to) {
        last.blocks.push(block);
        last.to = Math.max(last.to, end);
      } else {
        out.push({ from: block.slot, to: end, blocks: [block] });
      }
    }
    for (const cluster of out) {
      cluster.blocks.sort(
        (a, b) =>
          a.slot - b.slot ||
          a.slot + a.span - (b.slot + b.span) ||
          poolLast(a) - poolLast(b) ||
          a.code.localeCompare(b.code, "tr"),
      );
    }
    clusters.set(day, out);
  }
  return clusters;
}

function buildRows(entries) {
  const used = new Set();
  for (const entry of entries) {
    for (let k = 0; k < spanOf(entry); k++) used.add(entry.slot + k);
  }
  if (used.size === 0) {
    return TIME_SLOTS.map((_, si) => ({ type: "slot", slot: si, empty: true }));
  }

  const first = Math.min(...used);
  const last = Math.max(...used);

  const rows = [];
  if (first > 0) {
    rows.push({ type: "edge", from: 0, to: first - 1 });
  }
  for (let si = first; si <= last; si++) {
    rows.push({ type: "slot", slot: si, empty: !used.has(si) });
  }
  if (last < TIME_SLOTS.length - 1) {
    rows.push({ type: "edge", from: last + 1, to: TIME_SLOTS.length - 1 });
  }
  return rows;
}

function groupLabel(groups) {
  return groups.length === 1 ? `Gr.${groups[0].group}` : `Gr.${groups.map((group) => group.group).join("·")}`;
}

function Strip({ entry, color, slim, fill, joined, showRange, active, courseHref, onToggle }) {
  const t = useT();
  const buttonRef = useRef(null);
  const side = usePanelSide(buttonRef, true);
  const elective = entry.type === "Seçmeli";
  const groups = entry.groups ?? [entry];
  const single = groups.length === 1;
  const listed = groups.length <= INLINE_GROUPS;
  const meta = single ? metaOf(groups[0]) : [t("{count} grup", { count: groups.length })];
  const detailed = !slim && meta.length > 0;

  const label = [
    `${entry.code} ${entry.name}`,
    single
      ? t("Grup {group}", { group: groups[0].group })
      : t("{count} grup", { count: groups.length }),
    rangeOf(entry),
    entry.online ? t("çevrimiçi") : null,
    ...(single ? meta : []),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`flex flex-col overflow-hidden ${joined ? "" : "rounded-md"} ${fill ? "flex-auto" : ""}`}
      style={{
        ...blockStyle(elective, color),
        boxShadow: active ? `inset 0 0 0 1px rgba(${GOLD},0.6)` : undefined,
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        aria-haspopup="dialog"
        aria-label={label}
        className={`flex min-h-6 w-full flex-col justify-start py-1.5 pr-1.5 pl-1.5 text-left transition-colors hover:bg-primary-500/4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-500 ${fill ? "flex-auto" : ""}`}
      >
        <span className="flex items-center gap-1">
          <span
            className="shrink-0 font-mono text-[9.5px] font-semibold"
            style={{ color }}
          >
            {entry.code}
          </span>
          <span className="flex-1" />
          {entry.online && (
            <Wifi
              size={9}
              strokeWidth={2.25}
              aria-hidden
              className="shrink-0 text-secondary-700"
            />
          )}
          {entry.english && (
            <span className="shrink-0 font-mono text-[8.5px] font-semibold tracking-wide text-secondary-700">
              EN
            </span>
          )}
          {listed && (
            <span className="shrink-0 font-mono text-[9px] text-primary-500/70">
              {groupLabel(groups)}
            </span>
          )}
          <SideArrow side={side} />
        </span>
        <span
          className="mt-0.5 block text-[11px] leading-snug font-medium text-primary-600"
        >
          {entry.name}
        </span>
        {entry.pool && (
          <span className="mt-px flex items-center gap-1 text-[9.5px] font-medium text-secondary-700">
            <Layers size={9} strokeWidth={2} className="shrink-0" />
            {entry.pool.name}
          </span>
        )}

        {showRange && (
          <span className="mt-px block font-mono text-[9px] text-primary-500/70">
            {rangeOf(entry)}
          </span>
        )}
        {detailed && (
          <span className="mt-px block wrap-break-word text-[9.5px] leading-snug text-primary-500/70">
            {meta.join(" · ")}
          </span>
        )}
      </button>

      {active && (
        <GroupsPanel entry={entry} courseHref={courseHref} anchorRef={buttonRef} onClose={onToggle} />
      )}
    </div>
  );
}

function PoolStrip({ block, fill, joined, showRange, active, palette, courseHref, onToggle }) {
  const t = useT();
  const buttonRef = useRef(null);
  const side = usePanelSide(buttonRef, true);
  const limit = joined ? 2 : Math.min(Math.max(block.span + 1, 2), 6);
  const shown = block.courses.slice(0, limit);
  const rest = block.courses.length - shown.length;
  const label = [
    block.pool.name,
    t(DAYS[block.day]),
    t(WINDOW_LABELS[block.window]),
    t("{count} ders", { count: block.courses.length }),
  ].join(", ");

  return (
    <div
      className={`flex flex-col overflow-hidden ${joined ? "" : "rounded-md"} ${fill ? "flex-auto" : ""}`}
      style={{
        ...blockStyle(true, `rgb(${GOLD})`),
        boxShadow: active ? `inset 0 0 0 1px rgba(${GOLD},0.6)` : undefined,
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        aria-haspopup="dialog"
        aria-label={label}
        className={`flex min-h-6 w-full flex-col justify-start gap-1 p-1.5 text-left transition-colors hover:bg-primary-500/4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-500 ${fill ? "flex-auto" : ""}`}
      >
        <span className="flex items-start gap-1">
          <Layers size={10} strokeWidth={2} className="mt-px shrink-0 text-secondary-700" />
          <span className="min-w-0 flex-1 text-[9.5px] leading-tight font-semibold text-secondary-700">
            {block.pool.name}
          </span>
          <span className="shrink-0 font-mono text-[9px] text-primary-500/70">
            {t("{count} ders", { count: block.courses.length })}
          </span>
          <SideArrow side={side} />
        </span>
        <span className="flex flex-col gap-0.5">
          {shown.map((course) => (
            <span
              key={`${course.code}-${course.slot}`}
              className="block text-[10.5px] leading-snug text-primary-600"
            >
              <span className="mr-1 font-mono text-[9px] text-primary-500/60">
                {startOf(course.slot)}
              </span>
              {course.name}
              <span className="ml-1 font-mono text-[9px] text-primary-500/60">
                {groupLabel(course.groups)}
              </span>
            </span>
          ))}
        </span>
        {rest > 0 && (
          <span className="text-[9.5px] font-semibold text-secondary-700">
            {t("+{count} ders daha", { count: rest })}
          </span>
        )}
        {showRange && (
          <span className="font-mono text-[9px] text-primary-500/70">{rangeOf(block)}</span>
        )}
      </button>
      {active && (
        <PoolPanel
          block={block}
          palette={palette}
          courseHref={courseHref}
          anchorRef={buttonRef}
          onClose={onToggle}
        />
      )}
    </div>
  );
}

const PANEL_WIDTH = 320;
const PANEL_GAP = 6;
const EDGE = 12;
const SHEET_BREAKPOINT = 640;
const SLIDE = 8;

function panelSide(anchor) {
  if (window.innerWidth < SHEET_BREAKPOINT) return "bottom";
  const box = anchor.getBoundingClientRect();
  const frame = anchor.closest("[data-schedule-grid]")?.getBoundingClientRect();
  const viewportRight = window.innerWidth - EDGE;
  const width = Math.min(PANEL_WIDTH, window.innerWidth - EDGE * 2);
  if (box.right + PANEL_GAP + width <= Math.min(frame?.right ?? viewportRight, viewportRight)) return "right";
  if (box.left - PANEL_GAP - width >= Math.max(frame?.left ?? EDGE, EDGE)) return "left";
  return "below";
}

function placePanel(anchor, panel) {
  const side = panelSide(anchor);
  if (side === "bottom") {
    return { side, style: { left: 0, right: 0, bottom: 0, maxHeight: "70svh" } };
  }

  const box = anchor.getBoundingClientRect();
  const width = Math.min(PANEL_WIDTH, window.innerWidth - EDGE * 2);
  const maxHeight = Math.min(460, window.innerHeight - EDGE * 2);
  const height = Math.min(panel.scrollHeight, maxHeight);
  const x =
    side === "right"
      ? box.right + PANEL_GAP
      : side === "left"
        ? box.left - PANEL_GAP - width
        : Math.min(Math.max(box.left, EDGE), window.innerWidth - EDGE - width);
  const top = side === "below" ? box.bottom + PANEL_GAP : box.top;
  const y = Math.min(Math.max(top, EDGE), window.innerHeight - EDGE - height);
  return { side, style: { left: x, top: y, width, maxHeight } };
}

function usePanelSide(anchorRef, enabled) {
  const [side, setSide] = useState("right");

  useLayoutEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (anchorRef.current) setSide(panelSide(anchorRef.current));
      });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchorRef, enabled]);

  return side;
}

function SideArrow({ side }) {
  const props = { size: 10, strokeWidth: 2.25, className: "shrink-0 text-primary-500/70" };
  if (side === "right") return <ChevronRight {...props} />;
  if (side === "left") return <ChevronLeft {...props} />;
  return <ChevronDown {...props} />;
}

const OFFSETS = {
  right: `translateX(-${SLIDE}px)`,
  left: `translateX(${SLIDE}px)`,
  below: `translateY(-${SLIDE}px)`,
};

const SHEET_MS = 260;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const DRAG_CLOSE = 90;

const PanelCloseContext = createContext(null);

function AnchoredPanel({ anchorRef, label, onClose, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  const sheetRef = useRef(false);
  const dragRef = useRef(null);
  const [placement, setPlacement] = useState(null);
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (!sheetRef.current || reduceMotion) {
      closeRef.current();
      return;
    }
    setClosing(true);
    setTimeout(() => closeRef.current(), SHEET_MS);
  }, [reduceMotion]);

  const requestCloseRef = useRef(requestClose);
  useEffect(() => {
    requestCloseRef.current = requestClose;
  }, [requestClose]);

  useLayoutEffect(() => {
    const place = () => {
      if (!anchorRef.current || !panelRef.current) return;
      const next = placePanel(anchorRef.current, panelRef.current);
      sheetRef.current = next.side === "bottom";
      setPlacement(next);
    };

    place();
    let reveal = requestAnimationFrame(() => {
      reveal = requestAnimationFrame(() => setShown(true));
    });
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    const onPointer = (event) => {
      if (panelRef.current?.contains(event.target) || anchorRef.current?.contains(event.target)) return;
      requestCloseRef.current();
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      requestCloseRef.current();
      anchorRef.current?.focus();
    };

    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(reveal);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef]);

  const sheet = placement?.side === "bottom";

  useEffect(() => {
    if (!sheet) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheet]);

  const onPointerDown = (event) => {
    if (!sheet || !event.target.closest("[data-drag-area]") || event.target.closest("button, a")) return;
    dragRef.current = { y: event.clientY, time: performance.now() };
    setDragActive(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (dragRef.current) setDrag(Math.max(0, event.clientY - dragRef.current.y));
  };
  const onPointerUp = (event) => {
    if (!dragRef.current) return;
    const distance = Math.max(0, event.clientY - dragRef.current.y);
    const speed = distance / Math.max(1, performance.now() - dragRef.current.time);
    dragRef.current = null;
    setDragActive(false);
    if (distance > DRAG_CLOSE || speed > 0.6) requestClose();
    else setDrag(0);
  };

  const visible = Boolean(placement) && shown && !closing;
  const dragging = sheet && dragActive && drag > 0;

  let transform = "none";
  let transition = reduceMotion
    ? "opacity 120ms ease-out"
    : "opacity 150ms ease-out, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)";
  if (sheet) {
    transform = dragging ? `translateY(${drag}px)` : visible || reduceMotion ? "translateY(0)" : "translateY(100%)";
    transition = dragging || reduceMotion ? "none" : `transform ${SHEET_MS}ms ${SHEET_EASE}`;
  } else if (!visible && !reduceMotion && placement) {
    transform = OFFSETS[placement.side];
  }

  return createPortal(
    <PanelCloseContext.Provider value={requestClose}>
      {sheet && (
        <div
          aria-hidden
          className="fixed inset-0 z-[10060] bg-primary-700/80"
          style={{
            opacity: visible ? 1 : 0,
            transition: reduceMotion ? "none" : `opacity ${SHEET_MS}ms ease-out`,
          }}
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={label}
        aria-modal={sheet || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`fixed z-[10061] flex flex-col overflow-hidden border border-primary-500/12 bg-white shadow-[0_12px_32px_rgba(29,36,69,0.18)] ${
          sheet ? "rounded-t-2xl pb-[env(safe-area-inset-bottom)]" : "rounded-xl"
        }`}
        style={{
          ...(placement?.style ?? { left: 0, top: 0, width: PANEL_WIDTH, maxHeight: 460 }),
          opacity: sheet || visible ? 1 : 0,
          transform,
          transition,
          visibility: placement ? "visible" : "hidden",
        }}
      >
        {sheet && (
          <span data-drag-area className="flex shrink-0 touch-none justify-center pt-3 pb-1.5">
            <span aria-hidden className="h-1.5 w-16 rounded-full bg-primary-500/20" />
          </span>
        )}
        {children}
      </div>
    </PanelCloseContext.Provider>,
    document.body,
  );
}

function PanelHeader({ eyebrow, pooled = true, title, subtitle, onClose }) {
  const t = useT();
  const requestClose = useContext(PanelCloseContext) ?? onClose;
  return (
    <div data-drag-area className="flex touch-none items-start gap-2 border-b border-primary-500/8 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <span className="flex items-center gap-1 text-[9.5px] font-semibold tracking-wider text-secondary-700 uppercase">
            {pooled && <Layers size={10} strokeWidth={2} />}
            {eyebrow}
          </span>
        )}
        <span className="mt-0.5 block text-[13px] leading-snug font-semibold text-primary-600">{title}</span>
        {subtitle && <span className="block text-[11px] text-primary-500/70">{subtitle}</span>}
      </div>
      <button
        type="button"
        onClick={requestClose}
        aria-label={t("Kapat")}
        className="-mr-1 rounded-md p-1 text-primary-500/60 transition-colors hover:bg-primary-500/6 hover:text-primary-500"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function PanelGroup({ group }) {
  const t = useT();
  return (
    <span className="flex flex-col gap-1 text-[11px] leading-snug text-primary-500/75">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="font-semibold text-primary-600">{t("Grup {group}", { group: group.group })}</span>
        <span
          className={`rounded-sm px-1 py-px text-[9.5px] font-semibold ${
            group.english ? "bg-secondary-500/15 text-secondary-700" : "bg-primary-500/6 text-primary-500/75"
          }`}
        >
          {group.english ? t("İngilizce") : t("Türkçe")}
        </span>
        {group.online ? (
          <span className="inline-flex items-center gap-1 text-secondary-700">
            <Wifi size={11} strokeWidth={1.75} />
            {t("Çevrimiçi")}
          </span>
        ) : (
          group.room &&
          group.room !== "-" && (
            <span className="inline-flex items-center gap-1 font-mono text-[10.5px]">
              <MapPin size={11} strokeWidth={1.5} />
              {group.room}
            </span>
          )
        )}
      </span>
      {group.instructor && group.instructor !== "-" && (
        <span className="flex items-start gap-1">
          <User size={11} strokeWidth={1.5} className="mt-px shrink-0" />
          {group.staffSlug ? (
            <Link
              href={`/personel/${group.staffSlug}`}
              className="underline decoration-primary-500/20 underline-offset-2 transition-colors hover:text-secondary-700 hover:decoration-secondary-500"
            >
              {group.instructor}
            </Link>
          ) : (
            group.instructor
          )}
        </span>
      )}
      <EnrollAction entry={group} />
    </span>
  );
}

const instructorsOf = (course) => [
  ...new Set(
    course.groups.map((group) => group.instructor).filter((name) => name && name !== "-"),
  ),
];

function PanelCourse({ course, color, href, open, onToggle }) {
  const t = useT();
  return (
    <li className="border-t border-primary-500/6 first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-2 px-3.5 py-2 text-left transition-colors hover:bg-primary-500/3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-500"
      >
        <span className="w-9 shrink-0 pt-px font-mono text-[10.5px] text-primary-500/60">
          {startOf(course.slot)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] leading-snug font-medium text-primary-600">{course.name}</span>
          {!open && instructorsOf(course).length > 0 && (
            <span className="mt-0.5 flex items-start gap-1 text-[11px] leading-snug text-primary-500/75">
              <User size={11} strokeWidth={1.5} className="mt-px shrink-0" />
              {instructorsOf(course).join(", ")}
            </span>
          )}
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 font-mono text-[10px] text-primary-500/60">
            <span style={{ color }}>{course.code}</span>
            <span>{groupLabel(course.groups)}</span>
            <span>{rangeOf(course)}</span>
            {course.english && <span className="font-semibold text-secondary-700">EN</span>}
          </span>
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2.25}
          className={`mt-0.5 shrink-0 text-primary-500/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 px-3.5 pb-3 pl-14">
              {course.groups.map((group) => (
                <PanelGroup key={`${group.group}-${group.offeringId ?? ""}`} group={group} />
              ))}
              {href && (
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary-700 hover:underline"
                >
                  {t("Ders sayfası")}
                  <ArrowRight size={11} strokeWidth={2} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function PoolPanel({ block, palette, courseHref, anchorRef, onClose }) {
  const t = useT();
  const [openCourse, setOpenCourse] = useState(null);
  const title = `${t(DAYS[block.day])} · ${t(WINDOW_LABELS[block.window])}`;
  return (
    <AnchoredPanel anchorRef={anchorRef} label={`${block.pool.name}, ${title}`} onClose={onClose}>
      <PanelHeader
        eyebrow={block.pool.name}
        title={title}
        subtitle={t("{count} ders", { count: block.courses.length })}
        onClose={onClose}
      />
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {block.courses.map((course) => {
          const key = `${course.code}-${course.slot}`;
          return (
            <PanelCourse
              key={key}
              course={course}
              color={colorOf(palette, course.code)}
              href={courseHref?.(course.code) || null}
              open={openCourse === key}
              onToggle={() => setOpenCourse(openCourse === key ? null : key)}
            />
          );
        })}
      </ul>
    </AnchoredPanel>
  );
}

function GroupsPanel({ entry, courseHref, anchorRef, onClose }) {
  const t = useT();
  const href = courseHref?.(entry.code) || null;
  const kind = entry.pool?.name ?? (entry.badge || entry.type ? t(entry.badge || entry.type) : null);
  const groups =
    entry.groups.length === 1
      ? t("Grup {group}", { group: entry.groups[0].group })
      : t("{count} grup", { count: entry.groups.length });
  return (
    <AnchoredPanel anchorRef={anchorRef} label={`${entry.code} ${entry.name}`} onClose={onClose}>
      <PanelHeader
        eyebrow={kind}
        pooled={Boolean(entry.pool)}
        title={`${entry.code} ${entry.name}`}
        subtitle={`${t(DAYS[entry.day])} · ${rangeOf(entry)} · ${groups}`}
        onClose={onClose}
      />
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {entry.groups.map((group) => (
          <li
            key={`${group.group}-${group.offeringId ?? ""}`}
            className="border-t border-primary-500/6 px-3.5 py-2.5 first:border-t-0"
          >
            <PanelGroup group={group} />
          </li>
        ))}
      </ul>
      {href && (
        <div className="border-t border-primary-500/8 px-3.5 py-2">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary-700 hover:underline"
          >
            {t("Ders sayfası")}
            <ArrowRight size={11} strokeWidth={2} />
          </Link>
        </div>
      )}
    </AnchoredPanel>
  );
}

function Cluster({
  clusterKey,
  cluster,
  rowStart,
  rowEnd,
  column,
  palette,
  courseHref,
  clash,
  openId,
  onOpen,
  expanded,
  onExpand,
}) {
  const t = useT();
  const items = cluster.blocks;
  const single = items.length === 1;
  const conflict = clash && !single;
  const overflow = items.length > VISIBLE + 1;
  const shown = overflow && !expanded ? items.slice(0, VISIBLE) : items;

  return (
    <div
      className="relative z-10 flex flex-col gap-1 p-1"
      style={{
        gridColumn: column + 2,
        gridRow: `${rowStart} / ${rowEnd + 1}`,
        backgroundColor: conflict ? "rgba(180,120,20,0.05)" : undefined,
      }}
    >
      {conflict && (
        <span className="flex items-center gap-1 px-0.5 text-[9px] font-semibold tracking-wide text-amber-700 uppercase">
          <TriangleAlert size={9} strokeWidth={2.25} />
          {t("Çakışma")}
        </span>
      )}

      <div
        className={
          single
            ? "flex flex-auto flex-col"
            : "flex flex-auto flex-col gap-px overflow-hidden rounded-md bg-primary-500/12 shadow-[0_0_0_1px_rgba(29,36,69,0.08)]"
        }
      >
        {shown.map((entry, index) => {
          const id = `${clusterKey}#${index}`;
          const toggle = () => onOpen(openId === id ? null : id);
          if (entry.kind === "pool") {
            return (
              <PoolStrip
                key={entry.code}
                block={entry}
                fill
                joined={!single}
                showRange={!single}
                active={openId === id}
                palette={palette}
                courseHref={courseHref}
                onToggle={toggle}
              />
            );
          }
          return (
            <Strip
              key={`${entry.code}-${entry.slot}-${entry.span}`}
              entry={entry}
              color={colorOf(palette, entry.code)}
              slim={index >= VISIBLE}
              fill
              joined={!single}
              showRange={!single || entry.span > 1}
              active={openId === id}
              courseHref={courseHref}
              onToggle={toggle}
            />
          );
        })}
      </div>

      {overflow && (
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="flex min-h-6 items-center justify-center gap-0.5 rounded-md py-1 text-[10px] font-semibold text-secondary-700 transition-colors hover:bg-secondary-500/8"
        >
          <ChevronDown
            size={10}
            strokeWidth={2.25}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? t("Daralt") : t("+{count} ders", { count: items.length - VISIBLE })}
        </button>
      )}
    </div>
  );
}

function TimeLabel({ row, children }) {
  return (
    <div
      className="sticky left-0 z-20 flex flex-col items-center justify-start bg-white pt-1.5 leading-none"
      style={{
        gridColumn: 1,
        gridRow: row,
        borderBottom: `1px solid rgba(${NAVY},0.05)`,
        borderRight: `1px solid rgba(${NAVY},0.06)`,
      }}
    >
      {children}
    </div>
  );
}

export default function WeeklySchedule({
  entries = [],
  palette: fixedPalette = null,
  courseHref,
  note = null,
  clash = false,
}) {
  const t = useT();
  const [openId, setOpenId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());

  const clusters = useMemo(() => buildClusters(entries), [entries]);
  const rows = useMemo(() => buildRows(entries), [entries]);
  const rowOfSlot = useMemo(
    () =>
      new Map(
        rows.flatMap((row, ri) => (row.type === "slot" ? [[row.slot, ri + 2]] : [])),
      ),
    [rows],
  );
  const dayIndexes = useMemo(() => visibleDayIndexes(entries), [entries]);
  const ownPalette = useMemo(() => courseColors(entries), [entries]);
  const palette = fixedPalette ?? ownPalette;

  useEffect(() => {
    if (!openId) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const toggleExpand = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div data-schedule-grid className="overflow-hidden rounded-xl border border-primary-500/10 bg-white shadow-xs">
      <div className="border-b border-primary-500/6 px-4 py-2 text-center sm:hidden">
        <span className="text-[11px] text-primary-500/70">
          {t("← Programı görmek için yatay kaydırın →")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 72 + 156 * dayIndexes.length }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `72px repeat(${dayIndexes.length}, minmax(156px, 1fr))`,
              gridTemplateRows: `40px ${rows
                .map((row) =>
                  row.type === "edge"
                    ? "26px"
                    : row.empty
                      ? "24px"
                      : "minmax(44px, auto)",
                )
                .join(" ")}`,
            }}
          >
            <div
              className="sticky left-0 z-20 flex items-center justify-center bg-white"
              style={{
                gridColumn: 1,
                gridRow: 1,
                borderBottom: `1px solid rgba(${NAVY},0.08)`,
                borderRight: `1px solid rgba(${NAVY},0.06)`,
              }}
            >
              <span className="text-[10px] font-semibold tracking-widest text-primary-500/70 uppercase">
                {t("Saat")}
              </span>
            </div>

            {dayIndexes.map((di, col) => (
              <div
                key={DAYS[di]}
                className="flex items-center justify-center"
                style={{
                  gridColumn: col + 2,
                  gridRow: 1,
                  borderBottom: `1px solid rgba(${NAVY},0.08)`,
                  borderRight:
                    col < dayIndexes.length - 1
                      ? `1px solid rgba(${NAVY},0.05)`
                      : "none",
                }}
              >
                <span className="text-[12px] font-semibold text-primary-500">
                  {t(DAYS[di])}
                </span>
              </div>
            ))}

            {rows.flatMap((row, ri) => {
              const gridRow = ri + 2;

              if (row.type === "edge") {
                return [
                  <TimeLabel key={`edgelabel-${ri}`} row={gridRow}>
                    <span className="font-mono text-[9px] whitespace-nowrap text-primary-500/70">
                      {startOf(row.from)}
                    </span>
                  </TimeLabel>,
                  <div
                    key={`edgeband-${ri}`}
                    className="flex items-center justify-center"
                    style={{
                      gridColumn: "2 / -1",
                      gridRow,
                      backgroundColor: `rgba(${NAVY},0.02)`,
                      borderBottom: `1px solid rgba(${NAVY},0.04)`,
                    }}
                  >
                    <span className="font-mono text-[9px] tracking-wide text-primary-500/70">
                      {startOf(row.from)} – {endOf(row.to)} · {t("ders yok")}
                    </span>
                  </div>,
                ];
              }

              if (row.empty) {
                return [
                  <TimeLabel key={`emptylabel-${ri}`} row={gridRow}>
                    <span className="font-mono text-[9px] whitespace-nowrap text-primary-500/70">
                      {startOf(row.slot)}
                    </span>
                  </TimeLabel>,
                  <div
                    key={`emptyband-${ri}`}
                    style={{
                      gridColumn: "2 / -1",
                      gridRow,
                      backgroundColor: `rgba(${NAVY},0.015)`,
                      borderBottom: `1px solid rgba(${NAVY},0.04)`,
                    }}
                  />,
                ];
              }

              return [
                <TimeLabel key={`slotlabel-${ri}`} row={gridRow}>
                  <span className="font-mono text-[10.5px] font-semibold whitespace-nowrap text-primary-500/70">
                    {startOf(row.slot)}
                  </span>
                  <span className="mt-0.5 font-mono text-[8.5px] whitespace-nowrap text-primary-500/70">
                    {endOf(row.slot)}
                  </span>
                </TimeLabel>,
                ...dayIndexes.map((di, col) => (
                  <div
                    key={`bg-${di}-${row.slot}`}
                    style={{
                      gridColumn: col + 2,
                      gridRow,
                      backgroundColor: ri % 2 === 1 ? `rgba(${NAVY},0.012)` : "transparent",
                      borderBottom: `1px solid rgba(${NAVY},0.05)`,
                      borderRight:
                        col < dayIndexes.length - 1 ? `1px solid rgba(${NAVY},0.04)` : "none",
                    }}
                  />
                )),
              ];
            })}

            {dayIndexes.flatMap((di, col) =>
              (clusters.get(di) ?? []).map((cluster) => {
                const key = `${di}-${cluster.from}`;
                return (
                  <Cluster
                    key={`cluster-${key}`}
                    clusterKey={key}
                    cluster={cluster}
                    rowStart={rowOfSlot.get(cluster.from)}
                    rowEnd={rowOfSlot.get(cluster.to)}
                    column={col}
                    palette={palette}
                    courseHref={courseHref}
                    clash={clash}
                    openId={openId}
                    onOpen={setOpenId}
                    expanded={expanded.has(key)}
                    onExpand={() => toggleExpand(key)}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      {note && (
        <div className="border-t border-primary-500/6 px-4 py-2.5 text-center">
          <span className="text-[11px] text-primary-500/70">{t(note)}</span>
        </div>
      )}

      {entries.length === 0 && (
        <div className="border-t border-primary-500/6 py-12 text-center">
          <span className="text-[13px] text-primary-500/70">
            {t("Bu program için ders bulunmuyor.")}
          </span>
        </div>
      )}
    </div>
  );
}
