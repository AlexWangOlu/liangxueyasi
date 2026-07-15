"use client";

import { motion } from "framer-motion";
import { Trophy, Target, GitBranch, BookOpen, PenTool, CheckCircle, XCircle, Lightbulb, RotateCcw } from "lucide-react";
import { WritingResult, WritingScore, GrammarIssue } from "@/lib/deepseek";

interface ResultProps {
  result: WritingResult;
  essay: string;
  question: string;
  onRetry: () => void;
}

function ScoreRing({ score, label, icon: Icon }: { score: number; label: string; icon: typeof Trophy }) {
  const percentage = ((score - 1) / 8) * 100;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 7) return "text-green-500";
    if (score >= 5) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-foreground/[0.05]"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className={getScoreColor()}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${getScoreColor()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-foreground/30">/ 9.0</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground/40" />
        <span className="text-xs text-foreground/50">{label}</span>
      </div>
    </motion.div>
  );
}

function GrammarIssueCard({ issue, index }: { issue: GrammarIssue; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-amber-50/50 border border-amber-100 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <XCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-foreground/70 line-through">{issue.sentence}</p>
          <p className="text-sm text-green-600 mt-1">{issue.correction}</p>
          <p className="text-xs text-foreground/40 mt-2">{issue.explanation}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FeedbackItem({ icon: Icon, items, title, color }: { icon: typeof CheckCircle; items: string[]; title: string; color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium text-foreground/60">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-sm text-foreground/50"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${color} mt-1.5 shrink-0`} />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function Result({ result, essay, question, onRetry }: ResultProps) {
  const { score, feedback, grammarIssues, improvedVersion } = result;

  const getScoreLevel = (s: number) => {
    if (s >= 8) return "Expert";
    if (s >= 7) return "Good";
    if (s >= 6) return "Competent";
    if (s >= 5) return "Modest";
    return "Limited";
  };

  const getScoreLevelColor = (s: number) => {
    if (s >= 8) return "text-green-500 bg-green-500/10";
    if (s >= 7) return "text-emerald-500 bg-emerald-500/10";
    if (s >= 6) return "text-blue-500 bg-blue-500/10";
    if (s >= 5) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
        >
          <Trophy className="h-10 w-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Writing Assessment Complete</h2>
        <div className="flex items-center justify-center gap-3">
          <motion.span
            className="text-5xl font-bold text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score.overall}
          </motion.span>
          <span className="text-xl text-foreground/30">/ 9.0</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${getScoreLevelColor(score.overall)}`}>
            {getScoreLevel(score.overall)}
          </span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ScoreRing score={score.overall} label="Overall" icon={Trophy} />
        <ScoreRing score={score.taskAchievement} label="Task" icon={Target} />
        <ScoreRing score={score.coherenceCohesion} label="Coherence" icon={GitBranch} />
        <ScoreRing score={score.lexicalResource} label="Vocabulary" icon={BookOpen} />
        <ScoreRing score={score.grammaticalRange} label="Grammar" icon={PenTool} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-foreground/[0.02] rounded-2xl p-5">
          <FeedbackItem
            icon={CheckCircle}
            items={feedback.strengths}
            title="Strengths"
            color="text-green-500"
          />
        </div>
        <div className="bg-foreground/[0.02] rounded-2xl p-5">
          <FeedbackItem
            icon={XCircle}
            items={feedback.weaknesses}
            title="Areas to Improve"
            color="text-amber-500"
          />
        </div>
      </div>

      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
          <FeedbackItem
            icon={Lightbulb}
            items={feedback.suggestions}
            title="Improvement Suggestions"
            color="text-primary"
          />
        </div>
      )}

      {grammarIssues && grammarIssues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground/60 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-amber-500" />
            Grammar Issues Found
          </h3>
          <div className="space-y-3">
            {grammarIssues.map((issue, index) => (
              <GrammarIssueCard key={index} issue={issue} index={index} />
            ))}
          </div>
        </div>
      )}

      {improvedVersion && (
        <div className="bg-foreground/[0.02] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-foreground/60 mb-3">Improved Version</h3>
          <p className="text-sm text-foreground/60 leading-relaxed">{improvedVersion}</p>
        </div>
      )}

      <div className="bg-foreground/[0.02] rounded-2xl p-5">
        <h3 className="text-sm font-medium text-foreground/60 mb-3">Your Essay</h3>
        <p className="text-sm text-foreground/50 leading-relaxed whitespace-pre-wrap">{essay}</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <motion.button
          className="px-6 py-3 rounded-xl border border-foreground/[0.1] text-foreground/60 hover:text-foreground hover:border-foreground/[0.2]"
          onClick={onRetry}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="h-4 w-4 inline mr-2" />
          Write Again
        </motion.button>
      </div>
    </motion.div>
  );
}
