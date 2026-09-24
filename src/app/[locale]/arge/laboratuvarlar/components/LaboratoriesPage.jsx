import { EditableRegion } from "inscribed";

import PageLayout from "@/app/components/PageLayout";
import SubHeader from "@/app/components/Header/SubHeader";
import PendingContent from "@/app/components/PendingContent";
import LaboratoryList from "./LaboratoryList";

export default function LaboratoriesPage() {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Laboratuvarlar", en: "Laboratories" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Bölüm laboratuvarları ve donanımları",
              en: "Department laboratories and equipment",
            }}
          />
        }
      />
      <PageLayout>
        <div className="flex flex-col gap-8">
          <LaboratoryList />

          <PendingContent>
            <EditableRegion
              blockPath="pending.body"
              blockType="LongText"
              defaultValue={{
                tr: "Laboratuvar donanım ve yazılım envanteri güncellenmektedir. Ayrıntılı bilgi için bölüm sekreterliğine başvurabilirsiniz.",
                en: "The laboratory hardware and software inventory is being updated. For detailed information, you can contact the Department Secretariat.",
              }}
            />
          </PendingContent>
        </div>
      </PageLayout>
    </>
  );
}
