import CommissionsPage from "./components/CommissionsPage";
import { getStaff } from "@/app/lib/staff.js";

export const metadata = {
  title: "Komisyonlar",
  description: "Matematik Mühendisliği Bölümü komisyonları ve üyeleri.",
};

export default async function Page() {
  return <CommissionsPage initialStaff={await getStaff()} />;
}
