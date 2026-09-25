import { getCurriculum } from "@/data/curriculum";

import CurriculumPage from "./components/CurriculumPage";

export const metadata = {
  title: "Müfredat & Dersler",
  description: "Matematik Mühendisliği Bölümü lisans programı ders planı ve kredi bilgileri",
};

export default async function Page({ params }) {
  const { locale } = await params;
  const semesters = await getCurriculum(locale);
  return <CurriculumPage semesters={semesters} />;
}
