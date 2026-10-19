import LegalPage from "@/app/components/LegalPage";

export const metadata = {
  title: "Gizlilik Politikası",
  description:
    "Matematik Mühendisliği Bölümü web sitesinin topladığı veriler, çerez kullanımı ve saklama süreleri.",
};

const BODY = `
<p>Bu sayfa, Yıldız Teknik Üniversitesi Matematik Mühendisliği Bölümü web sitesinin hangi verileri topladığını ve bunları nasıl kullandığını açıklar. Üniversitenin genel gizlilik ve KVKK metinleri yandaki bağlantılardan okunabilir; buradaki metin yalnızca bu sitenin kendi işleyişini anlatır.</p>
<h2>Toplanan veriler</h2>
<p>Siteyi gezen ziyaretçilerden hiçbir kişisel veri toplanmaz. Giriş yalnızca site içeriğini düzenlemek içindir; üniversite hesabıyla giriş yapıldığında ad-soyad ve e-posta adresi görüntülenir. Bu bilgiler üniversitenin kimlik doğrulama sisteminden gelir.</p>
<h2>Çerezler</h2>
<p>Site yalnızca oturum açmak için gereken zorunlu çerezleri kullanır. Reklam, ölçümleme veya izleme amaçlı hiçbir çerez ya da üçüncü taraf izleyici bulunmaz.</p>
<h2>İletişim</h2>
<p>Verilerinizle ilgili talepleriniz için bölüm ile iletişime geçebilirsiniz.</p>
`;

export default function Page() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      subtitle="Bu sitenin topladığı veriler, çerez kullanımı ve saklama süreleri"
      body={BODY.trim()}
    />
  );
}
