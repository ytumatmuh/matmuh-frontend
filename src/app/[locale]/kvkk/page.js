import LegalPage from "@/app/components/LegalPage";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Matematik Mühendisliği Bölümü web sitesine ilişkin aydınlatma metni.",
};

const BODY = `
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, Yıldız Teknik Üniversitesi Matematik Mühendisliği Bölümü web sitesi üzerinden işlenen kişisel verilere ilişkin aydınlatma metnidir. Üniversitenin genel aydınlatma metni yandaki bağlantıdan okunabilir.</p>
<h2>Veri sorumlusu</h2>
<p>Yıldız Teknik Üniversitesi</p>
<h2>İşlenen kişisel veriler</h2>
<p>Siteye giriş yapan kullanıcıların kimlik ve iletişim bilgileri (ad-soyad, e-posta adresi) işlenir.</p>
<h2>İşleme amacı</h2>
<p>Veriler, siteye giriş yapan kullanıcının kimliğinin doğrulanması ve içerik düzenleme yetkisinin belirlenmesi amacıyla işlenir.</p>
<h2>Aktarım</h2>
<p>Kişisel veriler üçüncü kişilerle paylaşılmaz.</p>
<h2>Haklarınız</h2>
<p>Kanunun 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.</p>
<h2>Başvuru</h2>
<p>Bu haklarınıza ilişkin taleplerinizi üniversitenin aydınlatma metninde belirtilen kanallardan iletebilirsiniz.</p>
`;

export default function Page() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme"
      body={BODY.trim()}
    />
  );
}
