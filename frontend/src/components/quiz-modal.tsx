"use client";

import { useState } from "react";
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

type QuizState = "idle" | "loading" | "active" | "review" | "results";

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

  async function handleGenerate() {
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
  }

  function handleSubmitAnswer() {
    if (!selectedAnswer) return;
    setAnswers((prev) => [...prev, selectedAnswer]);
    setShowExplanation(true);
  }

  function handleNext() {
    setShowExplanation(false);
    setSelectedAnswer("");
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setState("results");
    }
  }

  function handleReset() {
    setState("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setAnswers([]);
    setShowExplanation(false);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {state === "results" ? "Quiz Results" : "Quiz Mode"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Idle / Generate */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-4 text-center"
            >
              <p className="text-muted-foreground">
                Test your knowledge of this lesson with an AI-generated quiz.
              </p>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button onClick={handleGenerate} size="lg">
                Generate Quiz
              </Button>
            </motion.div>
          )}

          {/* Loading */}
          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Generating quiz questions...
              </p>
            </motion.div>
          )}

          {/* Active question */}
          {state === "active" && currentQuestion && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span>{score} correct so far</span>
                </div>
                <Progress
                  value={((currentIndex + 1) / questions.length) * 100}
                />
              </div>

              <p className="text-base font-medium">
                {currentQuestion.question}
              </p>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                disabled={showExplanation}
              >
                {currentQuestion.options.map((option, i) => {
                  const isCorrect =
                    showExplanation && option === currentQuestion.correct;
                  const isWrong =
                    showExplanation &&
                    option === selectedAnswer &&
                    option !== currentQuestion.correct;

                  return (
                    <div
                      key={i}
                      className={`flex items-center space-x-2 rounded-lg border p-3 transition-colors ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : isWrong
                            ? "border-red-500 bg-red-500/10"
                            : ""
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${i}`} />
                      <Label
                        htmlFor={`option-${i}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>

              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-muted p-3 text-sm"
                >
                  <p className="font-medium">Explanation:</p>
                  <p className="text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}

              <div className="flex justify-end gap-2">
                {!showExplanation ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    {currentIndex + 1 < questions.length
                      ? "Next Question"
                      : "See Results"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {state === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-4 text-center"
            >
              <div className="space-y-2">
                <p className="text-5xl font-bold">
                  {score}/{questions.length}
                </p>
                <p className="text-muted-foreground">
                  {score === questions.length
                    ? "Perfect score! You really know this material."
                    : score >= questions.length * 0.7
                      ? "Great job! You have a solid understanding."
                      : "Keep studying! Review the lesson and try again."}
                </p>
              </div>
              <Progress
                value={(score / questions.length) * 100}
                className="mx-auto max-w-xs"
              />
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={handleReset}>Try Again</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
