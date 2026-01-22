"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
    content: string
    className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("markdown-prose prose prose-sm dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="mt-6 mb-4 text-2xl font-bold border-b pb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="mt-5 mb-3 text-xl font-semibold border-b pb-1" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="mt-4 mb-2 text-lg font-medium" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
                    ul: ({ node, ...props }) => <ul className="mb-4 ml-6 list-disc space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="mb-4 ml-6 list-decimal space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-primary/30 bg-muted/30 px-4 py-2 italic mb-4 rounded-r-md" {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) => (
                        inline
                            ? <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold" {...props} />
                            : <code className="block w-full overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm mb-4" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="mb-4 overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th className="border-b bg-muted/50 px-4 py-2 text-left font-semibold" {...props} />,
                    td: ({ node, ...props }) => <td className="border-b px-4 py-2" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
