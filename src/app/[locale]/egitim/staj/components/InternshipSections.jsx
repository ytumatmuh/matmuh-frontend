"use client";

import { Fragment } from "react";
import Link from "@/app/components/LocaleLink";
import { ArrowUpRight, Mail } from "lucide-react";
import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import { useIsEditor } from "@/app/lib/cms-provider.jsx";

import MainCard from "@/app/components/MainCard";
import Panel from "@/app/components/Panel";
import PageSection from "@/app/components/PageSection";
import StatStrip from "@/app/components/StatStrip";
import DocumentLink from "@/app/components/DocumentLink";
import Avatar from "@/app/components/Avatar";
import { PersonName, findPerson, fullName, useStaff } from "@/app/components/PersonRow";
import { contactLine } from "@/lib/person";
import { safeHref } from "@/lib/href";
import { useT } from "@/i18n/useT";

function lines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function Bullets({ items }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary-500" />
          <span className="text-[13px] text-primary-500/70 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StaffCard({ person, idx }) {
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
        {contactLine(person, t) && (
          <span className="block text-[11px] text-primary-500/70 wrap-break-word">
            {contactLine(person, t)}
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

export function MandatoryInternships() {
  const t = useT();
  const { value } = useCmsBlock("mandatory.items");
  const items = Array.isArray(value) ? value : [];
  const perType = Number(items[0]?.days) || 0;
  const total = items.reduce((sum, item) => sum + (Number(item.days) || 0), 0);

  return (
    <>
      <StatStrip
        items={[
          { value: items.length, label: t("Zorunlu staj"), hint: t("1. ve 2. staj") },
          { value: perType, label: t("Tür başına"), hint: t("iş günü") },
          { value: total, label: t("Toplam"), hint: t("iş günü") },
        ]}
      />

      <PageSection
        title={
          <EditableRegion
            blockPath="mandatory.title"
            blockType="ShortText"
            defaultValue={{ tr: "Zorunlu Stajlar", en: "Compulsory Internships" }}
          />
        }
      >
        <Panel>
          <div className="announcement-body text-[13px] text-primary-500/70 leading-relaxed">
            <EditableRegion
              blockPath="mandatory.intro"
              blockType="RichText"
              defaultValue={{
                tr: "<p>Öğrenciler her bir staj türünde 20 iş günü olmak üzere toplamda <strong>40 iş günü</strong> zorunlu staj yapmadan mezun olamaz. İki türün günleri birleştirilemez.</p>",
                en: "<p>Students cannot graduate without completing a total of <strong>40 working days</strong> of compulsory internship, with 20 working days in each internship type. The days of the two types cannot be combined.</p>",
              }}
            />
          </div>

          <EditableList
            blockPath="mandatory.items"
            as="div"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
            style={{ display: "grid" }}
            itemSchema={{
              order: { blockType: "ShortText", defaultValue: "" },
              code: { blockType: "ShortText", defaultValue: "" },
              title: { blockType: "ShortText", defaultValue: "" },
              days: { blockType: "ShortText", defaultValue: "" },
              ects: { blockType: "ShortText", defaultValue: "" },
              term: { blockType: "ShortText", defaultValue: "" },
            }}
            defaultValue={{
              tr: [
                {
                  order: "1. Staj",
                  code: "MTM2002",
                  title: "Bilgisayar Donanımı ve Temel Uygulamaları Stajı",
                  days: "20",
                  ects: "2",
                  term: "2. sınıf",
                },
                {
                  order: "2. Staj",
                  code: "MTM3002",
                  title: "Sorun Çözüm Teknikleri Stajı",
                  days: "20",
                  ects: "3",
                  term: "3. sınıf",
                },
              ],
              en: [
                {
                  order: "1st Internship",
                  code: "MTM2002",
                  title: "Computer Hardware and Basic Applications Internship",
                  days: "20",
                  ects: "2",
                  term: "2nd year",
                },
                {
                  order: "2nd Internship",
                  code: "MTM3002",
                  title: "Problem Solving Techniques Internship",
                  days: "20",
                  ects: "3",
                  term: "3rd year",
                },
              ],
            }}
          >
            {(item, index) => (
              <Link
                key={index}
                href={`/egitim/mufredat/${item.code}`}
                className="group flex flex-col gap-2 p-4 rounded-lg bg-primary-500/2 border border-primary-500/5 hover:border-secondary-500/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary-700">
                    {item.order}
                  </span>
                  <ArrowUpRight className="size-3.5 text-primary-500/70 group-hover:text-secondary-700 transition-colors" />
                </div>
                <span className="text-[14px] font-semibold text-primary-500 leading-snug">
                  {item.title}
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-primary-500/70">
                  <span className="font-mono">{item.code}</span>
                  <span>{item.days} {t("iş günü")}</span>
                  <span>{item.ects} {t("AKTS")}</span>
                  <span>{item.term}</span>
                </div>
              </Link>
            )}
          </EditableList>
        </Panel>
      </PageSection>
    </>
  );
}

export function ProcessSteps() {
  const { value } = useCmsBlock("process.items");
  const items = Array.isArray(value) ? value : [];

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="process.title"
          blockType="ShortText"
          defaultValue={{ tr: "Süreç", en: "Process" }}
        />
      }
      count={items.length}
    >
      <Panel>
        <EditableList
          blockPath="process.items"
          as="ol"
          className="flex flex-col gap-5"
          style={{ display: "flex" }}
          itemSchema={{
            title: { blockType: "ShortText", defaultValue: "" },
            detail: { blockType: "LongText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                title: "Staj yerini bul",
                detail: "Staj yapılacak iş yerini bulma sorumluluğu öğrenciye aittir. Yer, yurt içinde veya yurt dışında mühendislik uygulamaları üzerine çalışan bir fabrika, büro ya da kamu/özel iş yeri olabilir.",
              },
              {
                title: "Bölüm Staj Komisyonu onayı",
                detail: "Önerilen staj yerinin uygunluğuna Bölüm Staj Komisyonu karar verir.",
              },
              {
                title: "Belgeleri en az 10 gün önce teslim et",
                detail: "SGK girişinin yapılabilmesi için belgeler, staja başlama tarihinden en az 10 gün önce Fakülte Dekanlığı Staj Birimine teslim edilir.",
              },
              {
                title: "Sigorta girişi yapıldıktan sonra başla",
                detail: "Öğrenci, sigorta girişleri Dekanlık tarafından yapıldıktan sonra staj çalışmasına başlayabilir. Primler Üniversite tarafından karşılanır.",
              },
              {
                title: "Staj bitiminden itibaren 1 ay içinde teslim et",
                detail: "İş yeri yetkilisince onaylanmış Staj Sicil Formu, Staj Değerlendirme Formu ve Staj Defteri bölüm başkanlığına verilir. 1 ayı geçen staj defteri değerlendirmeye alınmaz.",
              },
              {
                title: "Değerlendirme",
                detail: "Komisyon belgeleri 1 ay içinde inceler; kabul, ret veya düzeltme kararı verir. Düzeltme istenirse belgeler 30 gün içinde tamamlanmalıdır. Ret kararına, yazılı bildirimden sonraki 1 hafta içinde itiraz edilebilir.",
              },
            ],
            en: [
              {
                title: "Find an internship place",
                detail: "The responsibility of finding the internship workplace belongs to the student. The location may be a factory, office, or public/private workplace working on engineering applications, either in Türkiye or abroad.",
              },
              {
                title: "Department Internship Commission approval",
                detail: "The suitability of the proposed internship placement is determined by the Department Internship Committee.",
              },
              {
                title: "Submit the documents at least 10 days in advance",
                detail: "In order for the SSI registration to be made, the documents must be submitted to the Faculty Dean's Office Internship Unit at least 10 days before the internship start date.",
              },
              {
                title: "Start after insurance registration is completed",
                detail: "The student may start the internship after the insurance registration is completed by the Dean's Office. Premiums are covered by the University.",
              },
              {
                title: "Submit within 1 month following the end of the internship",
                detail: "The Internship Record Form, Internship Evaluation Form, and Internship Notebook approved by the workplace official are submitted to the department headship. Internship notebooks exceeding 1 month are not evaluated.",
              },
              {
                title: "Evaluation",
                detail: "The commission examines the documents within 1 month; it decides on acceptance, rejection, or revision. If revision is requested, the documents must be completed within 30 days. An objection to the rejection decision may be submitted within 1 week following written notification.",
              },
            ],
          }}
        >
          {(item, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex flex-col items-center shrink-0">
                <span className="flex items-center justify-center size-7 rounded-full bg-secondary-500/15 text-[11px] font-bold text-secondary-700">
                  {index + 1}
                </span>
                {index < items.length - 1 && (
                  <span className="w-px flex-1 mt-1 bg-primary-500/10" />
                )}
              </div>
              <div className="flex flex-col gap-1 min-w-0 pb-1">
                <span className="text-[13px] font-semibold text-primary-500">{item.title}</span>
                <span className="text-[13px] text-primary-500/70 leading-relaxed">
                  {item.detail}
                </span>
              </div>
            </li>
          )}
        </EditableList>
      </Panel>
    </PageSection>
  );
}

