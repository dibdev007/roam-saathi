"use client";

// v4 — the "wow" motion layer for the public site.
// GPU-friendly framer-motion primitives that respect prefers-reduced-motion:
//   ScrollProgress · WordReveal · HeroOrbs (mouse parallax) ·
//   StatCounter (count-up) · Tilt (3D hover with glare) · FadeSwap

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useInView,
  animate,
  useReducedMotion,
} from "framer-motion";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Scroll progress — saffron gradient bar pinned to the very top       */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-forest via-[#16A34A] to-saffron"
      style={{ scaleX }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* WordReveal — staggered word-by-word rise for display headlines      */
/* ------------------------------------------------------------------ */

export function WordReveal({
  text,
  className,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <Tag className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={cn("inline-block", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%", opacity: 0, rotate: 2 }}
            animate={{ y: "0%", opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* HeroOrbs — floating aurora blobs that drift with the pointer        */
/* ------------------------------------------------------------------ */

export function HeroOrbs() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const o1x = useTransform(mx, [0, 1], [-28, 28]);
  const o1y = useTransform(my, [0, 1], [-18, 18]);
  const o2x = useTransform(mx, [0, 1], [34, -34]);
  const o2y = useTransform(my, [0, 1], [22, -22]);
  const o3x = useTransform(mx, [0, 1], [-16, 16]);
  const o3y = useTransform(my, [0, 1], [14, -14]);

  React.useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{ x: o1x, y: o1y }}
        className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#16A34A]/25 blur-[90px] rs-orb"
      />
      <motion.div
        style={{ x: o2x, y: o2y }}
        className="absolute right-[-6rem] top-1/4 h-96 w-96 rounded-full bg-saffron/20 blur-[110px] rs-orb-slow"
      />
      <motion.div
        style={{ x: o3x, y: o3y }}
        className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-400/15 blur-[100px] rs-orb"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCounter — count-up for numeric stat values ("24/7" → 24 + "/7") */
/* ------------------------------------------------------------------ */

export function StatCounter({ value, className }: { value: string; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  const match = value.match(/^(\d+)(.*)$/);
  const num = match ? Number(match[1]) : null;
  const tail = match ? match[2] : value;
  const [display, setDisplay] = React.useState(num === null ? value : "0");

  React.useEffect(() => {
    if (num === null || !inView) return;
    if (reduce) {
      setDisplay(String(num));
      return;
    }
    const controls = animate(0, num, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, num, reduce]);

  return (
    <span ref={ref} className={className}>
      {num === null ? value : display}
      {tail}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt — 3D perspective tilt with a moving glare, for feature cards   */
/* ------------------------------------------------------------------ */

export function Tilt({
  children,
  className,
  max = 9,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const srx = useSpring(rx, { stiffness: 220, damping: 22 });
  const sry = useSpring(ry, { stiffness: 220, damping: 22 });

  const glare = useTransform(
    [gx, gy],
    ([x, y]) =>
      `radial-gradient(360px circle at ${x}% ${y}%, rgba(255,255,255,0.16), transparent 62%)`
  );

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  }

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("rs-tilt", className)}>
      <motion.div
        style={{
          rotateX: srx,
          rotateY: sry,
          transformStyle: "preserve-3d",
          transformPerspective: 1100,
        }}
        className="h-full w-full rounded-[inherit]"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FadeSwap — soft enter/exit for filtered grids                        */
/* ------------------------------------------------------------------ */

export { motion, AnimatePresence };
