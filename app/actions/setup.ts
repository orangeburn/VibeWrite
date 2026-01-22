'use server';

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { planningModel } from '@/lib/ai';
import { performWebSearch } from '@/lib/search';

// Define the schema for a single fact
const FactSchema = z.object({
    facts: z.array(z.string()).describe('List of atomic facts extracted from the input'),
    missingInformation: z.array(z.string()).describe('List of crucial missing context needed to write the article'),
});

/**
 * Helper to fetch content from a URL and extract text.
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
 * Fold 1: Parse Intent & Extract Atomic Facts
 * Analyzes user prompt and uploaded file contents to establish "Global Consensus".
 * Accepts FormData to handle file uploads and URL references.
 */
export async function analyzeIntent(formData: FormData) {
    const userPrompt = formData.get('prompt') as string;
    const searchEnabled = formData.get('searchEnabled') === 'true';

    // Get pre-extracted file contents from client
    const fileContents = formData.getAll('fileContents') as string[];
    const fileNames = formData.getAll('fileNames') as string[];

    // Get URLs and names to fetch on server
    const urls = formData.getAll('urls') as string[];
    const urlNames = formData.getAll('urlNames') as string[];

    // Fetch URL contents and track failures
    const fetchResults = await Promise.all(
        urls.map((url) => fetchUrlContent(url))
    );

    // Handle Web Search
    let searchResultsText = "";
    if (searchEnabled) {
        try {
            // Generate a targeted search query based on context
            const { text: searchQuery } = await generateText({
                model: planningModel,
                prompt: `
                    Based on the following user prompt and material summaries, generate a concise search query (1 sentence) for a search engine to find more relevant information/facts for writing.
                    User Prompt: ${userPrompt || "[None]"}
                    Materials: ${fileNames.join(', ') || urlNames.join(', ') || "[None]"}
                    
                    Return ONLY the search query text, nothing else.
                `,
            });

            if (searchQuery.trim()) {
                const searchRes = await performWebSearch(searchQuery.trim());
                if (searchRes.success) {
                    searchResultsText = `Web Search Results for "${searchQuery.trim()}":\n${searchRes.results}`;
                }
            }
        } catch (error) {
            console.warn('[analyzeIntent] Search/Query Generation failed:', error);
        }
    }

    const failedUrls: string[] = [];
    const validFetchedContents: string[] = [];

    fetchResults.forEach((res, i) => {
        if (res.success) {
            validFetchedContents.push(`URL Material ${i + 1} (${urlNames[i] || 'unknown'}) Content:\n${res.content}`);
        } else {
            failedUrls.push(`${urlNames[i] || urls[i]} (${res.error})`);
        }
    });

    const combinedContext = [
        userPrompt ? `User Prompt: "${userPrompt}"` : "User Prompt: [Empty]",
        ...fileContents.map((content, i) => `File Material ${i + 1} (${fileNames[i] || 'unknown'}) Content:\n${content.slice(0, 10000)}`),
        ...validFetchedContents,
        searchResultsText ? searchResultsText : ""
    ].filter(Boolean).join('\n\n');

    console.log('[analyzeIntent] combinedContext length:', combinedContext.length);
    if (combinedContext.length < 50) {
        console.log('[analyzeIntent] combinedContext content:', combinedContext);
    }

    try {
        const { object } = await generateObject({
            model: planningModel,
            schema: FactSchema,
            prompt: `
        You are an expert editor and logic analyzer for Deep Write.
        
        Analyze the following context (User Prompt and File/URL Materials).
        Your goal is to:
        1. Extract "Atomic Facts": Key information, data points, or requirements mentioned in the context.
        2. Identify "Missing Information": Crucial context needed to write the article (e.g. Tone, Target Audience, length) that isn't already clear.
        
        Context:
        ${combinedContext}

        IMPORTANT: 
        - If the User Prompt is empty, prioritize extracting facts from the Material content.
        - Your output (facts and missingInformation) MUST be in the same language as the content provided in the Context (prefer the language of the User Prompt if available, otherwise the Materials).
        - IMPORTANT: IGNORE anything about images, videos, illustrations, or multimedia in the Context. Do NOT extract them as facts and do NOT list them as "Missing Information". This is a text-only platform.
      `,
        });

        return {
            success: true,
            data: object,
            failedUrls // Return list of URLs that couldn't be parsed
        };
    } catch (error) {
        console.error('Extraction Error:', error);
        return {
            success: false,
            error: 'Failed to analyze intent',
            details: error instanceof Error ? error.message : String(error)
        };
    }
}

