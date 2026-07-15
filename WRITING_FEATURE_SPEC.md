# 写作功能详细需求文档

## 概述

当前写作模块仅实现了题目列表浏览和题目详情展示，缺少核心的写作练习功能。本需求文档详细描述了需要实现的写作练习完整流程，包括：

1. **自定义写作题目生成** - 通过 DeepSeek API 动态生成写作题目
2. **写作编辑器** - 支持用户进行写作练习
3. **计时功能** - 模拟真实考试环境的倒计时
4. **AI批改与打分** - 调用 DeepSeek API 进行作文评估
5. **总结报告** - 提供语法错误、改进建议等详细反馈

---

## 功能需求

### 1. 写作模式选择

**需求描述：**
用户进入写作页面后，可以选择两种模式：

| 模式 | 说明 | 入口位置 |
|------|------|----------|
| **真题练习** | 从已有题库中选择题目进行写作 | 现有题目卡片点击进入 |
| **自定义写作** | 输入主题，由 AI 生成写作题目 | 页面顶部新增"自定义写作"按钮 |

**用户流程：**
```
写作首页 → 选择模式
         ├─ 真题练习 → 选择题目 → 开始写作
         └─ 自定义写作 → 输入主题 → AI生成题目 → 开始写作
```

---

### 2. 自定义写作题目生成

**需求描述：**
用户输入一个主题（如"环境保护"、"科技发展"等），系统调用 DeepSeek API 生成一篇符合雅思写作 Task 2 格式的题目。

**输入字段：**
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| topic | string | 用户输入的写作主题 | "人工智能" |
| type | enum | 题目类型（可选） | Argumentative / Discussion / Opinion |

**AI生成题目格式：**
```
{
  "en": "Some people believe that artificial intelligence will replace human workers in the future. To what extent do you agree or disagree?",
  "zh": "有些人认为人工智能将在未来取代人类工人。在多大程度上你同意或不同意？",
  "topic": "Technology",
  "type": "Argumentative"
}
```

**API设计：**
- 路由：`POST /api/writing/generate`
- 请求体：`{ topic: string, type?: string }`
- 响应：生成的写作题目对象

**安全要求：**
- DeepSeek API Key 必须存储在服务端环境变量中
- 前端只调用内部 API，不直接访问第三方服务

---

### 3. 写作编辑器

**需求描述：**
提供一个功能完善的写作编辑器，支持用户进行写作练习。

**功能特性：**
| 功能 | 说明 |
|------|------|
| 文本输入 | 支持多行文本输入，字数统计 |
| 字数限制 | 默认 250-300 词（雅思 Task 2 要求） |
| 实时保存 | 自动保存草稿到 localStorage |
| 格式工具栏 | 基础格式化（粗体、斜体、列表） |
| 字数统计 | 实时显示已输入字数 |

**UI设计：**
- 编辑器区域占页面主要空间
- 顶部显示题目和计时
- 底部显示字数统计和提交按钮
- 响应式布局，适配移动端

---

### 4. 计时功能

**需求描述：**
模拟真实雅思考试环境，提供倒计时功能。

**功能特性：**
| 功能 | 说明 |
|------|------|
| 预设时长 | 默认 40 分钟（雅思写作 Task 2 时长） |
| 自定义时长 | 支持用户自定义写作时长（10-120分钟） |
| 倒计时显示 | 分钟:秒格式，实时更新 |
| 时间提醒 | 剩余 10 分钟、5 分钟、1 分钟时给出提醒 |
| 自动提交 | 时间结束时自动提交作文（可选） |
| 暂停功能 | 允许用户暂停计时（练习模式） |

**计时状态：**
```
enum TimerStatus {
  IDLE = 'idle',       // 未开始
  RUNNING = 'running', // 运行中
  PAUSED = 'paused',   // 已暂停
  FINISHED = 'finished' // 已结束
}
```

**UI设计：**
- 计时器显示在题目上方
- 剩余时间充足时显示绿色
- 剩余时间少于5分钟时显示黄色
- 剩余时间少于1分钟时显示红色并闪烁

---

### 5. AI批改与打分

**需求描述：**
用户提交作文后，系统调用 DeepSeek API 进行智能批改和打分。

**评分维度：**
| 维度 | 权重 | 说明 |
|------|------|------|
| Task Achievement | 25% | 任务完成度，是否回答了问题 |
| Coherence & Cohesion | 25% | 连贯性和衔接性 |
| Lexical Resource | 25% | 词汇资源，用词多样性和准确性 |
| Grammatical Range & Accuracy | 25% | 语法范围和准确性 |

