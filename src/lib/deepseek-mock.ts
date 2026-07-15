import { GeneratedQuestion, WritingResult } from "./deepseek";

export const mockQuestions: Record<string, GeneratedQuestion> = {
  "人工智能": {
    en: "Some people believe that artificial intelligence will replace human workers in the future. To what extent do you agree or disagree?",
    zh: "有些人认为人工智能将在未来取代人类工人。在多大程度上你同意或不同意？",
    topic: "Technology",
    type: "Argumentative",
  },
  "环境保护": {
    en: "Environmental protection is the responsibility of governments rather than individuals. To what extent do you agree or disagree?",
    zh: "环境保护是政府而非个人的责任。在多大程度上你同意或不同意？",
    topic: "Environment",
    type: "Argumentative",
  },
  "教育": {
    en: "Some people think that universities should provide more practical courses, while others believe that theoretical knowledge is more important. Discuss both views and give your opinion.",
    zh: "有些人认为大学应该提供更多实用课程，而另一些人认为理论知识更重要。讨论两种观点并给出你的意见。",
    topic: "Education",
    type: "Discussion",
  },
  "社交媒体": {
    en: "Social media has had a negative impact on young people. Do you agree or disagree?",
    zh: "社交媒体对年轻人产生了负面影响。你同意还是不同意？",
    topic: "Technology & Media",
    type: "Argumentative",
  },
  "健康": {
    en: "Some people argue that the best way to improve public health is to increase the number of sports facilities. Others, however, think that this would have little effect on public health and that other measures are required. Discuss both these views and give your own opinion.",
    zh: "有些人认为改善公共健康的最佳方式是增加体育设施的数量。然而，另一些人认为这对公共健康几乎没有影响，需要其他措施。讨论这两种观点并给出你自己的意见。",
    topic: "Health",
    type: "Discussion",
  },
  "科技": {
    en: "The use of mobile phones and computers has made communication between people less personal. To what extent do you agree or disagree?",
    zh: "手机和电脑的使用使人们之间的交流变得不那么个人化。在多大程度上你同意或不同意？",
    topic: "Technology",
    type: "Argumentative",
  },
  "文化": {
    en: "Some people think that museums should be enjoyable places to attract and entertain young people, while others believe that the purpose of museums is to educate. Discuss both views and give your own opinion.",
    zh: "有些人认为博物馆应该是吸引和娱乐年轻人的有趣场所，而另一些人认为博物馆的目的是教育。讨论两种观点并给出你自己的意见。",
    topic: "Culture",
    type: "Discussion",
  },
};

export const generateMockQuestion = (topic: string, type?: string): GeneratedQuestion => {
  const normalizedTopic = topic.replace(/\s+/g, "").toLowerCase();
  
  for (const [key, question] of Object.entries(mockQuestions)) {
    if (key.includes(normalizedTopic) || normalizedTopic.includes(key)) {
      return { ...question, type: type || question.type };
    }
  }

  const defaultQuestions: GeneratedQuestion[] = [
    {
      en: "Some people argue that the best way to improve public health is to increase the number of sports facilities. Others, however, think that this would have little effect on public health and that other measures are required. Discuss both these views and give your own opinion.",
      zh: "有些人认为改善公共健康的最佳方式是增加体育设施的数量。然而，另一些人认为这对公共健康几乎没有影响，需要其他措施。讨论这两种观点并给出你自己的意见。",
      topic: "Health",
      type: type || "Discussion",
    },
    {
      en: "In many countries, traditional foods are being replaced by international fast foods. This is having a negative effect on both families and societies. To what extent do you agree or disagree?",
      zh: "在许多国家，传统食品正被国际快餐所取代。这对家庭和社会都产生了负面影响。在多大程度上你同意或不同意？",
      topic: "Food & Culture",
      type: type || "Argumentative",
    },
    {
      en: "Some people think that children should begin their formal education at a very early age. Others think they should begin after 7 years of age. Discuss both views and give your own opinion.",
      zh: "有些人认为儿童应该在很小的年龄就开始接受正规教育。另一些人认为他们应该在7岁以后开始。讨论两种观点并给出你自己的意见。",
      topic: "Education",
      type: type || "Discussion",
    },
  ];

  return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
};

