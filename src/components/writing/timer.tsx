"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  showControls?: boolean;
}

export default function Timer({
  duration,
  onTimeUp,
  isPaused = false,
  onPause,
  onResume,
  showControls = true,
}: TimerProps) {
  const [remaining, setRemaining] = useState(duration * 60);
  const [status, setStatus] = useState<TimerStatus>("idle");

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getTimeColor = useCallback(() => {
    const percentage = remaining / (duration * 60);
    if (percentage > 0.2) return "text-foreground/60";
    if (percentage > 0.05) return "text-amber-500";
    return "text-red-500";
  }, [remaining, duration]);

  const getProgressWidth = useCallback(() => {
    return `${(remaining / (duration * 60)) * 100}%`;
  }, [remaining, duration]);

  const getProgressColor = useCallback(() => {
    const percentage = remaining / (duration * 60);
    if (percentage > 0.2) return "bg-primary";
    if (percentage > 0.05) return "bg-amber-500";
    return "bg-red-500";
  }, [remaining, duration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (status === "running" && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setStatus("finished");
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, remaining, onTimeUp]);

  useEffect(() => {
    if (isPaused && status === "running") {
      setStatus("paused");
      onPause?.();
    } else if (!isPaused && status === "paused") {
      setStatus("running");
      onResume?.();
    }
  }, [isPaused, status, onPause, onResume]);

  const handleStart = () => {
    if (status === "idle") {
      setStatus("running");
    }
  };

  const handlePause = () => {
    if (status === "running") {
      setStatus("paused");
      onPause?.();
    }
  };

  const handleResume = () => {
    if (status === "paused") {
      setStatus("running");
      onResume?.();
    }
  };

  const handleReset = () => {
    setRemaining(duration * 60);
    setStatus("idle");
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Clock className={`h-5 w-5 ${getTimeColor()}`} />
        <motion.span
          className={`text-2xl font-bold font-mono ${getTimeColor()}`}
          key={remaining}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(remaining)}
        </motion.span>
      </div>

      <div className="flex-1 max-w-[200px] h-1.5 bg-foreground/[0.1] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getProgressColor()}`}
          style={{ width: getProgressWidth() }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      {showControls && (
        <div className="flex items-center gap-2">
          {status === "idle" && (
            <motion.button
              className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
              onClick={handleStart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="h-4 w-4" />
            </motion.button>
          )}

          {(status === "running" || status === "paused") && (
            <>
              <motion.button
                className="h-8 w-8 rounded-lg bg-foreground/[0.05] text-foreground/60 flex items-center justify-center"
                onClick={status === "running" ? handlePause : handleResume}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {status === "running" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </motion.button>
              <motion.button
                className="h-8 w-8 rounded-lg bg-foreground/[0.05] text-foreground/60 flex items-center justify-center"
                onClick={handleReset}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RotateCcw className="h-4 w-4" />
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
