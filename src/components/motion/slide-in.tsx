"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideInProps {
  children: ReactNode;
  direction?: "left" | "right" | "top" | "bottom";
  delay?: number;
  className?: string;
}

const slideOffsets = {
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  top: { x: 0, y: -40 },
  bottom: { x: 0, y: 40 },
};

export function SlideIn({ children, direction = "left", delay = 0, className }: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...slideOffsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
