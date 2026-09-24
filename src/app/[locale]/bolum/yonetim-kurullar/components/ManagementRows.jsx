"use client";

import { Mail } from "lucide-react";

import Avatar from "@/app/components/Avatar";
import { PersonName, fullName, useStaff } from "@/app/components/PersonRow";
import { byLeadership, contactLine } from "@/lib/person";
import { useT } from "@/i18n/useT";

export default function ManagementRows({ initialStaff = [] }) {
  const t = useT();
  const { people } = useStaff(initialStaff);
  const management = people.filter((person) => person.groups?.includes("MANAGEMENT")).sort(byLeadership);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {management.map((person, idx) => {
        const name = fullName(person);
        return (
          <div
            key={person.slug}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-primary-500/2 border border-primary-500/5"
          >
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
      })}
    </div>
  );
}
