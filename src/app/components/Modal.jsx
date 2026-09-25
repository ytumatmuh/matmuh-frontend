"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const neverChanges = () => () => {};

export default function Modal({
  open,
  onClose,
  label,
  contentClassName = "",
  dismissible = true,
  instantContent = false,
  children,
}) {
  const mounted = useSyncExternalStore(neverChanges, () => true, () => false);
  const [phase, setPhase] = useState("closed");

  if (open && phase !== "open") setPhase("open");
  if (!open && phase === "open") setPhase("closing");
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (dismissible) onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose, dismissible],
  );

  // Framer opaklığı derleyici katmanında canlandırıyor: animasyon bitince eleman
  // satır içi temel değerine dönüyor. Son değeri kendimiz yazmazsak kapanışta bir
  // kare tam opak, açılışta bir kare görünmez kalıyor.
  const settleOpacity = useCallback((value) => {
    if (overlayRef.current) overlayRef.current.style.opacity = value;
  }, []);

  const finish = useCallback(() => {
    settleOpacity("0");
    setPhase("closed");
  }, [settleOpacity]);

  useEffect(() => {
    if (phase !== "closing") return undefined;
    const timer = setTimeout(finish, 600);
    return () => clearTimeout(timer);
  }, [phase, finish]);

  const locked = phase !== "closed";

  useEffect(() => {
    if (!locked) return undefined;
    restoreRef.current = document.activeElement;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    panelRef.current?.focus();

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      restoreRef.current?.focus?.();
    };
  }, [locked]);

  if (!mounted || phase === "closed") return null;

  return createPortal(
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[10050]"
      initial={{ opacity: instantContent ? 1 : 0 }}
      animate={{ opacity: phase === "closing" ? 0 : 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      onAnimationComplete={() => (phase === "closing" ? finish() : settleOpacity("1"))}
      onClick={dismissible ? onClose : undefined}
    >
      <div aria-hidden className="absolute inset-0 bg-primary-700/92" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          event.stopPropagation();
          if (event.target === event.currentTarget) onClose();
        }}
        className="relative w-full h-full outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="size-5" />
        </button>
        <div
          onClick={(event) => {
            if (dismissible && event.target === event.currentTarget) onClose();
          }}
          className={`h-full ${contentClassName}`}
        >
          {children}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
