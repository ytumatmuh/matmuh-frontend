"use client";

import { LogIn, LogOut, PencilLine, ShieldOff, TriangleAlert } from "lucide-react";

import Link from "@/app/components/LocaleLink";
import { useAuth } from "@/lib/auth";
import { useCmsEditing } from "@/app/lib/cms-provider.jsx";
import { useT } from "@/i18n/useT";

const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors";

function Card({ children }) {
  return (
    <div className="w-full flex-1 px-4 py-16">
      <div className="mx-auto flex max-w-md flex-col gap-5 rounded-xl border border-primary-500/10 bg-white p-6 shadow-xs">
        {children}
      </div>
    </div>
  );
}

function SignedOut({ failed }) {
  const t = useT();
  const { signIn } = useAuth();

  return (
    <Card>
      <p className="text-[13px] leading-relaxed text-primary-500/70">
        {t("Bu sayfa site içeriğini düzenleyen yöneticiler ve editörler içindir.")}
      </p>
      {failed && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          {t("Giriş tamamlanamadı. Bu hesapla siteye giriş yapılamıyor.")}
        </p>
      )}
      <button
        type="button"
        onClick={() => signIn(`${window.location.origin}${window.location.pathname}`)}
        className={`${BUTTON} self-start bg-secondary-500 text-primary-500 hover:bg-secondary-500/80`}
      >
        <LogIn size={14} />
        {t("Giriş")}
      </button>
    </Card>
  );
}

function SignedIn() {
  const t = useT();
  const { user, signOut } = useAuth();
  const { canEdit, editing, setEditing } = useCmsEditing();

  return (
    <Card>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-primary-600 wrap-break-word">{user?.name}</p>
        {user?.email && (
          <p className="mt-0.5 text-[11px] text-primary-500/70 break-all">{user.email}</p>
        )}
      </div>

      {canEdit ? (
        <button
          type="button"
          role="switch"
          aria-checked={editing}
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 rounded-lg border border-primary-500/10 px-3 py-2.5 text-[12px] text-primary-500/70 transition-colors hover:bg-primary-500/4"
        >
          <PencilLine size={14} className="shrink-0 text-secondary-700" />
          <span className="flex-1 text-left">{t("Düzenleme modu")}</span>
          <span
            className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
              editing ? "bg-secondary-500" : "bg-primary-500/15"
            }`}
          >
            <span
              className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${
                editing ? "left-3.5" : "left-0.5"
              }`}
            />
          </span>
        </button>
      ) : (
        <p className="flex items-start gap-2 rounded-lg bg-primary-500/4 px-3 py-2.5 text-[12px] leading-relaxed text-primary-500/80">
          <ShieldOff size={14} className="mt-0.5 shrink-0 text-primary-500/70" />
          {t("Bu hesabın sitede düzenleme yetkisi yok.")}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className={`${BUTTON} border border-primary-500/10 text-primary-500/80 hover:border-primary-500/20 hover:text-primary-500`}
        >
          {t("Anasayfa")}
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className={`${BUTTON} text-red-700/75 hover:bg-red-50`}
        >
          <LogOut size={14} className="text-red-700/50" />
          {t("Çıkış Yap")}
        </button>
      </div>
    </Card>
  );
}

export default function SignInPanel({ failed }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <div className="mx-auto size-4 animate-spin rounded-full border-2 border-secondary-500 border-t-transparent" />
      </Card>
    );
  }

  return isAuthenticated ? <SignedIn /> : <SignedOut failed={failed} />;
}
