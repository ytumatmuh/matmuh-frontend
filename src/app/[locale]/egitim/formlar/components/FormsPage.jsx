"use client";

import { Fragment, useState } from "react";
import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import { useIsEditor } from "@/app/lib/cms-provider.jsx";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import Panel from "@/app/components/Panel";
import PageSection from "@/app/components/PageSection";
import DocumentLink from "@/app/components/DocumentLink";
import { safeHref } from "@/lib/href";
import { useT } from "@/i18n/useT";

const TABS = [
  { id: "ogrenci", label: "Öğrenci", blockPath: "forms.student" },
  { id: "personel", label: "Personel", blockPath: "forms.staff" },
];

const GRID = "grid grid-cols-1 xl:grid-cols-2 gap-2";
const CATEGORY =
  "xl:col-span-2 text-[11px] font-semibold uppercase tracking-widest text-primary-500/70 mt-3 first:mt-0";
const CATEGORY_INLINE =
  "text-[10px] font-semibold uppercase tracking-widest text-secondary-700/70";

function groupOrder(items) {
  const rank = {};
  const first = {};
  items.forEach((item, index) => {
    if (!(item.category in rank)) {
      rank[item.category] = Object.keys(rank).length;
      first[item.category] = index;
    }
  });
  return { rank, first };
}

function FormRow({ item, index, rank, first, editing }) {
  const seat = rank[item.category] ?? 0;
  return (
    <Fragment>
      {!editing && first[item.category] === index && (
        <span className={CATEGORY} style={{ order: seat * 2 }}>
          {item.category}
        </span>
      )}
      {editing && item.category && (
        <span className={CATEGORY_INLINE}>{item.category}</span>
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
}

function StudentForms({ items }) {
  const editing = useIsEditor();
  const { rank, first } = groupOrder(items);
  return (
    <EditableList
      blockPath="forms.student"
      as="div"
      className={GRID}
      style={{ display: "grid" }}
      itemSchema={{
        category: { blockType: "ShortText", defaultValue: "" },
        file: { blockType: "Link", defaultValue: { href: "", label: "" } },
        kind: { blockType: "ShortText", defaultValue: "" },
        size: { blockType: "ShortText", defaultValue: "" },
      }}
      defaultValue={{
        tr: [
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0609-Fak%C3%BClte-Y%C3%BCksekokul%20%C3%96%C4%9Frenci%20Genel%20Dilek%C3%A7e%20Formu.doc",
              label: "FR-0609 Fakülte-Yüksekokul Öğrenci Genel Dilekçe Formu",
            },
            kind: "doc",
            size: "36864",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0531-Mazeretli%20Ders%20Ekle-Sil%20Dilek%C3%A7esi(1).xls",
              label: "FR-0531 Mazeretli Ders Ekle-Sil Dilekçesi",
            },
            kind: "xls",
            size: "83968",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0606-%C3%87ak%C4%B1%C5%9Fan%20Dersler%20%C4%B0%C3%A7in%20Mazeret%20S%C4%B1nav%20Talep%20Formu.doc",
              label: "FR-0606 Çakışan Dersler İçin Mazeret Sınav Talep Formu",
            },
            kind: "doc",
            size: "45056",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0607-Mazeret%20S%C4%B1nav%20Talep%20Formu.doc",
              label: "FR-0607 Mazeret Sınav Talep Formu",
            },
            kind: "doc",
            size: "51712",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1107-Ders%20Sayd%C4%B1rma%20Dilek%C3%A7esi.docx",
              label: "FR-1107 Ders Saydırma Dilekçesi",
            },
            kind: "docx",
            size: "33568",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1445-Kay%C4%B1t%20Silme%20Dilek%C3%A7esi.doc",
              label: "FR-1445 Kayıt Silme Dilekçesi",
            },
            kind: "doc",
            size: "60928",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1550-%C3%96%C4%9Frencinin%20Yatay%20Ge%C3%A7i%C5%9Fine%20Engel%20Bir%20Durumun%20Olmad%C4%B1%C4%9F%C4%B1na%20Dair%20Belge.docx",
              label: "FR-1550 Öğrencinin Yatay Geçişine Engel Bir Durumun Olmadığına Dair Belge",
            },
            kind: "docx",
            size: "31679",
          },
          {
            category: "Lisans",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/DD-050-Matematik%20M%C3%BChendisli%C4%9Fi%20bitirme%20%C3%87al%C4%B1%C5%9Fmas%C4%B1%20ve%20Matematik%20M%C3%BChendisli%C4%9Finde%20Tasar%C4%B1m%20Uygulamas%C4%B1%20Haz%C4%B1rlama%20Esaslar%C4%B1.doc",
              label: "DD-050 Matematik Mühendisliği Bitirme Çalışması ve Tasarım Uygulaması Hazırlama Esasları",
            },
            kind: "doc",
            size: "176128",
          },
          {
            category: "Lisansüstü",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0389-Genel%20Dilek%C3%A7e%20Formu.doc",
              label: "FR-0389 Genel Dilekçe Formu",
            },
            kind: "doc",
            size: "41472",
          },
          {
            category: "Lisansüstü",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1503-FBE%20Seminer%20Dersi%20Kay%C4%B1t%20ve%20De%C4%9Ferlendirme%20Formu%20(GSSE%20Registration%20and%20Evaluation%20Form%20for%20Seminar%20Course).docx",
              label: "FR-1503 FBE Seminer Dersi Kayıt ve Değerlendirme Formu",
            },
            kind: "docx",
            size: "737360",
          },
        ],
        en: [
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0609-Fak%C3%BClte-Y%C3%BCksekokul%20%C3%96%C4%9Frenci%20Genel%20Dilek%C3%A7e%20Formu.doc",
              label: "FR-0609 Faculty-School Student General Petition Form",
            },
            kind: "doc",
            size: "36864",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0531-Mazeretli%20Ders%20Ekle-Sil%20Dilek%C3%A7esi(1).xls",
              label: "FR-0531 Excused Course Add-Drop Petition",
            },
            kind: "xls",
            size: "83968",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0606-%C3%87ak%C4%B1%C5%9Fan%20Dersler%20%C4%B0%C3%A7in%20Mazeret%20S%C4%B1nav%20Talep%20Formu.doc",
              label: "FR-0606 Excuse Exam Request Form for Conflicting Courses",
            },
            kind: "doc",
            size: "45056",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0607-Mazeret%20S%C4%B1nav%20Talep%20Formu.doc",
              label: "FR-0607 Excuse Exam Request Form",
            },
            kind: "doc",
            size: "51712",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1107-Ders%20Sayd%C4%B1rma%20Dilek%C3%A7esi.docx",
              label: "FR-1107 Course Substitution Petition",
            },
            kind: "docx",
            size: "33568",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1445-Kay%C4%B1t%20Silme%20Dilek%C3%A7esi.doc",
              label: "FR-1445 Deregistration Petition",
            },
            kind: "doc",
            size: "60928",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1550-%C3%96%C4%9Frencinin%20Yatay%20Ge%C3%A7i%C5%9Fine%20Engel%20Bir%20Durumun%20Olmad%C4%B1%C4%9F%C4%B1na%20Dair%20Belge.docx",
              label: "FR-1550 Document Certifying the Absence of Any Impediment to the Student's Lateral Transfer",
            },
            kind: "docx",
            size: "31679",
          },
          {
            category: "Undergraduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/DD-050-Matematik%20M%C3%BChendisli%C4%9Fi%20bitirme%20%C3%87al%C4%B1%C5%9Fmas%C4%B1%20ve%20Matematik%20M%C3%BChendisli%C4%9Finde%20Tasar%C4%B1m%20Uygulamas%C4%B1%20Haz%C4%B1rlama%20Esaslar%C4%B1.doc",
              label: "DD-050 Mathematical Engineering Principles for Preparing Graduation Project and Design Practice",
            },
            kind: "doc",
            size: "176128",
          },
          {
            category: "Graduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0389-Genel%20Dilek%C3%A7e%20Formu.doc",
              label: "FR-0389 General Petition Form",
            },
            kind: "doc",
            size: "41472",
          },
          {
            category: "Graduate",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-1503-FBE%20Seminer%20Dersi%20Kay%C4%B1t%20ve%20De%C4%9Ferlendirme%20Formu%20(GSSE%20Registration%20and%20Evaluation%20Form%20for%20Seminar%20Course).docx",
              label: "FR-1503 FBE Seminar Course Registration and Evaluation Form",
            },
            kind: "docx",
            size: "737360",
          },
        ],
      }}
    >
      {(item, index) => (
        <FormRow
          key={index}
          item={item}
          index={index}
          rank={rank}
          first={first}
          editing={editing}
        />
      )}
    </EditableList>
  );
}

