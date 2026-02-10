"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lang } from "@/lib/docs";
import { cn } from "@/lib/utils";

interface SearchDocument {
  id: string;
  lang: Lang;
  group: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  href: string;
}

interface SearchIndex {
  documents: SearchDocument[];
  generatedAt: string;
}

interface SearchProps {
  lang: Lang;
}

export function Search({ lang }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load search index
  useEffect(() => {
    const loadIndex = async () => {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const response = await fetch(`${basePath}/search-index.json`);
        if (response.ok) {
          const data = await response.json();
          setIndex(data);
        }
      } catch (error) {
        console.error("Failed to load search index:", error);
      }
    };

    if (open && !index) {
      loadIndex();
    }
  }, [open, index]);

  // Simple search function (client-side filtering)
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!index || !searchQuery.trim()) {
        setResults([]);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = index.documents
        .filter((doc) => doc.lang === lang)
        .filter((doc) => {
          const titleMatch = doc.title.toLowerCase().includes(query);
          const descMatch = doc.description.toLowerCase().includes(query);
          const contentMatch = doc.content.toLowerCase().includes(query);
          return titleMatch || descMatch || contentMatch;
        })
        .slice(0, 10);

      setResults(filtered);
      setSelectedIndex(0);
    },
    [index, lang],
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          const doc = results[selectedIndex];
          setOpen(false);
          setQuery("");
          router.push(doc.href);
        }
      }
    },
    [results, selectedIndex, router],
  );

  const handleSelect = (doc: SearchDocument) => {
    setOpen(false);
    setQuery("");
    router.push(doc.href);
  };

  const groupLabels: Record<string, string> = {
    "getting-started": lang === "ko" ? "시작하기" : "Getting Started",
    "core-concepts": lang === "ko" ? "핵심 개념" : "Core Concepts",
    guide: lang === "ko" ? "가이드" : "Guide",
    "cli-interfaces": lang === "ko" ? "CLI 인터페이스" : "CLI Interfaces",
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0 text-zinc-400 hover:text-zinc-100 lg:h-8 lg:w-auto lg:gap-2 lg:rounded-md lg:border lg:border-white/10 lg:bg-white/5 lg:px-3"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        <span className="hidden text-sm lg:inline">
          {lang === "ko" ? "검색" : "Search"}
        </span>
        <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-zinc-400 lg:inline">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden border-white/10 bg-zinc-950 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {lang === "ko" ? "문서 검색" : "Search Documentation"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center border-b border-white/10 px-4">
            <SearchIcon className="size-5 text-zinc-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === "ko" ? "문서 검색..." : "Search documentation..."
              }
              className="flex-1 border-0 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {loading && (
              <Loader2 className="size-4 animate-spin text-zinc-400" />
            )}
          </div>

          <ScrollArea className="max-h-[60vh]">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                {query ? (
                  <>
                    <FileText className="mb-2 size-8 opacity-50" />
                    <p>
                      {lang === "ko"
                        ? "검색 결과가 없습니다"
                        : "No results found"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm">
                    {lang === "ko"
                      ? "검색어를 입력하세요"
                      : "Type to search documentation"}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2">
                {results.map((doc, index) => (
                  <motion.button
                    key={doc.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.03 }}
                    onClick={() => handleSelect(doc)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors",
                      selectedIndex === index
                        ? "bg-white/10"
                        : "hover:bg-white/5",
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#B23A34]">
                        {groupLabels[doc.group] || doc.group}
                      </span>
                    </div>
                    <span className="font-medium text-zinc-100">
                      {doc.title}
                    </span>
                    {doc.description && (
                      <span className="line-clamp-1 text-sm text-zinc-400">
                        {doc.description}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/10 px-1 font-mono">↑↓</kbd>
                <span>{lang === "ko" ? "선택" : "Navigate"}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/10 px-1 font-mono">↵</kbd>
                <span>{lang === "ko" ? "열기" : "Open"}</span>
              </span>
            </div>
            <span>
              {index
                ? `${index.documents.length} ${lang === "ko" ? "문서" : "docs"}`
                : ""}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
