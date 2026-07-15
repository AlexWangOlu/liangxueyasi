"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion/page-transition";
import { useRouter } from "next/navigation";
import Timer from "@/components/writing/timer";
import Editor from "@/components/writing/editor";
import Result from "@/components/writing/result";
import { WritingResult } from "@/lib/deepseek";

interface WritingQuestion {
  en: string;
  zh: string;
  topic: string;
  date: string;
  type: string;
}

type WritingStatus = "idle" | "writing" | "submitted" | "grading" | "finished";

export default function PracticePage() {
  const router = useRouter();

  const [question, setQuestion] = useState<WritingQuestion | null>(null);
  const [essay, setEssay] = useState("");
  const [status, setStatus] = useState<WritingStatus>("idle");
  const [result, setResult] = useState<WritingResult | null>(null);
  const [duration, setDuration] = useState(40);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const questionData = sessionStorage.getItem("writing_question");
    if (questionData) {
      setQuestion(JSON.parse(questionData));
      setStatus("idle");
    } else {
      router.push("/writing");
    }
  }, [router]);

  useEffect(() => {
    const draft = localStorage.getItem("writing_draft");
    if (draft) {
      setEssay(draft);
    }
  }, []);

  useEffect(() => {
    if (status === "writing") {
      const interval = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleStart = () => {
    setStatus("writing");
    localStorage.removeItem("writing_draft");
  };

  const handlePause = () => {
    setIsTimerPaused(true);
  };

  const handleResume = () => {
    setIsTimerPaused(false);
  };

  const handleTimeUp = () => {
    setStatus("submitted");
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!question || essay.trim().length < 50) {
      alert("请至少写50个单词");
      return;
    }

    setStatus("grading");
    try {
      const res = await fetch("/api/writing/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.en, essay }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setResult(json.data);
        setStatus("finished");

        await fetch("/api/writing/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionEn: question.en,
            questionZh: question.zh,
            topic: question.topic,
            essay,
            score: json.data.score.overall,
            taskAchievement: json.data.score.taskAchievement,
            coherenceCohesion: json.data.score.coherenceCohesion,
            lexicalResource: json.data.score.lexicalResource,
            grammaticalRange: json.data.score.grammaticalRange,
            feedback: JSON.stringify(json.data.feedback),
            duration: totalTime,
          }),
        });

        localStorage.removeItem("writing_draft");
      } else {
        alert("批改失败: " + (json.error || "Unknown error"));
        setStatus("writing");
      }
    } catch (error) {
      console.error("Grade essay error:", error);
      alert("批改失败，请重试");
      setStatus("writing");
    }
  };

  const handleRetry = () => {
    setEssay("");
    setResult(null);
    setStatus("idle");
    setTotalTime(0);
    setIsTimerPaused(false);
    localStorage.removeItem("writing_draft");
  };

  const handleBack = () => {
    if (essay.trim()) {
      setShowConfirm(true);
    } else {
      router.push("/writing");
    }
  };

  if (!question) {
    return (
      <PageTransition>
        <div className="p-4 md:p-6 flex items-center justify-center h-[60vh]">
          <p className="text-foreground/40">加载中...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground"
            onClick={handleBack}
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">返回题目列表</span>
          </motion.button>
          <Badge variant="secondary" className="rounded-lg">
            {question.topic}
          </Badge>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-foreground/[0.02] rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs text-foreground/30 mb-4">
                  <span>{question.date}</span>
                  <span>·</span>
                  <span>{question.type}</span>
                </div>
                <h2 className="text-lg font-semibold leading-relaxed mb-3">{question.en}</h2>
                <p className="text-sm text-foreground/50 leading-relaxed">{question.zh}</p>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  写作设置
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-foreground/50 mb-2 block">写作时长</label>
                    <div className="flex items-center gap-3">
                      {[20, 30, 40, 60].map((time) => (
                        <button
                          key={time}
                          className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                            duration === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground/[0.02] text-foreground/60 border border-foreground/[0.05] hover:border-foreground/[0.1]"
                          }`}
                          onClick={() => setDuration(time)}
                        >
                          {time} 分钟
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/40">
                    建议写作长度：250-300 词（雅思 Task 2 要求）
                  </p>
                </div>
              </div>

              <motion.button
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
                onClick={handleStart}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                开始写作
              </motion.button>
            </motion.div>
          )}

          {(status === "writing" || status === "grading") && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="bg-foreground/[0.02] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-foreground/30 mb-2">
                  <span>{question.date}</span>
                  <span>·</span>
                  <span>{question.type}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">{question.en}</p>
              </div>

              <div className="bg-background border border-foreground/[0.05] rounded-2xl p-4">
                <Timer
                  duration={duration}
                  onTimeUp={handleTimeUp}
                  isPaused={isTimerPaused}
                  onPause={handlePause}
                  onResume={handleResume}
                  showControls={true}
                />
              </div>

              {isTimerPaused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-amber-600">写作已暂停</p>
                  <motion.button
                    className="mt-3 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm"
                    onClick={handleResume}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    继续写作
                  </motion.button>
                </motion.div>
              )}

              {status === "grading" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mb-4"
                  />
                  <p className="text-foreground/60">AI 正在批改你的作文...</p>
                  <p className="text-xs text-foreground/30 mt-2">预计需要 10-30 秒</p>
                </motion.div>
              ) : (
                <>
                  <Editor
                    value={essay}
                    onChange={setEssay}
                    maxLength={2000}
                    placeholder="Start writing your essay here..."
                    disabled={isTimerPaused}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/30">
                      已用时：{Math.floor(totalTime / 60)}分{totalTime % 60}秒
                    </span>
                    <motion.button
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
                      onClick={() => setShowConfirm(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={essay.trim().length < 50}
                    >
                      <Send className="h-4 w-4" />
                      提交作文
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {status === "finished" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Result
                result={result}
                essay={essay}
                question={question.en}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowConfirm(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  <h3 className="text-lg font-semibold">确认提交</h3>
                </div>
                <p className="text-sm text-foreground/60 mb-6">
                  {status === "writing"
                    ? "提交后将由 AI 进行批改，确定要提交吗？"
                    : "确定要离开吗？当前的写作内容将被保存为草稿。"}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-xl"
                    onClick={() => setShowConfirm(false)}
                  >
                    取消
                  </Button>
                  {status === "writing" ? (
                    <Button className="flex-1 h-10 rounded-xl" onClick={() => { setShowConfirm(false); handleSubmit(); }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      确认提交
                    </Button>
                  ) : (
                    <Button className="flex-1 h-10 rounded-xl" onClick={() => { setShowConfirm(false); router.push("/writing"); }}>
                      确认离开
                    </Button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
