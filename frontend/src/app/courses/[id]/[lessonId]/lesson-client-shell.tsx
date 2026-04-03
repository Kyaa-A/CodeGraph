"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { QuizModal } from "@/components/quiz-modal";

interface LessonClientShellProps {
  lessonId: string;
  courseId: string;
  children: React.ReactNode;
}

export function LessonClientShell({
  lessonId,
  courseId,
  children,
}: LessonClientShellProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      {children}

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Button
          onClick={() => setQuizOpen(true)}
          variant="outline"
          className="shadow-lg"
          size="lg"
        >
          Generate Quiz
        </Button>
        <Button
          onClick={() => setChatOpen(true)}
          className="shadow-lg"
          size="lg"
        >
          AI Tutor
        </Button>
      </div>

      <AiChatPanel
        open={chatOpen}
        onOpenChange={setChatOpen}
        lessonId={lessonId}
      />

      <QuizModal
        open={quizOpen}
        onOpenChange={setQuizOpen}
        lessonId={lessonId}
      />
    </>
  );
}