const roundToIeltsScore = (score: number): number => {
  const rounded = Math.round(score * 2) / 2;
  return Math.max(1.0, Math.min(9.0, rounded));
};

const evaluateTaskAchievement = (wordCount: number, paragraphCount: number, sentenceCount: number): number => {
  if (wordCount >= 300 && paragraphCount >= 4 && sentenceCount >= 15) return 8.0;
  if (wordCount >= 280 && paragraphCount >= 3 && sentenceCount >= 12) return 7.5;
  if (wordCount >= 250 && paragraphCount >= 3 && sentenceCount >= 10) return 7.0;
  if (wordCount >= 220 && paragraphCount >= 3 && sentenceCount >= 8) return 6.5;
  if (wordCount >= 200 && paragraphCount >= 2 && sentenceCount >= 6) return 6.0;
  if (wordCount >= 170 && paragraphCount >= 2 && sentenceCount >= 5) return 5.5;
  if (wordCount >= 150 && paragraphCount >= 2) return 5.0;
  if (wordCount >= 120) return 4.5;
  if (wordCount >= 80) return 4.0;
  if (wordCount >= 50) return 3.5;
  return 3.0;
};

const evaluateCoherenceCohesion = (paragraphCount: number, connectorCount: number, avgSentenceLength: number): number => {
  if (paragraphCount >= 4 && connectorCount >= 6 && avgSentenceLength >= 25) return 8.0;
  if (paragraphCount >= 4 && connectorCount >= 4 && avgSentenceLength >= 20) return 7.5;
  if (paragraphCount >= 3 && connectorCount >= 3 && avgSentenceLength >= 18) return 7.0;
  if (paragraphCount >= 3 && connectorCount >= 2 && avgSentenceLength >= 15) return 6.5;
  if (paragraphCount >= 3 && connectorCount >= 1 && avgSentenceLength >= 12) return 6.0;
  if (paragraphCount >= 2 && connectorCount >= 1 && avgSentenceLength >= 10) return 5.5;
  if (paragraphCount >= 2 && connectorCount >= 1) return 5.0;
  if (paragraphCount >= 2) return 4.5;
  if (connectorCount >= 1) return 4.0;
  return 3.5;
};

const evaluateLexicalResource = (wordCount: number, uniqueWordRatio: number, avgWordLength: number): number => {
  if (wordCount >= 280 && uniqueWordRatio >= 0.6 && avgWordLength >= 5.5) return 8.0;
  if (wordCount >= 250 && uniqueWordRatio >= 0.55 && avgWordLength >= 5.0) return 7.5;
  if (wordCount >= 220 && uniqueWordRatio >= 0.5 && avgWordLength >= 4.5) return 7.0;
  if (wordCount >= 200 && uniqueWordRatio >= 0.45 && avgWordLength >= 4.2) return 6.5;
  if (wordCount >= 180 && uniqueWordRatio >= 0.4 && avgWordLength >= 4.0) return 6.0;
  if (wordCount >= 150 && uniqueWordRatio >= 0.35 && avgWordLength >= 3.5) return 5.5;
  if (wordCount >= 120 && uniqueWordRatio >= 0.3) return 5.0;
  if (wordCount >= 100 && uniqueWordRatio >= 0.25) return 4.5;
  if (wordCount >= 80) return 4.0;
  return 3.5;
};

const evaluateGrammaticalRange = (grammarErrorCount: number, sentenceVariety: number, avgSentenceLength: number): number => {
  if (grammarErrorCount === 0 && sentenceVariety >= 5 && avgSentenceLength >= 25) return 8.0;
  if (grammarErrorCount <= 1 && sentenceVariety >= 4 && avgSentenceLength >= 20) return 7.5;
  if (grammarErrorCount <= 2 && sentenceVariety >= 3 && avgSentenceLength >= 18) return 7.0;
  if (grammarErrorCount <= 3 && sentenceVariety >= 3 && avgSentenceLength >= 15) return 6.5;
  if (grammarErrorCount <= 4 && sentenceVariety >= 2 && avgSentenceLength >= 12) return 6.0;
  if (grammarErrorCount <= 5 && sentenceVariety >= 2 && avgSentenceLength >= 10) return 5.5;
  if (grammarErrorCount <= 6 && sentenceVariety >= 1) return 5.0;
  if (grammarErrorCount <= 8) return 4.5;
  if (grammarErrorCount <= 10) return 4.0;
  return 3.5;
};

