"use client";
import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Target,
  TrendingUp,
  BookOpen,
  Cpu,
  BarChart3,
  Shield,
  Atom,
  Code2,
} from "lucide-react";
import { EditableRegion } from "inscribed";
import PageLayout from "@/app/components/PageLayout";
import MainCard from "@/app/components/MainCard";
import { useT } from "@/i18n/useT";
import DepartmentFacts from "./DepartmentFacts";
import FrequentQuestions from "./FrequentQuestions";
import {
  CareerProfile,
  EducationalGoals,
  InternshipSummary,
  Milestones,
  MinorPrograms,
  MissionVision,
} from "./AboutSections";

const workingAreas = [
  {
    id: "prog",
    label: "Programlama",
    icon: Code2,
    size: "lg",
    cx: 50,
    cy: 39,
  },
  { id: "yapay", label: "Yapay Zeka", icon: Cpu, size: "lg", cx: 30, cy: 52 },
  {
    id: "num",
    label: "Nümerik Analiz",
    icon: BookOpen,
    size: "lg",
    cx: 65,
    cy: 25,
  },
  {
    id: "veri",
    label: "Veri Bilimi",
    icon: BarChart3,
    size: "lg",
    cx: 35,
    cy: 25,
  },
  {
    id: "dif",
    label: "Diferansiyel Denklemler",
    icon: Award,
    size: "md",
    cx: 80,
    cy: 80,
  },
  {
    id: "opt",
    label: "Optimizasyon",
    icon: Target,
    size: "md",
    cx: 70,
    cy: 52,
  },
  {
    id: "fin",
    label: "Finans Matematiği",
    icon: TrendingUp,
    size: "md",
    cx: 20,
    cy: 80,
  },
  {
    id: "krip",
    label: "Kriptografi",
    icon: Shield,
    size: "md",
    cx: 50,
    cy: 73,
  },
  {
    id: "ist",
    label: "İstatistik",
    icon: BarChart3,
    size: "md",
    cx: 85,
    cy: 39,
  },
  {
    id: "fonk",
    label: "Fonksiyonel Analiz",
    icon: Atom,
    size: "sm",
    cx: 15,
    cy: 39,
  },
];

const graphLinks = [
  { source: "prog", target: "veri" },
  { source: "prog", target: "opt" },
  { source: "num", target: "dif" },
  { source: "veri", target: "yapay" },
  { source: "veri", target: "ist" },
  { source: "veri", target: "opt" },
  { source: "yapay", target: "prog" },
  { source: "opt", target: "num" },
  { source: "krip", target: "prog" },
  { source: "fin", target: "ist" },
  { source: "fonk", target: "dif" },
];


let mobileQuery;

function mediaQuery() {
  return (mobileQuery ??= window.matchMedia("(max-width: 767px)"));
}

