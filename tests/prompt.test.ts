import { describe, it, expect } from 'vitest';
import { buildWeightedFacts, generateNodePrompt } from '../lib/prompt';

describe('Prompt Weights Logic', () => {
    it('should prioritize local facts over global and search facts', () => {
        const globalFacts = ['Global fact'];
        const localFacts = ['Local fact'];
        const searchFacts = ['Search result'];

        const result = buildWeightedFacts(globalFacts, localFacts, searchFacts);

        const localPos = result.indexOf('[LOCAL]');
        const globalPos = result.indexOf('[GLOBAL]');
        const searchPos = result.indexOf('[SEARCH]');

        expect(localPos).toBeLessThan(globalPos);
        expect(globalPos).toBeLessThan(searchPos);
        expect(result).toContain('Local fact');
        expect(result).toContain('Global fact');
        expect(result).toContain('Search result');
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
