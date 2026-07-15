# 靓学 (LiangXue) - 雅思学习网站 UI 整体规划

## 概述

靓学是一款雅思学习软件，要求简洁灵敏护眼的 UI、丝滑动效、抽屉式 Sidebar、注册登录、明暗模式、移动端适配。本阶段目标是**先把整体 UI 框架做出来**，功能模块先放占位页，等用户测试后追加具体功能。

---

## 当前状态分析

- **框架**: Next.js 16 + App Router + TypeScript + Tailwind CSS 4
- **已有**: 基础项目骨架、API Routes 示例、Zod 校验工具、proxy.ts (CORS)
- **缺失**: 无 UI 组件库、无布局系统、无认证、无主题切换、无动效

---

## 技术选型决策

| 领域 | 选型 | 原因 |
|------|------|------|
| 组件库 | shadcn/ui | 可定制性强、Tailwind 原生、轻量、Vercel 生态 |
| 动效 | framer-motion | React 动效标准库、打断动画/布局动画/弹出动画全覆盖 |
| 图标 | lucide-react | shadcn/ui 默认图标库、轻量美观 |
| 认证 API | 自建 Route Handler + localStorage 模拟 | 先做 UI，后端对接时替换 |
| 主题 | next-themes | Next.js 明暗模式标准方案 |
| 表单 | react-hook-form + zod | 类型安全的表单校验 |

---

## 页面与布局规划

### 全局布局结构
```
┌─────────────────────────────────────────┐
│  Header (Logo + 主题切换 + 用户头像)      │
├────┬────────────────────────────────────┤
│    │                                    │
│ S  │         Main Content               │
│ i  │                                    │
│ d  │                                    │
│ e  │                                    │
│ b  │                                    │
│ a  │                                    │
│ r  │                                    │
│    │                                    │
├────┴────────────────────────────────────┤
│  Mobile: Bottom Tab Bar                 │
└─────────────────────────────────────────┘
```

### 页面路由
| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页/Dashboard | 学习概览、今日任务 |
| `/vocabulary` | 词汇学习 | 雅思词汇模块 |
| `/listening` | 听力练习 | 听力模块 |
| `/reading` | 阅读练习 | 阅读模块 |
| `/writing` | 写作练习 | 写作模块 |
| `/speaking` | 口语练习 | 口语模块 |
| `/profile` | 个人中心 | 用户信息、设置 |
| `/auth/login` | 登录 | 登录页 |
| `/auth/register` | 注册 | 注册页 |

---

## 具体实施步骤

### Step 1: 安装依赖
```bash
npx shadcn@latest init
npx shadcn@latest add button card input label dialog sheet tabs avatar dropdown-menu separator toast skeleton switch
npm install framer-motion next-themes react-hook-form lucide-react
```

### Step 2: 主题与全局样式 (globals.css)
- 定义护眼配色方案（亮色：暖白底 + 深绿/深灰文字；暗色：深灰底 + 浅色文字）
- 使用柔和的绿色调作为主色（雅思/学习相关、护眼）
- 配置 CSS 变量供 shadcn/ui 使用
- 设置 `next-themes` 的 `class` 策略

**配色方案：**
- 亮色：背景 `#f8f9f5`（暖白微绿）、前景 `#2d3a2e`、主色 `#4a7c59`（森林绿）、卡片 `#ffffff`
- 暗色：背景 `#1a1f1b`（深绿灰）、前景 `#e8ede9`、主色 `#6db87a`（亮绿）、卡片 `#242a25`

### Step 3: ThemeProvider + 布局组件
- 创建 `src/components/providers/theme-provider.tsx` — next-themes 封装
- 创建 `src/components/layout/header.tsx` — 顶部导航栏（Logo、主题切换、用户菜单）
- 创建 `src/components/layout/sidebar.tsx` — 抽屉式侧边栏（framer-motion 动画）
- 创建 `src/components/layout/main-layout.tsx` — 组合 Header + Sidebar + Content
- 移动端：Sidebar 变为 Sheet 抽屉，底部 Tab Bar

