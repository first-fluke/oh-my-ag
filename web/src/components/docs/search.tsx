"use client";

import { FileText, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredDocs = index?.documents.filter(
    (doc) =>
      doc.lang === lang &&
      (doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.description.toLowerCase().includes(query.toLowerCase()) ||
        doc.content.toLowerCase().includes(query.toLowerCase())),
  );

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const groupLabels: Record<string, string> = {
    "getting-started": lang === "ko" ? "시작하기" : "Getting Started",
    "core-concepts": lang === "ko" ? "핵심 개념" : "Core Concepts",
    guide: lang === "ko" ? "가이드" : "Guide",
    "cli-interfaces": lang === "ko" ? "CLI 인터페이스" : "CLI Interfaces",
  };

  const groupedDocs = filteredDocs?.reduce(
    (acc, doc) => {
      if (!acc[doc.group]) acc[doc.group] = [];
      acc[doc.group].push(doc);
      return acc;
    },
    {} as Record<string, SearchDocument[]>,
  );

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

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={lang === "ko" ? "문서 검색" : "Search Documentation"}
        description={
          lang === "ko" ? "문서를 검색하세요" : "Search for documentation"
        }
        className="max-w-2xl border-white/10 bg-zinc-950"
      >
        <CommandInput
          placeholder={
            lang === "ko" ? "검색어를 입력하세요..." : "Type to search..."
          }
          value={query}
          onValueChange={setQuery}
          className="border-white/10 text-zinc-100 placeholder:text-zinc-500"
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <FileText className="mb-2 size-8 opacity-50" />
            <p>{lang === "ko" ? "결과가 없습니다" : "No results found"}</p>
          </CommandEmpty>
          {groupedDocs &&
            Object.entries(groupedDocs).map(([group, docs]) => (
              <CommandGroup
                key={group}
                heading={groupLabels[group] || group}
                className="text-zinc-400 [&_[cmdk-group-heading]]:text-[#B23A34] [&_[cmdk-group-heading]]:font-medium"
              >
                {docs.map((doc) => (
                  <CommandItem
                    key={doc.id}
                    onSelect={() => handleSelect(doc.href)}
                    className={cn(
                      "cursor-pointer text-zinc-300",
                      "data-[selected=true]:bg-white/10 data-[selected=true]:text-zinc-50",
                      "[&_svg]:text-zinc-500",
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-zinc-100">
                        {doc.title}
                      </span>
                      {doc.description && (
                        <span className="line-clamp-1 text-xs text-zinc-400">
                          {doc.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
