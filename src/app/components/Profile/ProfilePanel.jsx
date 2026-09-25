"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "@/app/components/LocaleLink";
import {
  CalendarDays,
  Download,
  Eye,
  FileText,
  Info,
  MapPin,
  TriangleAlert,
  Wifi,
  X,
} from "lucide-react";

import Modal from "@/app/components/Modal";
import DocumentPreview, { canPreview } from "@/app/components/DocumentPreview";
import { deleteNote, noteTypeLabel } from "@/data/lecture-notes";
import { MyScheduleProvider, useMySchedule } from "@/data/useMySchedule";
import { buildIcs, downloadIcs } from "@/lib/calendar-export";
import CalendarExportMenu from "./CalendarExportMenu";
import WeeklySchedule from "@/app/[locale]/egitim/components/WeeklySchedule";
import { colorOf, courseColors } from "@/data/schedule-colors";
import { useAuth } from "@/lib/auth";
import { useLocaleNav } from "@/i18n/useLocaleNav";
import { useT } from "@/i18n/useT";
import { useCmsRoute } from "inscribed";
import { formatDate } from "@/lib/date";
import {
  NOTE_STATUS,
  fetchMyNotes,
  fetchMySchedule,
  scheduleDays,
  weekdayOf,
} from "@/data/profile";

function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-lg bg-primary-500/6"
        />
      ))}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-[13px] text-primary-500/70">
      <Info size={18} strokeWidth={1.5} className="text-primary-500/70" />
      {children}
    </div>
  );
}

function NoteThumb({ note }) {
  const t = useT();
  const [preview, setPreview] = useState(false);
  const kind = String(note.extension ?? "").toLowerCase();
  const previewable = canPreview(note.href, kind, note.previewHref);

  const face = (
    <>
      <FileText size={15} strokeWidth={1.5} className="text-primary-700" />
      <span className="text-[7px] font-bold tracking-wide text-primary-500/70">
        {note.extension}
      </span>
    </>
  );

  if (!previewable) {
    return (
      <span className="mt-0.5 flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-500/5">
        {face}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPreview(true)}
        aria-label={t("{title} dosyasını önizle", { title: note.title })}
        className="mt-0.5 flex size-9 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg bg-primary-500/5 transition-colors hover:bg-secondary-500/15"
      >
        {face}
      </button>
      <DocumentPreview
        open={preview}
        onClose={() => setPreview(false)}
        label={note.title}
        href={note.href}
        kind={kind}
        previewHref={note.previewHref}
      />
    </>
  );
}

const NOTE_FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "APPROVED", label: "Yayında" },
  { id: "PENDING", label: "Bekleyen" },
  { id: "REJECTED", label: "Reddedilen" },
];