export function TimingRules() {
  const { value } = useCmsBlock("timing.rules", {
    blockType: "LongText",
    defaultValue: {
      tr: `Stajların yarıyıl veya yaz tatiline rastlayan haftalarda yapılması esastır.
Haftada en az 3 serbest tam iş günü bulunan öğrenciler eğitim-öğretim dönemi, yaz okulu ve genel sınav dönemlerinde de staj yapabilir.
Stajlar tam gündür; yarım iş günü staj yapılmaz ve resmî tatil günleri staj süresinden sayılmaz.
Staj yapılan bir günde dersi veya sınavı olduğu tespit edilen öğrencinin o stajı iptal edilir.
Cumartesi çalışan iş yerlerinde cumartesi de iş gününden sayılır; iş yerinden alınmış imzalı ve mühürlü belge teslim edilmesi zorunludur.
İki staj türünün günleri birleştirilemez ve her tür 20 iş gününü aşamaz.`,
      en: `It is essential that internships are carried out during weeks corresponding to semester breaks or summer vacation.
Students who have at least 3 free full workdays per week may also do their internships during the academic semester, summer school, and final exam periods.
Internships are full-day; half-day internships cannot be done, and official holidays are not counted towards the internship duration.
The internship of a student who is determined to have a lecture or an exam on an internship day will be cancelled.
In workplaces operating on Saturdays, Saturday is also counted as a workday; submitting a signed and stamped document obtained from the workplace is mandatory.
The days of two internship types cannot be combined, and each type cannot exceed 20 workdays.`,
    },
  });

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="timing.title"
          blockType="ShortText"
          defaultValue={{ tr: "Ne Zaman Yapılır", en: "When Is It Held" }}
        />
      }
    >
      <Panel>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2.5">
          {lines(value).map((rule, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary-500" />
              <span className="text-[13px] text-primary-500/70 leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </PageSection>
  );
}

const DOC_GRID = "grid grid-cols-1 xl:grid-cols-2 gap-2";

export function InternshipDocuments() {
  const editing = useIsEditor();
  const { value } = useCmsBlock("documents.items");
  const items = Array.isArray(value) ? value : [];
  const rank = {};
  const first = {};
  items.forEach((item, index) => {
    if (item.category in rank) return;
    rank[item.category] = Object.keys(rank).length;
    first[item.category] = index;
  });

  return (
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
        <EditableList
          blockPath="documents.items"
          as="div"
          className={DOC_GRID}
          style={{ display: "grid" }}
          itemSchema={{
            category: { blockType: "ShortText", defaultValue: "" },
            note: { blockType: "ShortText", defaultValue: "" },
            file: { blockType: "Link", defaultValue: { href: "", label: "" } },
            kind: { blockType: "ShortText", defaultValue: "" },
            size: { blockType: "ShortText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                category: "Kılavuz ve esaslar",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/MATEMAT%C4%B0K%20M%C3%9CHEND%C4%B0SL%C4%B0%C4%9E%C4%B0%20STAJ%20KILAVUZU%202023-.pdf",
                  label: "Matematik Mühendisliği Staj Kılavuzu 2023",
                },
                kind: "pdf",
                size: "1321606",
              },
              {
                category: "Kılavuz ve esaslar",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/Staj_Ak%C4%B1%C5%9F_Diyagram%C4%B1.pdf",
                  label: "Staj Akış Diyagramı",
                },
                kind: "pdf",
                size: "240240",
              },
              {
                category: "Kılavuz ve esaslar",
                note: "",
                file: {
                  href: "https://kalite.yildiz.edu.tr/media/files/DD-097-YT%C3%9C%20KMF%20Matematik%20M%C3%BChendisli%C4%9Fi%20B%C3%B6l%C3%BCm%C3%BC%20Staj%20Uygulama%20Esaslar%C4%B1.docx",
                  label: "DD-097 Staj Uygulama Esasları",
                },
                kind: "docx",
                size: "188557",
              },
              {
                category: "Kılavuz ve esaslar",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/2026%20TAKV%C4%B0M.pdf",
                  label: "2026 Staj Takvimi",
                },
                kind: "pdf",
                size: "235313",
              },
              {
                category: "Başvuru belgeleri",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/FR-1877-YT%C3%9C%20Staj%20Ba%C5%9Fvuru%20Formu%20(Internship%20Application%20Form)_.doc",
                  label: "FR-1877 YTÜ Staj Başvuru Formu",
                },
                kind: "doc",
                size: "167424",
              },
              {
                category: "Başvuru belgeleri",
                note: "",
                file: {
                  href: "https://kalite.yildiz.edu.tr/media/files/FR-1936-Staj%20%C3%9Ccretlerine%20%C4%B0%C5%9Fsizlik%20Fonu%20Katk%C4%B1s%C4%B1%20Bilgi%20Formu.docx",
                  label: "FR-1936 Staj Ücretlerine İşsizlik Fonu Katkısı Bilgi Formu",
                },
                kind: "docx",
                size: "118394",
              },
              {
                category: "Staj sonrası belgeler",
                note: "",
                file: {
                  href: "https://kalite.yildiz.edu.tr/media/files/FR-0286-Staj%20Sicil%20Formu.doc",
                  label: "FR-0286 Staj Sicil Formu",
                },
                kind: "doc",
                size: "96256",
              },
              {
                category: "Staj sonrası belgeler",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/Staj-DegerlendirmeFormu2.pdf",
                  label: "Staj Değerlendirme Formu",
                },
                kind: "pdf",
                size: "738861",
              },
              {
                category: "Staj defterleri",
                note: "Her staj çalışması için ayrı bir staj defteri hazırlanır.",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/1_STAJ_B%C4%B0LG%C4%B0SAYAR%20DONANIMI%20VE%20TEMEL%20UYGULAMALARI%20STAJ%20DEFTER%C4%B0(T%C3%9CRK%C3%87E).docx",
                  label: "1. Staj Defteri - Türkçe",
                },
                kind: "docx",
                size: "143955",
              },
              {
                category: "Staj defterleri",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/1_STAJ_B%C4%B0LG%C4%B0SAYAR%20DONANIMI%20VE%20TEMEL%20UYGULAMALARI%20STAJ%20DEFTER%C4%B0(%C4%B0NG%C4%B0L%C4%B0CE).docx",
                  label: "1. Staj Defteri - İngilizce",
                },
                kind: "docx",
                size: "127892",
              },
              {
                category: "Staj defterleri",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/2_STAJ_SORUN%20%C3%87%C3%96Z%C3%9CM%20TEKN%C4%B0KLER%C4%B0%20STAJ%20DEFTER%C4%B0(T%C3%9CRK%C3%87E)(1).docx",
                  label: "2. Staj Defteri - Türkçe",
                },
                kind: "docx",
                size: "406002",
              },
              {
                category: "Staj defterleri",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/2_STAJ_SORUN%20%C3%87%C3%96Z%C3%9CM%20TEKN%C4%B0KLER%C4%B0%20STAJ%20DEFTER%C4%B0(%C4%B0NG%C4%B0L%C4%B0ZCE)(1).docx",
                  label: "2. Staj Defteri - İngilizce",
                },
                kind: "docx",
                size: "401356",
              },
            ],
            en: [
              {
                category: "Guidelines and principles",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/MATEMAT%C4%B0K%20M%C3%9CHEND%C4%B0SL%C4%B0%C4%9E%C4%B0%20STAJ%20KILAVUZU%202023-.pdf",
                  label: "Mathematical Engineering Internship Guide 2023",
                },
                kind: "pdf",
                size: "1321606",
              },
              {
                category: "Guidelines and principles",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/Staj_Ak%C4%B1%C5%9F_Diyagram%C4%B1.pdf",
                  label: "Internship Flowchart",
                },
                kind: "pdf",
                size: "240240",
              },
              {
                category: "Guidelines and principles",
                note: "",
                file: {
                  href: "https://kalite.yildiz.edu.tr/media/files/DD-097-YT%C3%9C%20KMF%20Matematik%20M%C3%BChendisli%C4%9Fi%20B%C3%B6l%C3%BCm%C3%BC%20Staj%20Uygulama%20Esaslar%C4%B1.docx",
                  label: "DD-097 Internship Implementation Principles",
                },
                kind: "docx",
                size: "188557",
              },
              {
                category: "Guidelines and principles",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/2026%20TAKV%C4%B0M.pdf",
                  label: "2026 Internship Calendar",
                },
                kind: "pdf",
                size: "235313",
              },
              {
                category: "Application documents",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/FR-1877-YT%C3%9C%20Staj%20Ba%C5%9Fvuru%20Formu%20(Internship%20Application%20Form)_.doc",
                  label: "FR-1877 YTU Internship Application Form",
                },
                kind: "doc",
                size: "167424",
              },
              {
                category: "Application documents",
                note: "",
                file: {
                  href: "https://kalite.yildiz.edu.tr/media/files/FR-1936-Staj%20%C3%9Ccretlerine%20%C4%B0%C5%9Fsizlik%20Fonu%20Katk%C4%B1s%C4%B1%20Bilgi%20Formu.docx",
                  label: "FR-1936 Unemployment Fund Contribution Information Form for Internship Remuneration",
                },
                kind: "docx",
                size: "118394",
              },
              {
                category: "Post-internship documents",
                note: "",
                file: {
                  href: "https://kalite.yildiz.edu.tr/media/files/FR-0286-Staj%20Sicil%20Formu.doc",
                  label: "FR-0286 Internship Evaluation Form",
                },
                kind: "doc",
                size: "96256",
              },
              {
                category: "Post-internship documents",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/Staj-DegerlendirmeFormu2.pdf",
                  label: "Internship Evaluation Form",
                },
                kind: "pdf",
                size: "738861",
              },
              {
                category: "Internship notebooks",
                note: "A separate internship report is prepared for each internship.",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/1_STAJ_B%C4%B0LG%C4%B0SAYAR%20DONANIMI%20VE%20TEMEL%20UYGULAMALARI%20STAJ%20DEFTER%C4%B0(T%C3%9CRK%C3%87E).docx",
                  label: "1st Internship Notebook - Turkish",
                },
                kind: "docx",
                size: "143955",
              },
              {
                category: "Internship notebooks",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/1_STAJ_B%C4%B0LG%C4%B0SAYAR%20DONANIMI%20VE%20TEMEL%20UYGULAMALARI%20STAJ%20DEFTER%C4%B0(%C4%B0NG%C4%B0L%C4%B0CE).docx",
                  label: "1st Internship Notebook - English",
                },
                kind: "docx",
                size: "127892",
              },
              {
                category: "Internship notebooks",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/2_STAJ_SORUN%20%C3%87%C3%96Z%C3%9CM%20TEKN%C4%B0KLER%C4%B0%20STAJ%20DEFTER%C4%B0(T%C3%9CRK%C3%87E)(1).docx",
                  label: "2nd Internship Notebook - Turkish",
                },
                kind: "docx",
                size: "406002",
              },
              {
                category: "Internship notebooks",
                note: "",
                file: {
                  href: "https://mtm.yildiz.edu.tr/media/files/2_STAJ_SORUN%20%C3%87%C3%96Z%C3%9CM%20TEKN%C4%B0KLER%C4%B0%20STAJ%20DEFTER%C4%B0(%C4%B0NG%C4%B0L%C4%B0ZCE)(1).docx",
                  label: "2nd Internship Notebook - English",
                },
                kind: "docx",
                size: "401356",
              },
            ],
          }}
        >
          {(item, index) => {
            const seat = rank[item.category] ?? 0;
            return (
              <Fragment key={index}>
                {!editing && first[item.category] === index && (
                  <span
                    className="xl:col-span-2 text-[11px] font-semibold uppercase tracking-widest text-primary-500/70 mt-3 first:mt-0"
                    style={{ order: seat * 2 }}
                  >
                    {item.category}
                  </span>
                )}
                {editing && item.category && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary-700/70">
                    {item.category}
                  </span>
                )}
                {item.note && (
                  <p
                    className="xl:col-span-2 text-[12px] text-primary-500/70 leading-relaxed"
                    style={editing ? undefined : { order: seat * 2 + 1 }}
                  >
                    {item.note}
                  </p>
                )}
                <DocumentLink
                  label={item.file?.label}
                  href={safeHref(item.file?.href)}
                  kind={item.kind}
                  size={Number(item.size) || 0}
                  style={editing ? undefined : { order: seat * 2 + 1 }}
                />
              </Fragment>
            );
          }}
        </EditableList>
      </Panel>
    </PageSection>
  );
}

