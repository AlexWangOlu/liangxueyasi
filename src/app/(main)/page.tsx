"use client";

import { motion } from "framer-motion";
import { BookOpen, Headphones, BookText, PenTool, Mic, TrendingUp, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { PageTransition } from "@/components/motion/page-transition";
import Link from "next/link";

const stats = [
  { label: "今日学习", value: "45分钟", icon: Clock, color: "text-primary" },
  { label: "已掌握词汇", value: "320", icon: BookOpen, color: "text-primary" },
  { label: "连续打卡", value: "7天", icon: TrendingUp, color: "text-primary" },
  { label: "目标进度", value: "68%", icon: Target, color: "text-primary" },
];

const modules = [
  { href: "/vocabulary", label: "词汇学习", desc: "雅思核心词汇", icon: BookOpen },
  { href: "/listening", label: "听力练习", desc: "真题听力训练", icon: Headphones },
  { href: "/reading", label: "阅读练习", desc: "阅读技巧提升", icon: BookText },
  { href: "/writing", label: "写作练习", desc: "写作模板与批改", icon: PenTool },
  { href: "/speaking", label: "口语练习", desc: "口语话题训练", icon: Mic },
];

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome */}
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">欢迎回来 👋</h1>
            <p className="text-muted-foreground mt-1">今天继续你的雅思学习之旅吧</p>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.05}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Learning Modules */}
        <FadeIn delay={0.2}>
          <h2 className="text-lg font-semibold">学习模块</h2>
        </FadeIn>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <FadeIn key={mod.href} delay={0.25 + i * 0.05}>
              <Link href={mod.href}>
                <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Card className="border-border/50 cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <mod.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{mod.label}</CardTitle>
                          <p className="text-sm text-muted-foreground">{mod.desc}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${30 + Math.random() * 40}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                          />
                        </div>
                        <span className="ml-3 text-xs text-muted-foreground">继续学习</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
