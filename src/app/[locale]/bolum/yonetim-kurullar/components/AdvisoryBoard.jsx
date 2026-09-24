"use client";

import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import PageSection from "@/app/components/PageSection";
import Panel from "@/app/components/Panel";
import Avatar from "@/app/components/Avatar";
import { useT } from "@/i18n/useT";

function BoardMemberRow({ member, idx }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary-500/2 border border-primary-500/5">
      <Avatar name={member.name} idx={idx} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-primary-500 leading-snug wrap-break-word">
          {member.rank && `${member.rank} `}
          {member.name}
        </span>
        <span className="block text-[11px] text-primary-500/70 wrap-break-word">
          {member.role}
        </span>
      </span>
    </div>
  );
}

export default function AdvisoryBoard() {
  const t = useT();
  const { value } = useCmsBlock("board.members");
  const count = Array.isArray(value) ? value.length : 0;

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="board.title"
          blockType="ShortText"
          defaultValue={{ tr: "Danışma Kurulu", en: "Advisory Board" }}
        />
      }
      count={count}
      action={
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-secondary-700 px-2 py-1 rounded-sm bg-secondary-500/10">
          <EditableRegion
            blockPath="board.year"
            blockType="ShortText"
            defaultValue="2025"
          />{" "}
          {t("Güncel")}
        </span>
      }
    >
      <Panel>
        <EditableList
          blockPath="board.members"
          as="div"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
          style={{ display: "grid" }}
          itemSchema={{
            name: { blockType: "ShortText", defaultValue: "" },
            rank: { blockType: "ShortText", defaultValue: "" },
            role: { blockType: "ShortText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                name: "Fatih TAŞÇI",
                rank: "Prof. Dr.",
                role: "Bölüm Başkanı",
              },
              {
                name: "Aysun GÜRAN",
                rank: "Doç. Dr.",
                role: "Öğretim Üyesi",
              },
              {
                name: "Tansu ALTANLAR",
                rank: "",
                role: "Jr Product Manager",
              },
              {
                name: "Zahid GÜRBÜZ",
                rank: "Dr.",
                role: "Assistant Professor",
              },
              {
                name: "Oguzhan KIVRAK",
                rank: "Dr. Öğr. Üyesi",
                role: "Product Manager",
              },
              {
                name: "Gürkan YERLİKAYAOĞLU",
                rank: "",
                role: "Senior Engineering Manager",
              },
              {
                name: "Serkan GESOĞLU",
                rank: "",
                role: "Business Analyst Architect",
              },
              {
                name: "Mihriban KARAKOÇ",
                rank: "",
                role: "Scrum Master",
              },
            ],
            en: [
              {
                name: "Fatih TAŞÇI",
                rank: "Prof. Dr.",
                role: "Department Head",
              },
              {
                name: "Aysun GÜRAN",
                rank: "Assoc. Prof. Dr.",
                role: "Faculty Member",
              },
              {
                name: "Tansu ALTANLAR",
                rank: "",
                role: "Jr Product Manager",
              },
              {
                name: "Zahid GÜRBÜZ",
                rank: "Dr.",
                role: "Assistant Professor",
              },
              {
                name: "Oguzhan KIVRAK",
                rank: "Asst. Prof. Dr.",
                role: "Product Manager",
              },
              {
                name: "Gürkan YERLİKAYAOĞLU",
                rank: "",
                role: "Senior Engineering Manager",
              },
              {
                name: "Serkan GESOĞLU",
                rank: "",
                role: "Business Analyst Architect",
              },
              {
                name: "Mihriban KARAKOÇ",
                rank: "",
                role: "Scrum Master",
              },
            ],
          }}
        >
          {(item, index) => <BoardMemberRow key={index} member={item} idx={index} />}
        </EditableList>
      </Panel>
    </PageSection>
  );
}
