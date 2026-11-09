import { mount } from '@vue/test-utils';
import Dropdown from '../src/dropdown.vue';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
    vi.useRealTimers();
});

describe('Dropdown.vue', () => {
    it('renders label and placeholder option', () => {
        const wrapper = mount(Dropdown, {
            props: {
                simpleOptions: ['A', 'B'],
                label: 'Test Label',
                placeholder: 'Test Placeholder',
                modelValue: undefined,
            },
        });
        expect(wrapper.find('.dropdown__label').text()).toBe('Test Label');
        const placeholderOption = wrapper.find('option[disabled]');
        expect(placeholderOption.text()).toBe('Test Placeholder');
    });

    it('renders simpleOptions as options', () => {
        const wrapper = mount(Dropdown, {
            props: {
                simpleOptions: ['A', 'B'],
                modelValue: undefined,
            },
        });
        const options = wrapper.findAll('option');
        expect(options).toHaveLength(2);
        expect(options[0].text()).toBe('A');
        expect(options[1].text()).toBe('B');
    });

    it('renders objectOptions as options', () => {
        const wrapper = mount(Dropdown, {
            props: {
                objectOptions: [
                    { text: 'One', value: '1' },
                    { text: 'Two', value: '2' },
                ],
                modelValue: undefined,
            },
        });
        const options = wrapper.findAll('option');
        expect(options).toHaveLength(2);
        expect(options[0].text()).toBe('One');
        expect(options[1].text()).toBe('Two');
    });

    it('disables option by value', () => {
        const wrapper = mount(Dropdown, {
            props: {
                objectOptions: [
                    { text: 'One', value: '1' },
                    { text: 'Two', value: '2' },
                ],
                disabledOptions: ['2'],
                modelValue: undefined,
            },
        });
        const options = wrapper.findAll('option');
        expect(options[1].attributes('disabled')).toBeDefined();
    });

    it('disables option by text', () => {
        const wrapper = mount(Dropdown, {
            props: {
                objectOptions: [
                    { text: 'One', value: '1' },
                    { text: 'Two', value: '2' },
                ],
                disabledOptions: ['One'],
                modelValue: undefined,
            },
        });
        const options = wrapper.findAll('option');
        expect(options[0].attributes('disabled')).toBeDefined();
    });

    it('emits update:modelValue on change', async () => {
        const wrapper = mount(Dropdown, {
            props: {
                simpleOptions: ['A', 'B'],
                modelValue: undefined,
            },
        });
        await wrapper.find('select').setValue('B');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('throws error if both options props are provided', () => {
        expect(() =>
            mount(Dropdown, {
                props: {
                    objectOptions: [{ text: 'One', value: '1' }],
                    simpleOptions: ['A'],
                    modelValue: undefined,
                },
            })
        ).toThrow();
    });

    it('throws error if no options are provided', () => {
        expect(() =>
            mount(Dropdown, {
                props: {
                    modelValue: undefined,
                },
            })
        ).toThrow();
    });

    it('hides placeholder once a falsy value (e.g. 0) is selected', () => {
        const wrapper = mount(Dropdown, {
            props: {
                objectOptions: [
                    { text: 'January', value: 0 },
                    { text: 'February', value: 1 },
                ],
                placeholder: 'Pick a month',
                modelValue: 0,
            },
        });
        const placeholderOption = wrapper.findAll('option').find((o) => o.text() === 'Pick a month');
        expect(placeholderOption).toBeUndefined();
    });

    it('keeps an enabled placeholder when clearable and emits null for it', async () => {
        const wrapper = mount(Dropdown, {
            props: { simpleOptions: ['A', 'B'], placeholder: 'Pick one', clearable: true, modelValue: 'A' },
        });
        const placeholderOption = wrapper.findAll('option').find((o) => o.text() === 'Pick one');
        expect(placeholderOption?.attributes('disabled')).toBeUndefined();
        await wrapper.find('select').setValue('');
        expect(wrapper.emitted('update:modelValue')).toEqual([[null]]);
    });

    it('cancels the type-ahead timer on unmount', async () => {
        vi.useFakeTimers();
        const wrapper = mount(Dropdown, { props: { simpleOptions: ['A', 'B'] } });
        await wrapper.find('select').trigger('keydown', { key: 'a' });
        expect(vi.getTimerCount()).toBe(1);
        wrapper.unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});
