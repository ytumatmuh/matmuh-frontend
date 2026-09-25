"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Download, Copy, Check, LoaderCircle } from "lucide-react";
import Modal from "@/app/components/Modal";
import { sectionLabel } from "@/lib/section-label";
import { useT } from "@/i18n/useT";
import { useCmsRoute } from "inscribed";
import { localizeTerm } from "@/i18n";
import { renderStatsCard, canvasToBlob, statsCardLegend } from "@/lib/stats-card";

const SITE_HOST = "matmuh.yildiz.edu.tr";

const slug = (text) =>
  String(text)
    .toLocaleLowerCase("tr-TR")
    .replace(/[ğüşıöç]/g, (c) => ({ ğ: "g", ü: "u", ş: "s", ı: "i", ö: "o", ç: "c" })[c])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function buildCardData({ t, locale, theme, course, termName, instructor, stats, summary, showSection }) {
  const legend = statsCardLegend(theme);
  const term = localizeTerm(t, termName);
  const coursePath = `${locale === "en" ? "/en" : ""}/egitim/mufredat/${course.code}`;
  const pct = (v) => {
    if (v == null || v === "") return "—";
    return locale === "en" ? `${v}%` : `%${String(v).replace(".", ",")}`;
  };
  const num = (v, d = 2) =>
    v == null || v === "" || Number.isNaN(Number(v))
      ? "—"
      : new Intl.NumberFormat(locale === "en" ? "en-US" : "tr-TR", { maximumFractionDigits: d }).format(Number(v));

  const hasDistribution = (stats.gradeDistribution ?? []).length > 0;

  return {
    locale,
    code: course.code,
    name: course.title,
    meta: [term, instructor, showSection ? sectionLabel(t, stats) : null]
      .filter(Boolean)
      .join("  ·  "),
    url: `${SITE_HOST}${coursePath}`,
    kpis: [
      {
        label: t("Sınıf Ortalaması"),
        value: num(stats.summary?.average),
        sub: t("Sınıf Düzeyi: {level}", { level: summary.avgLevel }),
      },
      { label: t("Standart Sapma"), value: num(stats.summary?.stdDev), sub: t("σ dağılımı") },
      {
        label: t("Dersi Alan"),
        value: hasDistribution ? num(summary.enrolled, 0) : "—",
        sub: t("öğrenci"),
      },
      {
        label: t("Geçme Oranı"),
        value: hasDistribution ? pct(summary.passRate) : "—",
        sub: hasDistribution
          ? t("{passed} geçen · {failed} kalan", { passed: summary.passed, failed: summary.failed })
          : t("harf dağılımı yok"),
      },
    ],
    distributions: [
      { title: t("Harf Dağılımı"), rows: stats.gradeDistribution ?? [] },
      { title: t("Bütünleme Harf Dağılımı"), rows: stats.makeupDistribution ?? [] },
    ],
    theme,
    legend: [
      { color: legend.pass, label: t("geçer") },
      { color: legend.conditional, label: t("koşullu") },
      { color: legend.fail, label: t("kalır") },
    ],
    exams: (stats.exams ?? []).map((exam) => ({ ...exam, name: t(exam.name) })),
    labels: {
      eyebrow: t("YTÜ MATEMATİK MÜHENDİSLİĞİ  ·  DERS İSTATİSTİĞİ"),
      exams: t("Sınavlar"),
      average: t("ort."),
      averageBar: t("Ortalama"),
      attendance: t("Katılım"),
      attended: t("giren"),
      students: t("öğrenci"),
      noDetail: t("Bu şube için ayrıntılı dağılım yok."),
      footer: t("Kaynak: OBS"),
    },
    fileName: `${slug(course.code)}-${slug(termName)}${showSection ? `-sube-${stats.section}` : ""}.png`,
    shareText: t("{code} {name} · {term} istatistikleri", { code: course.code, name: course.title, term }),
    shareUrl: `https://${SITE_HOST}${coursePath}`,
  };
}