**AI返回数据格式：**
```
{
  "score": {
    "overall": 7.0,
    "taskAchievement": 7.0,
    "coherenceCohesion": 7.5,
    "lexicalResource": 6.5,
    "grammaticalRange": 7.0
  },
  "feedback": {
    "strengths": ["观点清晰", "结构合理", "词汇丰富"],
    "weaknesses": ["部分语法错误", "论据不够充分"],
    "suggestions": [
      "建议使用更复杂的从句结构",
      "可以增加更多的连接词",
      "注意主谓一致问题"
    ]
  },
  "grammarIssues": [
    {
      "sentence": "He don't like coffee.",
      "correction": "He doesn't like coffee.",
      "explanation": "主谓一致错误，第三人称单数动词需要加s"
    }
  ],
  "improvedVersion": "建议修改后的版本..."
}
```

**API设计：**
- 路由：`POST /api/writing/grade`
- 请求体：`{ question: string, essay: string }`
- 响应：评分和反馈对象

**安全要求：**
- DeepSeek API Key 必须存储在服务端环境变量中
- 限制单次请求的作文长度（最大 2000 词）
- 添加请求频率限制，防止滥用

---

### 6. 总结报告

**需求描述：**
批改完成后，展示详细的总结报告，帮助用户了解自己的优势和不足。

**报告内容：**
| 部分 | 说明 |
|------|------|
| 总分展示 | 突出显示总分和各维度得分 |
| 分数解读 | 解释雅思分数对应的能力水平 |
| 优势分析 | 列出作文中的优点 |
| 改进建议 | 列出需要改进的地方和具体建议 |
| 语法错误 | 列出具体的语法错误及修正方案 |
| 词汇建议 | 提供替换词汇和表达 |
| 范文对比 | 可选：提供参考范文供对比学习 |

**UI设计：**
- 使用卡片式布局展示各部分内容
- 分数使用可视化进度条展示
- 语法错误高亮显示
- 提供"重新练习"按钮

---

## 技术方案

### 1. API 路由设计

#### 生成题目 API
```typescript
// src/app/api/writing/generate/route.ts
export async function POST(request: NextRequest) {
  // 1. 验证请求体（topic 必填）
  // 2. 调用 DeepSeek API 生成题目
  // 3. 返回生成的题目
}
```

#### 批改 API
```typescript
// src/app/api/writing/grade/route.ts
export async function POST(request: NextRequest) {
  // 1. 验证请求体（question、essay 必填）
  // 2. 调用 DeepSeek API 进行批改
  // 3. 返回评分和反馈
}
```

### 2. DeepSeek API 集成

**环境变量配置：**
```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
```

**API调用方式：**
- 使用 `fetch` 或 `axios` 在服务端调用
- 设置正确的 `Authorization` 头部
- 使用合适的模型（如 `deepseek-chat`）

**Prompt设计：**

生成题目 Prompt：
```
你是一个专业的雅思写作出题专家。请根据用户提供的主题，生成一道符合雅思写作 Task 2 格式的题目。

要求：
1. 题目类型：Argumentative（同意/不同意）或 Discussion（讨论双方观点）
2. 语言：英文原题 + 中文翻译
3. 难度：中等偏上（适合雅思 6.5-7.5 水平）

主题：{topic}

请输出 JSON 格式：
{
  "en": "英文题目",
  "zh": "中文翻译",
  "topic": "话题分类",
  "type": "题目类型"
}
```

批改 Prompt：
```
你是一个专业的雅思写作考官。请根据以下题目和考生作文进行评分和批改。

评分标准（雅思写作 Task 2）：
1. Task Achievement (25%) - 任务完成度
2. Coherence & Cohesion (25%) - 连贯性和衔接性
3. Lexical Resource (25%) - 词汇资源
4. Grammatical Range & Accuracy (25%) - 语法范围和准确性

题目：
{question}

考生作文：
{essay}

请输出 JSON 格式的详细评分报告：
{
  "score": {
    "overall": 总分,
    "taskAchievement": 得分,
    "coherenceCohesion": 得分,
    "lexicalResource": 得分,
    "grammaticalRange": 得分
  },
  "feedback": {
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["缺点1", "缺点2"],
    "suggestions": ["建议1", "建议2"]
  },
  "grammarIssues": [
    {
      "sentence": "原句",
      "correction": "修正后",
      "explanation": "解释"
    }
  ]
}
```

### 3. 前端组件设计

#### 写作练习组件
```typescript
// src/app/(main)/writing/practice/page.tsx
// 或在现有 page.tsx 中扩展

interface WritingPracticeProps {
  question: WritingQuestion | GeneratedQuestion;
  mode: 'exam' | 'practice'; // 考试模式/练习模式
}
```

#### 计时器组件
```typescript
// src/components/writing/timer.tsx
interface TimerProps {
  duration: number; // 分钟
  onTimeUp?: () => void;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
}
```

#### 编辑器组件
```typescript
// src/components/writing/editor.tsx
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}
```

#### 评分结果组件
```typescript
// src/components/writing/result.tsx
interface ResultProps {
  score: Score;
  feedback: Feedback;
  grammarIssues: GrammarIssue[];
  essay: string;
}
```

### 4. 状态管理