function StaffForms({ items }) {
  const editing = useIsEditor();
  const { rank, first } = groupOrder(items);
  return (
    <EditableList
      blockPath="forms.staff"
      as="div"
      className={GRID}
      style={{ display: "grid" }}
      itemSchema={{
        category: { blockType: "ShortText", defaultValue: "" },
        file: { blockType: "Link", defaultValue: { href: "", label: "" } },
        kind: { blockType: "ShortText", defaultValue: "" },
        size: { blockType: "ShortText", defaultValue: "" },
      }}
      defaultValue={{
        tr: [
          {
            category: "Akademik ve İdari Personel",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0714-Fak%C3%BClte-Y%C3%BCksekokul%20Akademik-%C4%B0dari%20Personel%20Genel%20Dilek%C3%A7e%20Formu.docx",
              label: "FR-0714 Fakülte-Yüksekokul Akademik-İdari Personel Genel Dilekçe Formu",
            },
            kind: "docx",
            size: "30070",
          },
          {
            category: "Akademik ve İdari Personel",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0251-2547-39.Madde%20G%C3%B6revlendirme%20Formu.xlsx",
              label: "FR-0251 2547-39. Madde Görevlendirme Formu",
            },
            kind: "xlsx",
            size: "57329",
          },
          {
            category: "Akademik ve İdari Personel",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0268-%C3%96%C4%9Fretim%20Eleman%C4%B1%20%C4%B0zin%20Onay%C4%B1.doc",
              label: "FR-0268 Öğretim Elemanı İzin Onay Formu",
            },
            kind: "doc",
            size: "80896",
          },
          {
            category: "Akademik ve İdari Personel",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0269-Akademik%20Birimlerde%20%C3%87al%C4%B1%C5%9Fan%20%C4%B0dari%20Personel%20%C4%B0zin%20Onay%C4%B1.doc",
              label: "FR-0269 Akademik Birimlerde Çalışan İdari Personel İzin Onay Formu",
            },
            kind: "doc",
            size: "81920",
          },
          {
            category: "Akademik ve İdari Personel",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0002-Ara%C5%9Ft%C4%B1rma%20G%C3%B6revlisi%20S%C3%BCre%20Uzatmas%C4%B1%20Formu.doc",
              label: "FR-0002 Araştırma Görevlisi Süre Uzatması Formu",
            },
            kind: "doc",
            size: "84992",
          },
          {
            category: "Akademik ve İdari Personel",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0245-EUS%20Ek%20Ders%20Beyan%20Formu.xls",
              label: "FR-0245 EUS Ek Ders Beyan Formu",
            },
            kind: "xls",
            size: "63488",
          },
        ],
        en: [
          {
            category: "Academic and Administrative Staff",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0714-Fak%C3%BClte-Y%C3%BCksekokul%20Akademik-%C4%B0dari%20Personel%20Genel%20Dilek%C3%A7e%20Formu.docx",
              label: "FR-0714 Faculty-School Academic-Administrative Personnel General Petition Form",
            },
            kind: "docx",
            size: "30070",
          },
          {
            category: "Academic and Administrative Staff",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0251-2547-39.Madde%20G%C3%B6revlendirme%20Formu.xlsx",
              label: "FR-0251 Law No. 2547 Article 39 Assignment Form",
            },
            kind: "xlsx",
            size: "57329",
          },
          {
            category: "Academic and Administrative Staff",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0268-%C3%96%C4%9Fretim%20Eleman%C4%B1%20%C4%B0zin%20Onay%C4%B1.doc",
              label: "FR-0268 Instructor Leave Approval Form",
            },
            kind: "doc",
            size: "80896",
          },
          {
            category: "Academic and Administrative Staff",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0269-Akademik%20Birimlerde%20%C3%87al%C4%B1%C5%9Fan%20%C4%B0dari%20Personel%20%C4%B0zin%20Onay%C4%B1.doc",
              label: "FR-0269 Leave Approval Form for Administrative Personnel Working in Academic Units",
            },
            kind: "doc",
            size: "81920",
          },
          {
            category: "Academic and Administrative Staff",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0002-Ara%C5%9Ft%C4%B1rma%20G%C3%B6revlisi%20S%C3%BCre%20Uzatmas%C4%B1%20Formu.doc",
              label: "FR-0002 Research Assistant Term Extension Form",
            },
            kind: "doc",
            size: "84992",
          },
          {
            category: "Academic and Administrative Staff",
            file: {
              href: "https://kalite.yildiz.edu.tr/media/files/FR-0245-EUS%20Ek%20Ders%20Beyan%20Formu.xls",
              label: "FR-0245 EUS Additional Course Declaration Form",
            },
            kind: "xls",
            size: "63488",
          },
        ],
      }}
    >
      {(item, index) => (
        <FormRow
          key={index}
          item={item}
          index={index}
          rank={rank}
          first={first}
          editing={editing}
        />
      )}
    </EditableList>
  );
}

