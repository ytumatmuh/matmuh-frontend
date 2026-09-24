import { EditableRegion } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import PageSection from "@/app/components/PageSection";
import PendingContent from "@/app/components/PendingContent";
import ResearchLinks from "./ResearchLinks";

export default function ProjectsPage() {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Devam Eden Projeler", en: "Ongoing Projects" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Bölümde yürütülen araştırma projeleri",
              en: "Research projects conducted in the department",
            }}
          />
        }
      />
      <PageLayout>
        <div className="flex flex-col gap-8">
          <PendingContent>
            <EditableRegion
              blockPath="pending.body"
              blockType="LongText"
              defaultValue={{
                tr: "Devam eden proje listesi güncellenmektedir. Bölüm öğretim üyelerinin yürüttüğü güncel projelere aşağıdaki kaynaklardan ulaşabilirsiniz.",
                en: "The list of ongoing projects is being updated. You can access current projects conducted by department faculty members from the sources below.",
              }}
            />
          </PendingContent>

          <PageSection
            title={
              <EditableRegion
                blockPath="resources.title"
                blockType="ShortText"
                defaultValue={{ tr: "Proje Kaynakları", en: "Project Resources" }}
              />
            }
          >
            <ResearchLinks />
          </PageSection>
        </div>
      </PageLayout>
    </>
  );
}
