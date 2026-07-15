"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Search, Filter, ChevronLeft, ChevronRight, X, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion/page-transition";
import { useRouter } from "next/navigation";

interface WritingView {
  id: number;
  side: string;
  claimZh: string | null;
  claimEn: string | null;
  analysisZh: string | null;
  analysisEn: string | null;
}

interface WritingQuestion {
  id: number;
  year: number;
  date: string;
  variant: string | null;
  en: string;
  zh: string;
  topic: string;
  views: WritingView[];
}

interface GeneratedQuestion {
  en: string;
  zh: string;
  topic: string;
  type: string;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function WritingPage() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 0 });

  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<WritingQuestion | null>(null);
  
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [customType, setCustomType] = useState<"Argumentative" | "Discussion" | "Opinion">("Argumentative");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      pageSize: String(pagination.pageSize),
      ...(search && { search }),
      ...(selectedTopic && { topic: selectedTopic }),
      ...(selectedYear && { year: selectedYear }),
    });
    const res = await fetch(`/api/writing/questions?${params}`);
    const json = await res.json();
    setQuestions(json.data);
    setPagination((prev) => ({ ...prev, ...json.pagination }));
  }, [pagination.page, pagination.pageSize, search, selectedTopic, selectedYear]);

  const fetchFilters = useCallback(async () => {
    const res = await fetch("/api/writing/filters");
    const json = await res.json();
    setTopics(json.topics);
    setYears(json.years);
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, Math.min(page, prev.totalPages)) }));
  };

  const handleStartWriting = (question: WritingQuestion) => {
    const questionData = {
      en: question.en,
      zh: question.zh,
      topic: question.topic,
      date: question.date,
      type: "IELTS",
    };
    sessionStorage.setItem("writing_question", JSON.stringify(questionData));
    router.push("/writing/practice");
  };

  const generateCustomQuestion = async () => {
    if (!customTopic.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/writing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customTopic, type: customType }),
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        const questionData = {
          en: json.data.en,
          zh: json.data.zh,
          topic: json.data.topic,
          date: "AI Generated",
          type: json.data.type,
        };
        sessionStorage.setItem("writing_question", JSON.stringify(questionData));
        router.push("/writing/practice");
      } else {
        alert("Failed to generate question: " + (json.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Generate question error:", error);
      alert("Failed to generate question. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <PenTool className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">写作练习</h1>
              <p className="text-xs text-foreground/40">601 道雅思写作 Task 2 真题</p>
            </div>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
            onClick={() => setShowCustomModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">自定义写作</span>
          </motion.button>
        </motion.div>

        {/* 搜索 + 筛选 */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <Input
              placeholder="搜索题目..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
              className="pl-9 h-10 rounded-xl bg-foreground/[0.02] border-foreground/[0.06]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-foreground/30 hover:text-foreground/60" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* 筛选面板 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-foreground/[0.02] rounded-2xl p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-foreground/50 mb-2">话题</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={selectedTopic === "" ? "default" : "outline"}
                      className="cursor-pointer rounded-lg text-[11px]"
                      onClick={() => { setSelectedTopic(""); setPagination((p) => ({ ...p, page: 1 })); }}
                    >
                      全部
                    </Badge>
                    {topics.map((t) => (
                      <Badge
                        key={t}
                        variant={selectedTopic === t ? "default" : "outline"}
                        className="cursor-pointer rounded-lg text-[11px]"
                        onClick={() => { setSelectedTopic(t); setPagination((p) => ({ ...p, page: 1 })); }}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/50 mb-2">年份</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={selectedYear === "" ? "default" : "outline"}
                      className="cursor-pointer rounded-lg text-[11px]"
                      onClick={() => { setSelectedYear(""); setPagination((p) => ({ ...p, page: 1 })); }}
                    >
                      全部
                    </Badge>
                    {years.map((y) => (
                      <Badge
                        key={y}
                        variant={selectedYear === String(y) ? "default" : "outline"}
                        className="cursor-pointer rounded-lg text-[11px]"
                        onClick={() => { setSelectedYear(String(y)); setPagination((p) => ({ ...p, page: 1 })); }}
                      >
                        {y}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 题目列表 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={stagger}
          initial="hidden"
          animate="show"
          key={`${pagination.page}-${selectedTopic}-${selectedYear}-${search}`}
        >
          {questions.map((q) => (
            <motion.div
              key={q.id}
              variants={cardVariant}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-foreground/[0.02] hover:bg-foreground/[0.04] rounded-2xl p-4 cursor-pointer border border-foreground/[0.04] transition-colors"
              onClick={() => setSelectedQuestion(q)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className="rounded-lg text-[10px] shrink-0">
                  {q.topic}
                </Badge>
                <span className="text-[10px] text-foreground/25 shrink-0">{q.date}</span>
              </div>
              <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">
                {q.en}
              </p>
              <p className="text-xs text-foreground/35 line-clamp-2 mt-1.5">
                {q.zh}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 空状态 */}
        {questions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-foreground/30 text-sm">未找到匹配的题目</p>
          </div>
        )}

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-foreground/40 min-w-[80px] text-center">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* 题目详情抽屉 */}
        <AnimatePresence>
          {selectedQuestion && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setSelectedQuestion(null)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed right-0 top-0 z-50 h-screen w-full max-w-lg bg-background shadow-2xl overflow-y-auto"
                style={{ borderRadius: "24px 0 0 24px" }}
              >
                <div className="p-6 space-y-5">
                  {/* 关闭 */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-lg">{selectedQuestion.topic}</Badge>
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedQuestion(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 题目 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-foreground/30">
                      <span>{selectedQuestion.date}</span>
                      {selectedQuestion.variant && <span>· {selectedQuestion.variant}</span>}
                    </div>
                    <h2 className="text-base font-semibold leading-relaxed">{selectedQuestion.en}</h2>
                    <p className="text-sm text-foreground/50 leading-relaxed">{selectedQuestion.zh}</p>
                  </div>

                  {/* 观点分析 */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground/60">观点分析</h3>
                    {selectedQuestion.views.map((view) => (
                      <motion.div
                        key={view.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: view.side === "B" ? 0.1 : 0 }}
                        className={`rounded-2xl p-4 ${
                          view.side === "A" ? "bg-primary/5 border border-primary/10" : "bg-foreground/[0.03] border border-foreground/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            view.side === "A" ? "bg-primary/10 text-primary" : "bg-foreground/5 text-foreground/50"
                          }`}>
                            观点 {view.side}
                          </span>
                        </div>
                        {view.claimZh && (
                          <p className="text-sm text-foreground/60 leading-relaxed">{view.claimZh}</p>
                        )}
                        {view.claimEn && (
                          <p className="text-xs text-foreground/35 mt-1">{view.claimEn}</p>
                        )}
                        {view.analysisZh && (
                          <div className="mt-2 pt-2 border-t border-foreground/[0.05]">
                            <p className="text-xs text-foreground/40">{view.analysisZh}</p>
                          </div>
                        )}
                        {!view.claimZh && !view.claimEn && !view.analysisZh && (
                          <p className="text-xs text-foreground/20 italic">暂无观点分析</p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* 写作按钮 */}
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-11 rounded-xl shadow-md shadow-primary/15" onClick={() => handleStartWriting(selectedQuestion!)}>
                      开始写作练习
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 自定义写作模态框 */}
        <AnimatePresence>
          {showCustomModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowCustomModal(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">自定义写作题目</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowCustomModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/60 mb-2 block">写作主题</label>
                    <Input
                      placeholder="输入你想写的主题，如：人工智能、环境保护..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground/60 mb-2 block">题目类型</label>
                    <div className="flex flex-wrap gap-2">
                      {([{ value: "Argumentative", label: "同意/不同意" }, { value: "Discussion", label: "讨论双方观点" }, { value: "Opinion", label: "表达观点" }] as const).map((type) => (
                        <button
                          key={type.value}
                          className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                            customType === type.value
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-foreground/[0.02] text-foreground/60 border border-foreground/[0.05] hover:border-foreground/[0.1]"
                          }`}
                          onClick={() => setCustomType(type.value)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setShowCustomModal(false)}>
                    取消
                  </Button>
                  <Button className="flex-1 h-11 rounded-xl" onClick={generateCustomQuestion} disabled={!customTopic.trim() || isGenerating}>
                    {isGenerating ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        生成题目
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
