"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Download, Copy, Check, LoaderCircle } from "lucide-react";
import Modal from "@/app/components/Modal";
import { sectionLabel } from "@/lib/section-label";
import { useT } from "@/i18n/useT";
import { useCmsRoute } from "inscribed";
import { localizeTerm } from "@/i18n";
import { renderStatsCard, canvasToBlob, statsCardLegend, STATS_CARD_SIZE } from "@/lib/stats-card";

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
      setCapabilities({
        share: typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }),
        link: typeof navigator.share === "function",
        copy: typeof window.ClipboardItem === "function" && !!navigator.clipboard?.write,
        secure: window.isSecureContext,
      });
    } catch {
      if (run === runRef.current) setStatus(t("Görsel oluşturulamadı."));
    }
  };

  const openShare = () => {
    const run = ++runRef.current;
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
      setStatus(t("Görsel panoya kopyalandı. WhatsApp Web, Discord ya da Telegram'da yapıştırabilirsin."));
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
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50";
  const primary = `${button} bg-secondary-500 text-primary-500 hover:bg-secondary-500/80`;
  const secondary = `${button} border border-primary-500/10 bg-white text-primary-500 hover:bg-primary-500/5`;

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
        contentClassName="flex items-center justify-center overflow-y-auto p-4"
      >
        <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-primary-600">{t("İstatistiği paylaş")}</h2>
            <p className="mt-1 text-sm text-primary-500/70">
              {t("Seçili dönem, hoca ve şubenin istatistikleri tek bir görselde.")}
            </p>
          </div>

          <div
            role="group"
            aria-label={t("Görsel teması")}
            className="flex self-center rounded-lg border border-primary-500/10 bg-primary-500/3 p-0.5"
          >
            {[
              ["dark", "Koyu"],
              ["light", "Açık"],
            ].map(([name, label]) => (
              <button
                key={name}
                type="button"
                onClick={() => chooseTheme(name)}
                aria-pressed={theme === name}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  theme === name ? "bg-white text-primary-600 shadow-xs" : "text-primary-500/60 hover:text-primary-500"
                }`}
              >
                {t(label)}
              </button>
            ))}
          </div>

          <div
            className={`mx-auto w-full overflow-hidden rounded-xl border border-primary-500/10 ${
              theme === "dark" ? "bg-primary-500" : "bg-[#E7EAF0]"
            }`}
            style={{
              aspectRatio: `${STATS_CARD_SIZE.width} / ${STATS_CARD_SIZE.height}`,
              maxWidth: `min(24rem, calc(52svh * ${STATS_CARD_SIZE.width / STATS_CARD_SIZE.height}))`,
            }}
          >
            {image ? (
              <img src={image.url} alt={image.data.shareText} className="size-full object-contain" />
            ) : (
              <div className="flex size-full items-center justify-center text-white/60">
                <LoaderCircle size={20} className="animate-spin" aria-label={t("Hazırlanıyor")} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-flow-col sm:auto-cols-fr">
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
              <button
                type="button"
                onClick={copy}
                disabled={!image}
                className={secondary}
              >
                {copied ? <Check size={15} className="text-secondary-700" /> : <Copy size={15} />}
                {copied ? t("Kopyalandı") : t("Görseli kopyala")}
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

          {image && !capabilities.share && (
            <p className="text-xs text-primary-500/70">
              {capabilities.secure
                ? t("Bu tarayıcı görseli doğrudan paylaşamıyor; indirip ya da kopyalayıp paylaşabilirsin.")
                : t("Görseli doğrudan paylaşmak yalnızca güvenli (https) bağlantıda çalışır; indirip paylaşabilirsin.")}
            </p>
          )}

          <p className="min-h-5 text-xs text-primary-500/70" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </Modal>
    </>
  );
}
