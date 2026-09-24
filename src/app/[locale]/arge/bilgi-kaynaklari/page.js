import { EditableRegion } from "inscribed";

import SubHeader from "@/app/components/Header/SubHeader";
import InformationSources from "./components/InformationSources";

export const metadata = {
  title: "Bilgi Kaynakları",
  description: "Bölümümüzün önerdiği e-kütüphane, veri tabanı ve akademik kaynak bağlantıları.",
};

export default function InformationSourcesPage() {
  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Bilgi Kaynakları", en: "Information Resources" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Eğitim ve araştırma süreçlerinizi destekleyen dijital kaynaklar",
              en: "Digital resources supporting your education and research processes",
            }}
          />
        }
      />
      <InformationSources />
    </>
  );
}
