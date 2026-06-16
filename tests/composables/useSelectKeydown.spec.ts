import { ref } from 'vue';
import { useSelectKeydown } from '../../src/composables/useSelectKeydown';
import { describe, it, expect } from 'vitest';

describe('useSelectKeydown', () => {
    it('emits correct value on keydown', () => {
        const options = ref([{ text: '12', value: 12 }, { text: '23', value: 23 }]);
        const emitted: any[] = [];
        const emit = (_: string, value: number) => emitted.push(value); // <-- compatible with ...args: any[]

        const { onSelectKeydown } = useSelectKeydown(options, emit);

        onSelectKeydown(new KeyboardEvent('keydown', { key: '1' }));
        expect(emitted).toEqual([12]);
        onSelectKeydown(new KeyboardEvent('keydown', { key: '2' }));
        expect(emitted).toEqual([12, 12]);
    });

    it('matches alphabetic prefixes case-insensitively', () => {
        const options = ref([
            { text: 'January', value: 0 },
            { text: 'June', value: 5 },
        ]);
        const emitted: any[] = [];
        const emit = (_: string, value: number) => emitted.push(value);

        const { onSelectKeydown } = useSelectKeydown(options, emit);

        onSelectKeydown(new KeyboardEvent('keydown', { key: 'j' }));
        expect(emitted).toEqual([0]);
        onSelectKeydown(new KeyboardEvent('keydown', { key: 'u' }));
        expect(emitted).toEqual([0, 5]);
    });
});
