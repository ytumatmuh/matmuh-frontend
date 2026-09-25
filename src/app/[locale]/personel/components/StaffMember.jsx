import Link from "@/app/components/LocaleLink";
import { Mail, ExternalLink } from "lucide-react";

import Avatar from "@/app/components/Avatar";
import { safeHref } from "@/lib/href";
import { useT } from "@/i18n/useT";
import { fullName } from "@/app/components/PersonRow";

export default function StaffMember({ member, idx }) {
  const t = useT();
  const name = fullName(member);
  const avesisUrl = safeHref(member.avesisLink);
  const office = member.office ?? "";
  const isRoomNumber = office && (office.includes("-") || /^\d+$/.test(office));

  return (
    <div className="group relative cursor-pointer rounded-xl border border-primary-500/10 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-secondary-500/40 hover:bg-[color-mix(in_srgb,var(--color-secondary-500)_4%,white)]">
      <div className="flex flex-col items-center text-center">
        <Avatar
          name={name}
          photo={member.photo}
          idx={idx}
          size="mb-3 h-16 w-16 ring-2 ring-transparent ring-offset-2 ring-offset-white transition-shadow duration-200 group-hover:ring-secondary-500/45"
          textSize="font-sans text-base tracking-wider"
        />

        <Link
          href={`/personel/${member.slug}`}
          className="font-sans text-sm font-semibold text-primary-500 leading-tight transition-colors duration-200 group-hover:text-secondary-700 outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-secondary-500"
        >
          {member.academicTitle} {name}
        </Link>

        {member.role && (
          <div className="mt-1 font-sans text-xs font-semibold text-secondary-700 tracking-tight">
            {member.role}
          </div>
        )}

        {member.phone && (
          <div className="mt-2 pt-1 font-sans text-xs text-primary-500/70 leading-tight">
            {t("Tel:")} {member.phone}
          </div>
        )}

        {office && (
          <div className="mt-2">
            <span className="text-xs font-bold text-secondary-700 bg-secondary-500/10 px-2 py-1 rounded-md">
              {isRoomNumber ? `${t("Oda")}: ${office}` : office}
            </span>
          </div>
        )}

        <div className="relative z-10 mt-4 flex items-center gap-2">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              aria-label={t("{name} kişisine e-posta gönder", { name })}
              className="rounded-md p-1.5 text-primary-500/70 transition-all duration-200 hover:bg-secondary-500/10 hover:text-secondary-700"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail size={14} strokeWidth={2} />
            </a>
          )}

          {avesisUrl && (
            <a
              href={avesisUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} ${t("AVESİS")}`}
              className="rounded-md p-1.5 text-primary-500/70 transition-all duration-200 hover:bg-secondary-500/10 hover:text-secondary-700"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} strokeWidth={2} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