export const generateMockGrade = (essay: string): WritingResult => {
  const words = essay.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const uniqueWordRatio = wordCount > 0 ? uniqueWords / wordCount : 0;
  
  const avgWordLength = wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;
  
  const rawParagraphs = essay.split(/\n+/).filter((p) => p.trim().length > 0);
  const paragraphCount = rawParagraphs.length || 1;
  
  const sentences = essay.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  
  const avgSentenceLength = sentenceCount > 0 ? essay.length / sentenceCount : 0;
  
  const complexConnectors = ["although", "despite", "however", "moreover", "furthermore", "in addition", "on the other hand", "in conclusion", "firstly", "secondly", "finally", "therefore", "nevertheless", "consequently", "in contrast", "for example", "in particular", "to sum up", "first of all", "last but not least"];
  const essayLower = essay.toLowerCase();
  const connectorCount = complexConnectors.filter((c) => essayLower.includes(c)).length;
  
  const grammarIssues: { sentence: string; correction: string; explanation: string }[] = [];
  
  const subjectVerbErrors = essay.match(/\b(he|she|it)\s+\b(have|don't)\b/gi);
  if (subjectVerbErrors && subjectVerbErrors.length > 0) {
    grammarIssues.push({
      sentence: subjectVerbErrors[0],
      correction: subjectVerbErrors[0].replace(/\b(have)\b/gi, "has").replace(/\b(don't)\b/gi, "doesn't"),
      explanation: "主谓一致错误，第三人称单数动词需要使用has/doesn't",
    });
  }
  
  const articleErrors = essay.match(/\ba\s+[aeiouAEIOU]/g);
  if (articleErrors && articleErrors.length > 0) {
    grammarIssues.push({
      sentence: articleErrors[0],
      correction: articleErrors[0].replace(/\ba\s+/, "an "),
      explanation: "元音音素开头的单词前应该使用an",
    });
  }
  
  const wrongArticleErrors = essay.match(/\ban\s+[^aeiouAEIOU]/g);
  if (wrongArticleErrors && wrongArticleErrors.length > 0) {
    grammarIssues.push({
      sentence: wrongArticleErrors[0],
      correction: wrongArticleErrors[0].replace(/\ban\s+/, "a "),
      explanation: "辅音音素开头的单词前应该使用a",
    });
  }
  
  const tenseErrors = essay.match(/\b(has|have)\s+[a-z]+ed\b/gi);
  if (tenseErrors && tenseErrors.length > 0) {
    grammarIssues.push({
      sentence: tenseErrors[0],
      correction: tenseErrors[0].replace(/\b(has|have)\s+/gi, ""),
      explanation: "时态错误，现在完成时结构不正确",
    });
  }
  
  const sentenceTypes = new Set<string>();
  if (essayLower.includes("although") || essayLower.includes("even though")) sentenceTypes.add("complex");
  if (essayLower.includes("because") || essayLower.includes("since")) sentenceTypes.add("cause");
  if (essayLower.includes("if") || essayLower.includes("unless")) sentenceTypes.add("conditional");
  if (essayLower.includes("which") || essayLower.includes("who") || essayLower.includes("that")) sentenceTypes.add("relative");
  if (essayLower.includes(", and") || essayLower.includes(", but") || essayLower.includes(", or")) sentenceTypes.add("compound");
  const sentenceVariety = sentenceTypes.size;
  
  const grammarErrorCount = grammarIssues.length;
  
  const taskAchievement = evaluateTaskAchievement(wordCount, paragraphCount, sentenceCount);
  const coherenceCohesion = evaluateCoherenceCohesion(paragraphCount, connectorCount, avgSentenceLength);
  const lexicalResource = evaluateLexicalResource(wordCount, uniqueWordRatio, avgWordLength);
  const grammaticalRange = evaluateGrammaticalRange(grammarErrorCount, sentenceVariety, avgSentenceLength);
  
  const overall = roundToIeltsScore((taskAchievement + coherenceCohesion + lexicalResource + grammaticalRange) / 4);
  
  const getStrengths = (): string[] => {
    const strengths: string[] = [];
    if (taskAchievement >= 7) strengths.push("充分回答了问题，论点清晰且论证充分");
    else if (taskAchievement >= 6) strengths.push("基本回答了问题，论点较为清晰");
    
    if (coherenceCohesion >= 7) strengths.push("文章结构清晰，连接词使用恰当，段落衔接自然");
    else if (coherenceCohesion >= 6) strengths.push("文章结构较为清晰，有适当的连接词");
    
    if (lexicalResource >= 7) strengths.push("词汇丰富多样，运用准确恰当");
    else if (lexicalResource >= 6) strengths.push("词汇量足够，有一定多样性");
    
    if (grammaticalRange >= 7) strengths.push("语法结构多样，运用熟练准确");
    else if (grammaticalRange >= 6) strengths.push("语法结构有一定变化，基本准确");
    
    return strengths.length > 0 ? strengths : ["文章结构完整，表达基本清晰"];
  };
  
  const getWeaknesses = (): string[] => {
    const weaknesses: string[] = [];
    if (taskAchievement < 6) weaknesses.push("未能充分回答问题，论点不够清晰或论证不足");
    else if (taskAchievement < 7) weaknesses.push("可以进一步拓展论点，增加更多论据");
    
    if (coherenceCohesion < 6) weaknesses.push("文章结构不够清晰，连接词使用不足");
    else if (coherenceCohesion < 7) weaknesses.push("可以增加更多连接词来增强连贯性");
    
    if (lexicalResource < 6) weaknesses.push("词汇量有限，重复使用较多，错误较多");
    else if (lexicalResource < 7) weaknesses.push("可以尝试使用更多高级词汇");
    
    if (grammaticalRange < 6) weaknesses.push("语法错误较多，影响表达准确性");
    else if (grammaticalRange < 7) weaknesses.push("可以增加更多复杂句结构");
    
    if (wordCount < 250) weaknesses.push("文章篇幅较短，建议增加至250词以上");
    if (paragraphCount < 3) weaknesses.push("建议分为引言、主体和结论三个段落");
    
    return weaknesses.slice(0, 3);
  };
  
  const getSuggestions = (): string[] => {
    const suggestions: string[] = [];
    
    if (taskAchievement < 7) {
      suggestions.push("建议仔细审题，确保完整回答所有问题要点");
      suggestions.push("增加更多具体例子和论据来支撑论点");
    }
    
    if (coherenceCohesion < 7) {
      suggestions.push("学习使用更多连接词如Firstly, Moreover, However, In conclusion等");
      suggestions.push("确保每个段落有明确的主题句，并围绕主题展开");
    }
    
    if (lexicalResource < 7) {
      suggestions.push("积累更多同义词，避免重复使用相同词汇");
      suggestions.push("尝试使用一些学术词汇提升文章质量");
    }
    
    if (grammaticalRange < 7) {
      suggestions.push("学习使用复合句和复杂句结构");
      suggestions.push("注意主谓一致、时态和冠词使用");
    }
    
    suggestions.push("建议检查语法错误，使用Grammarly等工具辅助校对");
    
    return suggestions.slice(0, 5);
  };
  
  return {
    score: {
      overall,
      taskAchievement,
      coherenceCohesion,
      lexicalResource,
      grammaticalRange,
    },
    feedback: {
      strengths: getStrengths(),
      weaknesses: getWeaknesses(),
      suggestions: getSuggestions(),
    },
    grammarIssues: grammarIssues.slice(0, 3),
    improvedVersion: paragraphCount > 0 
      ? `这篇作文结构${paragraphCount >= 3 ? "清晰" : "基本完整"}。为了达到更高分数，建议：\n\n1. 在段落开头使用更多连接词，如"Firstly", "Furthermore", "However"等\n2. 增加更多具体的例子来支持你的论点\n3. 使用更多复杂句结构，如定语从句、状语从句等\n4. 检查语法错误，特别是主谓一致和时态问题\n\n修改后的开头示例：\n\n${rawParagraphs[0].substring(0, 100)}... (继续扩展论点并添加更多细节)`
      : undefined,
  };
};
