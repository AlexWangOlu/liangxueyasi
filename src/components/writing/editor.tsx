"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Bold, Italic, List, ListOrdered } from "lucide-react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function Editor({
  value,
  onChange,
  maxLength = 2000,
  placeholder = "Start writing your essay here...",
  disabled = false,
}: EditorProps) {
  const [showFormatting, setShowFormatting] = useState(false);

  const wordCount = useCallback(() => {
    return value.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }, [value]);

  const charCount = useCallback(() => {
    return value.length;
  }, [value]);

  const percentage = useCallback(() => {
    return Math.min((charCount() / maxLength) * 100, 100);
  }, [charCount, maxLength]);

  const getCountColor = useCallback(() => {
    if (percentage() > 90) return "text-red-500";
    if (percentage() > 70) return "text-amber-500";
    return "text-foreground/40";
  }, [percentage]);

  const insertFormatting = useCallback(
    (prefix: string, suffix: string = "") => {
      const textarea = document.querySelector(".writing-editor") as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem("writing_draft", value);
    };

    const debouncedSave = setTimeout(saveDraft, 1000);
    return () => clearTimeout(debouncedSave);
  }, [value]);

  useEffect(() => {
    const draft = localStorage.getItem("writing_draft");
    if (draft && !value) {
      onChange(draft);
    }
  }, [value, onChange]);

  const handleClearDraft = () => {
    localStorage.removeItem("writing_draft");
    onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-foreground/40" />
          <span className="text-xs text-foreground/40">Word Count</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${getCountColor()}`}>
            {wordCount()} words / {charCount()} chars
          </span>
          <span className="text-xs text-foreground/25">Max: {maxLength} chars</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 bg-foreground/[0.05] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              percentage() > 90 ? "bg-red-500" : percentage() > 70 ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${percentage()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setShowFormatting(true)}
        onMouseLeave={() => setShowFormatting(false)}
      >
        {showFormatting && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute -top-10 left-0 flex items-center gap-1 bg-background border border-foreground/[0.05] rounded-lg p-1 shadow-lg"
          >
            <motion.button
              className="h-7 w-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05]"
              onClick={() => insertFormatting("**", "**")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              className="h-7 w-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05]"
              onClick={() => insertFormatting("*", "*")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              className="h-7 w-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05]"
              onClick={() => insertFormatting("\n- ")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              className="h-7 w-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05]"
              onClick={() => insertFormatting("\n1. ")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        )}

        <textarea
          className="writing-editor w-full h-[400px] p-4 bg-foreground/[0.02] border border-foreground/[0.06] rounded-2xl resize-none focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-base leading-relaxed placeholder:text-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          spellCheck={false}
        />
      </div>

      {value && (
        <div className="flex items-center justify-end">
          <motion.button
            className="text-xs text-foreground/30 hover:text-foreground/60"
            onClick={handleClearDraft}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Draft
          </motion.button>
        </div>
      )}
    </div>
  );
}
