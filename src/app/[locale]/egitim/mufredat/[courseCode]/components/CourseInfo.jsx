"use client";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Library,
  NotebookPen,
  Calendar,
  ChevronDown,
  GraduationCap,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Wifi,
} from "lucide-react";
import PageLayout from "@/app/components/PageLayout";
import MainCard from "@/app/components/MainCard";
import Collapse from "@/app/components/Collapse";
import Link from "@/app/components/LocaleLink";

import LectureNotes from "./LectureNotes";
import SectionEnroll from "./SectionEnroll";
import { useAuth } from "@/lib/auth";
import { useT } from "@/i18n/useT";

const RESOURCES_SHOWN = 5;

function resourceLines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^([-•*·]|\d+[.)])\s*/, "")
        .replace(/,(?=\S)/g, ", ")
        .replace(/\s{2,}/g, " "),
    )
    .filter(Boolean);
}

function ResourceList({ text }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const lines = resourceLines(text);
  const hidden = lines.length - RESOURCES_SHOWN;
  const shown = all || hidden <= 1 ? lines : lines.slice(0, RESOURCES_SHOWN);

  return (
    <div className="border-l-2 border-primary-500/10 pl-5">
      <ul className="flex flex-col gap-2">
        {shown.map((line, index) => (
          <li key={index} className="flex gap-2.5 text-[13px] leading-relaxed text-primary-500/80">
            <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-secondary-500" />
            <span className="min-w-0 wrap-break-word">{line}</span>
          </li>
        ))}
      </ul>
      {hidden > 1 && (
        <button
          type="button"
          onClick={() => setAll((value) => !value)}
          aria-expanded={all}
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-secondary-700 hover:underline"
        >
          <ChevronDown size={13} className={`transition-transform ${all ? "rotate-180" : ""}`} />
          {all ? t("Daha az göster") : t("+{count} kaynak daha", { count: hidden })}
        </button>
      )}
    </div>
  );
}

const POLICY_LINE = /^(.+?):\s*(\d+)\s*×\s*%\s*(\d+(?:[.,]\d+)?)$/;

function policyItems(text) {
  if (!text) return null;
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const items = lines.map((line) => {
    const match = line.match(POLICY_LINE);
    return match
      ? { label: match[1].trim(), count: Number(match[2]), weight: Number(match[3].replace(",", ".")) }
      : null;
  });
  return items.length > 0 && items.every(Boolean) ? items : null;
}

function assessmentGroups(assessment, items) {
  const final = assessment.final?.weight ?? 0;
  const last = items?.at(-1);
  const finalItem = last && last.weight === final ? last : null;
  const termItems = (items ?? []).filter((item) => item !== finalItem);
  return [
    { key: "term", label: "Yarıyıl içi", weight: assessment.midterm?.weight ?? 0, items: termItems },
    { key: "final", label: "Final", weight: final, items: [], note: "Dönem sonu sınavı" },
  ].filter((group) => group.weight > 0);
}

