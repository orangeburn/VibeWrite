import { describe, it, expect } from 'vitest';
import { buildWeightedFacts, generateNodePrompt } from '../lib/prompt';

describe('Prompt Weights Logic', () => {
    it('should prioritize user facts over search facts', () => {
        const userFacts = ['User defined fact 1'];
        const searchFacts = ['Search result 1'];

        const result = buildWeightedFacts(userFacts, searchFacts);

        // Check if [USER] appears before [SEARCH]
        const userPos = result.indexOf('[USER]');
        const searchPos = result.indexOf('[SEARCH]');

        expect(userPos).toBeLessThan(searchPos);
        expect(result).toContain('User defined fact 1');
        expect(result).toContain('Search result 1');
    });

    it('should generate a self-contained node prompt', () => {
        const prompt = generateNodePrompt(
            'Test Title',
            'Test Description',
            'Facts text',
            { tone: 'Professional' }
        );

        expect(prompt).toContain('Write the section "Test Title"');
        expect(prompt).toContain('Facts text');
        expect(prompt).toContain('No memory of previous sections');
    });
});
