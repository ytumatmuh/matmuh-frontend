"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import Panel from "@/app/components/Panel";
import PageSection from "@/app/components/PageSection";
import Avatar from "@/app/components/Avatar";
import { fullName } from "@/lib/person";
import { PersonName, findPerson, useStaff } from "@/app/components/PersonRow";
import DocumentLink from "@/app/components/DocumentLink";
import { safeHref } from "@/lib/href";
import { useT } from "@/i18n/useT";

const TITLE_TAIL = new Set(["Üyesi"]);

function personName(text) {
  const parts = String(text ?? "").trim().split(/\s+/);
  let i = 0;
  while (i < parts.length - 1 && (parts[i].endsWith(".") || TITLE_TAIL.has(parts[i]))) i += 1;
  return parts.slice(i).join(" ");
}

function parseMembers(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, tag] = line.split("|").map((part) => part.trim());
      return { label, tag: tag || null };
    });
}

function CommissionCard({ commission, people }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const members = parseMembers(commission.members);
  const chair = commission.chair?.trim();
  const total = members.length + (chair ? 1 : 0);
  const chairPerson = findPerson(people, chair);
  const rows = chair ? [{ label: chair, tag: t("Başkan") }, ...members] : members;

  return (
    <div className="rounded-lg border border-primary-500/5 bg-primary-500/2 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-primary-500/3 transition-colors"
      >
        {chair && (
          <Avatar
            name={chairPerson ? fullName(chairPerson) : personName(chair)}
            photo={chairPerson?.photo}
            size="size-8"
            textSize="text-[10px]"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-primary-500 leading-snug">
            {commission.name}
          </span>
          <span className="block text-[11px] text-primary-500/70 wrap-break-word">
            {chair
              ? chairPerson
                ? `${t(chairPerson.academicTitle ?? "")} ${fullName(chairPerson)}`.trim()
                : personName(chair)
              : `${total} ${t("üye")}`}
          </span>
        </span>
        <span className="shrink-0 text-[10px] text-primary-500/70">{total}</span>
        <ChevronDown
          className={`shrink-0 size-4 text-primary-500/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 flex flex-col gap-2 border-t border-primary-500/5">
          {rows.map((member, idx) => {
            const person = findPerson(people, member.label);
            return (
              <div key={idx} className="flex items-center gap-2.5">
                <Avatar
                  name={person ? fullName(person) : personName(member.label)}
                  photo={person?.photo}
                  idx={idx}
                  size="size-7"
                  textSize="text-[9px]"
                />
                <span className="text-[12px] text-primary-500/70 leading-snug">
                  {person ? (
                    <PersonName person={person} className="text-primary-500" />
                  ) : (
                    personName(member.label)
                  )}
                  {member.tag && (
                    <span className="ml-1.5 text-[10px] font-medium text-secondary-700">
                      {member.tag}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CommissionList({ people }) {
  const { value } = useCmsBlock("commissions.items");
  const count = Array.isArray(value) ? value.length : 0;

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="commissions.title"
          blockType="ShortText"
          defaultValue={{ tr: "Bölüm Komisyonları", en: "Department Committees" }}
        />
      }
      count={count}
    >
      <EditableList
        blockPath="commissions.items"
        as="div"
        className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
        style={{ display: "grid" }}
        itemSchema={{
          name: { blockType: "ShortText", defaultValue: "" },
          chair: { blockType: "ShortText", defaultValue: "" },
          members: { blockType: "LongText", defaultValue: "" },
        }}
        defaultValue={{
          tr: [
            {
              name: "Bilişim ve İletişim Komisyonu",
              chair: "hgonce@yildiz.edu.tr",
              members: `artur@yildiz.edu.tr
mertbal@yildiz.edu.tr
kemalp@yildiz.edu.tr`,
            },
            {
              name: "Akademik Teşvik ve Değerlendirme Komisyonu",
              chair: "tasci@yildiz.edu.tr",
              members: `nazmiye@yildiz.edu.tr
ozkoklu@yildiz.edu.tr
ozisik@yildiz.edu.tr
guler@yildiz.edu.tr`,
            },
            {
              name: "Eğitim-Öğretim ve Akreditasyon Komisyonu",
              chair: "ibayrak@yildiz.edu.tr",
              members: `sonar@yildiz.edu.tr
Doç. Dr. Gökhan Göksu
baslan@yildiz.edu.tr | Bologna Koordinatörü`,
            },
            {
              name: "İntibak ve Önceden Kazanılmış Yeterliliklerin Tanınması Komisyonu",
              chair: "ozisik@yildiz.edu.tr",
              members: `ucan@yildiz.edu.tr
derya.sekman@yildiz.edu.tr
huozer@yildiz.edu.tr
bibrahim@yildiz.edu.tr | Önceden Kazanılmış Yet. Tanınması Sorumlusu`,
            },
            {
              name: "Bitirme Çalışması Komisyonu",
              chair: "emir@yildiz.edu.tr",
              members: "cguler@yildiz.edu.tr",
            },
            {
              name: "Stratejik Planlama Komisyonu",
              chair: "tramazan@yildiz.edu.tr",
              members: `handenur@yildiz.edu.tr
tramazan@yildiz.edu.tr | Yıllık Faaliyet Sorumlusu`,
            },
            {
              name: "Kalite Komisyonu",
              chair: "kosker@yildiz.edu.tr",
              members: `ubabuscu@yildiz.edu.tr
ionder@yildiz.edu.tr
Arş. Gör. Metehan Turan`,
            },
            {
              name: "Laboratuvar, İş Sağlığı ve Güvenliği Komisyonu",
              chair: "nazmiye@yildiz.edu.tr",
              members: "asahiner@yildiz.edu.tr",
            },
            {
              name: "Anket Hazırlama ve Değerlendirme Komisyonu",
              chair: "fakgun@yildiz.edu.tr",
              members: "mcinar@yildiz.edu.tr",
            },
            {
              name: "Sosyal Aktiviteler ve Mezunlarla İlişkiler Komisyonu",
              chair: "Prof. Dr. Ayla Şaylı",
              members: `ksimsek@yildiz.edu.tr
handenur@yildiz.edu.tr`,
            },
            {
              name: "Uluslararası İlişkiler ve Değişim Programları Komisyonu",
              chair: "guler@yildiz.edu.tr",
              members: `sgoktepe@yildiz.edu.tr
faylikci@yildiz.edu.tr
emel.ugurlu@yildiz.edu.tr
buse.guler@yildiz.edu.tr`,
            },
            {
              name: "Endüstriyel İlişkiler ve Staj Komisyonu",
              chair: "hsahin@yildiz.edu.tr",
              members: `asahiner@yildiz.edu.tr | 1. Staj
ionder@yildiz.edu.tr | 1. Staj
huozer@yildiz.edu.tr | 1. Staj
buse.guler@yildiz.edu.tr | 1. Staj
emel.ugurlu@yildiz.edu.tr | 2. Staj
kemalp@yildiz.edu.tr | 2. Staj
Arş. Gör. Metehan Turan | 2. Staj`,
            },
          ],
          en: [
            {
              name: "Information Technology and Communication Committee",
              chair: "hgonce@yildiz.edu.tr",
              members: `artur@yildiz.edu.tr
mertbal@yildiz.edu.tr
kemalp@yildiz.edu.tr`,
            },
            {
              name: "Academic Incentive and Evaluation Commission",
              chair: "tasci@yildiz.edu.tr",
              members: `nazmiye@yildiz.edu.tr
ozkoklu@yildiz.edu.tr
ozisik@yildiz.edu.tr
guler@yildiz.edu.tr`,
            },
            {
              name: "Education-Training and Accreditation Commission",
              chair: "ibayrak@yildiz.edu.tr",
              members: `sonar@yildiz.edu.tr
Assoc. Prof. Dr. Gökhan Göksu
baslan@yildiz.edu.tr | Bologna Coordinator`,
            },
            {
              name: "Adjustment and Recognition of Prior Learning Commission",
              chair: "ozisik@yildiz.edu.tr",
              members: `ucan@yildiz.edu.tr
derya.sekman@yildiz.edu.tr
huozer@yildiz.edu.tr
bibrahim@yildiz.edu.tr | Officer Responsible for Recognition of Prior Learning`,
            },
            {
              name: "Graduation Project Committee",
              chair: "emir@yildiz.edu.tr",
              members: "cguler@yildiz.edu.tr",
            },
            {
              name: "Strategic Planning Commission",
              chair: "tramazan@yildiz.edu.tr",
              members: `handenur@yildiz.edu.tr
tramazan@yildiz.edu.tr | Annual Activity Coordinator`,
            },
            {
              name: "Quality Commission",
              chair: "kosker@yildiz.edu.tr",
              members: `ubabuscu@yildiz.edu.tr
ionder@yildiz.edu.tr
Res. Asst. Metehan Turan`,
            },
            {
              name: "Laboratory, Occupational Health and Safety Commission",
              chair: "nazmiye@yildiz.edu.tr",
              members: "asahiner@yildiz.edu.tr",
            },
            {
              name: "Survey Preparation and Evaluation Commission",
              chair: "fakgun@yildiz.edu.tr",
              members: "mcinar@yildiz.edu.tr",
            },
            {
              name: "Social Activities and Alumni Relations Committee",
              chair: "Prof. Dr. Ayla Şaylı",
              members: `ksimsek@yildiz.edu.tr
handenur@yildiz.edu.tr`,
            },
            {
              name: "International Relations and Exchange Programs Commission",
              chair: "guler@yildiz.edu.tr",
              members: `sgoktepe@yildiz.edu.tr
faylikci@yildiz.edu.tr
emel.ugurlu@yildiz.edu.tr
buse.guler@yildiz.edu.tr`,
            },
            {
              name: "Industrial Relations and Internship Committee",
              chair: "hsahin@yildiz.edu.tr",
              members: `asahiner@yildiz.edu.tr | 1st Internship
ionder@yildiz.edu.tr | 1st Internship
huozer@yildiz.edu.tr | 1st Internship
buse.guler@yildiz.edu.tr | 1st Internship
emel.ugurlu@yildiz.edu.tr | 2nd Internship
kemalp@yildiz.edu.tr | 2nd Internship
Res. Asst. Metehan Turan | 2nd Internship`,
            },
          ],
        }}
      >
        {(item, index) => <CommissionCard people={people} key={index} commission={item} />}
      </EditableList>
    </PageSection>
  );
}

function CommissionDocuments() {
  return (
    <EditableList
      blockPath="documents.items"
      as="div"
      className="flex flex-col gap-2"
      style={{ display: "flex" }}
      itemSchema={{
        file: { blockType: "Link", defaultValue: { href: "", label: "" } },
        kind: { blockType: "ShortText", defaultValue: "pdf" },
        size: { blockType: "ShortText", defaultValue: "" },
      }}
      defaultValue={{
        tr: [
          {
            file: {
              href: "https://mtm.yildiz.edu.tr/media/files/B%C3%96L%C3%9CM%20KOM%C4%B0SYONLARI%2019_11_2025(1).pdf",
              label: "Bölüm Komisyonları (19.11.2025)",
            },
            kind: "pdf",
            size: "76892",
          },
        ],
        en: [
          {
            file: {
              href: "https://mtm.yildiz.edu.tr/media/files/B%C3%96L%C3%9CM%20KOM%C4%B0SYONLARI%2019_11_2025(1).pdf",
              label: "Department Committees (19.11.2025)",
            },
            kind: "pdf",
            size: "76892",
          },
        ],
      }}
    >
      {(item, index) => (
        <DocumentLink
          key={index}
          label={item.file?.label}
          href={safeHref(item.file?.href)}
          kind={item.kind}
          size={Number(item.size) || 0}
        />
      )}
    </EditableList>
  );
}

export default function CommissionsPage({ initialStaff = [] }) {
  const { people } = useStaff(initialStaff);
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Komisyonlar", en: "Commissions" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Bölüm komisyonları ve üyeleri · 19.11.2025",
              en: "Department commissions and members · 19.11.2025",
            }}
          />
        }
      />
      <PageLayout>
        <div className="flex flex-col gap-8">
          <CommissionList people={people} />

          <PageSection
            title={
              <EditableRegion
                blockPath="documents.title"
                blockType="ShortText"
                defaultValue={{ tr: "Belgeler", en: "Documents" }}
              />
            }
          >
            <Panel>
              <CommissionDocuments />
            </Panel>
          </PageSection>
        </div>
      </PageLayout>
    </>
  );
}
