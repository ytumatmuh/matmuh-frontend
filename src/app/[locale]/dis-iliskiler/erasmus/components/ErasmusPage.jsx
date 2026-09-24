import { Briefcase } from "lucide-react";
import { EditableRegion } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import RelatedPages from "@/app/components/RelatedPages";
import QuickLinks from "@/app/components/QuickLinks";
import {
  Agreements,
  Coordinators,
  ErasmusInternship,
  ErasmusSidebarCards,
} from "./ErasmusSections";

const RELATED = [{ label: "Staj İşlemleri", href: "/egitim/staj", icon: Briefcase }];

function Sidebar() {
  return (
    <div className="flex flex-col gap-6">
      <ErasmusSidebarCards />
      <RelatedPages items={RELATED} />
      <QuickLinks external title="Kurumsal Sistemler" />
    </div>
  );
}

export default function ErasmusPage({ initialStaff = [] }) {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{
              tr: "Erasmus+",
              en: "Erasmus+",
            }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Değişim programları, bölüm koordinatörleri ve ikili anlaşmalar",
              en: "Exchange programs, department coordinators and bilateral agreements",
            }}
          />
        }
      />
      <PageLayout sidebar={<Sidebar />}>
        <div className="flex flex-col gap-8">
          <Coordinators initialStaff={initialStaff} />
          <Agreements />
          <ErasmusInternship />
        </div>
      </PageLayout>
    </>
  );
}
