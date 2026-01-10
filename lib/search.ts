/**
 * Shared web search utility using Tavily API.
 */
export async function performWebSearch(query: string): Promise<{ results: string; success: boolean; error?: string }> {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!TAVILY_API_KEY || TAVILY_API_KEY === 'tvly-your-api-key-here') {
        return { results: "", success: false, error: "未配置 TAVILY_API_KEY" };
    }

    try {
        console.log('[performWebSearch] Querying Tavily:', query);
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: "basic",
                max_results: 5
            }),
        });

        if (!response.ok) {
            return { results: "", success: false, error: `Tavily API error: ${response.status}` };
        }

        const data = await response.json();
        const resultsText = data.results.map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n---\n');

        return { results: resultsText, success: true };
    } catch (error) {
        console.error('Tavily search error:', error);
        return { results: "", success: false, error: String(error) };
    }
}