**写作练习状态：**
```typescript
interface WritingState {
  status: 'idle' | 'writing' | 'submitted' | 'grading' | 'finished';
  question: WritingQuestion | null;
  essay: string;
  timer: {
    duration: number;
    remaining: number;
    isRunning: boolean;
    isPaused: boolean;
  };
  result: WritingResult | null;
}
```

---

## 数据库设计

### 写作记录模型（新增）

```prisma
model WritingRecord {
  id          Int      @id @default(autoincrement())
  userId      String   // 关联用户（后续实现认证后）
  questionEn  String   // 英文题目
  questionZh  String   // 中文题目
  topic       String   // 话题
  essay       String   // 用户作文
  score       Float    // 总分
  taskAchievement Float
  coherenceCohesion Float
  lexicalResource Float
  grammaticalRange Float
  feedback    String?  // 反馈内容（JSON格式存储）
  duration    Int      // 用时（秒）
  createdAt   DateTime @default(now())
}
```

**新增 API：**
- `POST /api/writing/records` - 保存写作记录
- `GET /api/writing/records` - 获取用户写作记录列表
- `GET /api/writing/records/[id]` - 获取单条记录详情

---

## 实现步骤

### Phase 1: 基础架构（第1-2天）

| 任务 | 说明 |
|------|------|
| 1.1 | 创建 DeepSeek API 服务封装 (`src/lib/deepseek.ts`) |
| 1.2 | 添加环境变量配置 (`.env`) |
| 1.3 | 创建生成题目 API (`/api/writing/generate`) |
| 1.4 | 创建批改 API (`/api/writing/grade`) |
| 1.5 | 添加写作记录数据库模型 |
| 1.6 | 创建写作记录 API |

### Phase 2: 写作编辑器（第3-4天）

| 任务 | 说明 |
|------|------|
| 2.1 | 创建写作练习页面 (`writing/practice/page.tsx`) |
| 2.2 | 实现写作编辑器组件 |
| 2.3 | 实现计时器组件 |
| 2.4 | 实现题目展示区域 |
| 2.5 | 实现字数统计功能 |
| 2.6 | 实现草稿自动保存 |

### Phase 3: 自定义题目生成（第5天）

| 任务 | 说明 |
|------|------|
| 3.1 | 在写作首页添加"自定义写作"按钮 |
| 3.2 | 创建自定义题目模态框 |
| 3.3 | 实现 AI 题目生成调用 |
| 3.4 | 生成成功后跳转写作页面 |

### Phase 4: AI批改与结果展示（第6-7天）

| 任务 | 说明 |
|------|------|
| 4.1 | 实现提交作文功能 |
| 4.2 | 实现 AI 批改调用 |
| 4.3 | 创建评分结果组件 |
| 4.4 | 实现分数可视化展示 |
| 4.5 | 实现语法错误列表展示 |
| 4.6 | 实现改进建议展示 |
| 4.7 | 实现保存写作记录 |

### Phase 5: 优化与测试（第8天）

| 任务 | 说明 |
|------|------|
| 5.1 | 优化 API 错误处理 |
| 5.2 | 添加请求防抖和节流 |
| 5.3 | 完善移动端适配 |
| 5.4 | 进行功能测试 |
| 5.5 | 修复已知问题 |

---

## 技术注意事项

### 1. API Key 安全
- **严禁**将 DeepSeek API Key 暴露在前端代码中
- 将 API Key 存储在服务端环境变量中
- 前端只调用内部 API 路由

### 2. 请求限制
- 限制单次请求的作文长度（建议最大 2000 词）
- 添加请求频率限制（如每分钟最多 5 次请求）
- 实现请求超时处理

### 3. 错误处理
- API 调用失败时给出友好提示
- 网络异常时提供重试机制
- AI 返回格式异常时进行容错处理

### 4. 性能优化
- 使用 `useMemo` 和 `useCallback` 优化组件性能
- 计时器使用 `requestAnimationFrame` 或 `setInterval`
- 作文草稿使用 `debounce` 保存

### 5. 数据持久化
- 写作草稿自动保存到 localStorage
- 提交后的写作记录保存到数据库
- 支持从上次中断处继续写作

---

## 参考资源

- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [雅思写作评分标准](https://www.ielts.org/about-ielts/test-format/listening-reading-writing-speaking/writing)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/api-routes)

---

## 附录

### 雅思写作分数对应能力

| 分数 | 能力描述 |
|------|----------|
| 9 | 专家级 - 完全能应对语言要求 |
| 8 | 优秀 - 能有效运用语言 |
| 7 | 良好 - 能有效运用语言，偶尔有错误 |
| 6 | 合格 - 能运用语言，虽有错误但不影响交流 |
| 5 | 基础 - 部分能运用语言，错误较多 |
| 4 | 有限 - 只能在熟悉情境下运用 |
| 3 | 极有限 - 只能进行基本沟通 |
| 2 | 严重受限 - 只能表达基本意思 |
| 1 | 不懂英语 - 无法沟通 |
