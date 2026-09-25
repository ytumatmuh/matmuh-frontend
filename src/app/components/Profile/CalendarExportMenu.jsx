"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCmsRoute } from "inscribed";
import { CalendarPlus, Check, Copy, Download, ExternalLink } from "lucide-react";

import { useT } from "@/i18n/useT";

const neverChanges = () => () => {};
const platformOf = () => {
  const agent = navigator.userAgent;
  if (/android/i.test(agent)) return "android";
  if (/iphone|ipad|ipod|macintosh/i.test(agent)) return "apple";
  return "other";
};

const ITEM =
  "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-primary-500/4 focus-visible:bg-primary-500/4 focus-visible:outline-none";

function Item({ href, onSelect, icon: Icon, title, hint }) {
  const body = (
    <>
      <Icon size={14} className="mt-0.5 shrink-0 text-secondary-700" />
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] text-primary-600">{title}</span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug text-primary-500/70">{hint}</span>
        )}
      </span>
    </>
  );
  if (href) {
    return (
      <a role="menuitem" href={href} target="_blank" rel="noopener noreferrer" className={ITEM}>
        {body}
      </a>
    );
  }
  return (
    <button role="menuitem" type="button" onClick={onSelect} className={ITEM}>
      {body}
    </button>
  );
}

export default function CalendarExportMenu({ offeringIds, onDownload }) {
  const t = useT();
  const { locale } = useCmsRoute();
  const platform = useSyncExternalStore(neverChanges, platformOf, () => "other");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const feed = `${window.location.host}/takvim.ics?o=${offeringIds.join(",")}&lang=${locale}`;
  const https = `${window.location.protocol}//${feed}`;
  const webcal = `webcal://${feed}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(https);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const items = {
    google: {
      href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
      icon: ExternalLink,
      title: "Google Takvim",
      hint:
        platform === "android"
          ? t("Açılan sayfada Chrome menüsünden “Masaüstü sitesi”ni seçip Ekle'ye dokunun.")
          : null,
    },
    apple: { href: webcal, icon: CalendarPlus, title: t("Apple Takvim"), hint: t("iPhone, iPad ve Mac") },
    outlook: {
      href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(t("YTÜ Ders Programım"))}`,
      icon: ExternalLink,
      title: "Outlook",
    },
    copy: {
      onSelect: copy,
      icon: copied ? Check : Copy,
      title: copied ? t("Bağlantı kopyalandı") : t("Bağlantıyı kopyala"),
      hint: t("Google Takvim'de Diğer takvimler → URL ile ekle'ye yapıştırın."),
    },
    file: {
      onSelect: () => {
        onDownload();
        setOpen(false);
      },
      icon: Download,
      title: t("Dosya olarak indir"),
      hint: platform === "android" ? t("Samsung Takvim gibi uygulamalar dosyayı açabilir.") : null,
    },
  };

  const order =
    platform === "android"
      ? ["google", "copy", "file"]
      : platform === "apple"
        ? ["apple", "google", "outlook", "copy", "file"]
        : ["google", "apple", "outlook", "copy", "file"];

  const onKeyDown = (event) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (!open || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const nodes = [...ref.current.querySelectorAll('[role="menuitem"]')];
    const index = nodes.indexOf(document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    nodes[(index + step + nodes.length) % nodes.length]?.focus();
  };

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-secondary-500/10 px-2.5 py-1 text-[11px] font-medium text-secondary-700 transition-colors hover:bg-secondary-500/15"
      >
        <CalendarPlus size={12} strokeWidth={2} />
        {t("Takvime aktar")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("Takvime aktar")}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full z-20 mt-2 w-[min(18rem,calc(100vw-3rem))] origin-top-right overflow-hidden rounded-xl bg-white shadow-popover ring-1 ring-primary-500/10"
          >
            <p className="px-3.5 pt-3 pb-2 text-[11px] leading-snug text-primary-500/70">
              {t("Programınız takviminize eklenir ve kendiliğinden güncellenir.")}
            </p>
            <div className="border-t border-primary-500/8 p-1.5">
              {order.map((key) => (
                <Item key={key} {...items[key]} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
