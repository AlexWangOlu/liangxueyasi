"use client";

import { Mic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { PageTransition } from "@/components/motion/page-transition";

export default function SpeakingPage() {
  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">口语练习</h1>
              <p className="text-muted-foreground">口语话题训练</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">口语练习模块</h2>
              <p className="text-muted-foreground max-w-md">
                雅思口语训练功能正在开发中，敬请期待。将包含 Part 1/2/3 话题训练、语音评分等功能。
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
