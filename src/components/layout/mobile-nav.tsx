"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Headphones, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const mobileNavItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/vocabulary", label: "词汇", icon: BookOpen },
  { href: "/listening", label: "听力", icon: Headphones },
  { href: "/profile", label: "我的", icon: User },
];

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/80 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* 更多菜单 */}
        <button
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">更多</span>
        </button>
      </div>
    </nav>
  );
}
