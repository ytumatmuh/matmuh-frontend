import { getCurriculum } from "@/data/curriculum";

import CurriculumPage from "../mufredat/components/CurriculumPage";

export const metadata = {
  title: "Müfredat - Lisansüstü",
  description: "Matematik Mühendisliği Bölümü lisansüstü programı ders planı ve kredi bilgileri",
};

export default async function Page({ params }) {
  const { locale } = await params;
  const semesters = await getCurriculum(locale, true);
  return (
    <CurriculumPage
      semesters={semesters}
      title="Lisansüstü Müfredat"
      subTitle="Yüksek lisans programı ders planı ve kredi bilgileri"
    />
  );
}
