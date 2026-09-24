"use client";

import { Phone, ExternalLink, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { EditableList } from "inscribed";

import { safeHref, isExternalHref } from "@/lib/href";

export function FooterPhones() {
  return (
    <EditableList
      blockPath="footer.contact.phones"
      scope="global"
      as="div"
      className="space-y-3"
      itemSchema={{
        number: { blockType: "ShortText", defaultValue: "" },
        note: { blockType: "ShortText", defaultValue: "" },
      }}
      defaultValue={{
        tr: [
          {
            number: "+90 (212) 383 45 90",
            note: "Bölüm Başkanlığı",
          },
          {
            number: "+90 (212) 383 45 92",
            note: "Bölüm Öğrenci İşleri",
          },
          {
            number: "+90 (212) 383 45 91",
            note: "Bölüm Sekreterliği",
          },
        ],
        en: [
          {
            number: "+90 (212) 383 45 90",
            note: "Department Head's Office",
          },
          {
            number: "+90 (212) 383 45 92",
            note: "Department Student Affairs",
          },
          {
            number: "+90 (212) 383 45 91",
            note: "Department Secretariat",
          },
        ],
      }}
    >
      {(item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Phone size={14} className="shrink-0" />
          <span>
            {item.number}
            {item.note ? ` (${item.note})` : ""}
          </span>
        </div>
      )}
    </EditableList>
  );
}

export function FooterLinks() {
  return (
    <EditableList
      blockPath="footer.links.items"
      scope="global"
      as="div"
      className="space-y-3"
      itemSchema={{
        link: { blockType: "Link", defaultValue: { href: "", label: "" } },
      }}
      defaultValue={{
        tr: [
          {
            link: {
              href: "https://www.yildiz.edu.tr",
              label: "YTÜ Ana Sayfa",
            },
          },
          {
            link: {
              href: "https://kmf.yildiz.edu.tr",
              label: "Kimya-Metalurji Fakültesi",
            },
          },
          {
            link: {
              href: "https://ois.yildiz.edu.tr",
              label: "Öğrenci İşleri",
            },
          },
          {
            link: {
              href: "https://kutuphane.yildiz.edu.tr",
              label: "Kütüphane",
            },
          },
        ],
        en: [
          {
            link: {
              href: "https://www.yildiz.edu.tr",
              label: "YTU Homepage",
            },
          },
          {
            link: {
              href: "https://kmf.yildiz.edu.tr",
              label: "Faculty of Chemical and Metallurgical Engineering",
            },
          },
          {
            link: {
              href: "https://ois.yildiz.edu.tr",
              label: "Student Affairs",
            },
          },
          {
            link: {
              href: "https://kutuphane.yildiz.edu.tr",
              label: "Library",
            },
          },
        ],
      }}
    >
      {(item, index) => {
        const href = safeHref(item.link?.href);
        const external = isExternalHref(href);
        return (
          <a
            key={index}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="block hover:text-white transition-colors min-h-[1.25rem]"
          >
            {item.link?.label || "\u00A0"}
          </a>
        );
      }}
    </EditableList>
  );
}

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

export function FooterSocial() {
  return (
    <EditableList
      blockPath="footer.social.items"
      scope="global"
      as="div"
      className="flex items-center gap-4 shrink-0"
      style={{ display: "flex" }}
      itemSchema={{
        platform: { blockType: "ShortText", defaultValue: "" },
        label: { blockType: "ShortText", defaultValue: "" },
        link: { blockType: "Link", defaultValue: { href: "", label: "" } },
      }}
      defaultValue={{
        tr: [
          {
            platform: "facebook",
            label: "YTÜ Facebook",
            link: {
              href: "https://www.facebook.com/YildizEdu",
              label: "Facebook",
            },
          },
          {
            platform: "instagram",
            label: "YTÜ Instagram",
            link: {
              href: "https://www.instagram.com/yildizedu",
              label: "Instagram",
            },
          },
          {
            platform: "x",
            label: "YTÜ X",
            link: {
              href: "https://x.com/YildizEdu",
              label: "X",
            },
          },
          {
            platform: "linkedin",
            label: "YTÜ LinkedIn",
            link: {
              href: "https://www.linkedin.com/school/15100152",
              label: "LinkedIn",
            },
          },
          {
            platform: "youtube",
            label: "YTÜ YouTube",
            link: {
              href: "https://www.youtube.com/channel/UC2qKn25cUwpgBK6O1tGPjkA",
              label: "YouTube",
            },
          },
        ],
        en: [
          {
            platform: "facebook",
            label: "YTU Facebook",
            link: {
              href: "https://www.facebook.com/YildizEdu",
              label: "Facebook",
            },
          },
          {
            platform: "instagram",
            label: "YTU Instagram",
            link: {
              href: "https://www.instagram.com/yildizedu",
              label: "Instagram",
            },
          },
          {
            platform: "x",
            label: "YTU X",
            link: {
              href: "https://x.com/YildizEdu",
              label: "X",
            },
          },
          {
            platform: "linkedin",
            label: "YTU LinkedIn",
            link: {
              href: "https://www.linkedin.com/school/15100152",
              label: "LinkedIn",
            },
          },
          {
            platform: "youtube",
            label: "YTU YouTube",
            link: {
              href: "https://www.youtube.com/channel/UC2qKn25cUwpgBK6O1tGPjkA",
              label: "YouTube",
            },
          },
        ],
      }}
    >
      {(item, index) => {
        const Icon = SOCIAL_ICONS[item.platform] ?? ExternalLink;
        const href = safeHref(item?.link?.href);
        return (
          <a
            key={index}
            href={href}
            target={isExternalHref(href) ? "_blank" : undefined}
            rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
            aria-label={item.label}
            title={item.label}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <Icon size={16} />
          </a>
        );
      }}
    </EditableList>
  );
}
