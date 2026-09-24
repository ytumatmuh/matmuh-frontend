import { Mail } from "lucide-react";
import { EditableRegion } from "inscribed";

import { FooterLinks, FooterPhones, FooterSocial } from "./FooterLists";
import CreditsLink from "./CreditsLink";
import LegalLinks from "./LegalLinks";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="bg-primary-600 -mt-px">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-10 flex flex-col md:flex-row md:justify-between gap-10">
          <div>
            <h2 className="text-white font-semibold text-xs uppercase tracking-wide mb-4">
              <EditableRegion
                blockPath="footer.address.title"
                blockType="ShortText"
                defaultValue={{ tr: "Adres", en: "Address" }}
                scope="global"
              />
            </h2>
            <div className="text-neutral-400 text-xs font-light leading-relaxed">
              <EditableRegion
                blockPath="footer.address.body"
                blockType="LongText"
                defaultValue={{
                  tr: `Yıldız Teknik Üniversitesi
Matematik Mühendisliği Bölümü
Davutpaşa Kampüsü
34220 Esenler, İstanbul`,
                  en: `Yildiz Technical University
Department of Mathematical Engineering
Davutpaşa Campus
34220 Esenler, Istanbul`,
                }}
                scope="global"
                as="p"
              />
            </div>
          </div>

          <div>
            <h2 className="text-white font-semibold text-xs uppercase tracking-wide mb-4">
              <EditableRegion
                blockPath="footer.contact.title"
                blockType="ShortText"
                defaultValue={{ tr: "İletişim", en: "Contact" }}
                scope="global"
              />
            </h2>
            <div className="text-neutral-400 text-xs font-light space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0" />
                <EditableRegion
                  blockPath="footer.contact.email"
                  blockType="Link"
                  defaultValue={{ href: "mailto:mtmblm@yildiz.edu.tr", label: "mtmblm@yildiz.edu.tr" }}
                  scope="global"
                  className="hover:text-white transition-colors"
                />
              </div>
              <FooterPhones />
            </div>
          </div>

          <div>
            <h2 className="text-white font-semibold text-xs uppercase tracking-wide mb-4">
              <EditableRegion
                blockPath="footer.links.title"
                blockType="ShortText"
                defaultValue={{ tr: "Bağlantılar", en: "Links" }}
                scope="global"
              />
            </h2>
            <div className="text-neutral-400 text-xs font-light">
              <FooterLinks />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <div className="text-neutral-500 text-xs text-center sm:text-left">
            © {new Date().getFullYear()}{" "}
            <EditableRegion
              blockPath="footer.copyright"
              blockType="ShortText"
              defaultValue={{ tr: "Yıldız Teknik Üniversitesi · Matematik Mühendisliği Bölümü", en: "Yıldız Technical University · Department of Mathematical Engineering" }}
              scope="global"
            />
            {" · "}
            <CreditsLink />
            <LegalLinks />
          </div>

          <FooterSocial />
        </div>
      </div>
    </footer>
  );
}