function Assessment({ assessment, policy }) {
  const t = useT();
  const items = policyItems(policy);

  if (!assessment) {
    return (
      <p className="text-sm leading-relaxed text-primary-500/70 whitespace-pre-line border-l-2 border-primary-500/10 pl-5 py-1">
        {policy || "-"}
      </p>
    );
  }

  const groups = assessmentGroups(assessment, items);

  return (
    <div>
      <div className="flex flex-col sm:flex-row rounded-xl border border-primary-500/10 bg-primary-500/2 overflow-hidden">
        {groups.map((group) => (
          <section
            key={group.key}
            style={{ flexGrow: group.weight }}
            className="min-w-0 sm:basis-0 border-primary-500/10 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l"
          >
            <div className={`h-1.5 ${group.key === "final" ? "bg-primary-500" : "bg-secondary-500"}`} />
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-[10px] font-bold text-secondary-700 uppercase tracking-widest">
                  {t(group.label)}
                </h4>
                <span className="text-xl font-semibold text-primary-500 tabular-nums">
                  {t("%{n}", { n: group.weight })}
                </span>
              </div>
              {group.items.length > 0 ? (
                <ul className="mt-3 divide-y divide-primary-500/8 border-t border-primary-500/8">
                  {group.items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 text-primary-500/80">
                        {item.label}
                        {item.count > 1 && (
                          <span className="ml-1.5 text-xs text-primary-500/50">
                            {t("{n} adet", { n: item.count })}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-xs font-semibold text-primary-500">
                        {t("%{n}", { n: item.weight })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                group.note && <p className="mt-1 text-xs text-primary-500/60">{t(group.note)}</p>
              )}
            </div>
          </section>
        ))}
      </div>
      {!items && policy && (
        <p className="mt-3 text-[13px] leading-relaxed text-primary-500/70 whitespace-pre-line">{policy}</p>
      )}
    </div>
  );
}

function SectionRow({ section, defaultOpen }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const first = section.schedule[0];

  return (
    <div className="rounded-lg border border-primary-500/8">
      <div className="relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors has-[button:hover]:bg-primary-500/3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={`${section.instructor} · ${t("Grup")} ${section.groupNo}`}
          className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-secondary-500"
        />
        <span
          className="pointer-events-none size-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold"
          style={{
            backgroundColor: "var(--color-primary-500)",
            color: "var(--color-secondary-500, #AD976F)",
          }}
        >
          {initials(section.instructor)}
        </span>
        <span className="pointer-events-none min-w-0 flex-1">
          {section.staffSlug ? (
            <Link
              href={`/personel/${section.staffSlug}`}
              className="pointer-events-auto relative z-10 block wrap-break-word text-[13px] font-semibold leading-tight text-primary-500 transition-colors hover:text-secondary-700"
            >
              {section.instructor}
            </Link>
          ) : (
            <span className="block wrap-break-word text-[13px] font-semibold leading-tight text-primary-500">
              {section.instructor}
            </span>
          )}
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-primary-500/70">
            <span>
              {t("Grup")} {section.groupNo}
            </span>
            <span
              className={`rounded-sm px-1.5 py-px text-[10px] font-semibold ${
                section.english
                  ? "bg-secondary-500/15 text-secondary-700"
                  : "bg-primary-500/6 text-primary-500/80"
              }`}
            >
              {section.english ? t("İngilizce") : t("Türkçe")}
            </span>
            {!open && first && (
              <>
                <span>
                  {t(first.day)} {first.time.split(" - ")[0]}
                  {section.schedule.length > 1 &&
                    ` +${section.schedule.length - 1}`}
                </span>
              </>
            )}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`pointer-events-none shrink-0 text-primary-500/70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      <Collapse open={open}>
        <div className="space-y-2 px-2.5 pb-2.5">
          {section.schedule.map((slot, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-primary-500/2 border border-primary-500/10"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-primary-500">
                  {t(slot.day)}
                </span>
                {slot.online && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary-700 bg-secondary-500/10 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    <Wifi size={9} strokeWidth={2} /> {t("Çevrimiçi")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-primary-500/70">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {slot.time}
                </span>
                {!slot.online && slot.room !== "-" && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} /> {slot.room}
                  </span>
                )}
              </div>
            </div>
          ))}

          <SectionEnroll
            offeringId={section.offeringId}
            schedule={section.schedule}
          />
        </div>
      </Collapse>
    </div>
  );
}

const initials = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr") || "?";


export default function CourseInfo({ course, sections = [] }) {
  const t = useT();
  const [activeTab, setActiveTab] = useState(0);
  const { isAuthenticated, signIn } = useAuth();

  const onSignIn = useCallback(() => signIn(), [signIn]);

  if (!course) return null;

  const weekCount = course.syllabus?.length ?? 0;

  const tabs = [
    { label: "Genel", icon: GraduationCap, locked: false },
    { label: "Müfredat", icon: Library, locked: false },
    {
      label: "Ders Notları",
      icon: NotebookPen,
      badge: course.noteCount > 0 ? String(course.noteCount) : null,
      locked: !isAuthenticated,
    },
  ];

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };
  const tabTransition = { duration: 0.2 };

  const SidebarContent = (
    <div className="flex flex-col gap-5 lg:sticky lg:top-8 font-sans">
      <MainCard title={t("Şubeler & Program")}>
        <div className="space-y-2 pt-2">
          {sections.map((section) => (
            <SectionRow
              key={section.groupNo}
              section={section}
              defaultOpen={sections.length === 1}
            />
          ))}

          {sections.length === 0 && (
            <div className="flex flex-col items-center gap-2 text-sm font-medium text-primary-500/70 py-8 px-4 border border-dashed border-primary-500/20 rounded-xl text-center">
              <Info
                size={18}
                strokeWidth={1.5}
                className="text-primary-500/70"
              />
              {t("Bu ders bu dönem açılmamış veya program bilgisi girilmemiş.")}
            </div>
          )}
        </div>
      </MainCard>

      <MainCard title={t("Ders Bilgileri")}>
        <div className="space-y-3 pt-2">
          {[
            { label: "T+U+L", value: course.hours },
            { label: t("AKTS"), value: course.ects ?? "-" },
            {
              label: t("Yarıyıl"),
              value: course.semester ? t("{n}. Yarıyıl", { n: course.semester }) : "-",
            },
            { label: t("Tür"), value: t(course.type) },
            { label: t("Kategori"), value: course.category ? t(course.category) : "-" },
            { label: t("Dil"), value: course.language ? course.language.split(",").map((part) => t(part.trim())).join(", ") : "-" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-primary-500/70 font-medium">
                {item.label}
              </span>
              <span className="font-medium text-primary-500 font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </MainCard>
    </div>
  );

  return (
    <PageLayout sidebar={SidebarContent}>
      <div className="bg-white rounded-xl shadow-xs border border-primary-500/10 overflow-hidden min-h-150 font-sans">
        <div className="flex items-center border-b border-primary-500/10 px-2 overflow-x-auto no-scrollbar bg-white">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap
                ${
                  activeTab === idx
                    ? "border-secondary-500 text-secondary-700"
                    : "border-transparent text-primary-500/70 hover:text-primary-500"
                }`}
            >
              {tab.icon && (
                <tab.icon
                  size={16}
                  className={
                    activeTab === idx
                      ? "text-secondary-700"
                      : "text-primary-500/70"
                  }
                />
              )}
              {t(tab.label)}
              {tab.badge && (
                <span className="bg-primary-500/5 text-primary-500/70 text-[10px] px-2 py-0.5 rounded-md font-bold ml-1 font-mono">
                  {tab.badge}
                </span>
              )}
              {tab.locked && (
                <Lock
                  size={14}
                  className={
                    activeTab === idx
                      ? "text-secondary-700"
                      : "text-primary-500/70"
                  }
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-8 min-h-full">
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="tab0"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={tabTransition}
                className="space-y-8"
              >
                <div className="group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-secondary-500 rounded-full" />
                    <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest">
                      {t("Ders Hakkında")}
                    </h3>
                  </div>
                  {course.content ? (
                    <p className="text-sm text-primary-500/70 leading-relaxed border-l-2 border-primary-500/10 pl-5 py-1">
                      {course.content}
                    </p>
                  ) : course.bolognaLink ? (
                    <a
                      href={course.bolognaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 rounded-xl border border-primary-500/10 bg-primary-500/2 hover:border-secondary-500/40 transition-colors group"
                    >
                      <div className="shrink-0 size-8 rounded-lg bg-secondary-500/10 flex items-center justify-center text-secondary-700">
                        <ExternalLink size={14} strokeWidth={2} />
                      </div>
                      <span className="text-sm text-primary-500/70 leading-relaxed">
                        {t("Bu ders Matematik Mühendisliği bölümüne ait değil. İçerik, kazanım ve değerlendirme bilgileri")}{" "}
                        <span className="font-semibold text-primary-500 group-hover:text-secondary-700 transition-colors">
                          {t("YTÜ Bologna kataloğunda")}
                        </span>{" "}
                        {t("tutuluyor.")}
                      </span>
                    </a>
                  ) : (
                    <p className="text-sm text-primary-500/70 leading-relaxed border-l-2 border-primary-500/10 pl-5 py-1">
                      {t("Bu ders için içerik açıklaması girilmemiş.")}
                    </p>
                  )}
                </div>

                {course.resources && (
                  <div className="flex flex-col gap-6">
                    {course.resources && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-secondary-500 rounded-full" />
                          <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest">
                            {t("Kaynaklar")}
                          </h3>
                        </div>
                        <ResourceList text={course.resources} />
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-secondary-500 rounded-full" />
                    <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest">
                      {t("Değerlendirme Sistemi")}
                    </h3>
                  </div>
                  <Assessment assessment={course.assessment} policy={course.gradingPolicy} />
                </div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="tab1"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={tabTransition}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <Calendar
                      size={16}
                      className="text-secondary-700"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm font-semibold text-primary-500">
                      {t("Haftalık İçerik")}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-primary-500/70">
                    {t("{count} hafta", { count: weekCount })}
                  </span>
                </div>
                <div className="mb-8 h-px w-full bg-primary-500/10" />
                <div className="flex flex-col">
                  {course.syllabus?.map((item) => (
                    <div
                      key={item.week}
                      className="flex items-start gap-4 py-3.5 border-b border-primary-500/10 last:border-0"
                    >
                      <span className="shrink-0 size-8 rounded-full flex items-center justify-center font-mono text-xs font-bold bg-secondary-500/10 border border-secondary-500/20 text-secondary-700">
                        {item.week}
                      </span>
                      <span className="pt-1.5 text-sm font-medium text-primary-500 leading-relaxed">
                        {item.topic}
                      </span>
                    </div>
                  ))}
                  {weekCount === 0 && (
                    <div className="flex flex-col items-center gap-2 text-sm font-medium text-primary-500/70 py-12 px-4 border border-dashed border-primary-500/20 rounded-xl text-center">
                      <Info
                        size={18}
                        strokeWidth={1.5}
                        className="text-primary-500/70"
                      />
                      {t("Bu ders için haftalık içerik girilmemiş.")}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="tab2"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={tabTransition}
                className="w-full"
              >
                <LectureNotes lectureId={course.id} onSignIn={onSignIn} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