export default function ShareStats(props) {
  const t = useT();
  const { locale } = useCmsRoute();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState({});
  const [theme, setTheme] = useState("dark");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [capabilities, setCapabilities] = useState({ share: false, link: false, copy: false, secure: true });

  const { course, termName, instructor, stats, summary, showSection } = props;
  const urlsRef = useRef([]);
  const runRef = useRef(0);
  const image = images[theme] ?? null;

  const releaseUrls = () => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  };

  useEffect(() => releaseUrls, []);



  const generate = async (name, run) => {
    try {
      const data = buildCardData({ t, locale, theme: name, course, termName, instructor, stats, summary, showSection });
      const canvas = await renderStatsCard(data);
      const blob = await canvasToBlob(canvas);
      if (run !== runRef.current) return;
      const file = new File([blob], data.fileName, { type: "image/png" });
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      setImages((prev) => ({ ...prev, [name]: { url, blob, file, data } }));
    } catch {
      if (run === runRef.current) setStatus(t("Görsel oluşturulamadı."));
    }
  };

  const openShare = () => {
    const run = ++runRef.current;
    const probe = new File([new Uint8Array(1)], "probe.png", { type: "image/png" });
    setCapabilities({
      share: typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }),
      link: typeof navigator.share === "function",
      copy: typeof window.ClipboardItem === "function" && !!navigator.clipboard?.write,
      secure: window.isSecureContext,
    });
    releaseUrls();
    setImages({});
    setTheme("dark");
    setStatus("");
    setCopied(false);
    setOpen(true);
    void generate("dark", run);
  };

  const chooseTheme = (name) => {
    setTheme(name);
    setCopied(false);
    setStatus("");
    if (!images[name]) void generate(name, runRef.current);
  };

  const closeShare = () => {
    runRef.current++;
    setOpen(false);
  };

  const share = async () => {
    try {
      await navigator.share({ files: [image.file], title: image.data.shareText, text: image.data.shareUrl });
    } catch (error) {
      if (error?.name !== "AbortError") setStatus(t("Paylaşılamadı; görseli indirip paylaşabilirsin."));
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({ title: image.data.shareText, text: image.data.shareText, url: image.data.shareUrl });
    } catch (error) {
      if (error?.name !== "AbortError") setStatus(t("Paylaşılamadı; görseli indirip paylaşabilirsin."));
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ "image/png": image.blob })]);
      setCopied(true);
      setStatus(t("Görsel panoya kopyalandı."));
    } catch {
      setStatus(t("Kopyalanamadı; görseli indirip paylaşabilirsin."));
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = image.url;
    a.download = image.data.fileName;
    document.body.append(a);
    a.click();
    a.remove();
    setStatus(t("Görsel indirildi."));
  };

  const button =
    "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50";
  const primary = `${button} bg-secondary-500 text-primary-600 hover:bg-secondary-500/85`;
  const secondary = `${button} bg-white/10 text-white ring-1 ring-white/15 ring-inset hover:bg-white/15`;
  const swatches = [
    ["dark", "Koyu tema", "bg-primary-500 ring-1 ring-white/35 ring-inset"],
    ["light", "Açık tema", "bg-white"],
  ];

  return (
    <>
      <button
        type="button"
        onClick={openShare}
        disabled={!stats}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-xs font-semibold text-primary-500 transition-colors hover:bg-secondary-500/80 disabled:opacity-50"
      >
        <Share2 size={14} />
        {t("Paylaş")}
      </button>

      <Modal
        open={open}
        onClose={closeShare}
        label={t("İstatistiği paylaş")}
        contentClassName="flex flex-col items-center gap-4 bg-primary-700/50 px-4 backdrop-blur-md pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pt-14 sm:pb-8"
      >
        <h2 className="absolute top-5 left-5 text-sm font-semibold text-white/85">{t("İstatistiği paylaş")}</h2>

        <div
          className="flex min-h-0 w-full flex-1 items-center justify-center"
          onClick={(event) => event.target === event.currentTarget && closeShare()}
        >
          {image ? (
            <img
              src={image.url}
              alt={image.data.shareText}
              className="max-h-full max-w-full rounded-xl object-contain ring-1 ring-white/12 shadow-[0_18px_48px_rgba(0,0,0,0.35)] sm:max-w-md"
            />
          ) : (
            <LoaderCircle size={22} className="animate-spin text-white/60" aria-label={t("Hazırlanıyor")} />
          )}
        </div>

        <div role="radiogroup" aria-label={t("Görsel teması")} className="flex shrink-0 items-center gap-3">
          {swatches.map(([name, label, fill]) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={theme === name}
              aria-label={t(label)}
              title={t(label)}
              onClick={() => chooseTheme(name)}
              className={`size-7 rounded-full transition-shadow ${fill} ${
                theme === name
                  ? "shadow-[0_0_0_2px_var(--color-primary-700),0_0_0_4px_var(--color-secondary-500)]"
                  : "hover:shadow-[0_0_0_2px_var(--color-primary-700),0_0_0_4px_rgba(255,255,255,0.3)]"
              }`}
            />
          ))}
        </div>

        <div className="grid w-full max-w-md shrink-0 auto-cols-fr grid-flow-col gap-2">
          {capabilities.share && (
            <button type="button" onClick={share} disabled={!image} className={primary}>
              <Share2 size={15} />
              {t("Paylaş")}
            </button>
          )}
          {!capabilities.share && capabilities.link && (
            <button type="button" onClick={shareLink} disabled={!image} className={secondary}>
              <Share2 size={15} />
              {t("Bağlantıyı paylaş")}
            </button>
          )}
          {capabilities.copy && (
            <button type="button" onClick={copy} disabled={!image} className={secondary}>
              {copied ? <Check size={15} className="text-secondary-500" /> : <Copy size={15} />}
              {copied ? t("Kopyalandı") : t("Kopyala")}
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={!image}
            className={capabilities.share ? secondary : primary}
          >
            <Download size={15} />
            {t("İndir")}
          </button>
        </div>

        {(status || (image && !capabilities.share)) && (
          <p className="max-w-md shrink-0 text-center text-xs text-white/65" role="status" aria-live="polite">
            {status ||
              (capabilities.secure
                ? t("Bu tarayıcı görseli doğrudan paylaşamıyor; indirip ya da kopyalayıp paylaşabilirsin.")
                : t("Görseli doğrudan paylaşmak yalnızca güvenli (https) bağlantıda çalışır; indirip paylaşabilirsin."))}
          </p>
        )}
      </Modal>
    </>
  );
}
