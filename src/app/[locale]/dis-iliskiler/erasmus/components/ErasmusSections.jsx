"use client";

import NewTabHint from "@/app/components/NewTabHint";
import { Briefcase, ExternalLink, FileDown, Globe, Mail } from "lucide-react";
import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import MainCard from "@/app/components/MainCard";
import Panel from "@/app/components/Panel";
import PageSection from "@/app/components/PageSection";
import DocumentLink from "@/app/components/DocumentLink";
import Avatar from "@/app/components/Avatar";
import { PersonName, findPerson, fullName, useStaff } from "@/app/components/PersonRow";
import { contactLine } from "@/lib/person";
import { safeHref, isExternalHref } from "@/lib/href";
import { useT } from "@/i18n/useT";

const COLUMNS = "sm:grid-cols-[1fr_8rem_9rem_2rem]";

function lines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function CoordinatorRow({ person, idx }) {
  const t = useT();
  const name = fullName(person);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary-500/2 border border-primary-500/5">
      <Avatar name={name} photo={person.photo} idx={idx} />
      <span className="min-w-0 flex-1">
        <PersonName
          person={person}
          className="block text-[13px] font-medium text-primary-500 leading-snug wrap-break-word"
        />
        {contactLine(person, t, { withRole: false }) && (
          <span className="block text-[11px] text-primary-500/70 wrap-break-word">
            {contactLine(person, t, { withRole: false })}
          </span>
        )}
      </span>
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          aria-label={t("{name} kişisine e-posta gönder", { name })}
          className="shrink-0 flex items-center justify-center size-7 rounded-lg text-primary-500/70 hover:bg-secondary-500/10 hover:text-secondary-700 transition-colors"
        >
          <Mail className="size-3.5" />
        </a>
      )}
    </div>
  );
}

export function Coordinators({ initialStaff = [] }) {
  const { people } = useStaff(initialStaff);

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="coordinators.title"
          blockType="ShortText"
          defaultValue={{ tr: "Bölüm Koordinatörleri", en: "Department Coordinators" }}
        />
      }
    >
      <Panel>
        <EditableList
          blockPath="coordinators.items"
          as="div"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          style={{ display: "grid" }}
          itemSchema={{
            role: { blockType: "ShortText", defaultValue: "" },
            members: { blockType: "LongText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                role: "Gidiş İşlemleri",
                members: `guler@yildiz.edu.tr
sgoktepe@yildiz.edu.tr`,
              },
              {
                role: "Dönüş İşlemleri",
                members: "faylikci@yildiz.edu.tr",
              },
            ],
            en: [
              {
                role: "Departure Procedures",
                members: `guler@yildiz.edu.tr
sgoktepe@yildiz.edu.tr`,
              },
              {
                role: "Return Procedures",
                members: "faylikci@yildiz.edu.tr",
              },
            ],
          }}
        >
          {(item, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
                {item.role}
              </span>
              <div className="flex flex-col gap-1.5">
                {lines(item.members).map((entry, idx) => {
                  const person = findPerson(people, entry);
                  return person ? (
                    <CoordinatorRow key={entry} person={person} idx={idx} />
                  ) : (
                    <span
                      key={entry}
                      className="p-2.5 text-[13px] text-primary-500 leading-snug wrap-break-word"
                    >
                      {entry}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </EditableList>
      </Panel>
    </PageSection>
  );
}

function AgreementRow({ item }) {
  const t = useT();
  const href = safeHref(item.file?.href);

  return (
    <div
      className={`grid grid-cols-1 ${COLUMNS} sm:items-center gap-x-5 px-4 sm:px-5 py-2.5 ${
        href ? "group hover:bg-secondary-500/4 transition-colors" : ""
      }`}
    >
      <div className="text-[13px] text-primary-500 wrap-break-word">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group-hover:text-secondary-700 hover:underline"
          >
            {item.institution}
            <NewTabHint />
          </a>
        ) : (
          item.institution
        )}
        <span className="sm:hidden block mt-0.5 text-[11px] text-primary-500/70">
          {item.country} · <span className="font-mono">{item.code}</span>
        </span>
      </div>
      <div className="hidden sm:block text-[12px] text-primary-500/70 whitespace-nowrap">
        {item.country}
      </div>
      <div className="hidden sm:block text-[11px] font-mono text-primary-500/70 whitespace-nowrap">
        {item.code}
      </div>
      <div className="hidden sm:block">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("Anlaşmayı yeni sekmede indir")}
          >
            <FileDown className="size-3.5 text-primary-500/70 group-hover:text-secondary-700 transition-colors" />
          </a>
        )}
      </div>
    </div>
  );
}

