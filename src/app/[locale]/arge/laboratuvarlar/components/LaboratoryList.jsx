"use client";

import { Monitor, Users } from "lucide-react";
import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import PageSection from "@/app/components/PageSection";
import { useT } from "@/i18n/useT";

function softwareList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function LaboratoryCard({ lab }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-primary-500/10 shadow-xs bg-white">
      <div className="flex items-center gap-2">
        <Monitor className="size-4 text-secondary-700" />
        <span className="text-[14px] font-semibold text-primary-500">{lab.name}</span>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-primary-500/70">
        <Users className="size-3.5 text-primary-500/70" />
        {lab.capacity} {t("kapasiteli")}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-500/70">
          {t("Kurulu Yazılımlar")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {softwareList(lab.software).map((item) => (
            <span
              key={item}
              className="px-2 py-1 rounded-sm bg-secondary-500/10 text-[11px] font-medium text-secondary-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LaboratoryList() {
  const { value } = useCmsBlock("labs.items");
  const count = Array.isArray(value) ? value.length : 0;

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="labs.title"
          blockType="ShortText"
          defaultValue={{ tr: "Laboratuvarlar", en: "Laboratories" }}
        />
      }
      count={count}
    >
      <EditableList
        blockPath="labs.items"
        as="div"
        className="flex flex-col gap-3"
        style={{ display: "flex" }}
        itemSchema={{
          name: { blockType: "ShortText", defaultValue: "" },
          capacity: { blockType: "ShortText", defaultValue: "" },
          software: { blockType: "ShortText", defaultValue: "" },
        }}
        defaultValue={{
          tr: [
            {
              name: "Bilgisayar Laboratuvarı",
              capacity: "40 öğrenci",
              software: "MATLAB, MAPLE, C++",
            },
          ],
          en: [
            {
              name: "Computer Laboratory",
              capacity: "40 students",
              software: "MATLAB, MAPLE, C++",
            },
          ],
        }}
      >
        {(item, index) => <LaboratoryCard key={index} lab={item} />}
      </EditableList>
    </PageSection>
  );
}
