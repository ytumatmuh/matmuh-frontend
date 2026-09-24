import { Archive, BookOpen, CalendarDays } from "lucide-react";
import { EditableRegion } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import RelatedPages from "@/app/components/RelatedPages";
import QuickLinks from "@/app/components/QuickLinks";
import { FbeSection, ProgramList } from "./ProgramSections";

const RELATED = [
  {
    label: "Lisansüstü Ders Programı",
    href: "/egitim/lisansustu-ders-programi",
    icon: CalendarDays,
  },
  { label: "Müfredat", href: "/egitim/mufredat", icon: BookOpen },
  { label: "Formlar / Belgeler", href: "/egitim/formlar", icon: Archive },
];

function Sidebar() {
  return (
    <div className="flex flex-col gap-6">
      <RelatedPages items={RELATED} />
      <QuickLinks external title="Kurumsal Sistemler" />
    </div>
  );
}

export default function GraduateProgramsPage() {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Programlar", en: "Programmes" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{ tr: "Yüksek lisans ve doktora programları", en: "Master's and PhD programs" }}
          />
        }
      />
      <PageLayout sidebar={<Sidebar />}>
        <div className="flex flex-col gap-8">
          <ProgramList />
          <FbeSection />
        </div>
      </PageLayout>
    </>
  );
}