export function Agreements() {
  const t = useT();
  const { value } = useCmsBlock("agreements.items");
  const items = Array.isArray(value) ? value : [];

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="agreements.title"
          blockType="ShortText"
          defaultValue={{ tr: "İkili Anlaşmalar", en: "Bilateral Agreements" }}
        />
      }
      count={items.length}
      action={
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-secondary-700 px-2 py-1 rounded-sm bg-secondary-500/10">
          <EditableRegion
            blockPath="agreements.period"
            blockType="ShortText"
            defaultValue="2022-2023 - 2027-2028"
          />
        </span>
      }
    >
      <Panel padding="p-0" className="overflow-hidden">
        <div
          className={`hidden sm:grid ${COLUMNS} gap-x-5 px-5 py-3 border-b border-primary-500/8 text-[10px] font-semibold uppercase tracking-widest text-primary-500/70`}
        >
          <div>{t("Kurum")}</div>
          <div>{t("Ülke")}</div>
          <div className="whitespace-nowrap">{t("Erasmus Kodu")}</div>
          <div />
        </div>

        <EditableList
          blockPath="agreements.items"
          as="div"
          className="flex flex-col divide-y divide-primary-500/5"
          style={{ display: "flex" }}
          itemSchema={{
            institution: { blockType: "ShortText", defaultValue: "" },
            country: { blockType: "ShortText", defaultValue: "" },
            code: { blockType: "ShortText", defaultValue: "" },
            file: { blockType: "Link", defaultValue: { href: "", label: "" } },
          }}
          defaultValue={{
            tr: [
              {
                institution: "Universidad de León",
                country: "İspanya",
                code: "E LEON01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/E%20LEON01_613_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "E LEON01",
                },
              },
              {
                institution: "Sorbonne Université",
                country: "Fransa",
                code: "F PARIS 468",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/F%20PARIS468_541_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "F PARIS 468",
                },
              },
              {
                institution: "Université du Littoral Côte d’Opale",
                country: "Fransa",
                code: "F DUNKERQ09",
                file: {
                  href: "",
                  label: "",
                },
              },
              {
                institution: "Goce Delcev University",
                country: "Makedonya",
                code: "MK STIP01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/MK%20STIP01_541%20ve%20613_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "MK STIP01",
                },
              },
              {
                institution: "Università degli Studi di Bari Aldo Moro",
                country: "İtalya",
                code: "I BARI 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/I%20BARI01_MATEMAT%C4%B0K%20M%C3%9CHEND%C4%B0SL%C4%B0%C4%9E%C4%B0.pdf",
                  label: "I BARI 01",
                },
              },
              {
                institution: "Università degli Studi di Firenze",
                country: "İtalya",
                code: "I FIRENZE01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/I%20FIRENZE01%20MAT%20MUH.pdf",
                  label: "I FIRENZE01",
                },
              },
              {
                institution: "Technical University of Civil Engineering",
                country: "Romanya",
                code: "RO BUCURES08",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/RO%20BUCURES08_541_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "RO BUCURES08",
                },
              },
              {
                institution: "Brno University of Technology",
                country: "Çekya",
                code: "CZ BRNO01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/CZ%20BRNO01%20MAT%20MUH.pdf",
                  label: "CZ BRNO01",
                },
              },
              {
                institution: "Technological University of the Shannon",
                country: "İrlanda",
                code: "IRLSHANNON02",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/IRLSHANNON02_613_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "IRLSHANNON02",
                },
              },
              {
                institution: "University of Piraeus",
                country: "Yunanistan",
                code: "G PIREAS 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/G%20PIREAS01_610_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "G PIREAS 01",
                },
              },
              {
                institution: "Halmstad University",
                country: "İsveç",
                code: "S HALMSTA 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/S%20HALMSTA01%20Mat%20M%C3%BCh.pdf",
                  label: "S HALMSTA 01",
                },
              },
              {
                institution: "Martin Luther University Halle-Wittenberg",
                country: "Almanya",
                code: "D HALLE 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/D%20HALLE01_610_MAT%20M%C3%9CH.pdf",
                  label: "D HALLE 01",
                },
              },
              {
                institution: "Polytechnic Institute of Coimbra",
                country: "Portekiz",
                code: "P COIMBRA02",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/MAT_%20MUH_%20P%20COIMBRA02.pdf",
                  label: "P COIMBRA02",
                },
              },
              {
                institution: "University of Łódź",
                country: "Polonya",
                code: "PL LODZ01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/PL%20LODZ01%20mat%20m%C3%BCh.pdf",
                  label: "PL LODZ01",
                },
              },
              {
                institution: "Universidade Fernando Pessoa",
                country: "Portekiz",
                code: "P PORTO 26",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/P%20PORTO26_610_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "P PORTO 26",
                },
              },
            ],
            en: [
              {
                institution: "Universidad de León",
                country: "Spain",
                code: "E LEON01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/E%20LEON01_613_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "E LEON01",
                },
              },
              {
                institution: "Sorbonne Université",
                country: "France",
                code: "F PARIS 468",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/F%20PARIS468_541_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "F PARIS 468",
                },
              },
              {
                institution: "Université du Littoral Côte d’Opale",
                country: "France",
                code: "F DUNKERQ09",
                file: {
                  href: "",
                  label: "",
                },
              },
              {
                institution: "Goce Delcev University",
                country: "Macedonia",
                code: "MK STIP01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/MK%20STIP01_541%20ve%20613_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "MK STIP01",
                },
              },
              {
                institution: "Università degli Studi di Bari Aldo Moro",
                country: "Italy",
                code: "I BARI 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/I%20BARI01_MATEMAT%C4%B0K%20M%C3%9CHEND%C4%B0SL%C4%B0%C4%9E%C4%B0.pdf",
                  label: "I BARI 01",
                },
              },
              {
                institution: "Università degli Studi di Firenze",
                country: "Italy",
                code: "I FIRENZE01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/I%20FIRENZE01%20MAT%20MUH.pdf",
                  label: "I FIRENZE01",
                },
              },
              {
                institution: "Technical University of Civil Engineering",
                country: "Romania",
                code: "RO BUCURES08",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/RO%20BUCURES08_541_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "RO BUCURES08",
                },
              },
              {
                institution: "Brno University of Technology",
                country: "Czechia",
                code: "CZ BRNO01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/CZ%20BRNO01%20MAT%20MUH.pdf",
                  label: "CZ BRNO01",
                },
              },
              {
                institution: "Technological University of the Shannon",
                country: "Ireland",
                code: "IRLSHANNON02",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/IRLSHANNON02_613_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "IRLSHANNON02",
                },
              },
              {
                institution: "University of Piraeus",
                country: "Greece",
                code: "G PIREAS 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/G%20PIREAS01_610_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "G PIREAS 01",
                },
              },
              {
                institution: "Halmstad University",
                country: "Sweden",
                code: "S HALMSTA 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/S%20HALMSTA01%20Mat%20M%C3%BCh.pdf",
                  label: "S HALMSTA 01",
                },
              },
              {
                institution: "Martin Luther University Halle-Wittenberg",
                country: "Germany",
                code: "D HALLE 01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/D%20HALLE01_610_MAT%20M%C3%9CH.pdf",
                  label: "D HALLE 01",
                },
              },
              {
                institution: "Polytechnic Institute of Coimbra",
                country: "Portugal",
                code: "P COIMBRA02",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/MAT_%20MUH_%20P%20COIMBRA02.pdf",
                  label: "P COIMBRA02",
                },
              },
              {
                institution: "University of Łódź",
                country: "Poland",
                code: "PL LODZ01",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/PL%20LODZ01%20mat%20m%C3%BCh.pdf",
                  label: "PL LODZ01",
                },
              },
              {
                institution: "Universidade Fernando Pessoa",
                country: "Portugal",
                code: "P PORTO 26",
                file: {
                  href: "https://erasmus.yildiz.edu.tr/media/files/P%20PORTO26_610_MATEMAT%C4%B0K%20M%C3%9CH.pdf",
                  label: "P PORTO 26",
                },
              },
            ],
          }}
        >
          {(item, index) => <AgreementRow key={index} item={item} />}
        </EditableList>
      </Panel>

      <EditableRegion
        blockPath="agreements.note"
        blockType="LongText"
        defaultValue={{
          tr: "Kontenjanlar, dil koşulları ve başvuru tarihleri anlaşma dosyasında yer alır. Güncel duyurular için YTÜ Erasmus+ Koordinatörlüğü sayfası takip edilmelidir.",
          en: "Quotas, language requirements, and application dates are specified in the agreement file. For current announcements, the YTU Erasmus+ Coordinatorship page should be followed.",
        }}
        as="p"
        className="text-[12px] text-primary-500/70 leading-relaxed"
      />

      <EditableList
        blockPath="agreements.documents"
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
                href: "https://mtm.yildiz.edu.tr/media/files/Eramus+%C4%B0kili%20Anla%C5%9Fmalar%20Matematik+M%C3%BChendisli%C4%9Fi(1).xlsx",
                label: "Erasmus+ İkili Anlaşmalar - Matematik Mühendisliği",
              },
              kind: "xlsx",
              size: "19921",
            },
          ],
          en: [
            {
              file: {
                href: "https://mtm.yildiz.edu.tr/media/files/Eramus+%C4%B0kili%20Anla%C5%9Fmalar%20Matematik+M%C3%BChendisli%C4%9Fi(1).xlsx",
                label: "Erasmus+ Bilateral Agreements - Mathematical Engineering",
              },
              kind: "xlsx",
              size: "19921",
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
    </PageSection>
  );
}