export default function FormsPage({ sidebar }) {
  const t = useT();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const active = TABS.find((tab) => tab.id === activeTab);

  const student = useCmsBlock("forms.student");
  const staff = useCmsBlock("forms.staff");
  const source = active.id === "ogrenci" ? student : staff;
  const items = Array.isArray(source.value) ? source.value : [];

  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Formlar / Belgeler", en: "Forms / Documents" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Öğrenci dilekçeleri ve personel formları",
              en: "Student petitions and staff forms",
            }}
          />
        }
      />
      <PageLayout sidebar={sidebar}>
        <div className="flex flex-col gap-8">
          <PageSection
            title={
              <EditableRegion
                blockPath="forms.title"
                blockType="ShortText"
                defaultValue={{ tr: "Formlar", en: "Forms" }}
              />
            }
            count={items.length}
            action={
              <div className="flex items-center gap-1 shrink-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-3.5 py-1.5 rounded-lg transition-colors"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: activeTab === tab.id ? 600 : 450,
                      color: activeTab === tab.id ? "#fff" : "rgba(29,36,69,0.5)",
                      backgroundColor:
                        activeTab === tab.id
                          ? "var(--color-primary-500)"
                          : "transparent",
                    }}
                  >
                    {t(tab.label)}
                  </button>
                ))}
              </div>
            }
          >
            <Panel>
              {active.id === "ogrenci" ? (
                <StudentForms items={items} />
              ) : (
                <StaffForms items={items} />
              )}
            </Panel>
          </PageSection>
        </div>
      </PageLayout>
    </>
  );
}
