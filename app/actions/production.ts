'use server';

import { generateText } from 'ai';
import { writingModel, planningModel } from '@/lib/ai';
import { performWebSearch } from '@/lib/search';
import { buildWeightedFacts, generateNodePrompt } from '@/lib/prompt';

/**
 * Fold 3: Stateless Production
 * Generates content for a single node based on Consensus and Local Facts.
 * Now includes independent web search for each node.
 */
export async function writeNodeContent(
    nodeTitle: string,
    nodeDescription: string,
    globalFacts: string[],
    localFacts: string[],
    userConstraints: Record<string, any>,
    customPrompt?: string,
    enableSearch: boolean = false
) {
    let searchResults = "";
    if (enableSearch) {
        // Conduct independent search for the node
        const searchQuery = `${nodeTitle} ${nodeDescription}`.slice(0, 200);
        const searchResponse = await performWebSearch(searchQuery);
        if (searchResponse.success) {
            searchResults = searchResponse.results;
        }
    }

    const searchFacts = searchResults ? [searchResults] : [];

    const weightedFacts = buildWeightedFacts(globalFacts, localFacts, searchFacts);
    const prompt = generateNodePrompt(
        nodeTitle,
        nodeDescription,
        weightedFacts,
        userConstraints,
        customPrompt
    );

    try {
        const { text } = await generateText({
            model: writingModel,
            prompt: prompt,
        });

        return { success: true, data: text };
    } catch (error) {
        console.error('Writing Error:', error);
        return { success: false, error: 'Failed to write node content' };
    }
}

/**
 * Fold 4: Sequential Integration (Rolling Window)
 * Smooths the transition between the previous section and the current one.
 */
export async function integrateNode(
    prevContent: string,
    currentContent: string,
    nodeTitle: string
) {
    // If no previous content, no need to integrate, just return current.
    if (!prevContent) return { success: true, data: currentContent };

    const lastParagraph = prevContent.slice(-500); // Take last ~500 chars context

    try {
        const { text } = await generateText({
            model: writingModel,
            prompt: `
        You are the "Stitcher" agent.
        Your job is to ensure smooth transitions between sections.
        
        Previous Section (End):
        "...${lastParagraph}"
        
        Current Section (Start):
        "${nodeTitle}"
        ${currentContent.slice(0, 1000)}...
        
        Task:
        Rewrite the BEGINNING of the Current Section so it flows naturally from the Previous Section.
        Return the MODIFIED version of the Current Section (or at least the first few paragraphs).
        If it already flows well, return it as is.
        IMPORTANT: Always use the same language as the input sections.
      `,
        });

        // In a real implementation we might merge this back intelligently.
        // For MVP, we can treat the output as the new start of the current content.
        // However, simplest is to ask AI to rewrite the WHOLE current node with context of previous.
        // Let's adjust prompt to rewrite the whole current block if it's short, or just start.
        // For MVP robustness, let's ask to rewrite the current section entirely given the predecessor context.

        return { success: true, data: text }; // Assuming text is the full rewritten section
    } catch (error) {
        console.error('Integration Error:', error);
        return { success: false, error: 'Failed to integrate content' };
    }
}

/**
 * Fold 4: Global Refinement
 * Refines the full article to ensure flow, consistency with tone/audience, 
 * and strict adherence to global intent and facts.
 */
export async function refineFullArticle(
    fullContent: string,
    globalFacts: string[],
    intent: string,
    userConstraints: Record<string, any>
) {
    try {
        const { text } = await generateText({
            model: writingModel,
            prompt: `
        You are an expert Editor. Your task is to refine and rewrite the provided draft into a cohesive, professional article.
        
        Core Intent:
        ${intent}
        
        Global Facts to Adhere To:
        ${globalFacts.join('\n- ')}
        
        User Constraints:
        - Tone: ${userConstraints.tone || 'Professional'}
        - Audience: ${userConstraints.target_audience || 'General'}
        
        Draft Content:
        ${fullContent}
        
        Task:
        1. Rewrite the draft to ensure a logical flow and smooth transitions between sections.
        2. Strictly ground the content in the Global Facts provided.
        3. Match the specified Tone and Target Audience perfectly.
        4. Eliminate redundancies and improve vocabulary while maintaining the core message of each section.
        5. DO NOT hallucinate. Only use info from facts or common logic consistent with the intent.
        
        IMPORTANT: Use the same language as the input draft. Return the FULL refined article text.
      `,
        });

        return { success: true, data: text };
    } catch (error) {
        console.error('Refinement Error:', error);
        return { success: false, error: 'Failed to refine article' };
    }
}