export function Commission({ initialStaff = [] }) {
  const t = useT();
  const { people } = useStaff(initialStaff);
  const chair = useCmsBlock("commission.chair", {
    blockType: "ShortText",
    defaultValue: "hsahin@yildiz.edu.tr",
  });
  const composition = useCmsBlock("commission.composition", {
    blockType: "LongText",
    defaultValue: {
      tr: `Bölüm Kurulu tarafından, Bölüm öğretim elemanları arasından, 3 kişiden az olmayacak şekilde belirlenir.
Görev süresi 2 yıldır; süresi dolan üyeler tekrar seçilebilir.
Komisyon başkanı öğretim üyesi olmak zorundadır.
Sekretarya görevini Bölüm Sekreterliği yürütür.`,
      en: `It is determined by the Department Board from among the Department instructors, consisting of not fewer than 3 persons.
The term of office is 2 years; members whose terms have expired may be re-elected.
The chair of the commission must be a faculty member.
The secretariat duty is carried out by the Department Secretariat.`,
    },
  });
  const duties = useCmsBlock("commission.duties", {
    blockType: "LongText",
    defaultValue: {
      tr: `Öğrencilerin staj yapacağı iş yerlerinin uygunluğuna karar verir.
Bölüm Başkanlığı'nca iletilen staj belgelerini inceler ve değerlendirir.
Staja ilişkin duyuruları öğrencilere iletir.
Değerlendirme ve itiraz sonuçlarını yazılı olarak Bölüm Başkanlığı'na bildirir.
Gerek gördüğünde, Bölüm Sekreterliği aracılığıyla öğrencilere staj anketi yapabilir.`,
      en: `Decides on the suitability of the workplaces where students will conduct their internships.
Examines and evaluates internship documents forwarded by the Department Head's Office.
Conveys announcements regarding internships to students.
Reports evaluation and objection results in writing to the Department Head's Office.
May conduct internship surveys among students through the Department Secretariat when deemed necessary.`,
    },
  });
  const chairPerson = findPerson(people, chair.value);

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="commission.title"
          blockType="ShortText"
          defaultValue={{ tr: "Staj Komisyonu", en: "Internship Committee" }}
        />
      }
    >
      <Panel>
        <div className="flex flex-col gap-4">
          {chairPerson && <StaffCard person={chairPerson} idx={0} />}

          <EditableList
            blockPath="commission.groups"
            as="div"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            style={{ display: "grid" }}
            itemSchema={{
              label: { blockType: "ShortText", defaultValue: "" },
              subtitle: { blockType: "ShortText", defaultValue: "" },
              members: { blockType: "LongText", defaultValue: "" },
            }}
            defaultValue={{
              tr: [
                {
                  label: "I. Staj Komisyonu",
                  subtitle: "Bilgisayar Donanımı ve Temel Uygulamaları Stajı",
                  members: `asahiner@yildiz.edu.tr
ionder@yildiz.edu.tr
huozer@yildiz.edu.tr
buse.guler@yildiz.edu.tr`,
                },
                {
                  label: "II. Staj Komisyonu",
                  subtitle: "Sorun Çözüm Teknikleri",
                  members: `kemalp@yildiz.edu.tr
emel.ugurlu@yildiz.edu.tr`,
                },
              ],
              en: [
                {
                  label: "I. Internship Committee",
                  subtitle: "Computer Hardware and Basic Applications Internship",
                  members: `asahiner@yildiz.edu.tr
ionder@yildiz.edu.tr
huozer@yildiz.edu.tr
buse.guler@yildiz.edu.tr`,
                },
                {
                  label: "II. Internship Committee",
                  subtitle: "Problem Solving Techniques",
                  members: `kemalp@yildiz.edu.tr
emel.ugurlu@yildiz.edu.tr`,
                },
              ],
            }}
          >
            {(item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-primary-500">{item.label}</span>
                  <span className="text-[11px] text-primary-500/70">{item.subtitle}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {lines(item.members).map((email, idx) => {
                    const person = findPerson(people, email);
                    if (!person) return null;
                    return <StaffCard key={email} person={person} idx={idx} />;
                  })}
                </div>
              </div>
            )}
          </EditableList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-primary-500/5">
            <div className="flex flex-col gap-2 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
                {t("Oluşumu")}
              </span>
              <Bullets items={lines(composition.value)} />
            </div>
            <div className="flex flex-col gap-2 lg:pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
                {t("Görevleri")}
              </span>
              <Bullets items={lines(duties.value)} />
            </div>
          </div>

        </div>
      </Panel>
    </PageSection>
  );
}

