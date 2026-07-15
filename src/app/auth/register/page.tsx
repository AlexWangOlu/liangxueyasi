"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/auth";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = register(email, password, confirmPassword);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "注册失败");
      setLoading(false);
    }
  };

  // 密码强度指示
  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return Math.min(s, 4);
  };

  const strength = getStrength(password);
  const strengthLabels = ["", "弱", "一般", "较强", "强"];
  const strengthColors = ["", "bg-destructive", "bg-orange-400", "bg-primary/70", "bg-primary"];

  return (
    <motion.div
      className="w-full max-w-[400px]"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* 移动端 Logo */}
      <motion.div variants={fadeUp} className="lg:hidden flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-md shadow-primary/20">
          <span className="text-primary-foreground font-bold text-base">靓</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground leading-tight">靓学</h1>
          <p className="text-[10px] text-foreground/30 tracking-wider">IELTS LEARNING</p>
        </div>
      </motion.div>

      {/* 标题 */}
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-foreground">创建账号</h2>
        <p className="mt-1.5 text-sm text-foreground/40">注册靓学，开启雅思学习之旅</p>
      </motion.div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <motion.div variants={fadeUp} className="space-y-2">
          <Label htmlFor="email" className="text-foreground/60 text-xs font-medium">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            className="h-11 rounded-xl bg-foreground/[0.03] border-foreground/[0.06] focus:border-primary/40 transition-colors"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-2">
          <Label htmlFor="password" className="text-foreground/60 text-xs font-medium">密码</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="至少6位密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              className="h-11 rounded-xl bg-foreground/[0.03] border-foreground/[0.06] focus:border-primary/40 pr-10 transition-colors"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div key="off" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <EyeOff className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div key="on" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Eye className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          {/* 密码强度条 */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 pt-1"
            >
              <div className="flex gap-1 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength] : "bg-foreground/[0.06]"}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-foreground/30">{strengthLabels[strength]}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground/60 text-xs font-medium">确认密码</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            className="h-11 rounded-xl bg-foreground/[0.03] border-foreground/[0.06] focus:border-primary/40 transition-colors"
          />
          {/* 密码匹配提示 */}
          {confirmPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-[11px] ${password === confirmPassword ? "text-primary" : "text-destructive"}`}
            >
              {password === confirmPassword ? "密码一致" : "密码不一致"}
            </motion.p>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="text-sm text-destructive rounded-lg bg-destructive/8 px-3 py-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div variants={fadeUp} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-medium shadow-md shadow-primary/15"
            disabled={loading}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  注册中...
                </motion.div>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  创建账号
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>

      {/* 分隔 */}
      <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3">
        <div className="flex-1 h-px bg-foreground/[0.06]" />
        <span className="text-[11px] text-foreground/20">或</span>
        <div className="flex-1 h-px bg-foreground/[0.06]" />
      </motion.div>

      {/* 登录链接 */}
      <motion.div variants={fadeUp} className="mt-6 text-center">
        <p className="text-sm text-foreground/40">
          已有账号？{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline underline-offset-4">
            登录
          </Link>
        </p>
      </motion.div>

      {/* 底部装饰 */}
      <motion.div
        variants={fadeUp}
        className="mt-10 flex items-center justify-center gap-1.5 text-foreground/15"
      >
        <Sparkles className="h-3 w-3" />
        <span className="text-[10px] tracking-wider">POWERED BY AI</span>
      </motion.div>
    </motion.div>
  );
}
