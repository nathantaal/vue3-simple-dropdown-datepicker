import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SimpleDropdownDatepicker from '../src/SimpleDropdownDatepicker.vue';
import { describe, it, expect } from 'vitest';

describe('SimpleDropdownDatepicker', () => {
  it('day list reflects the selected month (Feb has 28/29 days)', async () => {
    const wrapper = mount(SimpleDropdownDatepicker);
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');

    await yearSelect.setValue('2023');
    await monthSelect.setValue('1'); // February (0-indexed)
    await nextTick();

    const dayOptions = daySelect.findAll('option').filter((o) => o.attributes('disabled') === undefined);
    expect(dayOptions).toHaveLength(28);
  });

  it('clamps selectedDay when switching to a shorter month', async () => {
    const wrapper = mount(SimpleDropdownDatepicker);
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');

    await yearSelect.setValue('2023');
    await monthSelect.setValue('0'); // January
    await daySelect.setValue('31');
    await monthSelect.setValue('1'); // February
    await nextTick();

    const emitted = wrapper.emitted('changeDate');
    const last = emitted![emitted!.length - 1][0] as Date;
    expect(last.getMonth()).toBe(1);
    expect(last.getDate()).toBeLessThanOrEqual(28);
  });

  it('uses the *Placeholder props', () => {
    const wrapper = mount(SimpleDropdownDatepicker, {
      props: { dayPlaceholder: 'D', monthPlaceholder: 'M', yearPlaceholder: 'Y' },
    });
    const placeholders = wrapper.findAll('option[disabled]').map((o) => o.text());
    expect(placeholders).toEqual(expect.arrayContaining(['D', 'M', 'Y']));
  });

  it('uses the *Label props instead of hardcoded Dutch', () => {
    const wrapper = mount(SimpleDropdownDatepicker, {
      props: { dayLabel: 'Day', monthLabel: 'Month', yearLabel: 'Year' },
    });
    const labels = wrapper.findAll('.dropdown__label').map((l) => l.text());
    expect(labels).toEqual(expect.arrayContaining(['Day', 'Month', 'Year']));
  });

  it('initializes from v-model value', () => {
    const initial = new Date(2024, 5, 15); // June 15, 2024
    const wrapper = mount(SimpleDropdownDatepicker, { props: { modelValue: initial } });
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    expect((yearSelect.element as HTMLSelectElement).value).toBe('2024');
    expect((monthSelect.element as HTMLSelectElement).value).toBe('5');
    expect((daySelect.element as HTMLSelectElement).value).toBe('15');
  });

  it('emits update:modelValue when a complete date is picked', async () => {
    const wrapper = mount(SimpleDropdownDatepicker);
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2024');
    await monthSelect.setValue('5');
    await daySelect.setValue('15');
    const events = wrapper.emitted('update:modelValue');
    expect(events).toBeTruthy();
    const last = events![events!.length - 1][0] as Date;
    expect(last.getFullYear()).toBe(2024);
    expect(last.getMonth()).toBe(5);
    expect(last.getDate()).toBe(15);
  });

  it('respects minYear and maxYear props', () => {
    const wrapper = mount(SimpleDropdownDatepicker, {
      props: { minYear: 2000, maxYear: 2010 },
    });
    const yearSelect = wrapper.findAll('select')[0];
    const yearOptions = yearSelect.findAll('option').filter((o) => o.attributes('disabled') === undefined);
    expect(yearOptions.map((o) => o.text())).toEqual([
      '2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010',
    ]);
  });

  it('disables months outside [min, max] when year matches', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, {
      props: {
        min: new Date(2024, 5, 1),  // June 1
        max: new Date(2024, 8, 30), // Sept 30
      },
    });
    const [yearSelect, monthSelect] = wrapper.findAll('select');
    await yearSelect.setValue('2024');
    const monthOptions = monthSelect.findAll('option');
    const labelsByDisabled = monthOptions
      .filter((o) => o.attributes('disabled') !== undefined)
      .map((o) => o.text());
    expect(labelsByDisabled).toEqual(expect.arrayContaining(['January', 'May', 'October', 'December']));
    expect(labelsByDisabled).not.toEqual(expect.arrayContaining(['June', 'July', 'August', 'September']));
  });
});
