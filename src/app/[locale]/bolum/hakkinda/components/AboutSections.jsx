"use client";

import { ArrowUpRight, Briefcase, GraduationCap, Lightbulb, Target } from "lucide-react";
import { EditableList, EditableRegion, useCmsBlock } from "inscribed";

import MainCard from "@/app/components/MainCard";
import { useT } from "@/i18n/useT";

function lines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function MissionVision() {
  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="mission.title"
          blockType="ShortText"
          defaultValue={{ tr: "Misyon & Vizyon", en: "Mission & Vision" }}
        />
      }
    >
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Target className="size-5 text-secondary-700" />
            <EditableRegion
              blockPath="mission.label"
              blockType="ShortText"
              defaultValue={{ tr: "Misyon", en: "Mission" }}
              as="span"
              className="font-semibold text-[14px] text-primary-500"
            />
          </div>
          <EditableRegion
            blockPath="mission.body"
            blockType="LongText"
            defaultValue={{
              tr: "Matematiksel düşünce ve mühendislik yaklaşımını birleştirerek, toplumun ve endüstrinin ihtiyaç duyduğu nitelikli bilim insanları ve mühendisler yetiştirmek; evrensel bilime katkıda bulunmak.",
              en: "To educate qualified scientists and engineers needed by society and industry by combining mathematical thinking and an engineering approach; to contribute to universal science.",
            }}
            as="p"
            className="text-[13px] text-primary-500/70 leading-relaxed"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="size-5 text-secondary-700" />
            <EditableRegion
              blockPath="vision.label"
              blockType="ShortText"
              defaultValue={{ tr: "Vizyon", en: "Vision" }}
              as="span"
              className="font-semibold text-[14px] text-primary-500"
            />
          </div>
          <EditableRegion
            blockPath="vision.body"
            blockType="LongText"
            defaultValue={{
              tr: "Matematik mühendisliği alanında ulusal ve uluslararası düzeyde öncü, yenilikçi araştırmalarıyla tanınan, tercih edilen bir bölüm olmak.",
              en: "To be a leading department at national and international levels in the field of mathematical engineering, recognized for its innovative research, and preferred.",
            }}
            as="p"
            className="text-[13px] text-primary-500/70 leading-relaxed"
          />
        </div>
      </div>
    </MainCard>
  );
}

export function EducationalGoals() {
  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="goals.title"
          blockType="ShortText"
          defaultValue={{ tr: "Program Eğitim Amaçları", en: "Program Educational Objectives" }}
        />
      }
    >
      <div className="flex flex-col gap-3 pt-2">
        <EditableRegion
          blockPath="goals.intro"
          blockType="LongText"
          defaultValue={{
            tr: "Matematik Mühendisliği, temel ve uygulamalı matematik bilgisiyle mühendislik, ekonomi ve sosyal hayatta karşılaşılan olayların matematiksel modelini kuran, bu modellere çözüm üreten ve bu amaçla bilgisayar yazılım ve uygulamaları geliştiren mühendisler yetiştirir.",
            en: "Mathematical Engineering educates engineers who build mathematical models of phenomena encountered in engineering, economics, and social life using basic and applied mathematical knowledge, produce solutions to these models, and develop computer software and applications for this purpose.",
          }}
          as="p"
          className="text-[13px] text-primary-500/70 leading-relaxed"
        />
        <EditableList
          blockPath="goals.items"
          as="div"
          className="flex flex-col gap-2 mt-1"
          style={{ display: "flex" }}
          itemSchema={{
            code: { blockType: "ShortText", defaultValue: "" },
            text: { blockType: "LongText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                code: "EA1",
                text: "Meslek içi ve sürekli eğitim programlarına katılan,",
              },
              {
                code: "EA2",
                text: "Ulusal ve uluslararası özel sektör ya da kamu kuruluşlarında yönetim ve uygulama kadrolarında çalışan,",
              },
              {
                code: "EA3",
                text: "Yurt içinde veya yurt dışında lisansüstü öğrenim gören,",
              },
              {
                code: "EA4",
                text: "Üniversitelerde akademisyen olarak görev yapan matematik mühendisleri yetiştirmek.",
              },
            ],
            en: [
              {
                code: "EA1",
                text: "Participating in in-service and continuing education programs,",
              },
              {
                code: "EA2",
                text: "Working in administrative and implementation positions in national and international private sector or public institutions,",
              },
              {
                code: "EA3",
                text: "Pursuing graduate studies domestically or abroad,",
              },
              {
                code: "EA4",
                text: "To train mathematical engineers who serve as academics at universities.",
              },
            ],
          }}
        >
          {(item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-primary-500/2 border border-primary-500/5"
            >
              <span className="font-mono text-[11px] font-bold text-secondary-700 shrink-0 mt-0.5">
                {item.code}
              </span>
              <span className="text-[13px] text-primary-500/70 leading-relaxed">{item.text}</span>
            </div>
          )}
        </EditableList>
      </div>
    </MainCard>
  );
}

