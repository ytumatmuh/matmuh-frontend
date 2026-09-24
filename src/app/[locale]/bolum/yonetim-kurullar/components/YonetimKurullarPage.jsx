import { EditableRegion } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import Panel from "@/app/components/Panel";
import PageSection from "@/app/components/PageSection";
import AdvisoryBoard from "./AdvisoryBoard";
import ManagementRows from "./ManagementRows";

export default function YonetimKurullarPage({ initialStaff = [] }) {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Yönetim & Kurullar", en: "Management & Boards" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Bölüm yönetimi ve Danışma Kurulu",
              en: "Department administration and Advisory Board",
            }}
          />
        }
      />
      <PageLayout>
        <div className="flex flex-col gap-8">
          <PageSection
            title={
              <EditableRegion
                blockPath="management.title"
                blockType="ShortText"
                defaultValue={{ tr: "Bölüm Yönetimi", en: "Department Administration" }}
              />
            }
          >
            <Panel>
              <ManagementRows initialStaff={initialStaff} />
            </Panel>
          </PageSection>

          <AdvisoryBoard />
        </div>
      </PageLayout>
    </>
  );
}
