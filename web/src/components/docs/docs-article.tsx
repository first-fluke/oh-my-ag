"use client";

import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface DocsArticleProps {
  markdown: string;
}

export function DocsArticle({ markdown }: DocsArticleProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="prose prose-invert max-w-none prose-pre:before:content-none prose-pre:after:content-none prose-code:before:content-none prose-code:after:content-none prose-table:block prose-table:overflow-x-auto"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          pre: ({ children, ...props }) => (
            <pre
              className="w-full max-w-full overflow-x-auto rounded-lg border border-white/10 bg-zinc-900/80 p-4 text-zinc-100"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = typeof className === "string";

            return (
              <code
                className={cn(
                  className,
                  isBlock
                    ? "whitespace-pre"
                    : "rounded bg-white/8 px-1 py-0.5 break-words",
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children, ...props }) => (
            <h1
              className="mt-0 mb-5 text-4xl font-semibold tracking-tight text-zinc-50"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="mt-10 mb-4 scroll-mt-28 border-b border-white/10 pb-2 text-2xl font-semibold text-zinc-50"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="mt-8 mb-3 scroll-mt-28 text-xl font-semibold text-zinc-100"
              {...props}
            >
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className="leading-7 text-zinc-300" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc space-y-1 pl-5 text-zinc-300" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal space-y-1 pl-5 text-zinc-300" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-7" {...props}>
              {children}
            </li>
          ),
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              className="font-medium text-[#e6b6b3] underline decoration-[#e6b6b3]/45 underline-offset-4"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-2 border-[#B23A34]/55 bg-[#B23A34]/10 px-4 py-2 text-zinc-200"
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <table
              className="w-full border-collapse text-left text-sm"
              {...props}
            >
              {children}
            </table>
          ),
          thead: ({ children, ...props }) => (
            <thead
              className="border-b border-white/20 bg-white/5"
              {...props}
            >
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th
              className="px-4 py-3 font-semibold text-zinc-200"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="border-b border-white/10 px-4 py-3 text-zinc-300"
              {...props}
            >
              {children}
            </td>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-white/5" {...props}>
              {children}
            </tr>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </motion.article>
  );
}
