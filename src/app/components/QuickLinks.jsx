"use client";

import NewTabHint from "@/app/components/NewTabHint";
import { createElement } from "react";
import Link from "@/app/components/LocaleLink";
import {
  ExternalLink,
  Monitor,
  BookOpen,
  CalendarDays,
  Briefcase,
  Calendar,
  Scale,
  KeyRound,
  File,
} from "lucide-react";
import { EditableList, useCmsBlock } from "inscribed";

import MainCard from "./MainCard";
import { useT } from "@/i18n/useT";
import { safeHref, isExternalHref } from "@/lib/href";

const ICONS = {
  monitor: Monitor,
  calendar: Calendar,
  "book-open": BookOpen,
  "calendar-days": CalendarDays,
  briefcase: Briefcase,
  file: File,
  scale: Scale,
  "key-round": KeyRound,
};

function icon(key, className) {
  return createElement(ICONS[key] ?? ExternalLink, { className });
}

function QuickLinkTile({ item }) {
  const href = safeHref(item?.link?.href);
  const external = isExternalHref(href);
  const className =
    "relative flex flex-col items-center gap-1.5 w-16 shrink-0 group";
  const content = (
    <>
      <div className="w-9 h-9 rounded-lg bg-secondary-500/8 hover:bg-secondary-600/10 flex items-center justify-center">
        {icon(
          item?.icon,
          "w-4 h-4 text-secondary-700 group-hover:text-secondary-700",
        )}
      </div>
      <span className="text-[10px] text-primary-500/70 text-center group-hover:text-primary-500 leading-tight">
        {item?.shortLabel}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
        <NewTabHint />
      </a>
    );
  }

  return (
    <Link href={href || "#"} className={className}>
      {content}
    </Link>
  );
}

