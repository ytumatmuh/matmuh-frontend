"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, PencilLine } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useCmsEditing } from "@/app/lib/cms-provider.jsx";
import { useT } from "@/i18n/useT";

const ROLE_LABELS = {
  ROLE_ADMIN: "Admin",
  ROLE_EDITOR: "Editör",
  ROLE_USER: "Öğrenci",
};

const SLOT = "w-9 h-9 sm:w-16";

const MENU_MOTION = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  shown: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.97 },
};

export default function UserLogin() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const { canEdit, editing, setEditing } = useCmsEditing();

  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoading || !isAuthenticated) return null;

  const name = user?.name || t("Ad Soyad");
  const email = user?.email || "";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "--";
  const roles = (user?.authorities ?? []).map((a) => t(ROLE_LABELS[a] ?? a));

  return (
    <>
      <div className="hidden lg:block w-[0.5px] h-6 bg-neutral-600"></div>
      <div ref={ref} className="relative z-30">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={name}
          className={`${SLOT} group relative z-50 flex items-center justify-center gap-1.5 px-2 rounded-lg transition-colors ${
            open
              ? "bg-primary-500 ring-1 ring-secondary-500/30"
              : "hover:bg-white/5"
          }`}
        >
          <span
            className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-semibold tracking-tight transition-colors ${
              open
                ? "border-secondary-500 bg-secondary-500/20 text-secondary-300"
                : "border-secondary-500/45 text-secondary-500 group-hover:border-secondary-500 group-hover:bg-secondary-500/10"
            }`}
          >
            {initials}
          </span>
          <ChevronDown
            size={13}
            className={`hidden sm:block shrink-0 transition-all duration-200 ${
              open
                ? "rotate-180 text-secondary-500"
                : "text-neutral-400 group-hover:text-neutral-300"
            }`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 touch-none bg-primary-700/55 sm:hidden"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              variants={MENU_MOTION}
              initial="hidden"
              animate="shown"
              exit="exit"
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              className="fixed right-3 top-(--header-h) z-50 w-[min(20rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-xl bg-white shadow-popover ring-1 ring-primary-500/10 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[clamp(15rem,88vw,21rem)]"
            >
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                <span className="w-9 h-9 shrink-0 rounded-full border border-secondary-500/35 bg-secondary-500/10 text-secondary-600 flex items-center justify-center text-xs font-semibold tracking-tight">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-primary-600 leading-snug wrap-break-word">
                    {name}
                  </p>
                  {email && (
                    <p className="mt-0.5 text-[11px] text-primary-500/70 leading-snug break-all">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              {roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="text-[10px] font-medium text-secondary-700 bg-secondary-500/10 px-2 py-0.5 rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}

              {canEdit && (
                <div className="p-1.5 border-t border-primary-500/8">
                  <span className="block px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-primary-500/70">
                    {t("Yönetim")}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editing}
                    onClick={() => setEditing(!editing)}
                    className="flex items-center gap-2 w-full px-2.5 py-2 text-[12px] text-primary-500/70 hover:bg-primary-500/4 transition-colors rounded-lg"
                  >
                    <PencilLine
                      size={14}
                      className="shrink-0 text-secondary-700"
                    />
                    <span className="flex-1 text-left">
                      {t("Düzenleme modu")}
                    </span>
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
                </div>
              )}

              <div className="p-1.5 border-t border-primary-500/8">
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-[12px] text-red-700/75 hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut size={14} className="text-red-700/50 shrink-0" />
                  <span>{t("Çıkış Yap")}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
