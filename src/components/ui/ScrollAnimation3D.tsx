'use client';

import { useRef, useEffect, useState, useCallback, ReactNode, CSSProperties } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from 'framer-motion';

// =============================================
// SCROLL-LINKED 3D SCENE WRAPPER
// Inspired by Koenigsegg Jesko scroll experience
// =============================================

/**
 * Hook: useScrollProgress
 * Returns a 0..1 progress value based on element visibility in viewport.
 */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>, offset: [string, string] = ['start end', 'end start']) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });
  return scrollYProgress;
}

/**
 * Perspective3DSection
 * Full-width section that applies 3D perspective transformations
 * as the user scrolls. Creates the "camera orbiting" feel.
 */
export function Perspective3DSection({
  children,
  className = '',
  rotateRange = [-8, 0, 4],
  scaleRange = [0.85, 1, 0.92],
  opacityRange = [0, 1, 0.3],
  translateYRange = [120, 0, -60],
  perspective = 1200,
  offset = ['start end', 'end start'],
}: {
  children: ReactNode;
  className?: string;
  rotateRange?: number[];
  scaleRange?: number[];
  opacityRange?: number[];
  translateYRange?: number[];
  perspective?: number;
  offset?: [string, string];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, offset);

  const rotateX = useTransform(progress, [0, 0.4, 1], rotateRange);
  const scale = useTransform(progress, [0, 0.4, 1], scaleRange);
  const opacity = useTransform(progress, [0, 0.3, 1], opacityRange);
  const y = useTransform(progress, [0, 0.4, 1], translateYRange);

  const smoothRotateX = useSpring(rotateX, { stiffness: 60, damping: 20 });
  const smoothScale = useSpring(scale, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 60, damping: 20 });

  return (
    <div ref={ref} className={className} style={{ perspective: `${perspective}px` }}>
      <motion.div
        style={{
          rotateX: smoothRotateX,
          scale: smoothScale,
          opacity,
          y: smoothY,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * ParallaxDepthLayer
 * Creates parallax depth by moving at different speeds.
 * depth: 0 = foreground (moves most), 1 = background (moves least)
 */
export function ParallaxDepthLayer({
  children,
  className = '',
  depth = 0.5,
  direction = 'vertical',
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
  direction?: 'vertical' | 'horizontal';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  const speed = 200 * (1 - depth); // foreground=200px, background=0px

  const yOffset = useTransform(progress, [0, 1], [-speed * 0.5, speed * 0.5]);
  const xOffset = useTransform(progress, [0, 1], [-speed * 0.3, speed * 0.3]);

  const smoothY = useSpring(yOffset, { stiffness: 40, damping: 15 });
  const smoothX = useSpring(xOffset, { stiffness: 40, damping: 15 });

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{
          y: direction === 'vertical' ? smoothY : 0,
          x: direction === 'horizontal' ? smoothX : 0,
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * CinematicReveal3D
 * Reveals content with a cinematic 3D fly-in effect from below,
 * rotating and scaling up as the user scrolls into view.
 */
export function CinematicReveal3D({
  children,
  className = '',
  delay = 0,
  rotateFrom = 12,
  scaleFrom = 0.75,
  translateFrom = 150,
  blurFrom = 12,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  rotateFrom?: number;
  scaleFrom?: number;
  translateFrom?: number;
  blurFrom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, ['start end', 'center center']);

  const rotateX = useTransform(progress, [0, 1], [rotateFrom, 0]);
  const scale = useTransform(progress, [0, 1], [scaleFrom, 1]);
  const y = useTransform(progress, [0, 1], [translateFrom, 0]);
  const opacity = useTransform(progress, [0, 0.4, 1], [0, 0.5, 1]);
  const blur = useTransform(progress, [0, 0.6], [blurFrom, 0]);

  const smoothRotate = useSpring(rotateX, { stiffness: 50, damping: 18 });
  const smoothScale = useSpring(scale, { stiffness: 50, damping: 18 });
  const smoothY = useSpring(y, { stiffness: 50, damping: 18 });

  return (
    <div ref={ref} style={{ perspective: '1000px' }}>
      <motion.div
        className={className}
        style={{
          rotateX: smoothRotate,
          scale: smoothScale,
          y: smoothY,
          opacity,
          filter: useTransform(blur, (v) => `blur(${v}px)`),
          transformOrigin: 'center bottom',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity, filter',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * ScrollZoom3D
 * Zooms an element as if the camera is flying into it —
 * scale starts small (far away) → 1 (at camera) → slightly past.
 * Like the Jesko front-on zoom reveal.
 */
export function ScrollZoom3D({
  children,
  className = '',
  startScale = 0.4,
  peakScale = 1.05,
  endScale = 1,
}: {
  children: ReactNode;
  className?: string;
  startScale?: number;
  peakScale?: number;
  endScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);

  const scale = useTransform(progress, [0, 0.5, 0.8, 1], [startScale, peakScale, endScale, endScale * 0.95]);
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.4]);
  const rotateY = useTransform(progress, [0, 0.5, 1], [-5, 0, 3]);

  const smoothScale = useSpring(scale, { stiffness: 50, damping: 20 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 40, damping: 18 });

  return (
    <div ref={ref} style={{ perspective: '1400px' }}>
      <motion.div
        className={className}
        style={{
          scale: smoothScale,
          opacity,
          rotateY: smoothRotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * HorizontalScrollReveal
 * Slides content in from the side with 3D rotation — like cards
 * fanning out from a deck. Ideal for category/feature grids.
 */
export function HorizontalScrollReveal({
  children,
  className = '',
  index = 0,
  direction = 'left',
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  direction?: 'left' | 'right';
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, ['start end', 'center center']);

  const dir = direction === 'left' ? -1 : 1;
  const offset = index * staggerDelay;

  const x = useTransform(progress, [offset, Math.min(offset + 0.5, 1)], [dir * 200, 0]);
  const rotateY = useTransform(progress, [offset, Math.min(offset + 0.5, 1)], [dir * 35, 0]);
  const opacity = useTransform(progress, [offset, Math.min(offset + 0.3, 1)], [0, 1]);
  const scale = useTransform(progress, [offset, Math.min(offset + 0.5, 1)], [0.7, 1]);

  const smoothX = useSpring(x, { stiffness: 60, damping: 20 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 60, damping: 20 });
  const smoothScale = useSpring(scale, { stiffness: 60, damping: 20 });

  return (
    <div ref={ref} style={{ perspective: '1000px' }}>
      <motion.div
        className={className}
        style={{
          x: smoothX,
          rotateY: smoothRotateY,
          scale: smoothScale,
          opacity,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * StickyScrollScene
 * A section that stays pinned while sub-elements animate in/out
 * during scroll. Like the Jesko feature highlight sections.
 */
export function StickyScrollScene({
  children,
  className = '',
  height = '300vh',
}: {
  children: (progress: MotionValue<number>) => ReactNode;
  className?: string;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={ref} style={{ height }} className={`relative ${className}`}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {children(scrollYProgress)}
      </div>
    </div>
  );
}

/**
 * Card3DTilt
 * Individual card with scroll-driven 3D tilt. Tilts away from center
 * of viewport as user scrolls past.
 */
export function Card3DTilt({
  children,
  className = '',
  tiltAmount = 15,
  hoverLift = true,
}: {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  hoverLift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);

  // Tilt based on position in viewport: top → tilt forward, bottom → tilt back
  const rotateX = useTransform(progress, [0, 0.5, 1], [tiltAmount, 0, -tiltAmount]);
  const smoothRotateX = useSpring(rotateX, { stiffness: 80, damping: 20 });

  // Mouse-driven tilt
  const mouseRotateX = useMotionValue(0);
  const mouseRotateY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseRotateX, { stiffness: 150, damping: 20 });
  const smoothMouseY = useSpring(mouseRotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseRotateY.set(((e.clientX - centerX) / rect.width) * 12);
    mouseRotateX.set(-((e.clientY - centerY) / rect.height) * 12);
  };

  const handleMouseLeave = () => {
    mouseRotateX.set(0);
    mouseRotateY.set(0);
  };

  return (
    <div
      ref={ref}
      style={{ perspective: '800px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={`${className} ${hoverLift ? 'hover:-translate-y-2 hover:shadow-2xl' : ''} transition-shadow duration-500`}
        style={{
          rotateX: smoothMouseX,
          rotateY: smoothMouseY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * TextScroll3D
 * Each word/line reveals with a staggered 3D rotation tied to scroll.
 * Creates the "text sweeping into view" effect.
 */
export function TextScroll3D({
  text,
  className = '',
  tag: Tag = 'h2',
  splitBy = 'word',
}: {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  splitBy?: 'word' | 'line';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, ['start end', 'center center']);

  const parts = splitBy === 'word' ? text.split(' ') : text.split('\n');

  return (
    <div ref={ref} style={{ perspective: '600px' }}>
      <Tag className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: splitBy === 'word' ? '0.3em' : '0' }}>
        {parts.map((part, i) => {
          const stagger = i * 0.04;
          return (
            <ScrollWord key={i} progress={progress} stagger={stagger} splitBy={splitBy}>
              {part}
            </ScrollWord>
          );
        })}
      </Tag>
    </div>
  );
}

function ScrollWord({
  children,
  progress,
  stagger,
  splitBy,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  stagger: number;
  splitBy: string;
}) {
  const rotateX = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.4, 1)],
    [90, 0]
  );
  const opacity = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.25, 1)],
    [0, 1]
  );
  const y = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.3, 1)],
    [40, 0]
  );

  const smoothRotate = useSpring(rotateX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 80, damping: 20 });

  return (
    <motion.span
      style={{
        display: 'inline-block',
        rotateX: smoothRotate,
        opacity,
        y: smoothY,
        transformOrigin: 'center bottom',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.span>
  );
}

/**
 * ScrollProgressBar3D
 * A 3D-styled progress bar that tracks vertical scroll position.
 * Glows as it fills.
 */
export function ScrollProgressBar3D() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #C75B39, #C4A35A, #E8A87C)',
        boxShadow: useTransform(
          glowOpacity,
          (v) => `0 0 ${v * 20}px rgba(199, 91, 57, ${v * 0.6}), 0 0 ${v * 40}px rgba(196, 163, 90, ${v * 0.3})`
        ),
      }}
    />
  );
}

/**
 * FloatingElement3D
 * Wraps any element to make it float and react to scroll
 * with subtle 3D rotation and parallax.
 */
export function FloatingElement3D({
  children,
  className = '',
  floatAmplitude = 10,
  floatSpeed = 4,
  scrollParallax = 0.3,
}: {
  children: ReactNode;
  className?: string;
  floatAmplitude?: number;
  floatSpeed?: number;
  scrollParallax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);

  const yParallax = useTransform(progress, [0, 1], [-100 * scrollParallax, 100 * scrollParallax]);
  const smoothY = useSpring(yParallax, { stiffness: 30, damping: 12 });

  return (
    <div ref={ref}>
      <motion.div
        className={className}
        animate={{
          y: [-floatAmplitude, floatAmplitude, -floatAmplitude],
          rotateZ: [-1, 1, -1],
        }}
        transition={{
          duration: floatSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          y: smoothY,
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * DepthRevealGrid
 * Wraps a grid of items with staggered 3D depth reveals.
 * Each child enters from depth with rotation.
 */
export function DepthRevealGrid({
  children,
  className = '',
  columns = 4,
}: {
  children: ReactNode[];
  className?: string;
  columns?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, ['start end', 'center center']);

  return (
    <div ref={ref} className={className} style={{ perspective: '1200px' }}>
      {children.map((child, i) => {
        const row = Math.floor(i / columns);
        const col = i % columns;
        const stagger = (row * 0.08) + (col * 0.05);

        return (
          <DepthRevealItem key={i} progress={progress} stagger={stagger} col={col} columns={columns}>
            {child}
          </DepthRevealItem>
        );
      })}
    </div>
  );
}

function DepthRevealItem({
  children,
  progress,
  stagger,
  col,
  columns,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  stagger: number;
  col: number;
  columns: number;
}) {
  const z = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.5, 1)],
    [-300, 0]
  );
  const opacity = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.3, 1)],
    [0, 1]
  );
  const rotateY = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.4, 1)],
    [col < columns / 2 ? -20 : 20, 0]
  );
  const scale = useTransform(
    progress,
    [stagger, Math.min(stagger + 0.5, 1)],
    [0.6, 1]
  );

  const smoothZ = useSpring(z, { stiffness: 50, damping: 18 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 50, damping: 18 });
  const smoothScale = useSpring(scale, { stiffness: 50, damping: 18 });

  return (
    <motion.div
      style={{
        translateZ: smoothZ,
        rotateY: smoothRotateY,
        scale: smoothScale,
        opacity,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CameraOrbit3D
 * Simulates a camera orbiting around content — the content
 * rotates Y as the user scrolls. Perfect for product showcases.
 */
export function CameraOrbit3D({
  children,
  className = '',
  rotateRange = [-25, 25],
  scaleRange = [0.9, 1.1],
}: {
  children: ReactNode;
  className?: string;
  rotateRange?: [number, number];
  scaleRange?: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);

  const rotateY = useTransform(progress, [0, 1], rotateRange);
  const scale = useTransform(progress, [0, 0.5, 1], [scaleRange[0], scaleRange[1], scaleRange[0]]);

  const smoothRotateY = useSpring(rotateY, { stiffness: 30, damping: 15 });
  const smoothScale = useSpring(scale, { stiffness: 30, damping: 15 });

  return (
    <div ref={ref} style={{ perspective: '1400px' }} className={className}>
      <motion.div
        style={{
          rotateY: smoothRotateY,
          scale: smoothScale,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
