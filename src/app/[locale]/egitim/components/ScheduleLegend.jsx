"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleHelp, Layers, MousePointerClick, Wifi } from "lucide-react";

import { COURSE_COLORS, GOLD_RGB, blockStyle } from "@/data/schedule-colors";
import { useT } from "@/i18n/useT";

const OUTLINE = "inset 0 0 0 1px rgba(29,36,69,0.08)";
const HOVER_OPEN_MS = 200;
const HOVER_CLOSE_MS = 150;

function Sample({ elective, bar = COURSE_COLORS[1], children }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-[3px]"
      style={{ ...blockStyle(elective, bar), boxShadow: elective ? undefined : OUTLINE }}
    >
      {children}
    </span>
  );
}

function JoinedSample() {
  return (
    <span
      aria-hidden
      className="inline-flex h-4 w-6 shrink-0 flex-col gap-px overflow-hidden rounded-[3px] bg-primary-500/15"
      style={{ boxShadow: OUTLINE }}
    >
      <span className="flex-1" style={blockStyle(false, COURSE_COLORS[1])} />
      <span className="flex-1" style={blockStyle(false, COURSE_COLORS[2])} />
    </span>
  );
}

function StripesSample() {
  return (
    <span aria-hidden className="inline-flex h-4 w-6 shrink-0 items-center justify-center gap-0.75">
      {COURSE_COLORS.slice(1, 4).map((color) => (
        <span key={color} className="h-4 w-0.75 rounded-full" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

function Item({ sample, className = "inline-flex", children }) {
  return (
    <span className={`${className} items-center gap-1.5 text-[11.5px] leading-tight text-primary-500/75`}>
      {sample}
      {children}
    </span>
  );
}

export default function ScheduleLegend({
  items = [],
  showOnline = false,
  showEnglish = true,
  showPool = false,
}) {
  const t = useT();
  const [help, setHelp] = useState(false);
  const helpRef = useRef(null);
  const timerRef = useRef(0);

  const openLater = (event) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHelp(true), HOVER_OPEN_MS);
  };
  const closeLater = (event) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHelp(false), HOVER_CLOSE_MS);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!help) return undefined;
    const onPointer = (event) => {
      if (!helpRef.current?.contains(event.target)) setHelp(false);
    };
    const onKey = (event) => event.key === "Escape" && setHelp(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [help]);

  return (
    <div className="px-1 sm:relative">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {items.map((item) => (
          <Item key={item.label} className="hidden sm:inline-flex" sample={<Sample elective={item.elective} bar={COURSE_COLORS[item.elective ? 2 : 1]} />}>
            {item.label}
          </Item>
        ))}
        {showEnglish && (
          <Item
            className="hidden sm:inline-flex"
            sample={
              <span className="font-mono text-[9.5px] font-semibold tracking-wide text-secondary-700">EN</span>
            }
          >
            {t("İngilizce")}
          </Item>
        )}
        {showOnline && (
          <Item className="hidden sm:inline-flex" sample={<Wifi size={12} strokeWidth={2} className="text-secondary-700" />}>{t("Çevrimiçi")}</Item>
        )}
        <div
          ref={helpRef}
          onPointerEnter={openLater}
          onPointerLeave={closeLater}
          onFocus={(event) => {
            if (event.target.matches(":focus-visible")) setHelp(true);
          }}
          onBlur={(event) => {
            if (!helpRef.current?.contains(event.relatedTarget)) setHelp(false);
          }}
        >
          <button
            type="button"
            onClick={() => {
              clearTimeout(timerRef.current);
              setHelp((prev) => !prev);
            }}
            aria-expanded={help}
            aria-controls="schedule-help"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium text-secondary-700 transition-colors hover:bg-secondary-500/10"
          >
            <CircleHelp size={13} strokeWidth={2} />
            {t("Nasıl okunur?")}
            <ChevronDown size={12} strokeWidth={2} className={`transition-transform ${help ? "rotate-180" : ""}`} />
          </button>

          <div
            id="schedule-help"
            role="tooltip"
            aria-hidden={!help}
            className={`absolute top-full right-0 left-0 z-30 mt-1.5 grid origin-top-left sm:right-auto sm:w-max sm:max-w-[min(40rem,100%)] gap-2.5 rounded-lg border border-primary-500/10 bg-white px-3.5 py-3 shadow-popover transition-[opacity,scale,visibility] motion-reduce:transition-none ${
              help
                ? "visible scale-100 opacity-100 duration-150 ease-out"
                : "invisible pointer-events-none scale-[0.97] opacity-0 duration-[120ms] ease-in"
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-primary-500/8 pb-2.5 sm:hidden">
            {items.map((item) => (
              <Item key={item.label} sample={<Sample elective={item.elective} bar={COURSE_COLORS[item.elective ? 2 : 1]} />}>
                {item.label}
              </Item>
            ))}
            {showEnglish && (
              <Item
                sample={
                  <span className="font-mono text-[9.5px] font-semibold tracking-wide text-secondary-700">EN</span>
                }
              >
                {t("İngilizce")}
              </Item>
            )}
            {showOnline && (
              <Item sample={<Wifi size={12} strokeWidth={2} className="text-secondary-700" />}>{t("Çevrimiçi")}</Item>
            )}
            </div>
            <Item sample={<StripesSample />}>{t("Sol şeridin rengi dersi gösterir; aynı ders her yerde aynı renktedir.")}</Item>
            <Item sample={<JoinedSample />}>{t("Aynı saatte birden çok ders varsa tek kutuda alt alta durur.")}</Item>
            {showPool && (
              <Item
                sample={
                  <Sample elective bar={`rgb(${GOLD_RGB})`}>
                    <Layers size={9} strokeWidth={2.25} className="text-secondary-700" />
                  </Sample>
                }
              >
                {t("Aynı dilimdeki üniversite seçmelileri tek kutuda toplanır; tıklayınca liste açılır.")}
              </Item>
            )}
            <Item
              sample={
                <span className="inline-flex w-6 shrink-0 justify-center text-primary-500/60">
                  <MousePointerClick size={13} strokeWidth={1.75} />
                </span>
              }
            >
              {t("Öğretim elemanı, derslik ve programa ekleme için kutuya tıklayın.")}
            </Item>
          </div>
        </div>
      </div>
    </div>
  );
}
