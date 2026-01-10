/**
 * Prompt optimization and Weighted Fact Management logic.
 */

export interface WeightedFact {
    content: string;
    source: 'user' | 'search';
    priority: number; // Higher is more important
}

/**
 * Builds a weighted fact list string based on priorities.
 * User inputs (description, links, docs) should have higher priority than search results.
 */
export function buildWeightedFacts(userFacts: string[], searchFacts: string[]): string {
    const weighted: WeightedFact[] = [
        ...userFacts.map((f) => ({ content: f, source: 'user' as const, priority: 10 })),
        ...searchFacts.map((f) => ({ content: f, source: 'search' as const, priority: 5 })),
    ];

    // Sort by priority descending
    const sorted = weighted.sort((a, b) => b.priority - a.priority);

    return sorted.map((f) => `- [${f.source === 'user' ? 'USER' : 'SEARCH'}] ${f.content}`).join('\n');
}

/**
 * Generates the system prompt for a single node generation.
 * Ensures "Memoryless" execution by not including previous node context unless explicitly passed.
 */
export function generateNodePrompt(
    nodeTitle: string,
    nodeDescription: string,
    weightedFacts: string,
    userConstraints: Record<string, any>,
    customPrompt?: string
) {
    return `
Role: You are a specialized sub-agent writing a specific section of an article.

Task: Write the section "${nodeTitle}".
Description: ${nodeDescription}

${customPrompt ? `Additional User Instructions: ${customPrompt}\n` : ''}

Constraints:
- Tone: ${userConstraints.tone || 'Professional'}
- Audience: ${userConstraints.target_audience || 'General'}

Reference Facts (Prioritized: USER > SEARCH):
${weightedFacts}

Output:
Write only the content of the section. Do not include the title.
IMPORTANT: You MUST write in the same language as the Reference Facts and Node Title.
No memory of previous sections is provided to ensure this section is self-contained.
  `.trim();
}
