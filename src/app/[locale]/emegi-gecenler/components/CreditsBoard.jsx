"use client";

import { EditableList, EditableRegion } from "inscribed";

import CartesianField from "./CartesianField";
import HeartCurve, { HeartMark } from "./HeartCurve";
import CreditCard from "./CreditCard";

const CELLS = [
  {
    place: "lg:col-start-1 lg:row-start-1 lg:justify-self-end lg:self-end",
    coord: "−, +",
    mark: "lg:left-auto lg:right-3 lg:top-auto lg:bottom-3",
  },
  {
    place: "lg:col-start-2 lg:row-start-1 lg:justify-self-start lg:self-end",
    coord: "+, +",
    mark: "lg:right-auto lg:left-3 lg:top-auto lg:bottom-3",
  },
  {
    place: "lg:col-start-1 lg:row-start-2 lg:justify-self-end lg:self-start",
    coord: "−, −",
    mark: "lg:left-auto lg:right-3",
  },
  {
    place: "lg:col-start-2 lg:row-start-2 lg:justify-self-start lg:self-start",
    coord: "+, −",
    mark: "lg:right-auto lg:left-3",
  },
];

export default function CreditsBoard() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] w-full flex-col items-center overflow-hidden bg-linear-to-b from-primary-500 from-82% to-primary-600 px-4 py-16">
      <div className="relative z-10 shrink-0 text-center">
        <EditableRegion
          blockPath="credits.title"
          blockType="ShortText"
          defaultValue={{ tr: "Emeği Geçenler", en: "Credits" }}
          as="h1"
          className="text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl"
        />
        <EditableRegion
          blockPath="credits.subtitle"
          blockType="ShortText"
          defaultValue={{ tr: "Bu siteyi dört kişi yaptı", en: "This website was built by four people" }}
          as="p"
          className="mt-2 text-[13px] text-neutral-400"
        />
        <EditableRegion
          blockPath="credits.intro"
          blockType="LongText"
          defaultValue=""
          as="p"
          className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-neutral-500 empty:hidden"
        />
      </div>

      <HeartMark />

      <div className="relative flex w-full flex-1 items-center justify-center mt-10 lg:mt-14">
        <CartesianField />
        <HeartCurve />

        <EditableList
          blockPath="credits.people"
          as="div"
          className="relative z-10 grid w-full max-w-4xl grid-cols-1 justify-items-center gap-6 lg:grid-cols-2 lg:grid-rows-2 lg:gap-x-28 lg:gap-y-24"
          style={{ display: "grid" }}
          itemSchema={{
            name: { blockType: "ShortText", defaultValue: "" },
            role: { blockType: "ShortText", defaultValue: "" },
            about: { blockType: "LongText", defaultValue: "" },
            photo: { blockType: "Image", defaultValue: null },
            github: { blockType: "Link", defaultValue: { href: "", label: "" } },
            linkedin: { blockType: "Link", defaultValue: { href: "", label: "" } },
            site: { blockType: "Link", defaultValue: { href: "", label: "" } },
            mail: { blockType: "Link", defaultValue: { href: "", label: "" } },
          }}
          defaultValue={{
            tr: [
              {
                name: "Kaan Necip Kalp",
                role: "Frontend & Tasarım",
                photo: null,
              },
              {
                name: "Egehan",
                role: "Veri Katmanı & CMS",
                photo: null,
              },
              {
                name: "Yusuf Acımacı",
                role: "Backend",
                photo: null,
              },
              {
                name: "Fatih Naz",
                role: "İçerik Yönetim Sistemi",
                photo: null,
              },
            ],
            en: [
              {
                name: "Kaan Necip Kalp",
                role: "Frontend & Design",
                photo: null,
              },
              {
                name: "Egehan",
                role: "Data Layer & CMS",
                photo: null,
              },
              {
                name: "Yusuf Acımacı",
                role: "Backend",
                photo: null,
              },
              {
                name: "Fatih Naz",
                role: "Content Management System",
                photo: null,
              },
            ],
          }}
        >
          {(person, index) => {
            const cell = CELLS[index] ?? CELLS[0];
            return (
              <div key={index} className={`flex w-full justify-center ${cell.place}`}>
                <CreditCard
                  person={person}
                  idx={index}
                  coord={cell.coord}
                  markClassName={cell.mark}
                />
              </div>
            );
          }}
        </EditableList>
      </div>
    </section>
  );
}
