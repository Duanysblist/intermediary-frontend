export type TextPart = string | { text: string; href: string }

const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g

/** Splits notes into plain text and Markdown links ("[title](https://...)"), as TII writes them. */
export function splitLinks(text: string): TextPart[] {
    const parts: TextPart[] = []
    let last = 0
    for (const m of text.matchAll(MARKDOWN_LINK)) {
        if (m.index > last) parts.push(text.slice(last, m.index))
        parts.push({ text: m[1], href: m[2] })
        last = m.index + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
}
