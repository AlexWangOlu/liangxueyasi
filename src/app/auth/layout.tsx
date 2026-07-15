"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* 左侧品牌展示区 */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-primary/5 items-center justify-center">
        {/* 浮动装饰圆 */}
        <motion.div
          className="absolute top-[15%] left-[20%] w-32 h-32 rounded-full bg-primary/8"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-24 h-24 rounded-full bg-primary/6"
          animate={{ y: [0, 16, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-[50%] right-[30%] w-16 h-16 rounded-full bg-primary/10"
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-[35%] left-[10%] w-20 h-20 rounded-2xl bg-primary/6"
          animate={{ y: [0, 14, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* 品牌内容 */}
        <div className="relative z-10 px-12 text-center">
          <motion.div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/20"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
          >
            <span className="text-primary-foreground font-bold text-3xl">靓</span>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            靓学
          </motion.h1>
          <motion.p
            className="text-lg text-foreground/40 font-light tracking-wide"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            IELTS Learning Platform
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col gap-3 text-sm text-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {["词汇 · 听力 · 阅读 · 写作 · 口语", "智能学习，高效备考", "你的雅思私人教练"].map((text, i) => (
              <motion.p
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