export function CareerProfile() {
  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="career.title"
          blockType="ShortText"
          defaultValue={{ tr: "Kariyer ve Mezun Profili", en: "Career and Alumni Profile" }}
        />
      }
    >
      <EditableList
        blockPath="career.groups"
        as="div"
        className="flex flex-col md:flex-row gap-8 w-full pt-1"
        style={{ display: "flex" }}
        itemSchema={{
          label: { blockType: "ShortText", defaultValue: "" },
          items: { blockType: "LongText", defaultValue: "" },
        }}
        defaultValue={{
          tr: [
            {
              label: "Çalışılan Kurumlar",
              items: `TÜBİTAK
MTA
TÜİK
Üniversite araştırma laboratuvarları
Sigorta ve finans kuruluşları
Bilgi işlem birimleri`,
            },
            {
              label: "Görev Alanları",
              items: `Yazılım Uzmanı / Mühendisi
Veri Tabanı Uzmanı
Sistem ve İş Analisti
İstatistiksel Analist
Matematikçi`,
            },
          ],
          en: [
            {
              label: "Institutions of Employment",
              items: `TÜBİTAK
MTA
TÜİK
University research laboratories
Insurance and financial institutions
Information technology departments`,
            },
            {
              label: "Areas of Responsibility",
              items: `Software Specialist / Engineer
Database Specialist
System and Business Analyst
Statistical Analyst
Mathematician`,
            },
          ],
        }}
      >
        {(group, index) => (
          <div key={index} className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="size-4 text-secondary-700" />
              <span className="font-semibold text-[13px] text-primary-500">{group.label}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {lines(group.items).map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex items-start gap-2 text-[13px] text-primary-500/70 leading-relaxed"
                >
                  <span className="w-1 h-1 rounded-full bg-secondary-500/50 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </EditableList>
    </MainCard>
  );
}

export function Milestones() {
  const { value } = useCmsBlock("milestones.items");
  const total = Array.isArray(value) ? value.length : 0;

  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="milestones.title"
          blockType="ShortText"
          defaultValue={{ tr: "Kilometre Taşları", en: "Milestones" }}
        />
      }
    >
      <div className="relative pt-2">
        <div className="absolute left-4.5 top-2 bottom-4 w-px bg-primary-500/10" />
        <EditableList
          blockPath="milestones.items"
          as="div"
          className="flex flex-col"
          style={{ display: "flex" }}
          itemSchema={{
            year: { blockType: "ShortText", defaultValue: "" },
            event: { blockType: "LongText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                year: "1911",
                event: "Kondüktör Mekteb-i Âlîsi adıyla kuruluş",
              },
              {
                year: "1922",
                event: "Nafia Fen Mektebi'ne dönüşüm",
              },
              {
                year: "1937",
                event: "İstanbul Teknik Okulu adını alması",
              },
              {
                year: "1969",
                event: "İstanbul Devlet Mühendislik ve Mimarlık Akademisi'ne dönüşüm",
              },
              {
                year: "1982",
                event: "Yıldız Üniversitesi'nin kurulması",
              },
              {
                year: "1992",
                event: "Yıldız Teknik Üniversitesi adının alınması ve Kimya-Metalurji Fakültesi'nin kurulması",
              },
            ],
            en: [
              {
                year: "1911",
                event: "Establishment under the name Kondüktör Mekteb-i Âlîsi",
              },
              {
                year: "1922",
                event: "Transformation into Nafia Fen Mektebi",
              },
              {
                year: "1937",
                event: "Taking the name Istanbul Technical School",
              },
              {
                year: "1969",
                event: "Transformation into Istanbul State Academy of Engineering and Architecture",
              },
              {
                year: "1982",
                event: "Establishment of Yildiz University",
              },
              {
                year: "1992",
                event: "Adoption of the name Yildiz Technical University and establishment of the Faculty of Chemical and Metallurgical Engineering",
              },
            ],
          }}
        >
          {(item, index) => (
            <div key={index} className="relative flex items-start gap-4 py-3 group">
              <div className="relative z-10 shrink-0 w-9 flex justify-center">
                <div
                  className={`w-3 h-3 rounded-full mt-1.5 transition-all duration-300 ${
                    index === total - 1
                      ? "bg-secondary-500 ring-4 ring-secondary-500/20"
                      : "bg-primary-500/20 ring-4 ring-transparent group-hover:bg-primary-500/40"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="font-mono text-[14px] font-bold text-secondary-700 leading-none">
                  {item.year}
                </div>
                <div className="text-[13px] font-medium text-primary-500 mt-1 leading-relaxed">
                  {item.event}
                </div>
              </div>
            </div>
          )}
        </EditableList>
      </div>
    </MainCard>
  );
}

export function InternshipSummary() {
  const t = useT();
  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="internship.title"
          blockType="ShortText"
          defaultValue={{ tr: "Staj Sistemi", en: "Internship System" }}
        />
      }
      buttonTitle={t("Staj Sayfası")}
      href="/egitim/staj"
    >
      <div className="flex flex-col gap-3 pt-2">
        <div className="announcement-body text-[13px] text-primary-500/70 leading-relaxed">
          <EditableRegion
            blockPath="internship.intro"
            blockType="RichText"
            defaultValue={{
              tr: "<p>Öğrenciler eğitimleri boyunca toplam <strong>40 iş günü</strong> zorunlu staj yapar. Staj yapılan departmanda en az bir mühendis bulunmalıdır.</p>",
              en: "<p>Students complete a total of <strong>40 working days</strong> of compulsory internship throughout their education. There must be at least one engineer in the department where the internship is carried out.</p>",
            }}
          />
        </div>
        <EditableList
          blockPath="internship.items"
          as="div"
          className="flex flex-col gap-3"
          style={{ display: "flex" }}
          itemSchema={{
            code: { blockType: "ShortText", defaultValue: "" },
            title: { blockType: "ShortText", defaultValue: "" },
            days: { blockType: "ShortText", defaultValue: "" },
            note: { blockType: "LongText", defaultValue: "" },
          }}
          defaultValue={{
            tr: [
              {
                code: "MTM2002",
                title: "Bilgisayar Donanımı ve Temel Uygulamaları Stajı",
                days: "20 iş günü",
                note: "Birinci aşama",
              },
              {
                code: "MTM3002",
                title: "Sorun Çözüm Teknikleri Stajı",
                days: "20 iş günü",
                note: "1. staj tamamlandıktan sonra, en az dört departmanlı orta/büyük ölçekli bir işletmede",
              },
            ],
            en: [
              {
                code: "MTM2002",
                title: "Computer Hardware and Basic Applications Internship",
                days: "20 working days",
                note: "First stage",
              },
              {
                code: "MTM3002",
                title: "Problem Solving Techniques Internship",
                days: "20 working days",
                note: "after the completion of the 1st internship, in a medium/large-scale enterprise with at least four departments",
              },
            ],
          }}
        >
          {(item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-primary-500/2 border border-primary-500/5"
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <GraduationCap className="size-4 text-secondary-700 shrink-0" />
                <span className="font-mono text-[12px] font-semibold text-primary-500">
                  {item.code}
                </span>
                <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-secondary-500/10 text-secondary-700">
                  {item.days}
                </span>
              </div>
              <div className="text-[13px] font-medium text-primary-500 leading-snug">
                {item.title}
              </div>
              <div className="text-[11px] text-primary-500/70 mt-1 leading-relaxed">
                {item.note}
              </div>
            </div>
          )}
        </EditableList>
      </div>
    </MainCard>
  );
}

export function MinorPrograms() {
  return (
    <MainCard
      title={
        <EditableRegion
          blockPath="minor.title"
          blockType="ShortText"
          defaultValue={{ tr: "Çift Anadal ve Yandal", en: "Double Major and Minor" }}
        />
      }
    >
      <div className="flex flex-col gap-3 pt-2">
        <div className="announcement-body text-[13px] text-primary-500/70 leading-relaxed">
          <EditableRegion
            blockPath="minor.body"
            blockType="RichText"
            defaultValue={{
              tr: "<p>Çift Anadal (ÇAP) ve Yandal başvuruları, <strong>YÖ-098 sayılı YTÜ Lisans Düzeyindeki Programlar Arasında Geçiş ile Çift Anadal ve Yan Dal Yönergesi</strong> çerçevesinde yürütülür. Bölümün yayımlanmış bir Yandal Programı ders planı bulunmaktadır.</p>",
              en: "<p>Double Major and Minor applications are conducted within the framework of <strong>YTU Directive No. YÖ-098 on Transfers Between Undergraduate Programs, Double Majors, and Minors</strong>. The department has a published Minor Program curriculum.</p>",
            }}
          />
        </div>
        <EditableRegion
          blockPath="minor.note"
          blockType="LongText"
          defaultValue={{
            tr: "Başvuru koşulları ve o yıl açılan program listesi her akademik yıl güncellendiğinden, güncel bilgi için Öğrenci İşleri Daire Başkanlığı duyurularını takip ediniz.",
            en: "Since application requirements and the list of programs offered that year are updated every academic year, please follow the announcements of the Department of Student Affairs for up-to-date information.",
          }}
          as="p"
          className="text-[12px] text-primary-500/70 leading-relaxed"
        />
        <MinorLink />
      </div>
    </MainCard>
  );
}

function MinorLink() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-secondary-700">
      <EditableRegion
        blockPath="minor.link"
        blockType="Link"
        defaultValue={{
          tr: {
            href: "https://ogi.yildiz.edu.tr",
            label: "Öğrenci İşleri Daire Başkanlığı",
          },
          en: {
            href: "https://ogi.yildiz.edu.tr",
            label: "Department of Student Affairs",
          },
        }}
        className="hover:text-secondary-700 transition-colors"
      />
      <ArrowUpRight size={13} strokeWidth={2} />
    </span>
  );
}

