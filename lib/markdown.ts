import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

/**
 * Parse Markdown string into a remark AST (Root node).
 */
export function parseMarkdownToAst(markdown: string): any {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)

    const ast = processor.parse(markdown)
    processor.run(ast)
    return ast
}

/**
 * Convert remark AST to a simplified JSON structure for rendering.
 * This is a basic example; you can customize based on your rendering needs.
 */
export function astToRenderJson(ast: any): any {
    const traverse = (node: any): any => {
        if (!node || typeof node !== 'object') return node

        const { type, children, position, ...rest } = node
        const result: any = { type }

        // Copy all properties except children and position
        Object.keys(rest).forEach(key => {
            if (key !== 'children' && key !== 'position') {
                result[key] = rest[key]
            }
        })

        if (children && Array.isArray(children)) {
            result.children = children.map(traverse)
        }

        return result
    }

    return traverse(ast)
}

/**
 * Parse Markdown and return the render JSON.
 */
export function markdownToRenderJson(markdown: string): any {
    const ast = parseMarkdownToAst(markdown)
    return astToRenderJson(ast)
}

/**
 * Validate Markdown syntax by attempting to parse it.
 * Returns true if parsing succeeds, false otherwise.
 */
export function validateMarkdown(markdown: string): boolean {
    try {
        parseMarkdownToAst(markdown)
        return true
    } catch {
        return false
    }
}