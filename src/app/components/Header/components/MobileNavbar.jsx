"use client";

import { useEffect, useState } from "react";
import Link from "@/app/components/LocaleLink";

import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { Search, ChevronUp, ExternalLink } from "lucide-react";
import { navigationItems, YTU_ANA_SITE } from "@/data/navigation";
import SearchOverlay from "@/app/components/Search/SearchOverlay";
import { useT } from "@/i18n/useT";
import { useLocaleNav } from "@/i18n/useLocaleNav";
import { useCmsRoute } from "inscribed";
import { LocaleSwitchLink, useAlternateLocalePaths } from "@/app/lib/alternate-locale.jsx";


function hasCategories(children) {
  return children.length > 0 && children[0].category !== undefined;
}

function flattenChildren(children) {
  if (!hasCategories(children)) return children;
  const flat = [];
  children.forEach((group) => {
    flat.push({ type: "category", label: group.category });
    group.items.forEach((item) => flat.push({ type: "link", ...item }));
  });
  return flat;
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

function AccordionSection({ item, onNavigate }) {
  const { href, path } = useLocaleNav();
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();

  const isActive = item.children
    ? path.startsWith(item.basePath)
    : path === item.href;

  if (!item.children) {
    return (
      <Link href={href(item.href)} onClick={onNavigate} className={`block font-medium text-base py-4 ${isActive ? "text-secondary-500" : "text-white"}`}>
        {t(item.label)}
      </Link>
    );
  }

  const flatItems = flattenChildren(item.children);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-4">
        <span className={isActive ? "text-secondary-500 font-medium" : "text-white/80 font-light"}>{t(item.label)}</span>
        <motion.span animate={{ rotate: isOpen ? 0 : 180 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
          <ChevronUp size={18} className="text-neutral-500" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden">
            <div className="relative pl-6 pb-2">
              <motion.div className="absolute left-0 top-0 bottom-2 w-px bg-white/10" initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }} exit={{ scaleY: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ originY: 0 }}
              />
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-1">
                {flatItems.map((child, i) =>
                  child.type === "category" ? (
                    <motion.div key={child.label} variants={staggerItem} className="pt-2 pb-1">
                      <span className="text-secondary-500 text-[11px] font-semibold uppercase tracking-wider">
                        {t(child.label)}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div key={child.href || i} variants={staggerItem}>
                      <Link href={href(child.href)} onClick={onNavigate}
                        className={`block text-sm py-1.5 transition-colors ${path === child.href ? "text-white font-medium" : "text-neutral-400 font-light hover:text-white"}`}
                      >
                        {t(child.label)}
                      </Link>
                    </motion.div>
                  )
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MobileNavbar({ isOpen, onClose }) {
  const t = useT();
  const { locale, slug, localePath } = useCmsRoute();
  const alternates = useAlternateLocalePaths();
  const localeHref = (target) => alternates[target] ?? localePath(slug, target);
  const reduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [isOpen]);


  return (
    <MotionConfig reducedMotion="user">
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: reduce ? 0 : 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute top-full left-0 right-0 h-[calc(100dvh-100%+1px)] bg-primary-500 -mt-px flex flex-col lg:hidden"
        >
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
              {navigationItems.map((item) => (
                <AccordionSection key={item.label} item={item} onNavigate={onClose} />
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} className="shrink-0 px-6 pb-6 pt-3 space-y-2.5 border-t border-white/5"
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3, delay: 0.2 }}
          >
            {!searchOpen && (
              <motion.button
                type="button"
                layoutId="mm-arama-kutusu"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSearchOpen(true)}
                className="relative flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-neutral-500 transition-colors hover:border-white/20"
              >
                <Search size={16} className="shrink-0" />
                {t("Ara...")}
              </motion.button>
            )}

            <div className="block sm:hidden space-y-2.5">
              <div className="-mx-6 border-t border-white/10" />

              <div className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 tracking-wide">
                  <LocaleSwitchLink href={localeHref("tr")} onClick={onClose} className={locale === "tr" ? "text-white" : "text-white/60 hover:text-white transition-colors"}>
                    TR
                  </LocaleSwitchLink>
                  <span className="text-white/60 font-light">/</span>
                  <LocaleSwitchLink href={localeHref("en")} onClick={onClose} className={locale === "en" ? "text-white" : "text-white/60 hover:text-white transition-colors"}>
                    EN
                  </LocaleSwitchLink>
                </div>

                <a href={YTU_ANA_SITE} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-secondary-500 transition-colors"
                >
                  {t("YTÜ Ana Site")}
                  <ExternalLink size={11} />
                </a>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>


    <SearchOverlay
      open={searchOpen}
      onClose={() => setSearchOpen(false)}
      onNavigate={onClose}
      fullScreen
      layoutId="mm-arama-kutusu"
    />
    </MotionConfig>
  );
}