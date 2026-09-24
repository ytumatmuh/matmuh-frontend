"use client";

import { ExternalLink } from "lucide-react";
import { EditableList } from "inscribed";

import { safeHref, isExternalHref } from "@/lib/href";

export default function ResearchLinks() {
  return (
    <EditableList
      blockPath="resources.items"
      as="div"
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
      style={{ display: "grid" }}
      itemSchema={{
        link: { blockType: "Link", defaultValue: { href: "", label: "" } },
        description: { blockType: "ShortText", defaultValue: "" },
      }}
      defaultValue={{
        tr: [
          {
            link: {
              href: "https://bap.yildiz.edu.tr/",
              label: "YTÜ Bilimsel Araştırma Projeleri Koordinatörlüğü",
            },
            description: "Proje başvuru ve destek süreçleri",
          },
          {
            link: {
              href: "https://avesis.yildiz.edu.tr/",
              label: "AVESİS - Akademik Veri Yönetim Sistemi",
            },
            description: "Öğretim üyelerinin güncel projeleri ve yayınları",
          },
        ],
        en: [
          {
            link: {
              href: "https://bap.yildiz.edu.tr/",
              label: "YTU Scientific Research Projects Coordinatorship",
            },
            description: "Project application and support processes",
          },
          {
            link: {
              href: "https://avesis.yildiz.edu.tr/",
              label: "AVESİS - Academic Data Management System",
            },
            description: "Current projects and publications of faculty members",
          },
        ],
      }}
    >
      {(item, index) => {
        const href = safeHref(item.link?.href);
        const external = isExternalHref(href);
        return (
          <a
            key={index}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex items-center gap-3 p-5 rounded-xl border border-primary-500/10 shadow-xs bg-white hover:border-secondary-500/30 hover:-translate-y-0.5 transition-all"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-primary-500">
                {item.link?.label}
              </span>
              <span className="block text-[11px] text-primary-500/70 mt-0.5">
                {item.description}
              </span>
            </span>
            <ExternalLink className="size-3.5 shrink-0 text-primary-500/70 group-hover:text-secondary-700 transition-colors" />
          </a>
        );
      }}
    </EditableList>
  );
}
