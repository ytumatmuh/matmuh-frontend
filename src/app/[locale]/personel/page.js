import { EditableRegion } from "inscribed";

import SubHeader from "@/app/components/Header/SubHeader";
import { getStaff } from "@/app/lib/staff.js";
import StaffPage from "./components/StaffPage";

export const metadata = {
  title: "Personel",
  description:
    "Matematik Mühendisliği Bölümü yönetimi, akademik kadro, araştırma görevlileri ve idari personel.",
};

export default async function PersonnelPage() {
  const initialStaff = await getStaff();

  return (
    <>
      <SubHeader
        title={
          <EditableRegion
            blockPath="page.title"
            blockType="ShortText"
            defaultValue={{ tr: "Akademik Personel", en: "Academic Staff" }}
          />
        }
        subTitle={
          <EditableRegion
            blockPath="page.subtitle"
            blockType="ShortText"
            defaultValue={{
              tr: "Bölüm akademik ve idari kadro listesi",
              en: "Department academic and administrative staff list",
            }}
          />
        }
      />
      <StaffPage initialStaff={initialStaff} />
    </>
  );
}
