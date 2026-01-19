import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ExamQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options?: { id: string; text: string }[];
  correct_answer?: string;
  points: number;
  explanation?: string;
  audio_context?: string;
  passage?: string;
  order_index: number;
}

interface MockExamState {
  status: "not_started" | "in_progress" | "section_break" | "completed";
  currentSection: number;
  currentQuestion: number;
  sections: string[];
  answers: Record<string, string>;
  timeRemaining: number;
  sectionTimes: number[];
  startedAt: Date | null;
  completedAt: Date | null;
}

interface SectionConfig {
  name: string;
  duration: number; // in seconds
  questionCount: number;
  questions: ExamQuestion[];
}

export const useMockExam = (examType: string = "ielts") => {
  const { user } = useAuth();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [examState, setExamState] = useState<MockExamState>({
    status: "not_started",
    currentSection: 0,
    currentQuestion: 0,
    sections: [],
    answers: {},
    timeRemaining: 0,
    sectionTimes: [],
    startedAt: null,
    completedAt: null,
  });
  const [results, setResults] = useState<{
    score: number;
    maxScore: number;
    sectionScores: Record<string, { score: number; max: number }>;
    bandScore?: number;
    cefrLevel?: string;
  } | null>(null);

  // Exam configurations
  const examConfigs: Record<string, { sections: { name: string; duration: number; questionCount: number }[] }> = {
    ielts: {
      sections: [
        { name: "listening", duration: 30 * 60, questionCount: 10 },
        { name: "reading", duration: 60 * 60, questionCount: 10 },
        { name: "writing", duration: 60 * 60, questionCount: 2 },
        { name: "speaking", duration: 15 * 60, questionCount: 3 },
      ],
    },
    sat: {
      sections: [
        { name: "reading", duration: 65 * 60, questionCount: 10 },
        { name: "writing", duration: 35 * 60, questionCount: 10 },
        { name: "math", duration: 80 * 60, questionCount: 10 },
      ],
    },
    toefl: {
      sections: [
        { name: "reading", duration: 54 * 60, questionCount: 10 },
        { name: "listening", duration: 41 * 60, questionCount: 10 },
        { name: "speaking", duration: 17 * 60, questionCount: 4 },
        { name: "writing", duration: 50 * 60, questionCount: 2 },
      ],
    },
    cefr: {
      sections: [
        { name: "reading", duration: 30 * 60, questionCount: 10 },
        { name: "listening", duration: 20 * 60, questionCount: 10 },
        { name: "writing", duration: 30 * 60, questionCount: 2 },
        { name: "speaking", duration: 10 * 60, questionCount: 3 },
      ],
    },
  };

  // Generate questions for all sections
  const generateExam = useCallback(async (difficulty: string = "intermediate") => {
    setGenerating(true);
    try {
      const config = examConfigs[examType] || examConfigs.ielts;
      const generatedSections: SectionConfig[] = [];

      for (const section of config.sections) {
        const { data, error } = await supabase.functions.invoke("generate-exam-questions", {
          body: {
            examType,
            section: section.name,
            difficulty,
            questionCount: section.questionCount,
          },
        });

        if (error) throw error;

        generatedSections.push({
          name: section.name,
          duration: section.duration,
          questionCount: section.questionCount,
          questions: (data.questions || []).map((q: any, idx: number) => ({
            ...q,
            id: `${section.name}-${idx}`,
          })),
        });
      }

      setSections(generatedSections);
      setExamState(prev => ({
        ...prev,
        sections: generatedSections.map(s => s.name),
        sectionTimes: generatedSections.map(s => s.duration),
      }));

      toast({
        title: "Exam Generated!",
        description: `${generatedSections.length} sections ready. Good luck!`,
      });

      return generatedSections;
    } catch (error) {
      console.error("Failed to generate exam:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate exam questions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setGenerating(false);
    }
  }, [examType, toast]);

  // Start the exam
  const startExam = useCallback(() => {
    if (sections.length === 0) {
      toast({
        title: "No Exam Generated",
        description: "Please generate an exam first.",
        variant: "destructive",
      });
      return;
    }

    setExamState(prev => ({
      ...prev,
      status: "in_progress",
      currentSection: 0,
      currentQuestion: 0,
      timeRemaining: sections[0].duration,
      startedAt: new Date(),
      answers: {},
    }));
  }, [sections, toast]);

  // Timer effect
  useEffect(() => {
    if (examState.status === "in_progress" && examState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setExamState(prev => {
          if (prev.timeRemaining <= 1) {
            // Time's up for this section
            return handleSectionTimeout(prev);
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examState.status, examState.currentSection]);

  // Handle section timeout
  const handleSectionTimeout = (state: MockExamState): MockExamState => {
    const nextSection = state.currentSection + 1;
    
    if (nextSection >= sections.length) {
      // Exam complete
      if (timerRef.current) clearInterval(timerRef.current);
      return {
        ...state,
        status: "completed",
        completedAt: new Date(),
        timeRemaining: 0,
      };
    }

    // Move to next section with break
    return {
      ...state,
      status: "section_break",
      currentSection: nextSection,
      currentQuestion: 0,
      timeRemaining: 0,
    };
  };

  // Continue to next section after break
  const continueToNextSection = useCallback(() => {
    setExamState(prev => ({
      ...prev,
      status: "in_progress",
      timeRemaining: sections[prev.currentSection]?.duration || 0,
    }));
  }, [sections]);

  // Navigate questions
  const goToQuestion = useCallback((questionIndex: number) => {
    const currentSectionQuestions = sections[examState.currentSection]?.questions || [];
    if (questionIndex >= 0 && questionIndex < currentSectionQuestions.length) {
      setExamState(prev => ({ ...prev, currentQuestion: questionIndex }));
    }
  }, [sections, examState.currentSection]);

  const nextQuestion = useCallback(() => {
    const currentSectionQuestions = sections[examState.currentSection]?.questions || [];
    if (examState.currentQuestion < currentSectionQuestions.length - 1) {
      setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  }, [sections, examState.currentSection, examState.currentQuestion]);

  const prevQuestion = useCallback(() => {
    if (examState.currentQuestion > 0) {
      setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    }
  }, [examState.currentQuestion]);

  // Submit answer
  const submitAnswer = useCallback((questionId: string, answer: string) => {
    setExamState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  }, []);

  // Finish section early
  const finishSection = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setExamState(prev => {
      const nextSection = prev.currentSection + 1;
      
      if (nextSection >= sections.length) {
        return {
          ...prev,
          status: "completed",
          completedAt: new Date(),
          timeRemaining: 0,
        };
      }

      return {
        ...prev,
        status: "section_break",
        currentSection: nextSection,
        currentQuestion: 0,
        timeRemaining: 0,
      };
    });
  }, [sections.length]);

  // Calculate results
  const calculateResults = useCallback(() => {
    let totalScore = 0;
    let totalMax = 0;
    const sectionScores: Record<string, { score: number; max: number }> = {};

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionMax = 0;

      section.questions.forEach(question => {
        const userAnswer = examState.answers[question.id];
        sectionMax += question.points;
        
        if (question.question_type === "multiple_choice" || question.question_type === "true_false") {
          if (userAnswer === question.correct_answer) {
            sectionScore += question.points;
          }
        } else if (question.question_type === "fill_blank") {
          if (userAnswer?.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim()) {
            sectionScore += question.points;
          }
        } else {
          // Essay/speaking - give partial credit if answered
          if (userAnswer && userAnswer.trim().length > 10) {
            sectionScore += question.points * 0.5; // 50% for completion
          }
        }
      });

      sectionScores[section.name] = { score: sectionScore, max: sectionMax };
      totalScore += sectionScore;
      totalMax += sectionMax;
    });

    // Calculate band score for IELTS
    const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    let bandScore: number | undefined;
    let cefrLevel: string | undefined;

    if (examType === "ielts") {
      if (percentage >= 90) bandScore = 9.0;
      else if (percentage >= 85) bandScore = 8.5;
      else if (percentage >= 80) bandScore = 8.0;
      else if (percentage >= 75) bandScore = 7.5;
      else if (percentage >= 70) bandScore = 7.0;
      else if (percentage >= 65) bandScore = 6.5;
      else if (percentage >= 60) bandScore = 6.0;
      else if (percentage >= 55) bandScore = 5.5;
      else if (percentage >= 50) bandScore = 5.0;
      else if (percentage >= 40) bandScore = 4.0;
      else bandScore = 3.0;
    } else if (examType === "cefr") {
      if (percentage >= 90) cefrLevel = "C2";
      else if (percentage >= 80) cefrLevel = "C1";
      else if (percentage >= 70) cefrLevel = "B2";
      else if (percentage >= 55) cefrLevel = "B1";
      else if (percentage >= 40) cefrLevel = "A2";
      else cefrLevel = "A1";
    }

    const calculatedResults = {
      score: totalScore,
      maxScore: totalMax,
      sectionScores,
      bandScore,
      cefrLevel,
    };

    setResults(calculatedResults);
    return calculatedResults;
  }, [sections, examState.answers, examType]);

  // Effect to calculate results when exam completes
  useEffect(() => {
    if (examState.status === "completed" && !results) {
      calculateResults();
    }
  }, [examState.status, results, calculateResults]);

  // Reset exam
  const resetExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setExamState({
      status: "not_started",
      currentSection: 0,
      currentQuestion: 0,
      sections: [],
      answers: {},
      timeRemaining: 0,
      sectionTimes: [],
      startedAt: null,
      completedAt: null,
    });
    setSections([]);
    setResults(null);
  }, []);

  // Get current question
  const currentQuestion = sections[examState.currentSection]?.questions[examState.currentQuestion];
  const currentSectionConfig = sections[examState.currentSection];

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress calculation
  const sectionProgress = currentSectionConfig 
    ? ((examState.currentQuestion + 1) / currentSectionConfig.questions.length) * 100
    : 0;
  
  const overallProgress = sections.length > 0
    ? ((examState.currentSection + (sectionProgress / 100)) / sections.length) * 100
    : 0;

  return {
    // State
    loading,
    generating,
    sections,
    examState,
    results,
    currentQuestion,
    currentSectionConfig,
    
    // Computed
    timeRemaining: formatTime(examState.timeRemaining),
    sectionProgress,
    overallProgress,
    answeredCount: Object.keys(examState.answers).length,
    
    // Actions
    generateExam,
    startExam,
    continueToNextSection,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitAnswer,
    finishSection,
    resetExam,
    calculateResults,
  };
};
