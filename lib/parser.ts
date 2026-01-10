/**
 * Simple text extraction for server-side processing.
 * For MVP: We'll handle file reading on the client side and pass text content.
 * This avoids DOM dependencies in Node.js environment.
 */

/**
 * Splits raw text into atomic facts.
 * MVP Strategy: Split by double newlines (paragraphs).
 * Future: Use LLM or NLP for sentence-level splitting.
 */
export function splitTextIntoFacts(text: string): string[] {
    if (!text) return [];

    return text
        .split(/\n\s*\n/) // Split by empty lines
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0);
}
