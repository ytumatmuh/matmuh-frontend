import { Layers, Wifi } from "lucide-react";

import { COURSE_COLORS } from "@/data/schedule-colors";
import { useT } from "@/i18n/useT";

export default function ScheduleLegend({
  items = [],
  showOnline = false,
  showEnglish = true,
  showPool = false,
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 flex-wrap px-1">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5"
          style={{ fontSize: "0.6875rem", color: "rgba(29,36,69,0.5)" }}
        >
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block border border-primary-500/15"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
      <span
        className="inline-flex items-center gap-1.5"
        style={{ fontSize: "0.6875rem", color: "rgba(29,36,69,0.5)" }}
      >
        <span className="inline-flex gap-px">
          {COURSE_COLORS.slice(0, 3).map((color) => (
            <span
              key={color}
              className="inline-block h-2.5 w-0.75 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        {t("Aynı ders, aynı renk")}
      </span>

      {showEnglish && (
        <span
          className="inline-flex items-center gap-1.5"
          style={{ fontSize: "0.6875rem", color: "rgba(29,36,69,0.5)" }}
        >
          <span className="font-mono text-[9.5px] font-semibold tracking-wide text-secondary-700">
            EN
          </span>
          {t("İngilizce ders")}
        </span>
      )}

      {showPool && (
        <span
          className="inline-flex items-center gap-1"
          style={{ fontSize: "0.6875rem", color: "var(--color-secondary-600)" }}
        >
          <Layers size={11} strokeWidth={2} />
          {t("Üniversite seçmelileri, gün dilimine göre toplu")}
        </span>
      )}

      {showOnline && (
        <span
          className="inline-flex items-center gap-1"
          style={{ fontSize: "0.6875rem", color: "var(--color-secondary-600)" }}
        >
          <Wifi size={11} strokeWidth={2} />
          {t("Çevrimiçi")}
        </span>
      )}
    </div>
  );
}