function subscribeToWidth(onChange) {
  const query = mediaQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const neverChanges = () => () => {};

function NodeGraphCanvas() {
  const t = useT();
  const [hoveredNode, setHoveredNode] = useState(null);
  const isMounted = useSyncExternalStore(neverChanges, () => true, () => false);
  const isMobile = useSyncExternalStore(
    subscribeToWidth,
    () => mediaQuery().matches,
    () => false,
  );

  if (!isMounted) return <div className="w-full h-full bg-primary-500" />;

  return (
    <div
      className="relative w-full h-full bg-primary-500 overflow-hidden select-none"
      onClick={() => setHoveredNode(null)}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #AD976F 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {graphLinks.map((link, idx) => {
          const sourceNode = workingAreas.find((n) => n.id === link.source);
          const targetNode = workingAreas.find((n) => n.id === link.target);

          if (!sourceNode || !targetNode) return null;

          const isHighlighted =
            hoveredNode === link.source || hoveredNode === link.target;
          const isDimmed = hoveredNode !== null && !isHighlighted;

          return (
            <motion.line
              key={`${link.source}-${link.target}`}
              x1={`${sourceNode.cx}%`}
              y1={`${sourceNode.cy}%`}
              x2={`${targetNode.cx}%`}
              y2={`${targetNode.cy}%`}
              stroke={isHighlighted ? "#AD976F" : "rgba(173, 151, 111, 0.15)"}
              strokeWidth={
                isHighlighted ? (isMobile ? 1.2 : 1.5) : isMobile ? 0.8 : 1
              }
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: isDimmed ? 0.05 : 1,
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                delay: idx * 0.05,
              }}
            />
          );
        })}

        {workingAreas.map((node, idx) => {
          const isHovered = hoveredNode === node.id;
          const isDimmed = hoveredNode !== null && !isHovered;

          const radius =
            node.size === "lg"
              ? isMobile
                ? 4.5
                : 6
              : node.size === "md"
                ? isMobile
                  ? 3.5
                  : 4.5
                : isMobile
                  ? 2.5
                  : 3;

          const fontSize =
            node.size === "lg"
              ? isMobile
                ? "10px"
                : "12px"
              : node.size === "md"
                ? isMobile
                  ? "9px"
                  : "10px"
                : isMobile
                  ? "8px"
                  : "9px";

          return (
            <g
              key={node.id}
              onMouseEnter={() => !isMobile && setHoveredNode(node.id)}
              onMouseLeave={() => !isMobile && setHoveredNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                setHoveredNode(isHovered ? null : node.id);
              }}
              className="cursor-pointer"
            >
              <motion.circle
                cx={`${node.cx}%`}
                cy={`${node.cy}%`}
                r={radius * 4}
                fill="rgba(173, 151, 111, 0.15)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isHovered ? 1.5 : 1,
                  opacity: isDimmed ? 0 : 1,
                }}
                transition={{ duration: 0.3 }}
              />

              <motion.circle
                cx={`${node.cx}%`}
                cy={`${node.cy}%`}
                r={radius}
                fill={isHovered ? "#FFF" : "#AD976F"}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: isDimmed ? 0.2 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: idx * 0.05,
                }}
              />

              <motion.text
                x={`${node.cx}%`}
                y={`${node.cy}%`}
                dy={radius + (isMobile ? 12 : 16)}
                textAnchor="middle"
                fill={isHovered ? "#FFF" : "rgba(255, 255, 255, 0.6)"}
                fontSize={fontSize}
                fontWeight={node.size === "lg" ? "600" : "500"}
                className="font-sans pointer-events-none"
                initial={{ opacity: 0, y: -5 }}
                animate={{
                  opacity: isDimmed ? 0.1 : 1,
                  y: 0,
                }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.05 }}
              >
                {t(node.label)}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}


export default function DepartmentInfo({ staff, curriculum }) {
  const t = useT();
  return (
    <PageLayout>
      <DepartmentFacts staff={staff} curriculum={curriculum} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <MissionVision />
          <EducationalGoals />

          <MainCard
            title={
              <EditableRegion
                blockPath="areas.title"
                blockType="ShortText"
                defaultValue={{ tr: "Çalışma ve Araştırma Alanları", en: "Fields of Study and Research" }}
              />
            }
          >
            <div className="flex flex-col -mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
              <div className="relative bg-primary-500 h-85 w-full border-y border-primary-500/10">
                <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10" />
                <div className="absolute inset-0 z-0">
                  <NodeGraphCanvas />
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="flex flex-wrap gap-2.5">
                  {workingAreas.map((area) => {
                    const Icon = area.icon;
                    const isLarge = area.size === "lg";

                    return (
                      <div
                        key={area.label}
                        className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-300 hover:shadow-md hover:border-secondary-500/30 cursor-pointer ${
                          isLarge
                            ? "bg-secondary-500/3 border-secondary-500/10"
                            : "bg-transparent border-primary-500/5"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isLarge
                              ? "bg-secondary-500/10 text-secondary-700"
                              : "bg-primary-500/4 text-primary-500/70"
                          }`}
                        >
                          <Icon size={isLarge ? 15 : 13} strokeWidth={1.8} />
                        </div>
                        <span
                          className={`font-medium ${
                            isLarge
                              ? "text-[13px] text-primary-500"
                              : "text-[12px] text-primary-500/70"
                          }`}
                        >
                          {t(area.label)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </MainCard>

          <CareerProfile />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Milestones />
          <InternshipSummary />
          <MinorPrograms />
          <FrequentQuestions />
        </div>
      </div>
    </PageLayout>
  );
}
