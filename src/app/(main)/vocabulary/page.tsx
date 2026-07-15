"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { BookOpen, Search, ChevronLeft, ChevronRight, ChevronUp, Volume2, FlipVertical, Check, X, Shuffle, Bookmark, List, Grid, ArrowRight, RotateCcw, BookMarked, Eye, EyeOff, Brain, Sparkles, X as XIcon, Minus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion/page-transition";
import { cn } from "@/lib/utils";

interface Word {
  id: number;
  wordId: string;
  wordRank: number;
  headWord: string;
  ukPhone: string | null;
  usPhone: string | null;
  phone: string | null;
  sentences?: string;
  phrases?: string;
  synonyms?: string;
  antonyms?: string;
  remMethod?: string;
  related?: string;
  translations?: string;
  vocabularyId?: number;
  vocabulary?: { name: string };
}

interface Translation {
  tranCn: string;
  pos: string;
  tranOther: string;
}

interface Sentence {
  sContent: string;
  sCn: string;
}

interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryWord {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings?: DictionaryMeaning[];
}

interface Phrase {
  pContent: string;
  pCn: string;
}

interface Synonym {
  pos: string;
  tran: string;
  hwds: { w: string }[];
}

interface Antonym {
  hwd: string;
}

interface RelatedWord {
  pos: string;
  words: { hwd: string; tran: string }[];
}

type StudyMode = "browse" | "flashcard" | "test" | "list" | "memory" | "favorites" | "mistakes" | "summary";

