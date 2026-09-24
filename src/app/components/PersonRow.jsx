"use client";

import { Mail } from "lucide-react";
import { useCmsRoute } from "inscribed";
import { useCollection } from "inscribed/collections";

import Link from "./LocaleLink";
import Avatar from "./Avatar";
import { contactLine, fullName, localizePerson } from "@/lib/person";
import { useT } from "@/i18n/useT";

export const STAFF_WINDOW = { limit: 100 };

export function staffKey(value) {
  return String(value ?? "")
    .trim()
    .split("@")[0]
    .toLocaleLowerCase("tr");
}

export { fullName };

export function useStaff(initial = []) {
  const { locale } = useCmsRoute();
  const { items, isLoading, error } = useCollection("staff", STAFF_WINDOW);
  const people = (items ?? []).map((item) => ({
    ...item.data,
    slug: item.slug,
  }));
  const roster = (people.length > 0 ? people : initial).map((person) => localizePerson(person, locale));
  return { people: roster, isLoading, error };
}

export function findPerson(people, id) {
  const key = staffKey(id);
  return people.find((person) => staffKey(person.email) === key);
}

export function PersonName({ person, className = "" }) {
  const t = useT();
  const title = person?.academicTitle ? t(person.academicTitle) : "";
  const label = [title, fullName(person)].filter(Boolean).join(" ");
  if (!person?.slug) return <span className={className}>{label}</span>;
  return (
    <Link
      href={`/personel/${person.slug}`}
      className={`${className} hover:text-secondary-700 hover:underline underline-offset-2 transition-colors`}
    >
      {label}
    </Link>
  );
}

export default function PersonRow({ id, idx = 0, staff = [] }) {
  const { people } = useStaff(staff);
  const person = findPerson(people, id);
  const t = useT();
  if (!person) return null;

  const name = fullName(person);

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary-500/2 border border-primary-500/5">
      <Avatar name={name} photo={person.photo} idx={idx} />
      <span className="min-w-0 flex-1">
        <PersonName
          person={person}
          className="block text-[13px] font-medium text-primary-500 leading-snug wrap-break-word"
        />
        {contactLine(person, t) && (
          <span className="block text-[11px] text-primary-500/70 wrap-break-word">
            {contactLine(person, t)}
          </span>
        )}
      </span>
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          aria-label={t("{name} kişisine e-posta gönder", { name })}
          className="shrink-0 flex items-center justify-center size-7 rounded-lg text-primary-500/70 hover:bg-secondary-500/10 hover:text-secondary-700 transition-colors"
        >
          <Mail className="size-3.5" />
        </a>
      )}
    </div>
  );
}
