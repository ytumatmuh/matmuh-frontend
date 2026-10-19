import SubHeader from "@/app/components/Header/SubHeader";
import { translate } from "@/i18n";
import SignInPanel from "./components/SignInPanel";

export const metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
};

export default async function Page({ params, searchParams }) {
  const { locale } = await params;
  const { error } = await searchParams;
  const label = translate(locale, "Yönetici Girişi");

  return (
    <>
      <SubHeader title={label} lastLabel={label} />
      <SignInPanel failed={Boolean(error)} />
    </>
  );
}