// Define Schema for Dynamic Form Fields
const FormFieldSchema = z.object({
    fields: z.array(z.object({
        key: z.string().describe('Unique key for the field (e.g. "target_audience")'),
        label: z.string().describe('Human readable label for the question'),
        type: z.enum(['text', 'textarea', 'select', 'checkbox']).describe('Form field type'),
        options: z.array(z.string()).optional().describe('Options if type is select or checkbox'),
        description: z.string().optional().describe('Help text for the user'),
    }))
});

/**
 * Fold 1: Generate Dynamic GUI Schema
 * Creates a list of questions/fields to ask the user based on the "Missing Information".
 */
export async function generateFormSchema(missingInfo: string[], intent: string = "", selectedFacts: string[] = []) {
    // Determine if we have enough context to generate a form
    const hasContext = missingInfo.length > 0 || intent.trim() !== "" || selectedFacts.length > 0;
    if (!hasContext) return { success: true, data: [] };

    try {
        const { object } = await generateObject({
            model: planningModel,
            schema: FormFieldSchema,
            prompt: `
        You are an expert AI writing assistant.
        
        Your goal is to generate a dynamic configuration form to gather necessary details from the user before generating a writing blueprint.
        Based on the user's "Writing Intent", "Selected Key Facts", and any identified "Missing Information", create a list of questions (form fields).

        Context:
        - User's Writing Intent: "${intent || "Not specified"}"
        - Selected Key Facts/Themes:
        ${selectedFacts.length > 0 ? selectedFacts.map(f => `  - ${f}`).join('\n') : "  - None selected"}
        
        - Previously Identified Missing Information:
        ${missingInfo.length > 0 ? missingInfo.join('\n') : "  - None identified"}

        Create a user-friendly configuration form.
        IMPORTANT Guidelines:
        1. prioritize the "Missing Information" if available, but also generate relevant questions based on the "Intent" and "Selected Key Facts" to refine the output.
        2. Use the SAME LANGUAGE as the User's Intent/Facts for all labels, options, and descriptions.
        3. If 'type' is 'select' or 'checkbox', you MUST provide a non-empty list of 'options'.
        4. STRICT NEGATIVE CONSTRAINT: DO NOT generate any fields regarding "images", "pictures", "videos", "multimedia", "illustrations", "graphics", or "visual style". EXCLUDE them completely.
        5. For 'checkbox' type with multiple options, it will be rendered as a multi-select list.
      `,
        });

        return {
            success: true,
            data: object.fields
        };
    } catch (error) {
        console.error('Schema Generation Error:', error);
        return { success: false, error: 'Failed to generate form schema' };
    }
}
/**
 * Utility to perform semantic deduplication of facts using AI.
 * Filters out new facts that are already covered by existing selected facts.
 */
export async function deduplicateFacts(existingFacts: string[], newCandidateFacts: string[]) {
    if (existingFacts.length === 0) return { success: true, data: newCandidateFacts };
    if (newCandidateFacts.length === 0) return { success: true, data: [] };

    try {
        const { object } = await generateObject({
            model: planningModel,
            schema: z.object({
                nonRedundantFacts: z.array(z.string()).describe('List of new facts that are semantically distinct from and NOT covered by the existing facts'),
            }),
            prompt: `
        You are a semantic deduplication agent.
        
        Existing Facts:
        ${existingFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}
        
        New Candidate Facts:
        ${newCandidateFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}
        
        Task:
        1. Compare each "New Candidate Fact" against the "Existing Facts".
        2. If a new fact is semantically the same or already implied/covered by an existing fact, discard it.
        3. If a new fact provides truly new information or a distinct data point, keep it.
        4. Return ONLY the list of new, non-redundant facts.
        
        IMPORTANT: Your output MUST be in the same language as the input facts.
      `,
        });

        return {
            success: true,
            data: object.nonRedundantFacts
        };
    } catch (error) {
        console.error('Deduplication Error:', error);
        // Fallback: return everything if AI fails to prevent data loss
        return { success: false, data: newCandidateFacts, error: 'Failed to deduplicate facts' };
    }
}