export function SpecialCases() {
  const { value } = useCmsBlock("cases.items");
  const items = Array.isArray(value) ? value : [];

  return (
    <PageSection
      title={
        <EditableRegion
          blockPath="cases.title"
          blockType="ShortText"
          defaultValue={{ tr: "Özel Durumlar", en: "Special Circumstances" }}
        />
      }
      count={items.length}
    >
      <EditableList
        blockPath="cases.items"
        as="div"
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        style={{ display: "grid" }}
        itemSchema={{
          title: { blockType: "ShortText", defaultValue: "" },
          detail: { blockType: "LongText", defaultValue: "" },
        }}
        defaultValue={{
          tr: [
            {
              title: "İsteğe bağlı staj",
              detail: "4. yarıyılın sona ermesinden itibaren, en fazla 2 kere ve toplamda 20 iş günü olmak üzere yapılabilir. Zorunlu staj yerine geçmez.",
            },
            {
              title: "Erasmus+ ile yurt dışı staj",
              detail: "Bölüm Staj Komisyonunun uygun görüşü, bölüm başkanlığının önerisi ve Fakülte Yönetim Kurulu kararı ile yapılabilir. Erasmus+ kapsamında en az 60 iş günü staj yapılması esastır.",
            },
            {
              title: "Ulusal Staj Programı",
              detail: "T.C. Cumhurbaşkanlığı Ulusal Staj Programı kapsamında isteğe bağlı veya zorunlu staj yapılabilir.",
            },
            {
              title: "Muafiyet",
              detail: "Daha önce kayıtlı olunan yükseköğretim kurumunda yapılan staj belgelenirse muafiyet istenebilir. Belgelerin kayıt olunan ilk yarıyıl içinde bölüme teslim edilmesi gerekir.",
            },
          ],
          en: [
            {
              title: "Optional internship",
              detail: "Starting from the end of the 4th semester, it can be conducted at most twice and for a total of 20 working days. It does not replace the compulsory internship.",
            },
            {
              title: "Internship abroad with Erasmus+",
              detail: "It can be carried out with the favorable opinion of the Department Internship Commission, the proposal of the department headship, and the decision of the Faculty Administrative Board. It is essential that an internship of at least 60 business days be completed within the scope of Erasmus+.",
            },
            {
              title: "National Internship Program",
              detail: "Optional or compulsory internships can be undertaken within the scope of the Presidency of the Republic of Türkiye National Internship Program.",
            },
            {
              title: "Exemption",
              detail: "If an internship completed at a previously enrolled higher education institution is documented, an exemption may be requested. The documents must be submitted to the department within the first semester of enrollment.",
            },
          ],
        }}
      >
        {(item, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 p-4 rounded-xl border border-primary-500/10 shadow-xs bg-white"
          >
            <span className="text-[13px] font-semibold text-primary-500">{item.title}</span>
            <span className="text-[13px] text-primary-500/70 leading-relaxed">{item.detail}</span>
          </div>
        )}
      </EditableList>
    </PageSection>
  );
}

export function InternshipContact() {
  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="contact.title"
          blockType="ShortText"
          defaultValue={{ tr: "İletişim", en: "Contact" }}
        />
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[13px]">
          <Mail className="size-4 shrink-0 text-secondary-700" />
          <EditableRegion
            blockPath="contact.email"
            blockType="Link"
            defaultValue={{
              href: "mailto:mtmstaj@yildiz.edu.tr",
              label: "mtmstaj@yildiz.edu.tr",
            }}
            className="min-w-0 break-all text-primary-500 hover:text-secondary-700 transition-colors"
          />
        </div>
        <EditableRegion
          blockPath="contact.source"
          blockType="LongText"
          defaultValue={{
            tr: `DD-097 · YTÜ KMF Matematik Mühendisliği Bölümü Staj Uygulama Esasları
Senato 23.05.2023 / 05-05`,
            en: `DD-097 · YTU KMF Department of Mathematical Engineering Internship Implementation Principles
Senate 23.05.2023 / 05-05`,
          }}
          as="p"
          className="text-[11px] text-primary-500/70 leading-relaxed"
        />
      </div>
    </MainCard>
  );
}
