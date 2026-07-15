"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { BookOpen, Headphones, BookText, PenTool, Mic, Home, Sun, Moon, LogIn, LogOut, Radar, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const WIDTH_COLLAPSED = 68;
const WIDTH_EXPANDED = 240;
const WIDTH_MOBILE = 270;

const spring = { type: "spring" as const, stiffness: 220, damping: 26, mass: 1 };
const softSpring = { type: "spring" as const, stiffness: 180, damping: 22 };

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/vocabulary", label: "词汇", icon: BookOpen },
  { href: "/listening", label: "听力", icon: Headphones },
  { href: "/reading", label: "阅读", icon: BookText },
  { href: "/writing", label: "写作", icon: PenTool },
  { href: "/speaking", label: "口语", icon: Mic },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isLoggedIn, logout: doLogout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sensingMode, setSensingMode] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const width = useMotionValue(WIDTH_EXPANDED);
  const labelOpacity = useTransform(width, [WIDTH_COLLAPSED + 20, WIDTH_EXPANDED - 20], [0, 1]);
  const labelX = useTransform(width, [WIDTH_COLLAPSED, WIDTH_EXPANDED], [-12, 0]);
  const contentPadX = useTransform(width, [WIDTH_COLLAPSED, WIDTH_EXPANDED], [8, 16]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-sensing");
    if (saved === "true") {
      setSensingMode(true);
      width.set(WIDTH_COLLAPSED);
    }
  }, [width]);

  const handleDesktopMouseEnter = useCallback(() => {
    if (sensingMode) {
      setIsHovering(true);
      animate(width, WIDTH_EXPANDED, { ...softSpring, damping: 30 });
    }
  }, [sensingMode, width]);

  const handleDesktopMouseLeave = useCallback(() => {
    if (sensingMode) {
      setIsHovering(false);
      animate(width, WIDTH_COLLAPSED, { ...softSpring, damping: 30 });
    }
  }, [sensingMode, width]);

  const mobileDragX = useMotionValue(0);
  const handleMobileDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -200) onClose();
  }, [onClose]);

  const onLogout = useCallback(() => {
    doLogout();
    onClose();
    router.push("/auth/login");
  }, [doLogout, onClose, router]);

  const renderNavItem = (item: (typeof navItems)[0]) => {
    const isActive = pathname === item.href;
    return (
      <Link key={item.href} href={item.href} onClick={onClose}>
        <motion.div
          className={cn(
            "group relative flex items-center gap-3 rounded-2xl py-2.5 text-[13px] font-medium overflow-hidden cursor-pointer",
            isActive ? "text-primary" : "text-foreground/40 hover:text-foreground/80"
          )}
          style={{ paddingLeft: 12, paddingRight: 12 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={softSpring}
        >
          {isActive && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 rounded-2xl bg-primary/10" transition={spring} />
          )}
          {isActive && (
            <motion.div layoutId="nav-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" transition={spring} />
          )}
          <div className="absolute inset-0 rounded-2xl bg-foreground/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
          <item.icon className="h-[18px] w-[18px] shrink-0 relative z-10" />
          <motion.span className="relative z-10 whitespace-nowrap" style={{ opacity: labelOpacity, x: labelX }}>
            {item.label}
          </motion.span>
        </motion.div>
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <motion.div className="flex items-center gap-3 shrink-0" style={{ paddingTop: 20, paddingBottom: 12, paddingLeft: contentPadX, paddingRight: contentPadX }}>
        <motion.div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary shrink-0" whileHover={{ scale: 1.08, rotate: 2 }} whileTap={{ scale: 0.92 }} transition={softSpring}>
          <span className="text-primary-foreground font-bold text-sm">靓</span>
        </motion.div>
        <motion.div className="overflow-hidden" style={{ opacity: labelOpacity, x: labelX }}>
          <h1 className="font-bold text-base text-foreground whitespace-nowrap leading-tight">靓学</h1>
          <p className="text-[9px] text-foreground/30 whitespace-nowrap leading-tight tracking-wider">IELTS LEARNING</p>
        </motion.div>
      </motion.div>

      <motion.div className="mx-4 h-px bg-foreground/[0.06] shrink-0" style={{ opacity: labelOpacity }} />

      <motion.nav className="flex-1 space-y-0.5 py-3 overflow-y-auto" style={{ paddingLeft: contentPadX, paddingRight: contentPadX }}>
        {navItems.map(renderNavItem)}
      </motion.nav>

      <motion.div className="mx-4 h-px bg-foreground/[0.06] shrink-0" style={{ opacity: labelOpacity }} />

      <motion.div className="shrink-0 py-3 space-y-1" style={{ paddingLeft: contentPadX, paddingRight: contentPadX }}>
        {isLoggedIn ? (
          <>
            <Link href="/profile" onClick={onClose}>
              <motion.div className={cn("group relative flex items-center gap-3 rounded-2xl py-2 text-[13px] font-medium overflow-hidden cursor-pointer", pathname === "/profile" ? "text-primary" : "text-foreground/40 hover:text-foreground/80")} style={{ paddingLeft: 12, paddingRight: 12 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={softSpring}>
                {pathname === "/profile" && <motion.div layoutId="nav-glow" className="absolute inset-0 rounded-2xl bg-primary/10" transition={spring} />}
                {pathname === "/profile" && <motion.div layoutId="nav-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" transition={spring} />}
                <div className="absolute inset-0 rounded-2xl bg-foreground/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Avatar className="h-[18px] w-[18px] shrink-0 relative z-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[8px]">{user?.name?.[0] || "学"}</AvatarFallback>
                </Avatar>
                <motion.span className="relative z-10 whitespace-nowrap truncate text-foreground/60" style={{ opacity: labelOpacity, x: labelX }}>
                  {user?.name || "我的"}
                </motion.span>
              </motion.div>
            </Link>
            <motion.button onClick={onLogout} className="group flex w-full items-center gap-3 rounded-2xl py-2 text-[13px] text-foreground/30 hover:text-destructive transition-colors" style={{ paddingLeft: 12, paddingRight: 12 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <motion.span className="whitespace-nowrap" style={{ opacity: labelOpacity, x: labelX }}>退出登录</motion.span>
            </motion.button>
          </>
        ) : (
          <Link href="/auth/login" onClick={onClose}>
            <motion.div className="group flex items-center gap-3 rounded-2xl py-2 text-[13px] font-medium text-foreground/40 hover:text-foreground/80" style={{ paddingLeft: 12, paddingRight: 12 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={softSpring}>
              <LogIn className="h-[18px] w-[18px] shrink-0" />
              <motion.span className="whitespace-nowrap" style={{ opacity: labelOpacity, x: labelX }}>登录</motion.span>
            </motion.div>
          </Link>
        )}

        <div className="flex items-center gap-3 rounded-2xl py-1.5" style={{ paddingLeft: 12, paddingRight: 8 }}>
          {mounted && (
            <>
              <motion.button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} whileHover={{ scale: 1.15, rotate: 20 }} whileTap={{ scale: 0.8 }} transition={softSpring} className="shrink-0">
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div key="moon" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                      <Moon className="h-4 w-4 text-foreground/40" />
                    </motion.div>
                  ) : (
                    <motion.div key="sun" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                      <Sun className="h-4 w-4 text-foreground/40" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.span className="text-[11px] text-foreground/30 flex-1 whitespace-nowrap" style={{ opacity: labelOpacity, x: labelX }}>
                {theme === "dark" ? "暗色模式" : "亮色模式"}
              </motion.span>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </>
          )}
        </div>

        <motion.button onClick={() => setSensingMode(!sensingMode)} className="hidden md:flex items-center gap-3 rounded-2xl py-2 text-[13px] font-medium text-foreground/25 hover:text-foreground/60 transition-colors" style={{ paddingLeft: 12, paddingRight: 12 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          <motion.div animate={{ rotate: sensingMode ? 180 : 0 }} transition={softSpring} className="shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M9 3v18" opacity="0.4" />
              <path d="M16 10l-3 3 3 3" />
            </svg>
          </motion.div>
          <motion.span className="whitespace-nowrap" style={{ opacity: labelOpacity, x: labelX }}>感应模式</motion.span>
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <>
      <motion.aside className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden" style={{ width, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)", borderRadius: "0 20px 20px 0" }} onMouseEnter={handleDesktopMouseEnter} onMouseLeave={handleDesktopMouseLeave}>
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md md:hidden" onClick={onClose} />
            <motion.aside key="mobile-drawer" initial={{ x: -WIDTH_MOBILE, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -WIDTH_MOBILE, opacity: 0.5 }} transition={{ ...spring, damping: 30 }} drag="x" dragConstraints={{ left: -WIDTH_MOBILE, right: 0 }} dragElastic={0.05} onDragEnd={handleMobileDragEnd} style={{ x: mobileDragX, borderRadius: "0 24px 24px 0", width: WIDTH_MOBILE, background: "var(--sidebar)", boxShadow: "8px 0 40px rgba(0,0,0,0.08)" }} className="fixed left-0 top-0 z-50 h-screen md:hidden overflow-hidden">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
