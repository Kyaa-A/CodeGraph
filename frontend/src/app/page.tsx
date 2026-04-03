import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI-Powered Chat Tutor",
    description:
      "Get instant help from an AI tutor that understands your lesson context using RAG.",
  },
  {
    title: "Semantic Search",
    description:
      "Find answers across all lessons instantly with natural language search powered by embeddings.",
  },
  {
    title: "Auto-Generated Quizzes",
    description:
      "Test your knowledge with AI-generated quizzes tailored to each lesson.",
  },
  {
    title: "LangChain & LangGraph",
    description:
      "Learn to build real AI applications using the same tools powering this platform.",
  },
  {
    title: "Track Your Progress",
    description:
      "Monitor your learning journey with course progress tracking and completion stats.",
  },
  {
    title: "Built for Developers",
    description:
      "Hands-on, code-first approach. Learn by building, not watching.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Learn AI Development
            <br />
            <span className="text-muted-foreground">by Building It</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Master LangChain, LangGraph, vector embeddings, and Python by
            constructing a real AI-powered course platform from scratch.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/courses">
            <Button size="lg">Browse Courses</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Platform Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Join CodeGraph and build real AI applications while learning the tools
          and concepts that matter.
        </p>
        <div className="mt-8">
          <Link href="/courses">
            <Button size="lg">Explore Courses</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-8">
          <p className="text-sm text-muted-foreground">
            CodeGraph - AI-Powered Learning Platform
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, FastAPI, LangChain
          </p>
        </div>
      </footer>
    </div>
  );
}