function QuickLinkRow({ item }) {
  const href = safeHref(item?.link?.href);
  const external = isExternalHref(href);
  const className =
    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-primary-500 hover:bg-gray-50 transition-colors";
  const content = (
    <>
      {icon(item?.icon, "w-4 h-4 text-primary-500/70 shrink-0")}
      <span className="flex-1">{item?.link?.label}</span>
      {external && (
        <ExternalLink className="w-3 h-3 text-primary-500/70 shrink-0" />
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
        <NewTabHint />
      </a>
    );
  }

  return (
    <Link href={href || "#"} className={className}>
      {content}
    </Link>
  );
}

function MobileStrip({ items }) {
  return (
    <div className="lg:hidden bg-white rounded-xl shadow-sm p-3">
      <div className="flex overflow-x-auto no-scrollbar pb-1">
        <div className="flex gap-1 mx-auto">
          {items.map((item, index) => (
            <QuickLinkTile key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickLinksFull({ title }) {
  const t = useT();
  const { value } = useCmsBlock("quicklinks.items");
  const items = Array.isArray(value) ? value : [];

  return (
    <>
      <MobileStrip items={items} />

      <div className="hidden lg:block">
        <MainCard title={t(title)}>
          <EditableList
            blockPath="quicklinks.items"
            scope="global"
            as="nav"
            className="space-y-1"
            itemSchema={{
              link: {
                blockType: "Link",
                defaultValue: { href: "", label: "" },
              },
              shortLabel: { blockType: "ShortText", defaultValue: "" },
              icon: { blockType: "ShortText", defaultValue: "" },
            }}
            defaultValue={{
              tr: [
                {
                  link: {
                    href: "https://obs.yildiz.edu.tr/oibs/std/login.aspx",
                    label: "Öğrenci Bilgi Sistemi (OBS)",
                  },
                  shortLabel: "OBS",
                  icon: "monitor",
                },
                {
                  link: {
                    href: "https://ogi.yildiz.edu.tr/akademik-takvim",
                    label: "Akademik Takvim",
                  },
                  shortLabel: "Takvim",
                  icon: "calendar",
                },
                {
                  link: {
                    href: "/egitim/mufredat",
                    label: "Müfredat",
                  },
                  shortLabel: "Müfredat",
                  icon: "book-open",
                },
                {
                  link: {
                    href: "/egitim/ders-programi",
                    label: "Ders Programı",
                  },
                  shortLabel: "Program",
                  icon: "calendar-days",
                },
                {
                  link: {
                    href: "/egitim/staj",
                    label: "Staj İşlemleri",
                  },
                  shortLabel: "Staj",
                  icon: "briefcase",
                },
                {
                  link: {
                    href: "/egitim/formlar",
                    label: "Formlar / Belgeler",
                  },
                  shortLabel: "Formlar",
                  icon: "file",
                },
                {
                  link: {
                    href: "https://ogi.yildiz.edu.tr/iletisim/hizli-erisim/yonetmelik-ve-yonergeler",
                    label: "Yönetmelik ve Yönergeler",
                  },
                  shortLabel: "Mevzuat",
                  icon: "scale",
                },
                {
                  link: {
                    href: "https://teknikdestek.yildiz.edu.tr/kb/index.php",
                    label: "OBS Şifresi ve Öğrenci E-postası",
                  },
                  shortLabel: "OBS Şifre",
                  icon: "key-round",
                },
              ],
              en: [
                {
                  link: {
                    href: "https://obs.yildiz.edu.tr/oibs/std/login.aspx",
                    label: "Student Information System (OBS)",
                  },
                  shortLabel: "OBS",
                  icon: "monitor",
                },
                {
                  link: {
                    href: "https://ogi.yildiz.edu.tr/akademik-takvim",
                    label: "Academic Calendar",
                  },
                  shortLabel: "Calendar",
                  icon: "calendar",
                },
                {
                  link: {
                    href: "/egitim/mufredat",
                    label: "Curriculum",
                  },
                  shortLabel: "Curriculum",
                  icon: "book-open",
                },
                {
                  link: {
                    href: "/egitim/ders-programi",
                    label: "Course Schedule",
                  },
                  shortLabel: "Program",
                  icon: "calendar-days",
                },
                {
                  link: {
                    href: "/egitim/staj",
                    label: "Internship Procedures",
                  },
                  shortLabel: "Internship",
                  icon: "briefcase",
                },
                {
                  link: {
                    href: "/egitim/formlar",
                    label: "Forms / Documents",
                  },
                  shortLabel: "Forms",
                  icon: "file",
                },
                {
                  link: {
                    href: "https://ogi.yildiz.edu.tr/iletisim/hizli-erisim/yonetmelik-ve-yonergeler",
                    label: "Regulations and Directives",
                  },
                  shortLabel: "Regulations",
                  icon: "scale",
                },
                {
                  link: {
                    href: "https://teknikdestek.yildiz.edu.tr/kb/index.php",
                    label: "OBS Password and Student E-mail",
                  },
                  shortLabel: "OBS Password",
                  icon: "key-round",
                },
              ],
            }}
          >
            {(item, index) => <QuickLinkRow key={index} item={item} />}
          </EditableList>
        </MainCard>
      </div>
    </>
  );
}

function QuickLinksExternal({ title }) {
  const t = useT();
  const { value } = useCmsBlock("quicklinks.items");
  const items = (Array.isArray(value) ? value : []).filter((item) =>
    isExternalHref(item?.link?.href),
  );

  return (
    <>
      <MobileStrip items={items} />

      <div className="hidden lg:block">
        <MainCard title={t(title)}>
          <nav aria-label={t(title)} className="space-y-1">
            {items.map((item, index) => (
              <QuickLinkRow key={index} item={item} />
            ))}
          </nav>
        </MainCard>
      </div>
    </>
  );
}

export default function QuickLinks({
  external = false,
  title = "Hızlı Erişim",
}) {
  return external ? (
    <QuickLinksExternal title={title} />
  ) : (
    <QuickLinksFull title={title} />
  );
}
