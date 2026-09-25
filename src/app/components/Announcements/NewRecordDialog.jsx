"use client";

import { useEffect, useId, useState } from "react";
import Link from "@/app/components/LocaleLink";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus } from "lucide-react";
import { useMyCollections } from "inscribed/collections";
import { useCmsRoute } from "inscribed";
import {
  LanguageChips,
  MultilingualFields,
  useCreateDraftRole,
  useMultilingualCreate,
} from "inscribed/compose";

import Modal from "@/app/components/Modal";
import RecordPreview from "./RecordPreview";
import { useIsEditor } from "@/app/lib/cms-provider.jsx";
import { useLocaleNav } from "@/i18n/useLocaleNav";
import { useT } from "@/i18n/useT";

const PANES = [
  { id: "form", label: "Form" },
  { id: "preview", label: "Önizleme" },
];

export default function NewRecordDialog({ collection, page, label, title, submitLabel }) {
  const t = useT();
  const isEditor = useIsEditor();
  const router = useRouter();
  const { href } = useLocaleNav();
  const [open, setOpen] = useState(false);

  if (!isEditor) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-secondary-500/10 px-3 py-1.5 text-[12px] font-medium text-secondary-700 transition-colors hover:bg-secondary-500/15"
      >
        <Plus className="size-3.5" />
        {t(label)}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label={t(title)}
        dismissible={false}
        contentClassName="flex items-start justify-center px-3 py-14 sm:px-6"
      >
        <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex shrink-0 items-center gap-3 border-b border-primary-500/8 px-5 py-3.5">
            <h2 className="flex-1 text-sm font-semibold text-primary-600">{t(title)}</h2>
            <Link
              href={href(page)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-500/70 transition-colors hover:text-secondary-700"
            >
              {t("Sayfada aç")}
              <ExternalLink className="size-3" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-primary-500/70 transition-colors hover:bg-primary-500/5 hover:text-primary-500"
            >
              {t("Vazgeç")}
            </button>
          </div>

          <Composer
            collection={collection}
            submitLabel={submitLabel}
            onCreated={(item) => {
              setOpen(false);
              router.push(href(`${page.replace(/\/yeni$/, "")}/${item.slug}`));
            }}
          />
        </div>
      </Modal>
    </>
  );
}

function Composer({ collection, submitLabel, onCreated }) {
  const t = useT();
  const { collections, isLoading } = useMyCollections();
  const meta = collections.find((entry) => entry.collectionKey === collection);

  if (isLoading) {
    return <p className="p-5 text-[12px] text-primary-500/70">{t("Yükleniyor…")}</p>;
  }

  if (!meta?.schema || !meta.canCreate) {
    return (
      <p className="p-5 text-[13px] text-primary-500/70">
        {t("Bu koleksiyonda kayıt oluşturma yetkiniz yok.")}
      </p>
    );
  }

  return (
    <ComposerPanes
      key={collection}
      collectionKey={collection}
      schema={meta.schema}
      locales={meta.locales}
      submitLabel={submitLabel}
      onCreated={onCreated}
    />
  );
}

function ComposerPanes({ collectionKey, schema, locales, submitLabel, onCreated }) {
  const t = useT();
  const { locale } = useCmsRoute();
  const [pane, setPane] = useState("form");
  const languages = locales?.length ? locales : [locale];
  const primary = languages.includes(locale) ? locale : languages[0];
  const [previewLocale, setPreviewLocale] = useState(primary);
  const scopeId = useId();
  const isDraftWriter = useCreateDraftRole(collectionKey, scopeId);
  const create = useMultilingualCreate({
    collectionKey,
    schema,
    languages,
    primary,
    active: isDraftWriter,
  });

  const primaryValues = create.valuesFor(primary);
  const shownLocale = create.added.includes(previewLocale) ? previewLocale : primary;
  const several = create.added.length > 1;

  useEffect(() => {
    if (
      schema?.fields?.some((f) => f.name === "publishedAt") &&
      primaryValues &&
      !primaryValues.publishedAt &&
      !create.hasServerDraft
    ) {
      const now = new Date();
      now.setSeconds(0, 0);
      create.setField(primary, "publishedAt", now.toISOString());
    }
  }, [schema, primaryValues, create, primary]);

  return (
    <>
      <div className="flex shrink-0 gap-1 border-b border-primary-500/8 px-5 py-2 lg:hidden">
        {PANES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setPane(entry.id)}
            className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              pane === entry.id
                ? "bg-secondary-500/10 text-secondary-700"
                : "text-primary-500/70 hover:bg-primary-500/5"
            }`}
          >
            {t(entry.label)}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-2">
        <div
          className={`min-h-0 overflow-y-auto overscroll-contain p-5 lg:block ${
            pane === "form" ? "block" : "hidden"
          }`}
        >
          {languages.length > 1 && (
            <div className="mb-4">
              <LanguageChips
                languages={languages}
                added={create.added}
                statusOf={create.statusOf}
                hasDraft={create.hasDraft}
                onAdd={create.add}
                onRemove={create.remove}
                disabled={create.isPending}
              />
            </div>
          )}
          <MultilingualFields fields={schema.fields} create={create} needsSlug={false} />
        </div>

        <div
          className={`min-h-0 overflow-y-auto overscroll-contain bg-primary-500/3 p-5 lg:block lg:border-l lg:border-primary-500/8 ${
            pane === "preview" ? "block" : "hidden"
          }`}
        >
          {several && (
            <div role="group" aria-label={t("Önizleme dili")} className="mb-3 flex gap-1">
              {create.added.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPreviewLocale(code)}
                  aria-pressed={shownLocale === code}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold uppercase transition-colors ${
                    shownLocale === code
                      ? "bg-secondary-500/12 text-secondary-700"
                      : "text-primary-500/60 hover:bg-primary-500/5 hover:text-primary-500"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
          <RecordPreview values={create.valuesFor(shownLocale)} collection={collectionKey} />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-primary-500/8 px-5 py-3">
        {create.error && (
          <p role="alert" className="flex-1 text-[12px] leading-snug text-red-700">
            {create.error}
          </p>
        )}
        <div className="ml-auto flex items-center gap-2">
          {create.hasServerDraft && (
            <button
              type="button"
              onClick={create.discard}
              disabled={create.isPending}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium text-primary-500/70 transition-colors hover:bg-primary-500/5 hover:text-primary-500 disabled:opacity-40"
            >
              {t("Taslağı temizle")}
            </button>
          )}
          <button
            type="button"
            onClick={() => create.submit(onCreated)}
            disabled={create.isPending}
            className="rounded-md bg-secondary-500/10 px-4 py-1.5 text-[12px] font-medium text-secondary-700 transition-colors hover:bg-secondary-500/15 disabled:opacity-40"
          >
            {create.isPending
              ? t("Kaydediliyor…")
              : several
                ? `${t(submitLabel)} (${create.added.map((code) => code.toUpperCase()).join(", ")})`
                : t(submitLabel)}
          </button>
        </div>
      </div>
    </>
  );
}
