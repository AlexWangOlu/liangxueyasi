export interface DeepSeekConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GeneratedQuestion {
  en: string;
  zh: string;
  topic: string;
  type: string;
}

export interface WritingScore {
  overall: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}

export interface GrammarIssue {
  sentence: string;
  correction: string;
  explanation: string;
}

export interface WritingFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface WritingResult {
  score: WritingScore;
  feedback: WritingFeedback;
  grammarIssues: GrammarIssue[];
  improvedVersion?: string;
}

const DEFAULT_CONFIG: DeepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseUrl: process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
};

export class DeepSeekService {
  private config: DeepSeekConfig;

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async request(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<DeepSeekResponse> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.error?.message || `DeepSeek API request failed: ${response.status}`
      );
    }

    return response.json() as Promise<DeepSeekResponse>;
  }

  async generateQuestion(topic: string, type?: string): Promise<GeneratedQuestion> {
    const questionType = type || 'Argumentative';
    
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的雅思写作出题专家。请根据用户提供的主题，生成一道符合雅思写作 Task 2 格式的题目。

要求：
1. 题目类型：${questionType}（${questionType === 'Argumentative' ? '同意/不同意' : questionType === 'Discussion' ? '讨论双方观点' : '表达观点'}）
2. 语言：英文原题 + 中文翻译
3. 难度：中等偏上（适合雅思 6.5-7.5 水平）
4. 请直接输出 JSON 格式，不要包含任何其他文字`,
      },
      {
        role: 'user',
        content: `主题：${topic}

请输出 JSON 格式：
{
  "en": "英文题目",
  "zh": "中文翻译",
  "topic": "话题分类",
  "type": "${questionType}"
}`,
      },
    ];

    const response = await this.request('/chat/completions', {
      model: this.config.model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedQuestion;
      }
      return JSON.parse(content) as GeneratedQuestion;
    } catch {
      throw new Error('Failed to parse generated question');
    }
  }

  async gradeEssay(question: string, essay: string): Promise<WritingResult> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的雅思写作考官。请根据以下题目和考生作文进行评分和批改。

评分标准（雅思写作 Task 2）：
1. Task Achievement (25%) - 任务完成度，是否充分回答了问题
2. Coherence & Cohesion (25%) - 连贯性和衔接性，段落结构和连接词使用
3. Lexical Resource (25%) - 词汇资源，用词多样性和准确性
4. Grammatical Range & Accuracy (25%) - 语法范围和准确性，句子结构多样性

总分计算：四个维度得分的平均值，保留一位小数。
分数范围：1.0 - 9.0

请直接输出 JSON 格式，不要包含任何其他文字。`,
      },
      {
        role: 'user',
        content: `题目：
${question}

考生作文：
${essay}

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
    "strengths": ["优点1", "优点2", ...],
    "weaknesses": ["缺点1", "缺点2", ...],
    "suggestions": ["建议1", "建议2", ...]
  },
  "grammarIssues": [
    {
      "sentence": "原句",
      "correction": "修正后",
      "explanation": "解释"
    }
  ],
  "improvedVersion": "对作文的改进版本建议（可选）"
}`,
      },
    ];

    const response = await this.request('/chat/completions', {
      model: this.config.model,
      messages,
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as WritingResult;
      }
      return JSON.parse(content) as WritingResult;
    } catch {
      throw new Error('Failed to parse grading result');
    }
  }
}

export const deepSeek = new DeepSeekService();
