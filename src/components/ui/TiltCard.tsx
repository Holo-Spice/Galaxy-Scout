"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/animation";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  glowColor?: string;
}

export function TiltCard({
  children,
  className,
  tiltAmount = 8,
  glowColor,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [tiltAmount, -tiltAmount]),
    { stiffness: 200, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-tiltAmount, tiltAmount]),
    { stiffness: 200, damping: 20 }
  );
  const scale = useSpring(isHovered ? 1.03 : 1, {
    stiffness: 200,
    damping: 20,
  });
  const glowOpacity = useSpring(isHovered ? 0.25 : 0, {
    stiffness: 200,
    damping: 20,
  });
  const boxShadow = useSpring(
    isHovered
      ? "0 20px 40px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(110,120,255,0.1)"
      : "0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
    { stiffness: 200, damping: 20 }
  );

  useEffect(() => {
    const hasTouchSupport =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouchSupport);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || reducedMotion || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / rect.width);
    mouseY.set(y / rect.height);
    ref.current.style.setProperty("--mouse-x", `${x}px`);
    ref.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseEnter = () => {
    if (!reducedMotion && !isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  if (reducedMotion || isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        scale,
        boxShadow,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
        style={{ opacity: glowOpacity }}
      >
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor ?? "rgba(110,120,255,0.12)"} 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
