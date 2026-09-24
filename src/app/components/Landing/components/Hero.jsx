"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "@/app/components/LocaleLink";
import { ChevronRight } from "lucide-react";
import { EditableRegion } from "inscribed";
import BackgroundVisuals from "./BackgroundVisuals";
import { useHeroActive, useReducedMotion } from "./heroMotion";
import HeroSearch from "./HeroSearch";

export default function Hero({ highlights = [] }) {
  const containerRef = useRef(null);
  const rectRef = useRef(null);
  const staleRectRef = useRef(true);
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  const [isHovered, setIsHovered] = useState(false);

  const reducedMotion = useReducedMotion();
  const active = useHeroActive(containerRef);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const cancelFrame = () => {
    if (!frameRef.current) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node || reducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const invalidateRect = () => {
      staleRectRef.current = true;
    };

    const flush = () => {
      frameRef.current = 0;

      if (staleRectRef.current) {
        rectRef.current = node.getBoundingClientRect();
        staleRectRef.current = false;
      }

      const rect = rectRef.current;
      if (!rect.width || !rect.height) return;

      mouseX.set(((pointerRef.current.x - rect.left) / rect.width) * 2 - 1);
      mouseY.set(((pointerRef.current.y - rect.top) / rect.height) * 2 - 1);
    };

    const onPointerMove = (event) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      if (!frameRef.current) frameRef.current = requestAnimationFrame(flush);
    };

    node.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", invalidateRect, { passive: true });
    window.addEventListener("scroll", invalidateRect, { passive: true });

    return () => {
      node.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", invalidateRect);
      window.removeEventListener("scroll", invalidateRect);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [reducedMotion, mouseX, mouseY]);

  const springConfig = { stiffness: 150, damping: 30, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const planeRotateX = useTransform(smoothMouseY, [-1, 1], [5, -5]);
  const planeRotateY = useTransform(smoothMouseX, [-1, 1], [-5, 5]);
  const planeTranslateZ = useTransform(smoothMouseY, [-1, 1], [-40, 40]);

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => {
        staleRectRef.current = true;
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        cancelFrame();
        mouseX.set(0);
        mouseY.set(0);
      }}
      className={`relative isolate overflow-hidden w-full min-h-[max(23.75rem,calc(72svh-var(--header-h)))] sm:h-[calc(76svh-var(--header-h))] sm:min-h-110 md:h-[calc(78svh-var(--header-h))] md:min-h-125 md:perspective-[1500px] flex flex-col items-center justify-center bg-primary-500 py-8 pb-20 sm:py-0 sm:pb-12 ${
        active ? "" : "mm-paused"
      }`}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden origin-center pointer-events-none z-0 md:transform-3d"
        style={{
          rotateX: planeRotateX,
          rotateY: planeRotateY,
          z: planeTranslateZ,
        }}
      >
        <BackgroundVisuals active={active} reducedMotion={reducedMotion} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 md:opacity-100">
          <motion.div className="relative flex items-center justify-center aspect-[2.38] w-[118svh] rotate-90 sm:w-auto sm:h-[78%] sm:max-w-[96vw] sm:rotate-0 drop-shadow-[0_0_18px_rgba(98,109,158,0.25)]">
            <svg
              viewBox="0 0 368.25 154.79"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute w-full h-full overflow-visible z-0"
              style={{
                maskImage:
                  "radial-gradient(ellipse 46% 62% at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.4) 45%, #000 82%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 46% 62% at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.4) 45%, #000 82%)",
              }}
            >
              <motion.rect
                x=".5"
                y=".5"
                width="367.25"
                height="153.79"
                stroke="#626D9E"
                strokeWidth="1.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
              <motion.path
                d="M333.86,77.4c0,26.38-19.75,48.15-45.28,51.33-2.12.27-4.28.41-6.47.41H89.43c-2.9,0-5.74-.24-8.51-.7-24.52-4.06-43.23-25.37-43.23-51.04s18.71-46.99,43.23-51.05c2.77-.46,5.61-.7,8.51-.7h192.68c2.19,0,4.35.14,6.47.41,25.53,3.18,45.28,24.95,45.28,51.34Z"
                stroke="#626D9E"
                strokeWidth="1.5"
                opacity="0.45"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.path
                d="M240.07,54.42h-107.91c-12.69,0-22.98,10.29-22.98,22.98s10.29,22.98,22.98,22.98h107.91c12.69,0,22.98-10.29,22.98-22.98s-10.29-22.98-22.98-22.98Z"
                stroke="#AD976F"
                strokeWidth="1.5"
                opacity="0.55"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut", delay: 1.2 }}
              />
              <motion.polyline
                points="184.07 1.06 83.65 152.54 83.65 1.06 184.07 152.54 184.07 1.06 285.18 153.74 285.18 1.06 184.07 152.54"
                stroke="#626D9E"
                strokeWidth="1.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.65 }}
                transition={{ duration: 5, ease: "easeInOut", delay: 1.8 }}
              />
              <motion.line
                x1="37.69"
                y1="77.4"
                x2=".5"
                y2="77.4"
                stroke="#626D9E"
                strokeWidth="1.5"
                opacity="0.45"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
              <motion.line
                x1="333.86"
                y1="77.4"
                x2="367.75"
                y2="77.4"
                stroke="#626D9E"
                strokeWidth="1.5"
                opacity="0.45"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            </svg>

            <motion.div
              className="absolute w-[46%] sm:w-[26%] max-w-120 aspect-square flex items-center justify-center z-20 overflow-visible pointer-events-none -rotate-90 sm:rotate-0"
              animate={{
                filter: isHovered
                  ? "drop-shadow(0 0 6px #0D112B) drop-shadow(0 0 26px rgba(173,151,111,0.6))"
                  : "drop-shadow(0 0 5px #0D112B) drop-shadow(0 0 15px rgba(173,151,111,0.35))",
              }}
              transition={{
                duration: 0.7,
                ease: "easeInOut",
              }}
            >
              <svg
                viewBox="0 0 51.1 53.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
              >
                <motion.path
                  d="M39.1489 26.458L51.1163 18.6097L36.774 18.7488L41.2827 5.16729L29.6771 13.6929L25.5025 0L21.3557 13.7856L9.74085 5.18584L14.3237 18.8138L0 18.6282L11.6519 26.792L0.0927704 35.1042L14.4721 34.863L9.8429 48.4445L21.4763 39.6128L25.4932 53.5469L29.8163 39.6777L41.2177 48.528L36.3287 34.798L50.9864 35.1598L39.1489 26.458ZM45.6521 20.3259L37.7759 25.4468L35.1877 23.545L36.2174 20.4465L45.6521 20.3259ZM38.3418 9.23989L35.1506 18.7674L31.2264 18.8045L30.1781 15.372L38.3418 9.23989ZM25.4932 5.73319L28.2392 14.7412L25.4375 16.8006L22.7565 14.8154L25.4932 5.73319ZM13.0342 9.70374L20.8454 15.4648L19.8157 18.8787L16.0307 18.8323L13.0342 9.70374ZM5.71463 20.4465H14.8896L15.975 23.6842L13.1826 25.688L5.71463 20.4465ZM5.25078 33.4065L13.062 27.7661L16.1513 29.9276L15.0473 33.1653L5.25078 33.4065ZM13.1826 43.8431L16.3554 34.8444L20.0847 34.7795L20.9846 37.9151L13.1826 43.8431ZM25.586 47.7023L22.9327 38.5181L25.6602 36.4493L28.2949 38.4903L25.586 47.7023ZM28.8051 36.7369L25.688 34.3435L22.4411 36.8111L21.3464 33.0168L16.9676 33.1282L18.3128 29.2968L14.5834 26.6807L17.849 24.315L16.578 20.4558H21.0681L22.2555 16.5038L25.5025 18.8972L28.7587 16.4481L30.0018 20.53L34.5847 20.4651L33.3323 24.1944L36.3102 26.4023L32.5994 28.8236L33.9074 32.7571L30.0482 32.5437L28.8051 36.7369ZM37.3863 43.305L30.3636 37.9244L31.3748 34.6682L34.5476 34.7424L37.3863 43.305ZM35.6422 32.8591L34.4548 29.5287L37.6646 27.4228L45.7356 33.425L35.6422 32.8591Z"
                  stroke="#AD976F"
                  strokeWidth="0.8"
                  fillRule="evenodd"
                  initial={{ pathLength: 0, fill: "rgba(173,151,111,0)" }}
                  animate={{ pathLength: 1, fill: "rgba(173,151,111,0.13)" }}
                  transition={{
                    pathLength: { duration: 4, ease: "easeInOut", delay: 2.5 },
                    fill: { duration: 2, delay: 5 },
                  }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(29,36,69,0.2)_0%,rgba(29,36,69,0.95)_100%)] pointer-events-none" />

      <motion.div
        className="relative z-100 flex flex-col items-center px-4 w-full max-w-7xl mx-auto md:transform-3d"
        initial={{ opacity: 0, translateZ: 100 }}
        animate={{ opacity: 1, translateZ: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="text-center flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center sm:justify-between gap-3 sm:gap-6 mb-2 w-full sm:max-w-5xl mx-auto"
          >
            <div className="shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-secondary-500" />
            <div className="grow-0 sm:grow">
              <EditableRegion
                blockPath="hero.title"
                blockType="ShortText"
                defaultValue={{ tr: "YILDIZ TEKNİK ÜNİVERSİTESİ", en: "YILDIZ TECHNICAL UNIVERSITY" }}
                as="h1"
                className="text-[clamp(0.85rem,4.4vw,1.1rem)] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight uppercase text-center whitespace-nowrap [text-shadow:0_2px_18px_rgba(13,17,43,0.9)]"
              />
            </div>
            <div className="shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-secondary-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-2 mt-4 w-full"
          >
            <span className="text-secondary-500/60 font-light text-xl sm:text-4xl leading-none select-none [text-shadow:0_2px_14px_rgba(13,17,43,0.95)]">
              [
            </span>
            <EditableRegion
              blockPath="hero.subtitle"
              blockType="ShortText"
              defaultValue={{ tr: "MATEMATİK MÜHENDİSLİĞİ", en: "DEPARTMENT OF MATHEMATICAL ENGINEERING" }}
              as="h2"
              className="text-[0.95rem] sm:text-2xl md:text-3xl lg:text-4xl font-medium text-secondary-500 tracking-[0.15em] uppercase text-center [text-shadow:0_2px_14px_rgba(13,17,43,0.95),0_0_28px_rgba(13,17,43,0.8)]"
            />
            <span className="text-secondary-500/60 font-light text-xl sm:text-4xl leading-none select-none [text-shadow:0_2px_14px_rgba(13,17,43,0.95)]">
              ]
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="hidden sm:block w-full sm:max-w-5xl mt-12 sm:mt-16 mb-8 mx-auto"
          >
            <HeroSearch />
          </motion.div>

        </div>
      </motion.div>

      {highlights.length > 0 && (
        <div className="relative z-30 mt-auto w-full px-4 pt-8 sm:absolute sm:inset-x-0 sm:bottom-10 sm:mt-0 sm:pt-0">
          <div className="mx-auto w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid gap-2 sm:grid-cols-2"
            >
              {highlights.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/12 bg-primary-700/65 px-3.5 py-2 text-left backdrop-blur-md transition-colors hover:border-secondary-500/45 hover:bg-primary-700/80"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2 text-[10px] font-semibold uppercase tracking-widest text-secondary-400">
                      {item.label}
                      {item.date && (
                        <span className="font-normal normal-case tracking-normal text-white/35">
                          {item.date}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[12.5px] text-white/85 group-hover:text-white">
                      {item.title}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className="shrink-0 text-white/60 transition-colors group-hover:text-secondary-400"
                  />
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      )}

    </div>
  );
}
