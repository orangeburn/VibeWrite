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
 * Node-specific facts have the highest priority, then global facts, then search results.
 */
export function buildWeightedFacts(globalFacts: string[], localFacts: string[], searchFacts: string[]): string {
    const weighted: WeightedFact[] = [
        ...localFacts.map((f) => ({ content: f, source: 'user' as const, priority: 20 })), // Local facts are most important
        ...globalFacts.map((f) => ({ content: f, source: 'user' as const, priority: 10 })), // Then global context
        ...searchFacts.map((f) => ({ content: f, source: 'search' as const, priority: 5 })), // Then search results
    ];

    // Sort by priority descending
    const sorted = weighted.sort((a, b) => b.priority - a.priority);

    return sorted.map((f) => `- [${f.priority >= 20 ? 'LOCAL' : f.priority >= 10 ? 'GLOBAL' : 'SEARCH'}] ${f.content}`).join('\n');
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
    const hasPrimaryContext = nodeTitle.trim().length > 0 || nodeDescription.trim().length > 0;

    return `
Role: You are a specialized sub-agent writing a specific section of an article.

Task: ${nodeTitle ? `Write the section "${nodeTitle}".` : 'Write a section based on the provided facts.'}
Description: ${nodeDescription || 'No specific description provided. Infer the focus from the Reference Facts.'}

${!hasPrimaryContext ? 'IMPORTANT: Since the section title and description are minimal, you MUST derive the core topic and structure entirely from the [LOCAL] facts below.\n' : ''}

${customPrompt ? `CRITICAL USER INSTRUCTIONS (HIGHEST PRIORITY): ${customPrompt}\n` : ''}

Constraints:
- Tone: ${userConstraints.tone || 'Professional'}
- Audience: ${userConstraints.target_audience || 'General'}

Reference Facts (Prioritized: LOCAL > GLOBAL > SEARCH):
These are the ground truth facts you SHOULD use and incorporate into your writing:
${weightedFacts}

Output:
Write the content for this section. DO NOT include the section title in your output.
Your writing should be comprehensive, engaging, and STRICTLY grounded in the provided facts and descriptions.
IMPORTANT: You MUST write in the same language as the Reference Facts and Node Title (or context).
No memory of previous sections is provided to ensure this section is self-contained.
  `.trim();
}
