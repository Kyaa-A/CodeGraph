"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz } from "@/lib/api";

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
}

type QuizState = "idle" | "loading" | "active" | "results";

// Icons
const Icons = {
  question: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  sparkles: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  check: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  close: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  retry: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  trophy: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

// Option letter mapping
const optionLetters = ["A", "B", "C", "D"];

export function QuizModal({ open, onOpenChange, lessonId }: QuizModalProps) {
  const [state, setState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const score = answers.reduce(
    (acc, answer, i) => (answer === questions[i]?.correct ? acc + 1 : acc),
    0
  );

  const handleGenerate = useCallback(async () => {
    setState("loading");
    setError(null);
    setAnswers([]);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setShowExplanation(false);

    try {
      const { questions: qs } = await generateQuiz(lessonId);
      setQuestions(qs);
      setState("active");
    } catch {
      setError("Could not generate quiz. Make sure the backend is running.");
      setState("idle");
    }
  }, [lessonId]);

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedAnswer) return;
    setAnswers((prev) => [...prev, selectedAnswer]);
    setShowExplanation(true);
  }, [selectedAnswer]);

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    setSelectedAnswer("");
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setState("results");
    }
  }, [currentIndex, questions.length]);

  const handleReset = useCallback(() => {
    setState("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setAnswers([]);
    setShowExplanation(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(handleReset, 300);
  }, [onOpenChange, handleReset]);

  const getResultMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
      return {
        title: "Perfect Score!",
        message: "Outstanding! You've mastered this material completely.",
        color: "text-green-600",
        bgColor: "bg-green-100",
        iconColor: "text-green-500",
      };
    } else if (percentage >= 80) {
      return {
        title: "Excellent!",
        message: "Great job! You have a strong understanding of the material.",
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        iconColor: "text-amber-500",
      };
    } else if (percentage >= 60) {
      return {
        title: "Good Effort!",
        message: "You're on the right track. Review the material to improve.",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-500",
      };
    } else {
      return {
        title: "Keep Learning!",
        message: "Don't worry—review the lesson and try again to improve.",
        color: "text-slate-600",
        bgColor: "bg-slate-100",
        iconColor: "text-slate-500",
      };
    }
  };

  const result = state === "results" ? getResultMessage() : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg glass-modal border-0 shadow-2xl shadow-black/10">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white">
              <Icons.question />
            </div>
            <DialogTitle className="font-heading text-xl">
              {state === "results" ? "Quiz Results" : "Knowledge Check"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 py-6 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                <span className="text-3xl">
                  <Icons.sparkles />
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Ready to test your knowledge?</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Our AI will generate a quiz based on this lesson's content to help reinforce your learning.
                </p>
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <Button onClick={handleGenerate} size="lg" className="btn-gold rounded-xl px-8">
                Start Quiz
              </Button>
            </motion.div>
          )}

          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-xl border-4 border-amber-200 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600">AI</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                Generating personalized quiz questions...
              </p>
            </motion.div>
          )}

          {state === "active" && currentQuestion && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-5 py-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-amber-600 font-medium">
                    {score}/{answers.length} correct
                  </span>
                </div>
                <Progress value={((currentIndex) / questions.length) * 100} className="h-2" />
              </div>

              <div className="glass-card rounded-xl p-4">
                <p className="font-medium text-lg leading-relaxed">{currentQuestion.question}</p>
              </div>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                disabled={showExplanation}
                className="space-y-2"
              >
                {currentQuestion.options.map((option, i) => {
                  const isCorrect = showExplanation && option === currentQuestion.correct;
                  const isWrong = showExplanation && option === selectedAnswer && option !== currentQuestion.correct;
                  const isSelected = !showExplanation && option === selectedAnswer;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        isCorrect
                          ? "border-green-500 bg-green-50"
                          : isWrong
                            ? "border-red-500 bg-red-50"
                            : isSelected
                              ? "border-amber-500 bg-amber-50"
                              : "border-black/5 hover:border-amber-200 hover:bg-amber-50/30"
                      }`}
                      onClick={() => !showExplanation && setSelectedAnswer(option)}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : isWrong
                            ? "bg-red-500 text-white"
                            : isSelected
                              ? "bg-amber-500 text-white"
                              : "bg-slate-100 text-slate-500"
                      }`}>
                        {isCorrect ? <Icons.check /> : isWrong ? <Icons.close /> : optionLetters[i]}
                      </div>
                      <RadioGroupItem value={option} id={`option-${i}`} className="sr-only" />
                      <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer text-sm font-medium">
                        {option}
                      </Label>
                    </motion.div>
                  );
                })}
              </RadioGroup>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 overflow-hidden"
                  >
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs mt-0.5 shrink-0">
                        i
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">Explanation</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end gap-2 pt-2">
                {!showExplanation ? (
                  <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="btn-gold rounded-xl">
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="rounded-xl btn-gold">
                    {currentIndex + 1 < questions.length ? (
                      <>
                        Next Question
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    ) : (
                      "See Results"
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {state === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="space-y-6 py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className={`w-20 h-20 mx-auto rounded-2xl ${result.bgColor} flex items-center justify-center`}
              >
                <span className={result.iconColor}><Icons.trophy /></span>
              </motion.div>

              <div className="space-y-2">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`font-heading text-2xl font-bold ${result.color}`}
                >
                  {result.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm"
                >
                  {result.message}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">{score}</span>
                  <span className="text-2xl text-muted-foreground">/</span>
                  <span className="text-2xl text-muted-foreground">{questions.length}</span>
                </div>
                <Progress value={(score / questions.length) * 100} className="max-w-xs mx-auto h-3" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-3 pt-2"
              >
                <Button variant="outline" onClick={handleClose} className="rounded-xl">
                  Close
                </Button>
                <Button onClick={handleReset} className="btn-gold rounded-xl gap-2">
                  <Icons.retry />
                  Try Again
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
