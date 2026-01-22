import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

/**
 * 将Markdown内容转换为DOCX文档
 */
export async function generateDocx(title: string, content: string): Promise<Blob> {
    const paragraphs: Paragraph[] = []
    
    // 添加标题
    paragraphs.push(
        new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            spacing: { after: 400 }
        })
    )
    
    // 添加内容（简化处理）
    // 这里可以添加更复杂的Markdown到DOCX转换逻辑
    const lines = content.split('\n')
    
    for (const line of lines) {
        if (!line.trim()) {
            paragraphs.push(new Paragraph({ text: '' }))
            continue
        }
        
        // 简单的标题检测
        if (line.startsWith('# ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.substring(2),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                })
            )
        } else if (line.startsWith('## ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.substring(3),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                })
            )
        } else if (line.startsWith('### ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.substring(4),
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            )
        } else {
            // 普通段落
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun(line)],
                    spacing: { before: 100, after: 100 }
                })
            )
        }
    }
    
    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs
        }],
        styles: {
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 32,
                        bold: true,
                        color: "000000"
                    },
                    paragraph: {
                        spacing: { after: 200 }
                    }
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 26,
                        bold: true,
                        color: "000000"
                    },
                    paragraph: {
                        spacing: { after: 150 }
                    }
                },
                {
                    id: "Heading3",
                    name: "Heading 3",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 22,
                        bold: true,
                        color: "000000"
                    },
                    paragraph: {
                        spacing: { after: 100 }
                    }
                }
            ]
        }
    })
    
    const blob = await Packer.toBlob(doc)
    return blob
}

/**
 * 将Markdown内容转换为纯文本（用于TXT导出）
 */
export function generateText(title: string, content: string): string {
    return `# ${title}\n\n${content}`
}

/**
 * 导出文件
 */
export async function exportFile(filename: string, content: string, format: string): Promise<void> {
    let blob: Blob
    
    switch (format) {
        case 'md':
            blob = new Blob([content], { type: 'text/markdown' })
            break
        case 'txt':
            const textContent = generateText(filename, content)
            blob = new Blob([textContent], { type: 'text/plain' })
            break
        case 'docx':
            blob = await generateDocx(filename, content)
            break
        default:
            throw new Error(`不支持的文件格式: ${format}`)
    }
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename || 'vibewrite-output'}.${format}`
    a.click()
    URL.revokeObjectURL(url)
}