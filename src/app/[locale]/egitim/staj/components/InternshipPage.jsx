import { BookOpen, FileStack, Sun } from "lucide-react";
import { EditableRegion } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import RelatedPages from "@/app/components/RelatedPages";
import QuickLinks from "@/app/components/QuickLinks";
import {
  Commission,
  InternshipContact,
  InternshipDocuments,
  MandatoryInternships,
  ProcessSteps,
  SpecialCases,
  TimingRules,
} from "./InternshipSections";

const RELATED = [
  { label: "Yaz Okulu", href: "/egitim/yaz-okulu", icon: Sun },
  { label: "Formlar / Belgeler", href: "/egitim/formlar", icon: FileStack },
  { label: "Müfredat", href: "/egitim/mufredat", icon: BookOpen },
];

function Sidebar() {
  return (
    <div className="flex flex-col gap-6">
      <InternshipContact />
      <RelatedPages items={RELATED} />
      <QuickLinks external title="Kurumsal Sistemler" />
    </div>
  );
}

export default function InternshipPage({ initialStaff = [] }) {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Staj İşlemleri", en: "Internship Procedures" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Zorunlu staj esasları, süreç ve belgeler",
              en: "Compulsory internship guidelines, process and documents",
            }}
          />
        }
      />
      <PageLayout sidebar={<Sidebar />}>
        <div className="flex flex-col gap-8">
          <MandatoryInternships />
          <ProcessSteps />
          <TimingRules />
          <InternshipDocuments />
          <Commission initialStaff={initialStaff} />
          <SpecialCases />
        </div>
      </PageLayout>
    </>
  );
}
