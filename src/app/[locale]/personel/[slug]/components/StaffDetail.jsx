import { CalendarOff, Clock, Mail, ExternalLink, Phone, MapPin } from "lucide-react";

import Avatar from "@/app/components/Avatar";
import MainCard from "@/app/components/MainCard";
import PageLayout from "@/app/components/PageLayout";
import PageSection from "@/app/components/PageSection";
import StaffSchedule from "./StaffSchedule";
import StaffOfferings from "./StaffOfferings";
import { DAY_KEYS, DAYS } from "@/data/schedule-grid";
import { fullName } from "@/lib/person";
import { safeHref } from "@/lib/href";
import { translate } from "@/i18n";

const LINE = "flex items-center gap-2.5 text-[13px] text-primary-500/70";

function Contact({ person, locale }) {
  const avesis = safeHref(person.avesisLink);
  const office = person.office ?? "";
  const isRoom = office && (office.includes("-") || /^\d+$/.test(office));

  return (
    <div className="flex flex-col gap-2.5">
      {office && (
        <span className={LINE}>
          <MapPin className="size-4 shrink-0 text-secondary-700" />
          {isRoom ? `${translate(locale, "Oda")} ${office}` : office}
        </span>
      )}
      {person.phone && (
        <span className={LINE}>
          <Phone className="size-4 shrink-0 text-secondary-700" />
          {person.phone}
        </span>
      )}
      {person.email && (
        <a className={`${LINE} hover:text-secondary-700 transition-colors`} href={`mailto:${person.email}`}>
          <Mail className="size-4 shrink-0 text-secondary-700" />
          <span className="break-all">{person.email}</span>
        </a>
      )}
      {avesis && (
        <a
          className={`${LINE} hover:text-secondary-700 transition-colors`}
          href={avesis}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="size-4 shrink-0 text-secondary-700" />
          {translate(locale, "AVESİS profili")}
        </a>
      )}
    </div>
  );
}

const dayIndex = (key) => {
  const index = DAY_KEYS.indexOf(key);
  return index === -1 ? DAY_KEYS.length : index;
};

function OfficeHours({ hours, locale }) {
  const rows = [...(hours ?? [])]
    .filter((hour) => hour?.dayOfWeek && hour.startTime && hour.endTime)
    .sort((a, b) => dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));

  if (rows.length === 0) return null;

  return (
    <div className="mt-5 border-t border-primary-500/10 pt-5">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
        <Clock className="size-3.5 text-secondary-700" />
        {translate(locale, "Görüşme Saatleri")}
      </h3>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((hour, index) => (
          <li key={index} className="flex flex-col gap-0.5 text-[13px]">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-primary-600">
                {translate(locale, DAYS[dayIndex(hour.dayOfWeek)] ?? "Pazar")}
              </span>
              <span className="shrink-0 font-mono text-[12px] text-primary-500/80">
                {hour.startTime.slice(0, 5)}–{hour.endTime.slice(0, 5)}
              </span>
            </span>
            {hour.description && (
              <span className="text-[12px] leading-snug text-primary-500/70">{hour.description}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StaffDetail({ person, entries, term, locale }) {
  const name = fullName(person);

  const profile = (
    <div className="flex flex-col gap-5 lg:sticky lg:top-8">
      <MainCard title={translate(locale, "Profil")}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar
            name={name}
            photo={person.photo}
            idx={0}
            size="h-24 w-24 shrink-0"
            textSize="font-sans text-xl tracking-wider"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-primary-600 wrap-break-word">
              {person.academicTitle} {name}
            </h2>
            {person.role && (
              <p className="mt-1 text-[12px] font-medium text-secondary-700">
                {person.role}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 border-t border-primary-500/10 pt-5">
          <Contact person={person} locale={locale} />
        </div>
        <OfficeHours hours={person.officeHours} locale={locale} />
      </MainCard>
    </div>
  );

  return (
    <PageLayout sidebar={profile} sidebarFirst>
      <div className="flex flex-col gap-8">
        <PageSection title={translate(locale, "Haftalık Ders Programı")}>
          {entries.length > 0 ? (
            <StaffSchedule entries={entries} />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-primary-500/20 px-4 py-8 text-center text-sm font-medium text-primary-500/70">
              <CalendarOff size={18} strokeWidth={1.5} className="text-primary-500/70" />
              {translate(locale, "Bu dönem için ders programı girilmemiş.")}
            </div>
          )}
        </PageSection>

        {entries.length > 0 && (
          <PageSection title={translate(locale, "Verdiği Dersler")}>
            <StaffOfferings entries={entries} term={term} />
          </PageSection>
        )}
      </div>
    </PageLayout>
  );
}