export function ErasmusInternship() {
  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="internship.title"
          blockType="ShortText"
          defaultValue={{ tr: "Erasmus+ ile Staj", en: "Internship with Erasmus+" }}
        />
      }
    >
      <Panel>
        <div className="flex gap-3">
          <Briefcase className="size-4 shrink-0 mt-0.5 text-secondary-700" />
          <EditableRegion
            blockPath="internship.body"
            blockType="LongText"
            defaultValue={{
              tr: "Erasmus+ programı kapsamında yurt dışında staj yapılabilir. Bölüm Staj Komisyonunun uygun görüşü, bölüm başkanlığının önerisi ve Fakülte Yönetim Kurulu kararı gerekir; bu kapsamda en az 60 iş günü staj yapılması esastır.",
              en: "Internships can be carried out abroad within the scope of the Erasmus+ program. A favorable opinion from the Department Internship Committee, a proposal by the department chair, and a decision of the Faculty Executive Board are required; within this scope, it is essential to complete an internship of at least 60 working days.",
            }}
            as="p"
            className="text-[13px] text-primary-500/70 leading-relaxed"
          />
        </div>
      </Panel>
    </PageSection>
  );
}

export function ErasmusSidebarCards() {
  return (
    <>
      <MainCard
        title={
          <EditableRegion
            blockPath="contact.title"
            blockType="ShortText"
            defaultValue={{ tr: "İletişim", en: "Contact" }}
          />
        }
      >
        <div className="flex items-center gap-2 text-[13px]">
          <Mail className="size-4 shrink-0 text-secondary-700" />
          <EditableRegion
            blockPath="contact.email"
            blockType="Link"
            defaultValue={{
              href: "mailto:mtmerasmus@yildiz.edu.tr",
              label: "mtmerasmus@yildiz.edu.tr",
            }}
            className="min-w-0 break-all text-primary-500 hover:text-secondary-700 transition-colors"
          />
        </div>
      </MainCard>

      <MainCard
        title={
          <EditableRegion
            blockPath="links.title"
            blockType="ShortText"
            defaultValue={{ tr: "Bağlantılar", en: "Links" }}
          />
        }
      >
        <EditableList
          blockPath="links.items"
          as="nav"
          className="flex flex-col gap-0.5"
          style={{ display: "flex" }}
          itemSchema={{
            link: { blockType: "Link", defaultValue: { href: "", label: "" } },
          }}
          defaultValue={{
            tr: [
              {
                link: {
                  href: "https://erasmus.yildiz.edu.tr/",
                  label: "YTÜ Erasmus+ Koordinatörlüğü",
                },
              },
              {
                link: {
                  href: "https://erasmus.yildiz.edu.tr/sayfa/24/4",
                  label: "Erasmus+ Anlaşmaları",
                },
              },
              {
                link: {
                  href: "https://erasmus.yildiz.edu.tr/sayfa/21/1",
                  label: "Giden Öğrenci İşlemleri",
                },
              },
            ],
            en: [
              {
                link: {
                  href: "https://erasmus.yildiz.edu.tr/",
                  label: "YTU Erasmus+ Coordinatorship",
                },
              },
              {
                link: {
                  href: "https://erasmus.yildiz.edu.tr/sayfa/24/4",
                  label: "Erasmus+ Agreements",
                },
              },
              {
                link: {
                  href: "https://erasmus.yildiz.edu.tr/sayfa/21/1",
                  label: "Outgoing Student Procedures",
                },
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
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-primary-500 hover:bg-gray-50 transition-colors"
              >
                <Globe className="size-4 shrink-0 text-primary-500/70" />
                <span className="flex-1">{item.link?.label}</span>
                <ExternalLink className="size-3 shrink-0 text-primary-500/70 group-hover:text-secondary-700 transition-colors" />
              </a>
            );
          }}
        </EditableList>
      </MainCard>
    </>
  );
}
