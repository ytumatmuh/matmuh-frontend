"use client";

import { useState, useRef, useCallback } from "react";
import { useT } from "@/i18n/useT";
import { useLocaleNav } from "@/i18n/useLocaleNav";
import Link from "@/app/components/LocaleLink";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import NewTabHint from "@/app/components/NewTabHint";

function hasCategories(children) {
  return children.length > 0 && children[0].category !== undefined;
}

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.06 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: { opacity: 0, y: 4, transition: { duration: 0.1 } },
};

function DropdownItem({ item }) {
  const { href, path } = useLocaleNav();
  const t = useT();
  const Icon = item.icon;
  const isActive = !item.external && path === item.href;
  const className = `flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors duration-200 ${isActive ? "bg-primary-500/5" : "hover:bg-primary-500/3"}`;

  const content = (
    <>
      {Icon && (
        <div
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${isActive ? "bg-primary-500/10" : "bg-primary-500/4 group-hover:bg-primary-500/7"}`}
        >
          <Icon
            size={14}
            strokeWidth={1.5}
            className={`transition-colors duration-200 ${isActive ? "text-primary-500" : "text-primary-500/70 group-hover:text-primary-500/70"}`}
          />
        </div>
      )}
      <div className="flex flex-col">
        <span
          className={`flex items-center gap-1.5 text-xs transition-colors duration-200 text-primary-500 ${isActive ? "font-medium" : "font-normal group-hover:text-primary-500"}`}
        >
          {t(item.label)}
          {item.external && (
            <ExternalLink
              size={10}
              strokeWidth={1.5}
              className="text-primary-500/70"
            />
          )}
        </span>
        {item.description && (
          <span className="text-[10px] text-primary-500/70 font-normal leading-tight mt-0.5">
            {t(item.description)}
          </span>
        )}
      </div>
    </>
  );

  if (item.external) {
    return (
      <motion.div variants={staggerItem}>
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {content}
          <NewTabHint />
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerItem}>
      <Link href={href(item.href)} className={className}>
        {content}
      </Link>
    </motion.div>
  );
}

function SimpleDropdown({ items }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="py-2 px-1 space-y-0.5"
    >
      {items.map((item) => (
        <DropdownItem key={item.href} item={item} />
      ))}
    </motion.div>
  );
}

function CategorizedDropdown({ items }) {
  const t = useT();
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex py-2 px-1"
    >
      {items.map((group, groupIndex) => (
        <motion.div
          key={group.category}
          variants={staggerItem}
          className={`flex-1 px-2 ${groupIndex > 0 ? "border-l border-black/5" : ""}`}
        >
          <div className="px-3 pt-1 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-500/70">
              {t(group.category)}
            </span>
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <DropdownItem key={item.href} item={item} />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function NavItems({ item, children }) {
  const { href, path } = useLocaleNav();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const isActive = item.basePath
    ? path.startsWith(item.basePath)
    : path === item.href;

  const openDropdown = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 120);
  }, []);

  if (!item.children) {
    return (
      <Link
        href={href(item.href)}
        className={`hidden xl:block text-xs tracking-wide transition-colors ${isActive ? "text-secondary-500 font-semibold" : "text-white/80 font-light hover:text-secondary-500"}`}
      >
        {children}
      </Link>
    );
  }

  const categorized = hasCategories(item.children);

  const getPrimaryHref = () => {
    if (item.href) return item.href;
    if (categorized && item.children[0]?.items)
      return item.children[0].items[0]?.href || "#";
    return item.children[0]?.href || "#";
  };

  return (
    <div
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
    >
      <Link
        href={href(getPrimaryHref())}
        className={`flex items-center gap-0.5 text-xs tracking-wide ${isActive ? "font-semibold" : "font-light"} transition-colors ${isActive || isOpen ? "text-secondary-500" : "text-white/80 font-light hover:text-secondary-500"}`}
      >
        {children}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown size={12} strokeWidth={1.5} className="text-white/60" />
        </motion.span>
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
            style={{
              width: categorized ? "auto" : "240px",
              minWidth: categorized
                ? `${item.children.length * 220}px`
                : undefined,
            }}
          >
            <div className="bg-white rounded-xl shadow-popover ring-1 ring-primary-500/10 overflow-hidden">
              <div className="h-0.75 bg-secondary-400" />

              {categorized ? (
                <CategorizedDropdown items={item.children} />
              ) : (
                <SimpleDropdown items={item.children} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
