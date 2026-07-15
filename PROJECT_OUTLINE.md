# 靓学 (LiangXue) - 雅思学习平台项目大纲

## 项目概述

靓学是一款专注于雅思考试备考的学习平台，提供词汇、听力、阅读、写作、口语五大模块的完整学习体验。平台采用现代化的技术栈，注重用户体验和学习效果。

---

## 技术栈

| 领域 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js | 16.2.10 | App Router 模式 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 4.x | 原子化CSS |
| 组件库 | shadcn/ui | 4.x | 基于Radix UI |
| 动效 | framer-motion | 12.x | 流畅动画 |
| 图标 | lucide-react | 1.x | 精美图标 |
| ORM | Prisma | 6.x | SQLite数据库 |
| 表单 | react-hook-form | 7.x | 表单管理 |
| 校验 | Zod | 4.x | 类型安全校验 |
| 主题 | next-themes | 0.4.x | 明暗模式 |
| 通知 | sonner | 2.x | Toast通知 |

---

## 项目结构

```
d:\2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/             # 主布局（带侧边栏）
│   │   │   ├── page.tsx        # Dashboard首页
│   │   │   ├── vocabulary/     # 词汇学习模块
│   │   │   │   └── page.tsx
│   │   │   ├── listening/      # 听力练习模块
│   │   │   │   └── page.tsx
│   │   │   ├── reading/        # 阅读练习模块
│   │   │   │   └── page.tsx
│   │   │   ├── writing/        # 写作练习模块
│   │   │   │   └── page.tsx
│   │   │   ├── speaking/       # 口语练习模块
│   │   │   │   └── page.tsx
│   │   │   ├── profile/        # 个人中心
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx      # 主布局（Header + Sidebar）
│   │   ├── api/                # API路由
│   │   │   ├── vocabulary/     # 词汇API
│   │   │   │   ├── lists/route.ts
│   │   │   │   └── words/route.ts
│   │   │   └── writing/        # 写作API
│   │   │       ├── filters/route.ts
│   │   │       └── questions/route.ts
│   │   ├── auth/               # 认证页面
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── layout.tsx          # 根布局
│   │   └── globals.css         # 全局样式
│   ├── components/
│   │   ├── layout/             # 布局组件
│   │   │   ├── header.tsx      # 顶部导航栏
│   │   │   ├── sidebar.tsx     # 侧边栏
│   │   │   └── mobile-nav.tsx  # 移动端导航
│   │   ├── motion/             # 动画组件
│   │   │   ├── page-transition.tsx
│   │   │   ├── fade-in.tsx
│   │   │   ├── slide-in.tsx
│   │   │   └── loading-skeleton.tsx
│   │   ├── providers/          # 状态提供者
│   │   │   └── theme-provider.tsx
│   │   └── ui/                 # shadcn/ui组件
│   ├── hooks/                  # 自定义Hooks
│   │   └── use-auth.ts         # 认证Hook
│   ├── lib/                    # 工具库
│   │   ├── api-utils.ts        # API工具函数
│   │   ├── auth.ts             # 认证逻辑
│   │   ├── prisma.ts           # Prisma客户端
│   │   └── utils.ts            # 通用工具
│   └── types/                  # 类型定义
│       └── index.ts
├── prisma/                     # Prisma数据库
│   ├── schema.prisma           # 数据库模型
│   ├── dev.db                  # SQLite数据库
│   └── migrations/             # 迁移文件
└── public/                     # 静态资源
```

---

## 核心模块

### 1. 词汇学习 (Vocabulary)

**功能特性：**
- 7000+ 雅思词汇库（IELTS_2、IELTS_3）
- 多种学习模式：浏览、闪卡、记忆、测试、列表
- 分页加载支持（50条/页）
- 单词搜索和筛选
- 单词详情弹窗（发音、释义、例句、短语、同义词、反义词）
- 记忆方法展示

**API路由：**
- `GET /api/vocabulary/lists` - 获取词汇书单列表
- `GET /api/vocabulary/words` - 获取单词列表（支持分页、搜索、筛选）
- `GET /api/vocabulary/words/[id]` - 获取单个单词详情

**数据库模型：**
- `Vocabulary` - 词汇书单
- `Word` - 单词（含音标、翻译、例句、短语等）

---

### 2. 写作练习 (Writing)

**功能特性：**
- 601 道雅思写作 Task 2 真题
- 题目搜索和筛选（按话题、年份）
- 题目详情抽屉（英文原题、中文翻译、观点分析）
- **待实现：** 写作编辑器、计时功能、AI批改、分数评估、改进建议

**API路由：**
- `GET /api/writing/questions` - 获取写作题目列表（支持分页、搜索、筛选）
- `GET /api/writing/questions/[id]` - 获取单个题目详情
- `GET /api/writing/filters` - 获取筛选条件（话题、年份）

**数据库模型：**
- `WritingQuestion` - 写作题目（年份、日期、英文、中文、话题）
- `WritingView` - 观点分析（支持A/B观点）

---

### 3. 听力练习 (Listening)

**状态：** 占位页，待开发

---

### 4. 阅读练习 (Reading)

**状态：** 占位页，待开发

---

### 5. 口语练习 (Speaking)

**状态：** 占位页，待开发

---

### 6. 认证系统 (Auth)

**功能特性：**
- 登录/注册页面
- localStorage 模拟认证（后端对接时替换）
- 未登录访问保护页面自动跳转登录

---

### 7. 个人中心 (Profile)

**状态：** 基础页面，待完善

---

## 设计规范

### 配色方案

| 模式 | 背景色 | 前景色 | 主色 | 卡片色 |
|------|--------|--------|------|--------|
| 亮色 | #f8f9f5 | #2d3a2e | #4a7c59 | #ffffff |
| 暗色 | #1a1f1b | #e8ede9 | #6db87a | #242a25 |

**设计理念：** 护眼配色，使用暖白+绿色系，避免高对比纯白纯黑。

### 动效规范

- 页面切换：基于 framer-motion 的 fade + slide 动画
- 组件入场：stagger 交错动画
- 交互反馈：hover 缩放、tap 收缩
- 模态框：slide 从右侧滑入

### 响应式规范

- 桌面端：侧边栏常驻
- 平板端：响应式布局
- 移动端：侧边栏变为底部 Tab Bar

---

## 开发流程

### 环境搭建

```bash
# 安装依赖
npm install

# 数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 代码规范

- 使用 TypeScript 严格模式
- 组件命名：PascalCase
- 文件命名：kebab-case
- 变量命名：camelCase
- 使用 clsx + tailwind-merge 处理样式
- 组件内使用 useCallback 优化性能
- API 路由使用 Zod 校验

---

## 部署说明

- 框架：Next.js，支持 Vercel、Netlify、Docker
- 数据库：SQLite，生产环境建议迁移至 PostgreSQL
- 环境变量：`.env` 文件管理（DATABASE_URL）

---

## 待办事项

### 高优先级
- [ ] 完善写作功能（编辑器、计时、AI批改、打分）
- [ ] 实现听力练习模块
- [ ] 实现阅读练习模块
- [ ] 实现口语练习模块
- [ ] 替换模拟认证为真实后端

### 中优先级
- [ ] 添加学习进度追踪
- [ ] 实现错题本功能
- [ ] 添加学习计划制定
- [ ] 实现数据统计图表

### 低优先级
- [ ] 支持多语言切换
- [ ] 添加社交分享功能
- [ ] 实现学习社区

---

## 参考文档

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [framer-motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
