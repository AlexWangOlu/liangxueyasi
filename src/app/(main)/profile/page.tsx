"use client";

import { useRouter } from "next/navigation";
import { User, Settings, Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { PageTransition } from "@/components/motion/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/auth";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const settingsItems = [
  { icon: Bell, label: "消息通知", description: "管理学习提醒" },
  { icon: Shield, label: "隐私设置", description: "账户安全与隐私" },
  { icon: Settings, label: "通用设置", description: "语言、显示等" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <FadeIn>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {user?.name?.[0] || "学"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user?.name || "雅思学习者"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email || "未登录"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Learning Stats */}
        <FadeIn delay={0.1}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">学习统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">320</p>
                  <p className="text-xs text-muted-foreground">已学词汇</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">7</p>
                  <p className="text-xs text-muted-foreground">连续天数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">45h</p>
                  <p className="text-xs text-muted-foreground">学习时长</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Settings */}
        <FadeIn delay={0.15}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {settingsItems.map((item) => (
                <motion.button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              ))}
              <Separator className="my-2" />
              <div className="flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">深色模式</p>
                    <p className="text-xs text-muted-foreground">护眼暗色主题</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Logout */}
        <FadeIn delay={0.2}>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </FadeIn>
      </div>
    </PageTransition>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
    />
  );
}
