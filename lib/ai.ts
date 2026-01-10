import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';

// Determine which provider to use based on environment variable
const useDeepSeek = process.env.OPENAI_BASE_URL?.includes('deepseek');

// Create the appropriate provider
export const aiProvider = useDeepSeek
  ? createDeepSeek({
    apiKey: process.env.OPENAI_API_KEY, // DeepSeek uses OPENAI_API_KEY for compatibility
  })
  : createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

// Models configuration
// 'planningModel' needs strong reasoning for Intent Parsing and Blueprint generation
export const planningModel = aiProvider(process.env.OPENAI_PLANNING_MODEL || 'gpt-4o');

// 'writingModel' can be faster/cheaper for atomic section generation
export const writingModel = aiProvider(process.env.OPENAI_WRITING_MODEL || 'gpt-4o-mini'); 