/**
 * Fold 4: Global Audit (V1.0 Logic)
 * Checks for hallucinations or tone inconsistencies using a JSON Array protocol.
 */
export async function auditContent(
    fullContent: string,
    allFacts: string[],
    enableSearch: boolean = false,
    materials: { name: string, content: string }[] = []
) {
    let searchResults = "";
    if (enableSearch) {
        try {
            const queryResult = await generateText({
                model: planningModel,
                prompt: `Analyze the following article and generate a concise search query to verify its key factual claims.\n\nArticle:\n${fullContent.slice(0, 1000)}...`,
            });
            const searchQuery = queryResult.text.trim().replace(/^"|"$/g, '');

            const searchResponse = await performWebSearch(searchQuery);
            if (searchResponse.success) {
                searchResults = searchResponse.results;
            }
        } catch (e) {
            console.error('Audit Search Generation Error:', e);
        }
    }

    const materialsContext = materials.length > 0
        ? `\n[CORE SOURCE MATERIALS (Absolute Priority)]:\n${materials.map(m => `--- Start of ${m.name} ---\n${m.content}\n--- End of ${m.name} ---`).join('\n\n')}`
        : '';

    try {
        const { text } = await generateText({
            model: planningModel,
            prompt: `
        Audit the following article for hallucinations and factual accuracy.
        
        Article:
        ${fullContent}
        ${materialsContext}

        Allowed Facts:
        ${allFacts.join('\n- ')}
        
        ${searchResults ? `External Verification Reference (Secondary Priority):\n${searchResults}` : ''}
        
        Task:
        1. Identify issues in the following categories:
           - FACTUAL_ERROR: Claims not supported by facts or materials.
           - TONE_INCONSISTENCY: Sections that don't match the tone.
           - REDUNDANCY: Repetitive content.
           - LOGICAL_GAP: Missing transitions.

        2. HIERARCHY OF TRUTH: [CORE SOURCE MATERIALS] are ABSOLUTE. If search results contradict materials, the materials WIN.
        
        Output Format (JSON Array only):
        [
          {
            "type": "risk" | "suggestion" | "anomaly" | "passed",
            "title": "Short title of the issue",
            "description": "Detailed explanation"
          }
        ]
        
        IMPORTANT: Your output MUST be a valid JSON array and in the same language as the Article.
        If no issues found, return a "passed" item saying "Overall Audit Passed".
      `,
        });

        // Attempt to parse JSON from the AI response
        const cleanText = text.replace(/```json|```/g, '').trim();
        try {
            const parsed = JSON.parse(cleanText);
            return { success: true, data: parsed };
        } catch (e) {
            console.error('JSON Parse Error for Audit Result:', e);
            return { success: false, error: 'AI response was not a valid JSON array' };
        }
    } catch (error) {
        console.error('Audit Error:', error);
        return { success: false, error: 'Failed to audit content' };
    }
}
/**
 * Fold 5: Title Generation
 * Generates a title based on the integrated content and user constraints.
 */
export async function generateTitle(
    fullContent: string,
    intent: string,
    facts: string[],
    userConstraints: Record<string, any>
) {
    try {
        const { text } = await generateText({
            model: planningModel,
            prompt: `
        Analyze the following article content and its original context to generate a compelling, professional title.
        
        Original Intent:
        ${intent}
        
        Key Facts/Themes:
        ${facts.join('\n- ')}
        
        Background Information (User Inputs):
        ${JSON.stringify(userConstraints)}
        
        Full Article Content (First 5000 chars):
        ${fullContent.slice(0, 5000)}...
        
        Constraints:
        - Tone: ${userConstraints.tone || 'Professional'}
        - Audience: ${userConstraints.target_audience || 'General'}
        
        Task:
        1. Synthesize the title from BOTH the original intent and the actual generated content.
        2. Ensure the title reflects the core value proposition and tone.
        3. Return ONLY the title text itself. No quotes, no prefix.
        4. Match the language of the provided content.
      `,
        });

        return { success: true, data: text.trim().replace(/^"|"$/g, '') };
    } catch (error) {
        console.error('Title Generation Error:', error);
        return { success: false, error: 'Failed to generate title' };
    }
}
