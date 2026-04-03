"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchLessons, type SearchResult } from "@/lib/api";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { results } = await searchLessons(query, 8);
        setResults(results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      // Navigate to the lesson - we need the course_id, but we only have lesson_id.
      // We'll route to a search-result redirect that figures out the course.
      router.push(`/search-redirect?lesson_id=${result.lesson_id}`);
    },
    [router]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search lessons with AI..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!query.trim() && (
          <CommandEmpty>Type to search across all lessons...</CommandEmpty>
        )}
        {query.trim() && !loading && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
        {results.length > 0 && (
          <CommandGroup heading="Lessons">
            {results.map((result, index) => (
              <CommandItem
                key={`${result.lesson_id}-${index}`}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {result.lesson_title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.similarity_score * 100)}% match
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {result.chunk_text}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