const springConfig = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.8 };

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [lists, setLists] = useState<{ id: number; bookId: string; name: string; wordCount: number }[]>([]);
  const [studyMode, setStudyMode] = useState<StudyMode>("browse");
  const [search, setSearch] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gridView, setGridView] = useState(true);
  const [testWords, setTestWords] = useState<Word[]>([]);
  const [cardDirection, setCardDirection] = useState(0);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dictionaryData, setDictionaryData] = useState<DictionaryWord[] | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [memoryQueue, setMemoryQueue] = useState<Word[]>([]);
  const [memoryMode, setMemoryMode] = useState<"recognition" | "recall">("recognition");
  const [memoryShowAnswer, setMemoryShowAnswer] = useState(false);
  const [memoryKnown, setMemoryKnown] = useState<Set<number>>(new Set());
  const [memoryUnknown, setMemoryUnknown] = useState<Set<number>>(new Set());
  const [memoryInput, setMemoryInput] = useState("");
  const [memoryHintRevealed, setMemoryHintRevealed] = useState(false);
  const [memoryCorrectFeedback, setMemoryCorrectFeedback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [pageSize] = useState(50);
  const [favoriteWordIds, setFavoriteWordIds] = useState<Set<number>>(new Set());
  const [favoriteWords, setFavoriteWords] = useState<Word[]>([]);
  const [mistakeWords, setMistakeWords] = useState<Word[]>([]);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [studySummary, setStudySummary] = useState<{
    totalStudied: number;
    todayStudied: number;
    totalFavorites: number;
    totalMistakes: number;
    recentActivity: { word: string; mode: string; status: string; time: string }[];
    modeStats: Record<string, { correct: number; wrong: number; total: number }>;
  } | null>(null);
  const [groupMode, setGroupMode] = useState<"category" | "alphabet" | "pos">("category");
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const flipProgress = useSpring(0, { stiffness: 200, damping: 30 });
  const flipRotateY = useTransform(flipProgress, [0, 1], [0, 180]);

  useEffect(() => {
    flipProgress.set(isFlipped ? 1 : 0);
  }, [isFlipped, flipProgress]);

  const fetchLists = useCallback(async () => {
    const res = await fetch("/api/vocabulary/lists");
    const json = await res.json();
    setLists(json.data);
  }, []);

  const fetchWords = useCallback(async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      pageSize: pageSize.toString(),
      ...(selectedList && { listId: selectedList }),
      ...(search && { search }),
    });
    const res = await fetch(`/api/vocabulary/words?${params}`);
    const json = await res.json();
    setWords(json.data);
    setTotalPages(json.pagination.totalPages);
    setTotalWords(json.pagination.total);
  }, [currentPage, pageSize, selectedList, search]);

  const fetchDictionaryData = useCallback(async (word: string) => {
    setDictionaryLoading(true);
    setDictionaryData(null);
    try {
      const res = await fetch(`/api/vocabulary/dictionary?word=${encodeURIComponent(word)}`);
      const json = await res.json();
      if (json.success) {
        setDictionaryData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch dictionary data:", error);
    } finally {
      setDictionaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedWord) {
      fetchDictionaryData(selectedWord.headWord);
    } else {
      setDictionaryData(null);
    }
  }, [selectedWord, fetchDictionaryData]);

  const fetchAllWordsForList = useCallback(async () => {
    setIsLoadingList(true);
    const allWordsData: Word[] = [];
    let currentPageNum = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        page: currentPageNum.toString(),
        pageSize: "500",
        ...(selectedList && { listId: selectedList }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/vocabulary/words?${params}`);
      const json = await res.json();
      allWordsData.push(...json.data);
      if (currentPageNum >= json.pagination.totalPages) {
        hasMore = false;
      }
      currentPageNum++;
    }

    setAllWords(allWordsData);
    setTotalWords(allWordsData.length);
    setIsLoadingList(false);
  }, [selectedList, search]);

  const fetchAllWordsForPractice = useCallback(async () => {
    const allWords: Word[] = [];
    let currentPageNum = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        page: currentPageNum.toString(),
        pageSize: "500",
        ...(selectedList && { listId: selectedList }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/vocabulary/words?${params}`);
      const json = await res.json();
      allWords.push(...json.data);
      if (currentPageNum >= json.pagination.totalPages) {
        hasMore = false;
      }
      currentPageNum++;
    }

    if (studyMode === "test") {
      setTestWords(shuffleArray(allWords).slice(0, Math.min(50, allWords.length)));
      setCurrentIndex(0);
      setScore(0);
      setAnswered(0);
    }
    if (studyMode === "memory") {
      setMemoryQueue(shuffleArray(allWords).slice(0, Math.min(100, allWords.length)));
      setCurrentIndex(0);
      setMemoryShowAnswer(false);
      setMemoryKnown(new Set());
      setMemoryUnknown(new Set());
      setMemoryInput("");
      setMemoryHintRevealed(false);
      setMemoryCorrectFeedback(false);
    }
  }, [selectedList, search, studyMode]);

  useEffect(() => {
    fetchLists();
    fetchFavorites();
    fetchMistakes();
  }, [fetchLists]);

  useEffect(() => {
    if (studyMode === "test" || studyMode === "memory") {
      fetchAllWordsForPractice();
    } else if (studyMode === "list") {
      fetchAllWordsForList();
    } else {
      fetchWords();
    }
  }, [fetchWords, fetchAllWordsForPractice, fetchAllWordsForList, studyMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [studyMode]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchFavorites = useCallback(async () => {
    const res = await fetch("/api/vocabulary/favorites");
    const json = await res.json();
    if (json.success) {
      setFavoriteWords(json.data);
      setTotalFavorites(json.pagination.total);
      setFavoriteWordIds(new Set(json.data.map((w: Word) => w.id)));
    }
  }, []);

  const fetchMistakes = useCallback(async () => {
    const res = await fetch("/api/vocabulary/mistakes");
    const json = await res.json();
    if (json.success) {
      setMistakeWords(json.data);
      setTotalMistakes(json.pagination.total);
    }
  }, []);

  const toggleFavorite = useCallback(async (wordId: number) => {
    const res = await fetch("/api/vocabulary/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId }),
    });
    const json = await res.json();
    if (json.success) {
      setFavoriteWordIds(prev => {
        const newIds = new Set(prev);
        if (json.data.favorited) {
          newIds.add(wordId);
        } else {
          newIds.delete(wordId);
        }
        return newIds;
      });
      fetchFavorites();
    }
  }, [fetchFavorites]);

  const addMistake = useCallback(async (wordId: number, mistakeType: string, correctAnswer: string, wrongAnswer?: string) => {
    await fetch("/api/vocabulary/mistakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, mistakeType, correctAnswer, wrongAnswer }),
    });
    fetchMistakes();
  }, [fetchMistakes]);

  const logStudy = useCallback(async (wordId: number, studyMode: string, status: "correct" | "wrong") => {
    await fetch("/api/vocabulary/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, studyMode, status }),
    });
  }, []);

  const removeMistake = useCallback(async (wordId: number) => {
    await fetch("/api/vocabulary/mistakes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId }),
    });
    fetchMistakes();
  }, [fetchMistakes]);

  const fetchSummary = useCallback(async () => {
    const res = await fetch("/api/vocabulary/summary");
    const json = await res.json();
    if (json.success) {
      setStudySummary(json.data);
    }
  }, []);

  const parseTranslations = (word: Word): Translation[] => {
    try {
      if (word.translations) {
        return JSON.parse(word.translations);
      }
    } catch {
      return [];
    }
    return [];
  };

  const getTranslation = (word: Word): string => {
    try {
      const trans = parseTranslations(word);
      if (trans.length === 0) return "";
      return trans.map(t => `${t.pos ? `${t.pos}. ` : ""}${t.tranCn}`).join("；");
    } catch {
      return "";
    }
  };

  const getFullTranslation = (word: Word): string => {
    const trans = parseTranslations(word);
    if (trans.length === 0) return "";
    return trans.map(t => {
      let result = `${t.tranCn}`;
      if (t.pos) result = `${t.pos}. ${result}`;
      if (t.tranOther) result += ` (${t.tranOther})`;
      return result;
    }).join("\n");
  };

  const getPartOfSpeech = (word: Word): string => {
    try {
      const trans = parseTranslations(word);
      if (trans.length === 0) return "其他";
      const pos = trans[0]?.pos;
      if (!pos) return "其他";
      const posMap: Record<string, string> = {
        "n.": "名词",
        "v.": "动词",
        "adj.": "形容词",
        "adv.": "副词",
        "prep.": "介词",
        "conj.": "连词",
        "pron.": "代词",
        "num.": "数词",
        "art.": "冠词",
        "int.": "感叹词",
        "aux.": "助动词",
      };
      return posMap[pos] || pos || "其他";
    } catch {
      return "其他";
    }
  };

  const getFirstLetter = (word: Word): string => {
    const headWord = word.headWord || "";
    if (!headWord) return "#";
    return headWord.charAt(0).toUpperCase();
  };

  const groupedWords = useMemo<Record<string, Word[]>>(() => {
    if (allWords.length === 0) return {};
    
    if (groupMode === "alphabet") {
      const groups = allWords.reduce((acc, word) => {
        const letter = getFirstLetter(word);
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(word);
        return acc;
      }, {} as Record<string, Word[]>);
      return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
    } else if (groupMode === "pos") {
      return allWords.reduce((acc, word) => {
        const pos = getPartOfSpeech(word);
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(word);
        return acc;
      }, {} as Record<string, Word[]>);
    } else {
      return allWords.reduce((acc, word) => {
        const groupName = word.vocabulary?.name || "未分类";
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(word);
        return acc;
      }, {} as Record<string, Word[]>);
    }
  }, [allWords, groupMode]);

  const getSentences = (word: Word): Sentence[] => {
    try {
      if (word.sentences) {
        return JSON.parse(word.sentences);
      }
    } catch {
      return [];
    }
    return [];
  };

  const getPhrases = (word: Word): Phrase[] => {
    try {
      if (word.phrases) {
        return JSON.parse(word.phrases);
      }
    } catch {
      return [];
    }
    return [];
  };

  const getSynonyms = (word: Word): Synonym[] => {
    try {
      if (word.synonyms) {
        return JSON.parse(word.synonyms);
      }
    } catch {
      return [];
    }
    return [];
  };

  const getAntonyms = (word: Word): Antonym[] => {
    try {
      if (word.antonyms) {
        return JSON.parse(word.antonyms);
      }
    } catch {
      return [];
    }
    return [];
  };

  const getRelatedWords = (word: Word): RelatedWord[] => {
    try {
      if (word.related) {
        return JSON.parse(word.related);
      }
    } catch {
      return [];
    }
    return [];
  };

  const getRemMethod = (word: Word): string => {
    return word.remMethod || "";
  };

  const handleTestAnswer = (optionIndex: number) => {
    const options = generateTestOptions(currentWord!);
    const isCorrect = options[optionIndex].correct;
    
    setSelectedAnswer(optionIndex);
    setShowAnswer(true);
    if (isCorrect) setScore((s) => s + 1);
    setAnswered((a) => a + 1);

    if (!isCorrect && currentWord) {
      addMistake(currentWord.id, "test", getTranslation(currentWord));
    }
    
    logStudy(currentWord!.id, "test", isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      if (currentIndex < testWords.length - 1) {
        setCurrentIndex((i) => i + 1);
        setShowAnswer(false);
        setSelectedAnswer(null);
      }
    }, 1800);
  };

  const resetTest = () => {
    setTestWords(shuffleArray(words).slice(0, 10));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  const generateTestOptions = (word: Word) => {
    const correctAnswer = getTranslation(word);
    const wrongAnswers = shuffleArray(words.filter(w => w.id !== word.id))
      .slice(0, 3)
      .map(w => getTranslation(w));
    
    const options = [{ text: correctAnswer, correct: true }, ...wrongAnswers.map(w => ({ text: w, correct: false }))];
    return shuffleArray(options);
  };

  const handleMemoryRecallSubmit = () => {
    setMemoryShowAnswer(true);
  };

  const handleMemoryAnswer = (known: boolean) => {
    const currentWord = memoryQueue[currentIndex];
    
    let isActuallyKnown = known;
    if (memoryMode === "recall" && !memoryShowAnswer) {
      isActuallyKnown = memoryInput.toLowerCase() === currentWord.headWord.toLowerCase();
    }
    
    if (isActuallyKnown) {
      setMemoryKnown(prev => new Set([...prev, currentWord.id]));
      if (memoryMode === "recall" && !memoryShowAnswer) {
        setMemoryCorrectFeedback(true);
      }
    } else {
      setMemoryUnknown(prev => new Set([...prev, currentWord.id]));
      addMistake(currentWord.id, "memory", getTranslation(currentWord));
    }
    
    logStudy(currentWord.id, "memory", isActuallyKnown ? "correct" : "wrong");

    setTimeout(() => {
      if (currentIndex < memoryQueue.length - 1) {
        setCurrentIndex((i) => i + 1);
        setMemoryShowAnswer(false);
        setMemoryInput("");
        setMemoryHintRevealed(false);
        setMemoryCorrectFeedback(false);
      }
    }, memoryMode === "recall" && isActuallyKnown && !memoryShowAnswer ? 500 : 300);
  };

  const handleMemoryInputChange = (value: string) => {
    setMemoryInput(value);
    
    if (memoryMode === "recall" && !memoryShowAnswer && currentWord) {
      const trimmedValue = value.trim();
      if (trimmedValue.length === currentWord.headWord.length) {
        if (trimmedValue.toLowerCase() === currentWord.headWord.toLowerCase()) {
          setTimeout(() => {
            setMemoryCorrectFeedback(true);
            handleMemoryAnswer(true);
          }, 200);
        }
      }
    }
  };

  const resetMemory = () => {
    setMemoryQueue(shuffleArray(words).slice(0, 20));
    setCurrentIndex(0);
    setMemoryShowAnswer(false);
    setMemoryKnown(new Set());
    setMemoryUnknown(new Set());
    setMemoryInput("");
    setMemoryHintRevealed(false);
    setMemoryCorrectFeedback(false);
  };

  const currentWord = studyMode === "test" ? testWords[currentIndex] : studyMode === "memory" ? memoryQueue[currentIndex] : words[currentIndex];
  const testOptions = currentWord ? generateTestOptions(currentWord) : [];

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCardDirection(-1);
      setTimeout(() => {
        setCurrentIndex(i => i - 1);
        setIsFlipped(false);
        setCardDirection(0);
      }, 150);
    }
  };

  const handleNextCard = async () => {
    const maxIndex = studyMode === "test" ? testWords.length - 1 : studyMode === "memory" ? memoryQueue.length - 1 : words.length - 1;
    if (currentIndex < maxIndex) {
      setCardDirection(1);
      setTimeout(() => {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
        setCardDirection(0);
      }, 150);
    } else if (studyMode === "flashcard" && currentPage < totalPages) {
      setCardDirection(1);
      setTimeout(async () => {
        await setCurrentPage(p => p + 1);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCardDirection(0);
      }, 150);
    }
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig }}
        >
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={springConfig}
          >
            <BookOpen className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">词汇学习</h1>
            <p className="text-xs text-foreground/40">7002 个雅思核心词汇</p>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.05 }}
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <Input
              placeholder="搜索单词..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); setCurrentIndex(0); }}
              className="pl-9 h-10 rounded-xl bg-foreground/[0.02] border-foreground/[0.06]"
            />
          </div>
          <div className="flex gap-2">
            {lists.map((list) => (
              <motion.button
                key={list.id}
                className={cn(
                  "rounded-lg text-xs px-3 py-1.5 transition-colors",
                  selectedList === String(list.id) 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" 
                    : "border border-foreground/[0.06] text-foreground/50 hover:text-foreground/80"
                )}
                onClick={() => { setSelectedList(selectedList === String(list.id) ? "" : String(list.id)); setCurrentIndex(0); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springConfig}
              >
                {list.name} ({list.wordCount})
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-foreground/[0.03]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springConfig, delay: 0.1 }}
        >
          {([
            { id: "browse" as const, label: "浏览", icon: Grid },
            { id: "flashcard" as const, label: "闪卡", icon: FlipVertical },
            { id: "memory" as const, label: "记忆", icon: Brain },
            { id: "test" as const, label: "测试", icon: Check },
            { id: "list" as const, label: "列表", icon: List },
            { id: "favorites" as const, label: `收藏 (${totalFavorites})`, icon: Bookmark },
            { id: "mistakes" as const, label: `错题 (${totalMistakes})`, icon: X },
            { id: "summary" as const, label: "总结", icon: BookMarked },
          ]).map((mode, idx) => (
            <motion.button
              key={mode.id}
              onClick={() => { setStudyMode(mode.id); setCurrentIndex(0); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                studyMode === mode.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" 
                  : "text-foreground/40 hover:text-foreground/70"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: 0.15 + idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <mode.icon className="h-4 w-4" />
              {mode.label}
            </motion.button>
          ))}
        </motion.div>

        {studyMode === "browse" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={springConfig}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/30">
                  共 {totalWords} 个单词
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    className="h-8 w-8 rounded-xl border border-foreground/[0.06] flex items-center justify-center text-foreground/40 hover:text-foreground/70"
                    onClick={() => setGridView(!gridView)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {gridView ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>

              {gridView ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {words.map((word, idx) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ ...springConfig, delay: idx * 0.02 }}
                      className="bg-foreground/[0.02] rounded-2xl p-4 cursor-pointer transition-colors hover:bg-foreground/[0.04]"
                      onClick={() => setSelectedWord(word)}
                      whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{word.headWord}</p>
                          <p className="text-xs text-foreground/40">{word.ukPhone || word.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                              favoriteWordIds.has(word.id) ? "text-yellow-500 bg-yellow-500/10" : "text-foreground/30 hover:text-yellow-500"
                            )}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(word.id); }}
                          >
                            <Bookmark className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-foreground/30 hover:text-primary"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Volume2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/60 mt-2 line-clamp-2">{getTranslation(word)}</p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {words.map((word, idx) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfig, delay: idx * 0.015 }}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors hover:bg-foreground/[0.03]"
                      onClick={() => setSelectedWord(word)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="text-xs text-foreground/20 w-8">{idx + 1}</span>
                      <span className="font-medium text-foreground flex-1">{word.headWord}</span>
                      <span className="text-xs text-foreground/40">{word.ukPhone || word.phone}</span>
                      <span className="text-sm text-foreground/50">{getTranslation(word)}</span>
                      <Volume2 className="h-4 w-4 text-foreground/20" />
                    </motion.div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <motion.div
                  className="flex items-center justify-center gap-2 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    className="h-10 w-10 rounded-xl border border-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground/[0.2] disabled:opacity-30"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    whileHover={{ scale: currentPage > 1 ? 1.1 : 1 }}
                    whileTap={{ scale: currentPage > 1 ? 0.9 : 1 }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value) || 1;
                        setCurrentPage(Math.max(1, Math.min(totalPages, page)));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const page = parseInt((e.target as HTMLInputElement).value) || 1;
                          setCurrentPage(Math.max(1, Math.min(totalPages, page)));
                        }
                      }}
                      className="w-16 px-3 py-2 rounded-lg bg-foreground/[0.02] border border-foreground/[0.06] text-sm text-center text-foreground focus:outline-none focus:border-primary/50"
                      min="1"
                      max={totalPages}
                    />
                    <span className="text-sm text-foreground/40">/ {totalPages}</span>
                  </div>
                  <motion.button
                    className="h-10 w-10 rounded-xl border border-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground/[0.2] disabled:opacity-30"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: currentPage < totalPages ? 1.1 : 1 }}
                    whileTap={{ scale: currentPage < totalPages ? 0.9 : 1 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "flashcard" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="flashcard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="text-xs text-foreground/30 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                第 {(currentPage - 1) * pageSize + currentIndex + 1} / {totalWords} 个单词
              </motion.div>

              <motion.div
                className="relative w-full max-w-md aspect-[3/4] cursor-pointer"
                style={{ perspective: 2000 }}
                initial={{ opacity: 0, scale: 0.95, rotateY: -15 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateY: cardDirection * 30,
                  transition: cardDirection !== 0 ? { duration: 0.15 } : { ...springConfig }
                }}
                exit={{ opacity: 0, scale: 0.95, rotateY: 15 }}
                onClick={() => setIsFlipped(!isFlipped)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ 
                    rotateY: flipRotateY,
                    transformStyle: "preserve-3d"
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                >
                  <motion.div
                    className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-foreground/[0.03] p-8 flex flex-col items-center justify-center border border-foreground/[0.06] shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springConfig }}
                  >
                    <motion.div
                      className="mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...springConfig, delay: 0.1 }}
                    >
                      <h2 className="text-5xl font-bold text-foreground">{currentWord?.headWord}</h2>
                    </motion.div>
                    <motion.p 
                      className="text-xl text-foreground/40 mb-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.2 }}
                    >
                      {currentWord?.ukPhone || currentWord?.phone}
                    </motion.p>
                    <motion.div
                      className="flex items-center gap-2 text-sm text-primary/60"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <FlipVertical className="h-4 w-4" />
                      <span>点击翻转查看释义</span>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-foreground/[0.02] p-8 flex flex-col border border-primary/10 shadow-2xl overflow-y-auto"
                    style={{ rotateY: 180 }}
                  >
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.1 }}
                    >
                      <h3 className="text-2xl font-semibold text-foreground mb-2">{currentWord?.headWord}</h3>
                      <p className="text-lg text-primary">{getTranslation(currentWord!)}</p>
                    </motion.div>

                    {getRemMethod(currentWord!) && (
                      <motion.div
                        className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.15 }}
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground/70">{getRemMethod(currentWord!)}</p>
                        </div>
                      </motion.div>
                    )}

                    {getSentences(currentWord!).length > 0 && (
                      <motion.div
                        className="space-y-3 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.2 }}
                      >
                        <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider">例句</p>
                        {getSentences(currentWord!).slice(0, 3).map((s, i) => (
                          <motion.div 
                            key={i}
                            className="bg-foreground/[0.02] rounded-xl p-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...springConfig, delay: 0.3 + i * 0.1 }}
                          >
                            <p className="text-sm text-foreground/80 mb-1">{s.sContent}</p>
                            <p className="text-xs text-foreground/40">{s.sCn}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {getPhrases(currentWord!).length > 0 && (
                      <motion.div
                        className="flex flex-wrap gap-2 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.3 }}
                      >
                        {getPhrases(currentWord!).slice(0, 5).map((p, i) => (
                          <motion.span
                            key={i}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ ...springConfig, delay: 0.4 + i * 0.05 }}
                          >
                            {p.pContent}
                          </motion.span>
                        ))}
                      </motion.div>
                    )}

                    {getSynonyms(currentWord!).length > 0 && (
                      <motion.div
                        className="space-y-2 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.35 }}
                      >
                        <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider">同义词</p>
                        {getSynonyms(currentWord!).slice(0, 2).map((s, i) => (
                          <div key={i} className="flex flex-wrap gap-2">
                            <span className="text-xs text-foreground/30">{s.pos}</span>
                            {s.hwds.slice(0, 4).map((h, j) => (
                              <span key={j} className="px-2 py-0.5 bg-foreground/[0.04] text-foreground/60 rounded-full text-xs">
                                {h.w}
                              </span>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="flex items-center gap-6 mt-10">
                <motion.button
                  className="h-12 w-12 rounded-full border border-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground/[0.2] disabled:opacity-30"
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  whileHover={{ scale: currentIndex > 0 ? 1.15 : 1 }}
                  whileTap={{ scale: currentIndex > 0 ? 0.85 : 1 }}
                  transition={springConfig}
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>
                <motion.button
                  className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
                  onClick={() => {
                    setWords(shuffleArray(words));
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  whileHover={{ scale: 1.15, rotate: 180 }}
                  whileTap={{ scale: 0.85 }}
                  transition={springConfig}
                >
                  <Shuffle className="h-6 w-6" />
                </motion.button>
                <motion.button
                  className="h-12 w-12 rounded-full border border-foreground/[0.1] flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground/[0.2] disabled:opacity-30"
                  onClick={handleNextCard}
                  disabled={currentIndex >= words.length - 1 && currentPage >= totalPages}
                  whileHover={{ scale: currentIndex < words.length - 1 || currentPage < totalPages ? 1.15 : 1 }}
                  whileTap={{ scale: currentIndex < words.length - 1 || currentPage < totalPages ? 0.85 : 1 }}
                  transition={springConfig}
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "memory" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="memory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="flex items-center gap-4 mb-6 w-full max-w-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-xs text-foreground/30">
                  进度: {currentIndex + 1}/{memoryQueue.length}
                </span>
                <div className="flex-1 h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / memoryQueue.length) * 100}%` }}
                    transition={{ ...springConfig }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500">{memoryKnown.size}</span>
                  <span className="text-xs text-foreground/20">/</span>
                  <span className="text-xs text-red-500">{memoryUnknown.size}</span>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-2 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <motion.button
                  onClick={() => setMemoryMode("recognition")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    memoryMode === "recognition" ? "bg-primary text-primary-foreground" : "bg-foreground/[0.02] text-foreground/40"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  认词
                </motion.button>
                <motion.button
                  onClick={() => setMemoryMode("recall")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    memoryMode === "recall" ? "bg-primary text-primary-foreground" : "bg-foreground/[0.02] text-foreground/40"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EyeOff className="h-4 w-4 inline mr-2" />
                  默写
                </motion.button>
              </motion.div>

              {memoryQueue.length > 0 && currentWord ? (
                <motion.div
                  className="w-full max-w-md"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <motion.div
                    className="rounded-3xl bg-gradient-to-br from-primary/10 to-primary/[0.03] p-8 mb-6 border border-primary/10 shadow-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    {memoryMode === "recognition" ? (
                      <>
                        <motion.h2 
                          className="text-4xl font-bold text-foreground text-center mb-4"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.15 }}
                        >
                          {currentWord.headWord}
                        </motion.h2>
                        <motion.p 
                          className="text-lg text-foreground/40 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: 0.2 }}
                        >
                          {currentWord.ukPhone || currentWord.phone}
                        </motion.p>
                        {!memoryShowAnswer && (
                          <motion.button
                            onClick={() => setMemoryShowAnswer(true)}
                            className="w-full mt-6 py-3 rounded-xl bg-foreground/[0.06] text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.25 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            显示释义
                          </motion.button>
                        )}
                        {memoryShowAnswer && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 text-center"
                          >
                            <p className="text-xl text-primary">{getTranslation(currentWord)}</p>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <>
                        <motion.p 
                          className="text-xl text-primary text-center mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          {getTranslation(currentWord)}
                        </motion.p>
                        
                        {!memoryShowAnswer ? (
                          <>
                            <AnimatePresence>
                              {memoryCorrectFeedback && (
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <motion.div
                                    className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl shadow-green-500/30"
                                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.8, y: -20, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                  >
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                                    >
                                      <Check className="h-6 w-6" />
                                    </motion.div>
                                    <span className="font-semibold text-lg">正确!</span>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            <div className="flex justify-center gap-1 mb-6">
                              {currentWord.headWord.split('').map((char, index) => (
                                <motion.div
                                  key={index}
                                  className={cn(
                                    "w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all cursor-text",
                                    index < memoryInput.length
                                      ? memoryInput[index].toLowerCase() === char.toLowerCase()
                                        ? "border-green-500 bg-green-500/10 text-green-600"
                                        : "border-red-500 bg-red-500/10 text-red-600"
                                      : memoryHintRevealed && index === 0
                                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                                        : "border-foreground/20 bg-foreground/[0.02] text-foreground/30 hover:border-primary/30 hover:bg-primary/[0.03]"
                                  )}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ 
                                    opacity: 1, 
                                    scale: memoryCorrectFeedback ? 1.1 : 1,
                                    y: memoryCorrectFeedback ? -5 : 0
                                  }}
                                  transition={{ duration: 0.15, delay: 0.1 + index * 0.05 }}
                                  onClick={() => {
                                    const hiddenInput = document.getElementById('memory-hidden-input');
                                    if (hiddenInput) {
                                      hiddenInput.focus();
                                    }
                                  }}
                                >
                                  {index < memoryInput.length ? (
                                    memoryInput[index]
                                  ) : memoryHintRevealed && index === 0 ? (
                                    char
                                  ) : (
                                    <span className="text-lg">_</span>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                            
                            <input
                              id="memory-hidden-input"
                              type="text"
                              value={memoryInput}
                              onChange={(e) => handleMemoryInputChange(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && memoryInput.trim()) {
                                  handleMemoryRecallSubmit();
                                }
                              }}
                              className="absolute opacity-0 w-0 h-0 pointer-events-none"
                              autoFocus
                              maxLength={currentWord.headWord.length}
                            />
                            
                            <div className="flex items-center gap-3">
                              <motion.button
                                onClick={() => setMemoryHintRevealed(true)}
                                disabled={memoryHintRevealed}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-sm transition-colors",
                                  memoryHintRevealed 
                                    ? "bg-foreground/[0.02] text-foreground/30 cursor-not-allowed"
                                    : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                )}
                                whileHover={!memoryHintRevealed ? { scale: 1.05 } : {}}
                                whileTap={!memoryHintRevealed ? { scale: 0.95 } : {}}
                              >
                                <Lightbulb className="h-4 w-4 inline mr-2" />
                                提示首字母
                              </motion.button>
                              <motion.button
                                onClick={() => setMemoryInput("")}
                                className="px-4 py-2 rounded-xl bg-foreground/[0.06] text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <RotateCcw className="h-4 w-4 inline mr-2" />
                                清空
                              </motion.button>
                            </div>
                          </>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                          >
                            <h2 className="text-4xl font-bold text-foreground mb-2">
                              {currentWord.headWord}
                            </h2>
                            <p className="text-lg text-foreground/40">{currentWord.ukPhone || currentWord.phone}</p>
                            {memoryInput && (
                              <div className="mt-4 p-3 rounded-xl bg-foreground/[0.04]">
                                <p className="text-sm text-foreground/50">你的输入:</p>
                                <p className={cn(
                                  "text-xl font-medium",
                                  memoryInput.toLowerCase() === currentWord.headWord.toLowerCase()
                                    ? "text-green-500"
                                    : "text-red-500"
                                )}>
                                  {memoryInput}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => handleMemoryAnswer(false)}
                      className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="h-5 w-5 inline mr-2" />
                      不认识
                    </motion.button>
                    <motion.button
                      onClick={() => handleMemoryAnswer(true)}
                      className="flex-1 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-medium"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(34, 197, 94, 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="h-5 w-5 inline mr-2" />
                      {memoryMode === "recognition" ? "认识" : "提交"}
                    </motion.button>
                  </div>
                </motion.div>
              ) : memoryQueue.length > 0 && currentIndex >= memoryQueue.length ? (
                <motion.div
                  className="w-full max-w-md text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-8"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  >
                    <Sparkles className="h-10 w-10 text-primary" />
                  </motion.div>
                  <motion.h2 
                    className="text-3xl font-bold text-foreground mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.3 }}
                  >
                    记忆完成!
                  </motion.h2>
                  <motion.p 
                    className="text-foreground/40 mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    认识 {memoryKnown.size} / 不认识 {memoryUnknown.size}
                  </motion.p>
                  <motion.button
                    onClick={resetMemory}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springConfig, delay: 0.5 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="h-5 w-5 mr-2 inline" />
                    继续练习
                  </motion.button>
                </motion.div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "test" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="flex items-center gap-4 mb-8 w-full max-w-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-xs text-foreground/30">
                  进度: {answered}/{testWords.length}
                </span>
                <div className="flex-1 h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(answered / testWords.length) * 100}%` }}
                    transition={{ ...springConfig }}
                  />
                </div>
                <motion.span 
                  className="text-sm font-bold text-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                >
                  {score}
                </motion.span>
              </motion.div>

              {testWords.length === 0 ? (
                <motion.div
                  className="w-full max-w-md text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-foreground/[0.05] mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full"
                    />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">加载中...</h3>
                  <p className="text-sm text-foreground/40">正在准备测试题目</p>
                </motion.div>
              ) : testWords.length > 0 && currentWord && !showAnswer ? (
                <motion.div
                  className="w-full max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <motion.div
                    className="rounded-3xl bg-gradient-to-br from-primary/10 to-primary/[0.03] p-8 mb-6 border border-primary/10 shadow-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <motion.h2 
                      className="text-4xl font-bold text-foreground text-center mb-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                    >
                      {currentWord.headWord}
                    </motion.h2>
                    <motion.p 
                      className="text-lg text-foreground/40 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    >
                      {currentWord.ukPhone || currentWord.phone}
                    </motion.p>
                  </motion.div>

                  <div className="space-y-3">
                    {testOptions.map((option, i) => (
                      <motion.button
                        key={i}
                        className={cn(
                          "w-full p-4 rounded-2xl text-left transition-all",
                          "bg-foreground/[0.02] border border-foreground/[0.04] hover:border-primary/20 hover:bg-primary/[0.03]"
                        )}
                        onClick={() => handleTestAnswer(i)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: 0.1 + i * 0.05 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span 
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                              "bg-foreground/[0.06] text-foreground/50"
                            )}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {String.fromCharCode(65 + i)}
                          </motion.span>
                          <span className="text-sm text-foreground">{option.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : testWords.length > 0 && currentWord && showAnswer ? (
                <motion.div
                  className="w-full max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className={cn(
                      "rounded-3xl p-8 text-center",
                      testOptions[selectedAnswer!]?.correct
                        ? "bg-gradient-to-br from-green-500/10 to-green-500/[0.03] border border-green-500/20" 
                        : "bg-gradient-to-br from-red-500/10 to-red-500/[0.03] border border-red-500/20"
                    )}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {testOptions[selectedAnswer!]?.correct ? (
                        <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      ) : (
                        <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      )}
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-bold text-foreground mb-3"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                    >
                      {currentWord.headWord}
                    </motion.h3>
                    <motion.p 
                      className="text-xl text-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    >
                      {getTranslation(currentWord)}
                    </motion.p>
                  </motion.div>

                  <div className="space-y-3 mt-4">
                    {testOptions.map((option, i) => {
                      const isSelected = i === selectedAnswer;
                      const isCorrect = option.correct;
                      let bgClass = "bg-foreground/[0.02]";
                      let borderClass = "border-foreground/[0.04]";
                      
                      if (isSelected && isCorrect) {
                        bgClass = "bg-green-500/10";
                        borderClass = "border-green-500/30";
                      } else if (isSelected && !isCorrect) {
                        bgClass = "bg-red-500/10";
                        borderClass = "border-red-500/30";
                      } else if (!isSelected && isCorrect) {
                        bgClass = "bg-green-500/5";
                        borderClass = "border-green-500/20";
                      }
                      
                      return (
                        <motion.div
                          key={i}
                          className={cn(
                            "w-full p-4 rounded-2xl text-left border",
                            bgClass, borderClass
                          )}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: 0.1 + i * 0.05 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                              isSelected && isCorrect ? "bg-green-500 text-white" :
                              isSelected && !isCorrect ? "bg-red-500 text-white" :
                              !isSelected && isCorrect ? "bg-green-500/20 text-green-500" :
                              "bg-foreground/[0.06] text-foreground/50"
                            )}>
                              {isCorrect ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + i)}
                            </span>
                            <span className={cn(
                              "text-sm",
                              isSelected && isCorrect ? "text-green-600" :
                              isSelected && !isCorrect ? "text-red-600" :
                              !isSelected && isCorrect ? "text-green-500" :
                              "text-foreground/60"
                            )}>
                              {option.text}
                            </span>
                            {!isSelected && isCorrect && (
                              <span className="text-xs text-green-500 ml-auto">正确答案</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="w-full max-w-md text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-8"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  >
                    <motion.span 
                      className="text-4xl font-bold text-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, delay: 0.4 }}
                    >
                      {score}
                    </motion.span>
                  </motion.div>
                  <motion.h2 
                    className="text-3xl font-bold text-foreground mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.3 }}
                  >
                    测试完成!
                  </motion.h2>
                  <motion.p 
                    className="text-foreground/40 mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    答对 {score} / {testWords.length} 题
                  </motion.p>
                  <motion.button
                    onClick={resetTest}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springConfig, delay: 0.5 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="h-5 w-5 mr-2 inline" />
                    重新测试
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "list" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between text-xs text-foreground/30 mb-4">
                <span>共 {totalWords} 个单词</span>
                <motion.button
                  className="h-8 w-8 rounded-xl border border-foreground/[0.06] flex items-center justify-center text-foreground/40"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bookmark className="h-4 w-4" />
                </motion.button>
              </div>
              
              {isLoadingList ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm text-foreground/40">加载中...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/40">分组方式:</span>
                <motion.button
                  onClick={() => setGroupMode("category")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    groupMode === "category" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-foreground/[0.04] text-foreground/50 hover:text-foreground/70"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  分类
                </motion.button>
                <motion.button
                  onClick={() => setGroupMode("alphabet")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    groupMode === "alphabet" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-foreground/[0.04] text-foreground/50 hover:text-foreground/70"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  A-Z
                </motion.button>
                <motion.button
                  onClick={() => setGroupMode("pos")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    groupMode === "pos" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-foreground/[0.04] text-foreground/50 hover:text-foreground/70"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  词性
                </motion.button>
              </div>

              {groupMode === "alphabet" && (
                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => {
                    const hasLetter = Object.keys(groupedWords).includes(letter);
                    return (
                      <button
                        key={letter}
                        onClick={() => {
                          const element = document.getElementById(`group-${letter}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={cn(
                          "min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center",
                          hasLetter 
                            ? "bg-foreground/[0.04] text-foreground/60 hover:text-foreground hover:bg-primary/10" 
                            : "bg-foreground/[0.02] text-foreground/20 cursor-not-allowed"
                        )}
                        disabled={!hasLetter}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {Object.entries(groupedWords).map(([groupName, groupWords]) => {
                const isExpanded = expandedGroups.has(groupName);
                return (
                  <div
                    key={groupName}
                    id={`group-${groupName}`}
                    className="mb-4"
                  >
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedGroups);
                        if (isExpanded) {
                          newExpanded.delete(groupName);
                        } else {
                          newExpanded.add(groupName);
                        }
                        setExpandedGroups(newExpanded);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors text-left"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        groupMode === "alphabet" ? "bg-blue-500/50" :
                        groupMode === "pos" ? "bg-purple-500/50" : "bg-primary/50"
                      )} />
                      <span className="text-sm font-medium text-foreground/60 flex-1">{groupName}</span>
                      <span className="text-xs text-foreground/30">({groupWords.length}个)</span>
                      <ChevronRight className={cn(
                        "h-4 w-4 text-foreground/40 transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </button>
                    {isExpanded && (
                      <div className="ml-5 mt-2 space-y-1">
                        {groupWords.map((word) => (
                          <div
                            key={word.id}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors group cursor-pointer"
                            onClick={() => setSelectedWord(word)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{word.headWord}</span>
                                <button
                                  className="h-6 w-6 rounded-lg flex items-center justify-center text-foreground/30 hover:text-primary transition-colors"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-foreground/40">{word.ukPhone || word.phone}</p>
                            </div>
                            <p className="text-sm text-foreground/50 truncate max-w-[150px]">{getTranslation(word)}</p>
                            <ArrowRight className="h-4 w-4 text-foreground/20" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "favorites" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/30">
                  共 {totalFavorites} 个收藏单词
                </span>
                {favoriteWords.length > 0 && (
                  <motion.button
                    onClick={() => {
                      setMemoryQueue(shuffleArray(favoriteWords));
                      setCurrentIndex(0);
                      setMemoryShowAnswer(false);
                      setMemoryKnown(new Set());
                      setMemoryUnknown(new Set());
                      setStudyMode("memory");
                    }}
                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Brain className="h-4 w-4 inline mr-2" />
                    开始记忆
                  </motion.button>
                )}
              </div>

              {favoriteWords.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {favoriteWords.map((word, idx) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ ...springConfig, delay: idx * 0.02 }}
                      className="bg-foreground/[0.02] rounded-2xl p-4 cursor-pointer transition-colors hover:bg-foreground/[0.04]"
                      onClick={() => setSelectedWord(word)}
                      whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{word.headWord}</p>
                          <p className="text-xs text-foreground/40">{word.ukPhone || word.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-yellow-500 bg-yellow-500/10"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(word.id); }}
                          >
                            <Bookmark className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-foreground/30 hover:text-primary"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Volume2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/60 mt-2 line-clamp-2">{getTranslation(word)}</p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-foreground/[0.05] mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Bookmark className="h-8 w-8 text-foreground/20" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">暂无收藏单词</h3>
                  <p className="text-sm text-foreground/40">在浏览或列表模式中点击星星图标收藏单词</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "mistakes" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="mistakes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/30">
                  共 {totalMistakes} 个错题单词
                </span>
                {mistakeWords.length > 0 && (
                  <motion.button
                    onClick={() => {
                      setMemoryQueue(shuffleArray(mistakeWords));
                      setCurrentIndex(0);
                      setMemoryShowAnswer(false);
                      setMemoryKnown(new Set());
                      setMemoryUnknown(new Set());
                      setStudyMode("memory");
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Brain className="h-4 w-4 inline mr-2" />
                    复习错题
                  </motion.button>
                )}
              </div>

              {mistakeWords.length > 0 ? (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {mistakeWords.map((word: Word & { mistakeCount?: number; lastWrongAt?: string }, idx) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfig, delay: idx * 0.015 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-red-500/[0.02] border border-red-500/[0.05] hover:bg-red-500/[0.04] transition-colors group cursor-pointer"
                      onClick={() => setSelectedWord(word)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold">
                        {word.mistakeCount || 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{word.headWord}</span>
                          <motion.button
                            className="h-6 w-6 rounded-lg flex items-center justify-center text-foreground/30 hover:text-primary"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                        <p className="text-xs text-foreground/40">{word.ukPhone || word.phone}</p>
                      </div>
                      <p className="text-sm text-foreground/50 truncate max-w-[150px]">{getTranslation(word)}</p>
                      <motion.button
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-foreground/20 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); removeMistake(word.id); }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.button>
                      <ArrowRight className="h-4 w-4 text-foreground/20" />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-foreground/[0.05] mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-8 w-8 text-green-500/50" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">暂无错题</h3>
                  <p className="text-sm text-foreground/40">完成测试或记忆练习后，错题会自动记录到这里</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {studyMode === "summary" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/30">学习统计</span>
                <motion.button
                  onClick={fetchSummary}
                  className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="h-4 w-4 inline mr-2" />
                  刷新
                </motion.button>
              </div>

              {studySummary ? (
                <>
                  <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springConfig}
                  >
                    <motion.div
                      className="bg-gradient-to-br from-primary/10 to-primary/[0.03] rounded-2xl p-4 border border-primary/10"
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <p className="text-xs text-foreground/40 mb-2">总学习次数</p>
                      <p className="text-2xl font-bold text-foreground">{studySummary.totalStudied}</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-green-500/10 to-green-500/[0.03] rounded-2xl p-4 border border-green-500/10"
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <p className="text-xs text-foreground/40 mb-2">今日学习</p>
                      <p className="text-2xl font-bold text-green-500">{studySummary.todayStudied}</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/[0.03] rounded-2xl p-4 border border-yellow-500/10"
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <p className="text-xs text-foreground/40 mb-2">收藏单词</p>
                      <p className="text-2xl font-bold text-yellow-500">{studySummary.totalFavorites}</p>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-br from-red-500/10 to-red-500/[0.03] rounded-2xl p-4 border border-red-500/10"
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <p className="text-xs text-foreground/40 mb-2">错题数量</p>
                      <p className="text-2xl font-bold text-red-500">{studySummary.totalMistakes}</p>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="bg-foreground/[0.02] rounded-2xl p-6 border border-foreground/[0.05]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.1 }}
                  >
                    <h3 className="text-sm font-semibold text-foreground mb-4">学习模式统计</h3>
                    <div className="space-y-3">
                      {Object.entries(studySummary.modeStats).map(([mode, stats]) => {
                        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                        const modeLabels: Record<string, string> = {
                          test: "测试",
                          memory: "记忆",
                          flashcard: "闪卡",
                        };
                        return (
                          <motion.div key={mode} className="flex items-center gap-4">
                            <span className="text-sm text-foreground/60 w-16">{modeLabels[mode] || mode}</span>
                            <div className="flex-1 h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${accuracy}%` }}
                                transition={{ ...springConfig, delay: 0.2 }}
                              />
                            </div>
                            <span className="text-sm text-foreground/40 w-20 text-right">{stats.correct}/{stats.total} ({accuracy}%)</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-foreground/[0.02] rounded-2xl p-6 border border-foreground/[0.05]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.15 }}
                  >
                    <h3 className="text-sm font-semibold text-foreground mb-4">最近学习记录</h3>
                    {studySummary.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {studySummary.recentActivity.map((activity, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...springConfig, delay: 0.2 + idx * 0.05 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                activity.status === "correct" ? "bg-green-500" : "bg-red-500"
                              )} />
                              <span className="text-sm text-foreground">{activity.word}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-foreground/40">{activity.mode}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/40 text-center py-8">暂无学习记录</p>
                    )}
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-primary/10 to-primary/[0.05] rounded-2xl p-6 border border-primary/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.2 }}
                  >
                    <h3 className="text-sm font-semibold text-primary mb-3">学习建议</h3>
                    <ul className="space-y-2 text-sm text-foreground/70">
                      {studySummary.totalMistakes > 0 && (
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <span>您有 {studySummary.totalMistakes} 个错题，建议优先复习错题本中的单词</span>
                        </li>
                      )}
                      {studySummary.todayStudied === 0 && (
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>今天还没有学习，开始你的单词学习之旅吧！</span>
                        </li>
                      )}
                      {studySummary.totalFavorites > 0 && (
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>您收藏了 {studySummary.totalFavorites} 个单词，可以使用收藏模式进行专项记忆</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span>建议每天学习20-30个单词，保持学习连续性</span>
                      </li>
                    </ul>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-foreground/[0.05] mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BookMarked className="h-8 w-8 text-foreground/20" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">加载中...</h3>
                  <p className="text-sm text-foreground/40">正在获取学习统计数据</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <AnimatePresence>
          {selectedWord && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedWord(null)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg"
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ ...springConfig }}
              >
                <motion.button
                  onClick={() => setSelectedWord(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-foreground/[0.06] flex items-center justify-center text-foreground/40 hover:text-foreground/60"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XIcon className="h-4 w-4" />
                </motion.button>

                <motion.div
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-bold text-foreground mb-2">{selectedWord.headWord}</h2>
                  <p className="text-lg text-foreground/40">{selectedWord.ukPhone || selectedWord.phone}</p>
                </motion.div>

                {getTranslation(selectedWord) && (
                  <motion.div
                    className="bg-primary/5 rounded-2xl p-4 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-sm text-foreground/30 mb-2">释义</p>
                    <p className="text-lg text-primary">{getTranslation(selectedWord)}</p>
                  </motion.div>
                )}

                {getRemMethod(selectedWord) && (
                  <motion.div
                    className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-foreground/30 mb-1">记忆方法</p>
                        <p className="text-sm text-foreground/70">{getRemMethod(selectedWord)}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {getSentences(selectedWord).length > 0 && (
                  <motion.div
                    className="space-y-3 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <p className="text-sm text-foreground/30">例句</p>
                    {getSentences(selectedWord).slice(0, 3).map((s, i) => (
                      <div key={i} className="bg-foreground/[0.02] rounded-xl p-3">
                        <p className="text-sm text-foreground/80 mb-1">{s.sContent}</p>
                        <p className="text-xs text-foreground/40">{s.sCn}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {getPhrases(selectedWord).length > 0 && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-foreground/30 mb-2">短语搭配</p>
                    <div className="flex flex-wrap gap-2">
                      {getPhrases(selectedWord).slice(0, 6).map((p, i) => (
                        <div key={i} className="bg-primary/5 rounded-xl px-3 py-2">
                          <p className="text-sm text-foreground">{p.pContent}</p>
                          <p className="text-xs text-foreground/40">{p.pCn}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {getSynonyms(selectedWord).length > 0 && (
                  <motion.div
                    className="space-y-2 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <p className="text-sm text-foreground/30">同义词</p>
                    {getSynonyms(selectedWord).slice(0, 2).map((s, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <span className="text-xs text-foreground/30">{s.pos}</span>
                        {s.hwds.slice(0, 5).map((h, j) => (
                          <span key={j} className="px-2 py-0.5 bg-foreground/[0.04] text-foreground/60 rounded-full text-xs">
                            {h.w}
                          </span>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}

                {getAntonyms(selectedWord).length > 0 && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-foreground/30 mb-2">反义词</p>
                    <div className="flex flex-wrap gap-2">
                      {getAntonyms(selectedWord).slice(0, 5).map((a, i) => (
                        <span key={i} className="px-3 py-1 bg-red-500/5 text-red-500/70 rounded-full text-xs">
                          {a.hwd}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {getRelatedWords(selectedWord).length > 0 && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <p className="text-sm text-foreground/30">同根词</p>
                    {getRelatedWords(selectedWord).slice(0, 3).map((r, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <span className="text-xs text-foreground/30">{r.pos}</span>
                        {r.words.slice(0, 3).map((w, j) => (
                          <span key={j} className="px-2 py-0.5 bg-foreground/[0.04] text-foreground/60 rounded-full text-xs">
                            {w.hwd} - {w.tran}
                          </span>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}

                {dictionaryLoading && (
                  <motion.div
                    className="flex items-center justify-center py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}

                {dictionaryData && dictionaryData.length > 0 && (
                  <>
                    {dictionaryData[0].phonetics && dictionaryData[0].phonetics.some(p => p.audio) && (
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="text-sm text-foreground/30 mb-2">发音</p>
                        <div className="flex gap-2">
                          {dictionaryData[0].phonetics
                            .filter(p => p.audio)
                            .slice(0, 2)
                            .map((p, i) => (
                              <motion.button
                                key={i}
                                onClick={() => {
                                  const audio = new Audio(p.audio);
                                  audio.play().catch(e => console.error("Play audio failed:", e));
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl text-sm text-primary hover:bg-primary/10 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Volume2 className="h-4 w-4" />
                                <span>{p.text || (i === 0 ? "UK" : "US")}</span>
                              </motion.button>
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {dictionaryData[0].meanings && (
                      <motion.div
                        className="space-y-3 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                      >
                        <p className="text-sm text-foreground/30">详细释义</p>
                        {dictionaryData[0].meanings.slice(0, 3).map((meaning, mi) => (
                          <div key={mi} className="bg-foreground/[0.02] rounded-xl p-4">
                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full mb-2">
                              {meaning.partOfSpeech}
                            </span>
                            {meaning.definitions.slice(0, 2).map((def, di) => (
                              <div key={di} className="mb-2 last:mb-0">
                                <p className="text-sm text-foreground/80">{def.definition}</p>
                                {def.example && (
                                  <p className="text-xs text-foreground/40 mt-1 italic">"{def.example}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {dictionaryData[0].meanings && dictionaryData[0].meanings.some(m => m.synonyms && m.synonyms.length > 0) && (
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <p className="text-sm text-foreground/30 mb-2">同义词</p>
                        <div className="flex flex-wrap gap-2">
                          {dictionaryData[0].meanings
                            .flatMap(m => m.synonyms || [])
                            .slice(0, 8)
                            .map((synonym, i) => (
                              <span key={i} className="px-3 py-1 bg-primary/5 text-primary/70 rounded-full text-xs">
                                {synonym}
                              </span>
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {dictionaryData[0].meanings && dictionaryData[0].meanings.some(m => m.antonyms && m.antonyms.length > 0) && (
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                      >
                        <p className="text-sm text-foreground/30 mb-2">反义词</p>
                        <div className="flex flex-wrap gap-2">
                          {dictionaryData[0].meanings
                            .flatMap(m => m.antonyms || [])
                            .slice(0, 8)
                            .map((antonym, i) => (
                              <span key={i} className="px-3 py-1 bg-red-500/5 text-red-500/70 rounded-full text-xs">
                                {antonym}
                              </span>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                <motion.div className="h-8" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {studyMode === "list" && allWords.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={() => {
            const mainElement = document.querySelector("main");
            if (mainElement) {
              mainElement.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="fixed bottom-24 right-6 z-50 h-11 w-11 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </PageTransition>
  );
}