### Step 4: 动效系统
- 创建 `src/components/motion/page-transition.tsx` — 页面切换动画
- 创建 `src/components/motion/fade-in.tsx` — 淡入动画组件
- 创建 `src/components/motion/slide-in.tsx` — 滑入动画组件
- 创建 `src/components/motion/loading-skeleton.tsx` — 加载骨架屏
- 所有动效基于 framer-motion，支持打断、弹性回弹

### Step 5: 认证页面 UI
- `src/app/auth/login/page.tsx` — 登录页（邮箱+密码、记住我、跳转注册）
- `src/app/auth/register/page.tsx` — 注册页（邮箱+密码+确认密码、跳转登录）
- `src/app/auth/layout.tsx` — 认证页独立布局（居中卡片、无 Sidebar）
- `src/lib/auth.ts` — 认证状态管理（localStorage 模拟，后续可替换为真实后端）

### Step 6: 各模块页面占位
- Dashboard 首页：学习数据卡片概览
- 词汇/听力/阅读/写作/口语：各占位页，带标题和"即将上线"提示
- 个人中心页：头像、基本信息、设置项

### Step 7: 移动端适配
- Sidebar 桌面端常驻、移动端 Sheet 抽屉
- Header 移动端显示汉堡菜单按钮
- 底部 Tab Bar 仅移动端显示
- 响应式间距和字体

### Step 8: 交互逻辑
- 未登录访问受保护页 → 重定向到登录
- 登录/注册成功 → 跳转首页
- Sidebar 当前页高亮
- 主题切换持久化
- 页面切换加载状态

---

## 文件变更清单

### 新增文件
```
src/components/providers/theme-provider.tsx
src/components/layout/header.tsx
src/components/layout/sidebar.tsx
src/components/layout/main-layout.tsx
src/components/layout/mobile-nav.tsx
src/components/motion/page-transition.tsx
src/components/motion/fade-in.tsx
src/components/motion/slide-in.tsx
src/components/motion/loading-skeleton.tsx
src/app/auth/login/page.tsx
src/app/auth/register/page.tsx
src/app/auth/layout.tsx
src/app/(main)/layout.tsx          — 主布局（Header + Sidebar）
src/app/(main)/page.tsx            — Dashboard
src/app/(main)/vocabulary/page.tsx
src/app/(main)/listening/page.tsx
src/app/(main)/reading/page.tsx
src/app/(main)/writing/page.tsx
src/app/(main)/speaking/page.tsx
src/app/(main)/profile/page.tsx
src/lib/auth.ts
src/hooks/use-auth.ts
```

### 修改文件
```
src/app/layout.tsx     — 添加 ThemeProvider、调整 metadata
src/app/page.tsx       — 重定向到 / 或 Dashboard
src/app/globals.css    — 护眼配色、CSS 变量、动画关键帧
```

### 删除文件
```
src/app/api/hello/route.ts  — 示例 API，清理掉
```

---

## 假设与决策

1. **认证方案**: 先用 localStorage 模拟，UI 完整，后端 API 对接时替换
2. **页面内容**: 各学习模块先做占位 UI，具体功能等用户反馈
3. **动效**: 基于 framer-motion 的 layout animations + AnimatePresence 实现页面级切换
4. **护眼**: 使用暖白 + 绿色系配色，避免高对比纯白纯黑
5. **shadcn/ui**: 使用 New York 风格，rounded 适中

---

## 验证步骤

1. `npm run build` 构建无错误
2. 明暗模式切换正常，刷新后主题保持
3. 侧边栏桌面端常驻、移动端抽屉正常开合
4. 登录/注册表单校验正常，提交跳转正确
5. 页面切换有动效，打断动画正常
6. 移动端响应式布局正常
7. 当前页面在 Sidebar 中高亮
