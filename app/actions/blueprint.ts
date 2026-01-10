'use server';

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { planningModel } from '@/lib/ai';
import { performWebSearch } from '@/lib/search';

// Define the Blueprint Schema
const BlueprintSchema = z.object({
    nodes: z.array(z.object({
        id: z.string().describe('Unique identifier for the node'),
        title: z.string().describe('Section title'),
        description: z.string().describe('Detailed instruction for what this section should cover'),
        estimatedWordCount: z.number().optional().describe('Target word count for this section'),
    })).describe('Ordered list of sections/chapters for the article'),
});

/**
 * Fold 2: Generate Blueprint
 * Creates a structured outline based on the "Consensus" (Global Facts + User Answers).
 */
export async function generateBlueprint(
    globalFacts: string[],
    userAnswers: Record<string, any>,
    searchEnabled: boolean = false,
    lockedNodes: { title: string; description: string }[] = []
) {
    const userAnswersText = JSON.stringify(userAnswers, null, 2);

    // Handle Web Search for Blueprint Generation
    let searchResultsText = "";
    if (searchEnabled) {
        const queryPrompt = `Based on the following context, generate a single search query to find relevant structure or topics for this writing project:
        Intent: ${userAnswers.intent || 'Writing Project'}
        Facts: ${globalFacts.slice(0, 5).join(', ')}
        `;
        try {
            const { text: searchQuery } = await generateText({
                model: planningModel,
                prompt: queryPrompt,
            });
            if (searchQuery) {
                const searchRes = await performWebSearch(searchQuery.trim());
                if (searchRes.success) {
                    searchResultsText = `Web Search Results for "${searchQuery.trim()}":\n${searchRes.results}`;
                }
            }
        } catch (err) {
            console.error("Global search query generation failed:", err);
        }
    }

    const lockedNodesContext = lockedNodes.length > 0
        ? `Existing Locked Nodes (DO NOT DUPLICATE THESE):\n${lockedNodes.map((n, i) => `${i + 1}. ${n.title}: ${n.description}`).join('\n')}`
        : "";

    const context = `
    Global Facts:
    ${globalFacts.join('\n- ')}
    
    User Configuration:
    ${userAnswersText}

    ${searchResultsText ? `Search Results Context:\n${searchResultsText}` : ''}

    ${lockedNodesContext}
  `;

    try {
        const { object } = await generateObject({
            model: planningModel,
            schema: BlueprintSchema,
            prompt: `
        You are the Chief Architect of Deep Write.
        Based on the Global Facts and User Configuration, design a detailed writing blueprint.
        
        Break the content down into logical sections (Nodes).
        Each Node must have a clear title and a specific description of what to cover.
        Ensure the flow is logical and covers all requirements.
        
        CRITICAL TASK: SEMANTIC DEDUPLICATION
        Below is a list of nodes that are ALREADY LOCKED in the current blueprint.
        You MUST NOT generate any new nodes that are semantically identical, similar, or overlapping in purpose with these locked nodes.
        Your goal is to generate ONLY the additional or alternative nodes needed to complete the framework, assuming the locked nodes will stay exactly where they are.
        
        Locked Nodes:
        ${lockedNodes.length > 0 ? lockedNodes.map(n => `- ${n.title}`).join('\n') : 'None'}

        Context:
        ${context}

        IMPORTANT: Your output (node titles and descriptions) MUST be in the same language as the context.
      `,
        });

        return {
            success: true,
            data: object.nodes
        };
    } catch (error) {
        console.error('Blueprint Generation Error:', error);
        return { success: false, error: 'Failed to generate blueprint' };
    }
}

/**
 * Fold 2: Refine/Regenerate Node
 * Allows user to ask for changes to a specific part of the plan.
 */
export async function refineBlueprint(currentNodes: any[], feedback: string) {
    try {
        const { object } = await generateObject({
            model: planningModel,
            schema: BlueprintSchema,
            prompt: `
        The user wants to modify the current blueprint.
        
        Current Pattern:
        ${JSON.stringify(currentNodes)}
        
        User Feedback:
        "${feedback}"
        
        Regenerate the blueprint (list of nodes) to respect this feedback. 
        Keep unchanged parts as they are.
        IMPORTANT: Maintain the same language as the current blueprint and feedback.
      `,
        });

        return {
            success: true,
            data: object.nodes
        };
    } catch (error) {
        console.error('Blueprint Refinement Error:', error);
        return { success: false, error: 'Failed to refine blueprint' };
    }
}

/**
 * Helper to fetch content from a URL and extract text.
 * (Duplicate to keep setup.ts and blueprint.ts independent server actions)
 */
async function fetchUrlContent(url: string): Promise<{ content: string; success: boolean; error?: string }> {
    const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': BROWSER_UA },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            if (response.status === 403) {
                errorMsg = "访问被拒绝 (403 Forbidden) - 可能由于反爬虫机制，建议手动复制内容。";
            } else if (response.status === 429) {
                errorMsg = "请求过于频繁 (429 Too Many Requests) - 请稍后再试。";
            } else if (response.status === 404) {
                errorMsg = "素材链接不存在 (404 Not Found)。";
            }

            return {
                content: "",
                success: false,
                error: errorMsg
            };
        }
        const html = await response.text();
        const text = html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return { content: text.slice(0, 10000), success: true };
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        let errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('timeout')) {
            errorMsg = "请求超时，请检查链接是否有效。";
        }
        return {
            content: "",
            success: false,
            error: errorMsg
        };
    }
}


/**
 * Fold 2: Node-Level Material Injection
 * Extracts "Local Facts" from pre-extracted text for a specific node.
 * Accepts FormData with pre-extracted file contents and URLs to fetch.
 */
export async function injectNodeContext(formData: FormData) {
    const nodeDescription = formData.get('nodeDescription') as string;

    // Get pre-extracted file contents from client
    const fileContents = formData.getAll('fileContents') as string[];

    // Get URLs to fetch on server
    const urls = formData.getAll('urls') as string[];
    const urlNames = formData.getAll('urlNames') as string[];

    // Fetch URL contents and track failures
    const fetchResults = await Promise.all(
        urls.map((url) => fetchUrlContent(url))
    );

    const validFetchedContents: string[] = [];
    const failedUrls: string[] = [];

    fetchResults.forEach((res, i) => {
        if (res.success) {
            validFetchedContents.push(`URL Material ${i + 1} (${urlNames[i] || 'unknown'}):\n${res.content}`);
        } else {
            failedUrls.push(`${urlNames[i] || urls[i]} (${res.error})`);
        }
    });

    const combinedContext = [
        ...fileContents.map((c, i) => `File Material ${i + 1}:\n${c.slice(0, 5000)}`),
        ...validFetchedContents
    ].join('\n\n');

    const finalContext = [
        `Section Description: ${nodeDescription}`,
        combinedContext,
    ].filter(Boolean).join('\n\n');

    try {
        const { object } = await generateObject({
            model: planningModel,
            schema: z.object({
                localFacts: z.array(z.string()).describe('Facts relevant specifically to this section'),
            }),
            prompt: `
        Analyze the following materials for the section "${nodeDescription}".
        Extract atomic facts that should be used specifically in this section.
        Ignore general facts if they don't apply to this specific part.
        
        Materials:
        ${finalContext}

        IMPORTANT: Your output (local facts) MUST be in the same language as the node description and materials.
      `,
        });

        return {
            success: true,
            data: object.localFacts,
            failedUrls
        };
    } catch (error) {
        console.error('Node Context Injection Error:', error);
        return { success: false, error: 'Failed to extract node facts' };
    }
}