function NotesBody({
  items,
  busyId,
  confirmId,
  onRemove,
  onConfirm,
  onNavigate,
}) {
  const t = useT();
  const { locale } = useCmsRoute();
  const { href } = useLocaleNav();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  if (items.length === 0) return <Empty>{t("Henüz not yüklemediniz.")}</Empty>;

  const needle = query.toLocaleLowerCase("tr");
  const shown = items.filter(
    (note) =>
      (status === "all" || note.status === status) &&
      (needle === "" ||
        `${note.title} ${note.lectureCode ?? ""}`
          .toLocaleLowerCase("tr")
          .includes(needle)),
  );

  return (
    <>
      {items.length > 3 && (
        <div className="sticky top-0 z-10 space-y-2 border-b border-primary-500/6 bg-white px-4 py-2.5">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Not veya ders kodu ara…")}
            aria-label={t("Notlarımda ara")}
            className="w-full rounded-lg border border-primary-500/10 bg-primary-500/2 px-3 py-1.5 text-[13px] text-primary-600 outline-none! focus:border-secondary-500/50"
          />
          <div className="flex flex-wrap gap-1.5">
            {NOTE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatus(filter.id)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  status === filter.id
                    ? "bg-secondary-500/12 text-secondary-700"
                    : "text-primary-500/70 hover:text-primary-500"
                }`}
              >
                {t(filter.label)}
              </button>
            ))}
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <Empty>{t("Bu koşullara uyan not yok.")}</Empty>
      ) : (
        <ul className="divide-y divide-primary-500/6">
          {shown.map((note) => {
            const badge = NOTE_STATUS[note.status] ?? NOTE_STATUS.PENDING;
            const draft = note.status !== "APPROVED";
            return (
              <li key={note.id} className="flex items-start gap-3 px-4 py-3">
                <NoteThumb note={note} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-primary-600">
                      {note.title}
                    </span>
                    <span
                      className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${badge.tone}`}
                    >
                      {t(badge.label)}
                    </span>
                    {note.type !== "OTHER" && noteTypeLabel(note.type) && (
                      <span className="rounded-sm bg-primary-500/6 px-1.5 py-0.5 text-[10px] font-semibold text-primary-500/70">
                        {t(noteTypeLabel(note.type))}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-primary-500/70">
                    {note.lectureCode && (
                      <>
                        <Link
                          href={href(`/egitim/mufredat/${note.lectureCode}`)}
                          onClick={onNavigate}
                          className="font-mono font-semibold text-secondary-700 hover:underline"
                        >
                          {note.lectureCode}
                        </Link>
                        <span aria-hidden>·</span>
                      </>
                    )}
                    {formatDate(note.createdAt, locale)}
                    {note.offering?.instructor && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="wrap-break-word">
                          {note.offering.instructor}
                        </span>
                      </>
                    )}
                    {note.status === "APPROVED" && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye size={11} strokeWidth={1.5} />
                          {note.viewCount} görüntülenme
                        </span>
                      </>
                    )}
                  </span>
                </span>

                {confirmId === note.id ? (
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onRemove(note)}
                      disabled={busyId === note.id}
                      className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
                    >
                      {busyId === note.id ? "…" : "Onayla"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfirm(null)}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-primary-500/70 transition-colors hover:text-primary-500"
                    >
                      {t("Vazgeç")}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      draft ? onRemove(note) : onConfirm(note.id)
                    }
                    className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-primary-500/70 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    {draft ? "İptal et" : "Kaldır"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function ScheduleEntry({ entry, conflict }) {
  const t = useT();
  return (
    <li
      className={`flex items-start gap-3 rounded-lg px-3 py-2 ${
        conflict ? "bg-white" : "bg-primary-500/2"
      }`}
    >
      <span className="shrink-0 font-mono text-[11px] text-secondary-700">
        {entry.startTime}
        <span className="block text-primary-500/70">{entry.endTime}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block wrap-break-word text-[13px] font-medium text-primary-600">
          {entry.lectureCode ? `${entry.lectureCode} · ` : ""}
          {entry.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-primary-500/70">
          {entry.online ? (
            <span className="inline-flex items-center gap-1">
              <Wifi size={11} strokeWidth={1.5} /> {t("Çevrimiçi")}
            </span>
          ) : entry.classroom ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} strokeWidth={1.5} /> {entry.classroom}
            </span>
          ) : null}
          {entry.staffName && (
            <span className="wrap-break-word">{entry.staffName}</span>
          )}
          {entry.examType && (
            <span className="rounded-sm bg-secondary-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-secondary-700">
              {t("Sınav")}
            </span>
          )}
        </span>
      </span>
    </li>
  );
}

function CalendarExportAction() {
  const t = useT();
  const { rows, entries, term } = useMySchedule();

  if (entries.length === 0 || !term?.startDate || !term?.endDate) return null;

  const download = () => {
    const text = buildIcs(entries, term, { t, name: t("YTÜ Ders Programım") });
    if (text) downloadIcs(text, `ders-programi-${term.academicYear ?? ""}.ics`);
  };

  return (
    <CalendarExportMenu
      offeringIds={rows.map((row) => row.offeringId).filter(Boolean)}
      onDownload={download}
    />
  );
}

function EnrolledCourses({ onChanged }) {
  const t = useT();
  const { rows, entries, busyId, remove } = useMySchedule();
  const palette = useMemo(() => courseColors(entries), [entries]);

  if (rows.length === 0) return null;

  const onRemove = async (offeringId) => {
    await remove(offeringId);
    onChanged?.();
  };

  return (
    <div className="border-b border-primary-500/8 px-4 py-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
        {t("Kayıtlı dersler")}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex max-w-full items-center gap-1.5 rounded-md border border-primary-500/10 bg-white py-1 pr-1 pl-2 text-[12px] text-primary-600"
            style={{ borderLeft: `2.5px solid ${colorOf(palette, row.lectureCode)}` }}
            title={[row.lectureCode, row.lectureName, row.groupNumber != null ? `Gr.${row.groupNumber}` : null]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="shrink-0 font-mono text-[11px] font-semibold text-secondary-700">
              {row.lectureCode}
            </span>
            {row.lectureName && <span className="hidden min-w-0 truncate sm:inline">{row.lectureName}</span>}
            {row.groupNumber != null && (
              <span className="shrink-0 font-mono text-[10.5px] text-primary-500/70">Gr.{row.groupNumber}</span>
            )}
            <button
              type="button"
              onClick={() => void onRemove(row.offeringId)}
              disabled={busyId === row.offeringId}
              aria-label={t("{course} dersini programdan kaldır", {
                course: row.lectureName || row.lectureCode,
              })}
              className="shrink-0 rounded-sm p-0.5 text-primary-500/70 transition-colors hover:bg-primary-500/8 hover:text-red-700 disabled:opacity-40"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeekGrid() {
  const t = useT();
  const { status, entries } = useMySchedule();

  if (status === "loading") return <Skeleton rows={3} />;
  if (entries.length === 0) {
    return <Empty>{t("Haftalık programınızda ders görünmüyor.")}</Empty>;
  }

  return (
    <div className="px-2 py-2">
      <WeeklySchedule
        entries={entries}
        courseHref={null}
        clash
        note="Yalnızca buradan eklediğiniz gruplar görünür. Başka bölümden aldığınız dersler bu programda yer almaz."
      />
    </div>
  );
}

const SCHEDULE_TABS = [
  { id: "week", label: "Hafta" },
  { id: "dated", label: "Bu hafta" },
];

function ScheduleTabs({ items, onChanged }) {
  const t = useT();
  const [tab, setTab] = useState("week");

  return (
    <>
      <EnrolledCourses onChanged={onChanged} />

      <div className="flex gap-1.5 border-b border-primary-500/6 px-4 py-2">
        {SCHEDULE_TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-pressed={tab === entry.id}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              tab === entry.id
                ? "bg-secondary-500/12 text-secondary-700"
                : "text-primary-500/70 hover:text-primary-500"
            }`}
          >
            {t(entry.label)}
          </button>
        ))}
      </div>

      {tab === "week" ? <WeekGrid /> : <DatedSchedule items={items} />}
    </>
  );
}

function DatedSchedule({ items }) {
  const t = useT();
  const { locale } = useCmsRoute();
  if (items.length === 0) {
    return <Empty>{t("Bu hafta için ders kaydınız görünmüyor.")}</Empty>;
  }

  return (
    <div className="divide-y divide-primary-500/6">
      {scheduleDays(items).map(({ date, blocks }) => (
        <div key={date} className="px-4 py-3">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500/70">
              {t(weekdayOf(date))}
            </span>
            <span className="text-[11px] text-primary-500/70">
              {formatDate(date, locale)}
            </span>
          </div>
          <div className="space-y-1.5">
            {blocks.map(({ entries, conflict, overlap }) =>
              conflict ? (
                <div
                  key={entries[0].id}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-1.5"
                >
                  <p className="flex items-center gap-1.5 px-1.5 pb-1.5 text-[11px] font-semibold text-amber-700">
                    <TriangleAlert size={12} strokeWidth={2} />
                    {t("Çakışma")}
                    {overlap && (
                      <span className="font-mono font-normal text-amber-700/70">
                        {overlap}
                      </span>
                    )}
                  </p>
                  <ul className="space-y-1.5">
                    {entries.map((entry) => (
                      <ScheduleEntry key={entry.id} entry={entry} conflict />
                    ))}
                  </ul>
                </div>
              ) : (
                <ul key={entries[0].id}>
                  <ScheduleEntry entry={entries[0]} />
                </ul>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const VIEWS = {
  notes: {
    label: "Notlarım",
    icon: FileText,
    load: fetchMyNotes,
    Body: NotesBody,
  },
  schedule: {
    label: "Ders Programım",
    icon: CalendarDays,
    load: fetchMySchedule,
    Body: ScheduleTabs,
    Provider: MyScheduleProvider,
    Action: CalendarExportAction,
  },
};

export default function ProfilePanel({ view, onClose }) {
  const t = useT();
  const [shownView, setShownView] = useState(view);
  const { getAccessToken } = useAuth();
  const [state, setState] = useState({
    view: null,
    status: "loading",
    items: [],
  });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  async function removeNote(note) {
    setBusyId(note.id);
    setActionError(null);
    try {
      const token = await getAccessToken();
      await deleteNote(note.id, token);
      setState((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== note.id),
      }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  useEffect(() => {
    if (!view) return undefined;

    let alive = true;

    (async () => {
      try {
        const token = await getAccessToken();
        const items = await VIEWS[view].load(token);
        if (alive) setState({ view, status: "ready", items });
      } catch {
        if (alive) setState({ view, status: "error", items: [] });
      }
    })();

    return () => {
      alive = false;
    };
  }, [view, getAccessToken, reloadKey]);

  if (view && view !== shownView) setShownView(view);
  if (!shownView) return null;

  const { label, icon: Icon, Body, Provider = Fragment, Action } = VIEWS[shownView];
  const status = state.view === shownView ? state.status : "loading";

  return (
    <Provider>
      <Modal
        open={Boolean(view)}
        instantContent
        onClose={onClose}
        label={t(label)}
        contentClassName="flex items-center justify-center px-4 py-16 sm:px-6"
      >
        <div className="flex h-[68svh] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-144 sm:max-w-3xl lg:h-168 lg:max-w-5xl">
          <div className="relative z-30 flex shrink-0 items-center gap-2.5 border-b border-primary-500/8 px-5 py-3.5">
            <Icon size={16} strokeWidth={1.5} className="text-secondary-700" />
            <h2 className="text-sm font-semibold text-primary-600">
              {t(label)}
            </h2>
            <span className="ml-auto flex items-center gap-3">
              {status === "ready" && state.items.length > 0 && (
                <span className="text-[11px] text-primary-500/70">
                  {t("{count} kayıt", { count: state.items.length })}
                </span>
              )}
              {Action && <Action />}
            </span>
          </div>

          {actionError && (
            <p className="shrink-0 border-b border-red-500/15 bg-red-50 px-4 py-2 text-[11px] text-red-700">
              {actionError}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {status === "loading" && <Skeleton />}
            {status === "error" && <Empty>{t("Bilgiler alınamadı.")}</Empty>}
            {status === "ready" && (
              <Body
                items={state.items}
                busyId={busyId}
                confirmId={confirmId}
                onRemove={removeNote}
                onConfirm={setConfirmId}
                onNavigate={onClose}
                onChanged={() => setReloadKey((n) => n + 1)}
              />
            )}
          </div>
        </div>
      </Modal>
    </Provider>
  );
}
