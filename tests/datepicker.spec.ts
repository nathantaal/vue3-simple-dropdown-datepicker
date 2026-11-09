import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SimpleDropdownDatepicker from '../src/SimpleDropdownDatepicker.vue';
import { describe, it, expect, vi, afterEach } from 'vitest';

const ymd = (d: unknown) =>
  d instanceof Date ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : d;
const emittedDates = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.emitted('update:modelValue') ?? []).map((e) => ymd(e[0]));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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

describe('min/max enforcement', () => {
  const min = new Date(2021, 2, 1); // 1 March 2021

  it('emits null when a year change moves the selection before min', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min } });
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2022');
    await monthSelect.setValue('0');
    await daySelect.setValue('15');
    await yearSelect.setValue('2021');
    expect(emittedDates(wrapper)).toEqual(['2022-1-15', null]);
    expect(wrapper.emitted('changeDate')!.map((e) => ymd(e[0]))).toEqual(['2022-1-15', null]);
  });

  it('never emits a date before min when the year is picked last', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min, dateFormat: 'ddmmyyyy' } });
    const [daySelect, monthSelect, yearSelect] = wrapper.findAll('select');
    await daySelect.setValue('1');
    await monthSelect.setValue('0');
    await yearSelect.setValue('2021');
    expect(emittedDates(wrapper)).toEqual([]);
  });

  it('keyboard type-ahead skips disabled options', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min: new Date(2024, 5, 1) } });
    const [yearSelect, monthSelect] = wrapper.findAll('select');
    await yearSelect.setValue('2024');
    await monthSelect.trigger('keydown', { key: 'j' });
    expect((monthSelect.element as HTMLSelectElement).value).toBe('5'); // June, not January
  });

  it('emits null when min moves past the selected date', async () => {
    const wrapper = mount(SimpleDropdownDatepicker);
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2022');
    await monthSelect.setValue('0');
    await daySelect.setValue('15');
    await wrapper.setProps({ min: new Date(2022, 5, 1) });
    expect(emittedDates(wrapper)).toEqual(['2022-1-15', null]);
  });

  it('emits the date again when bounds widen to include the selection', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min } });
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2022');
    await monthSelect.setValue('0');
    await daySelect.setValue('15');
    await yearSelect.setValue('2021');
    await wrapper.setProps({ min: new Date(2020, 0, 1) });
    expect(emittedDates(wrapper)).toEqual(['2022-1-15', null, '2021-1-15']);
  });

  it('does not emit when bounds change without affecting the selection', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min } });
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2022');
    await monthSelect.setValue('0');
    await daySelect.setValue('15');
    await wrapper.setProps({ min: new Date(2021, 2, 1), max: new Date(2030, 0, 1) });
    expect(emittedDates(wrapper)).toEqual(['2022-1-15']);
  });

  it('keeps the dropdowns when v-model feeds back the null it emitted', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, {
      props: {
        min,
        modelValue: null,
        'onUpdate:modelValue': (v: Date | null) => wrapper.setProps({ modelValue: v }),
      },
    });
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2022');
    await monthSelect.setValue('0');
    await daySelect.setValue('15');
    await yearSelect.setValue('2021');
    await nextTick();
    expect(wrapper.props('modelValue')).toBeNull();
    expect([yearSelect, monthSelect, daySelect].map((s) => (s.element as HTMLSelectElement).value))
      .toEqual(['2021', '0', '15']);
  });
});

describe('day list before the month and year are picked', () => {
  const inNovember2026 = () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 9));
  };

  it('offers day 31 before a month is picked', () => {
    inNovember2026();
    const wrapper = mount(SimpleDropdownDatepicker, { props: { dateFormat: 'ddmmyyyy' } });
    const dayTexts = wrapper.findAll('select')[0].findAll('option').map((o) => o.text());
    expect(dayTexts).toContain('31');
  });

  it('keeps 29 February when a leap year is picked last', async () => {
    inNovember2026();
    const wrapper = mount(SimpleDropdownDatepicker, { props: { dateFormat: 'ddmmyyyy' } });
    const [daySelect, monthSelect, yearSelect] = wrapper.findAll('select');
    await daySelect.setValue('29');
    await monthSelect.setValue('1');
    await yearSelect.setValue('2024');
    expect(emittedDates(wrapper)).toEqual(['2024-2-29']);
  });

  it('clamps 29 February to 28 when a non-leap year is picked last', async () => {
    inNovember2026();
    const wrapper = mount(SimpleDropdownDatepicker, { props: { dateFormat: 'ddmmyyyy' } });
    const [daySelect, monthSelect, yearSelect] = wrapper.findAll('select');
    await daySelect.setValue('29');
    await monthSelect.setValue('1');
    await yearSelect.setValue('2023');
    expect(emittedDates(wrapper)).toEqual(['2023-2-28']);
  });
});

describe('year range', () => {
  const yearTexts = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('select')[0].findAll('option:not([disabled])').map((o) => o.text());

  it('reaches back to min when minYear is not set', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min: new Date(1950, 0, 1) } });
    expect(yearTexts(wrapper)[0]).toBe('1950');
  });

  it('reaches up to max when maxYear is not set', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { max: new Date(2100, 11, 31) } });
    expect(yearTexts(wrapper).at(-1)).toBe('2100');
  });

  it('lets an explicit minYear override min', () => {
    const wrapper = mount(SimpleDropdownDatepicker, {
      props: { min: new Date(1950, 0, 1), minYear: 2000 },
    });
    expect(yearTexts(wrapper)[0]).toBe('2000');
  });

  it('shows a v-model value whose year is outside the offered range', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { modelValue: new Date(1950, 0, 1) } });
    expect((wrapper.findAll('select')[0].element as HTMLSelectElement).value).toBe('1950');
  });
});

describe('dateFormat', () => {
  const lastSelectTexts = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('select')[2].findAll('option').map((o) => o.text());

  it('accepts uppercase tokens', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { dateFormat: 'DD/MM/YYYY' } });
    expect(lastSelectTexts(wrapper)).toContain('1970');
  });

  it.each(['ddmmyy', 'ddddmmyyyy'])('warns and falls back to yyyy-mm-dd for %s', (dateFormat) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(SimpleDropdownDatepicker, { props: { dateFormat } });
    expect(wrapper.findAll('select')).toHaveLength(3);
    expect(lastSelectTexts(wrapper)).toContain('31');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('locale', () => {
  const monthTexts = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('select')[1].findAll('option:not([disabled])').map((o) => o.text());

  it('renders month names in the given locale', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { locale: 'nl' } });
    expect(monthTexts(wrapper)).toEqual([
      'januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december',
    ]);
  });

  // Option values and emitted dates are Gregorian, so the names must be too.
  it.each([
    ['fa-IR', 'ژانویه', 'دسامبر'], // default calendar is Persian
    ['en-u-ca-hebrew', 'January', 'December'],
  ])('uses Gregorian month names for %s', (locale, january, december) => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { locale } });
    const texts = monthTexts(wrapper);
    expect([texts[0], texts[11]]).toEqual([january, december]);
  });

  it.each([
    ['en', ['Year', 'Month', 'Day']],
    ['nl', ['Jaar', 'Maand', 'Dag']],
  ])('uses the field names as default placeholders (%s)', (locale, expected) => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { locale } });
    const placeholders = wrapper.findAll('select').map((s) => s.find('option[disabled][value=""]').text());
    expect(placeholders).toEqual(expected);
  });

  it('warns and falls back to English for an invalid locale', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(SimpleDropdownDatepicker, { props: { locale: 'not a locale!' } });
    expect(monthTexts(wrapper)[0]).toBe('January');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('accessible names', () => {
  const ariaLabels = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('select').map((s) => s.attributes('aria-label'));

  it('names each dropdown when no label is set', () => {
    const wrapper = mount(SimpleDropdownDatepicker);
    expect(ariaLabels(wrapper)).toEqual(['year', 'month', 'day']);
  });

  it('localizes the names', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { locale: 'nl', dateFormat: 'ddmmyyyy' } });
    expect(ariaLabels(wrapper)).toEqual(['dag', 'maand', 'jaar']);
  });

  it('relies on the visible label instead of aria-label when one is set', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { yearLabel: 'Geboortejaar' } });
    const yearSelect = wrapper.findAll('select')[0];
    expect(yearSelect.attributes('aria-label')).toBeUndefined();
    expect(wrapper.find(`label[for="${yearSelect.attributes('id')}"]`).text()).toBe('Geboortejaar');
  });

  it('groups the dropdowns so the picker as a whole can be named', () => {
    const wrapper = mount(SimpleDropdownDatepicker, { attrs: { 'aria-label': 'Date of birth' } });
    expect(wrapper.attributes('role')).toBe('group');
    expect(wrapper.attributes('aria-label')).toBe('Date of birth');
  });
});

describe('clearing', () => {
  const values = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('select').map((s) => (s.element as HTMLSelectElement).value);

  const pick2024_06_15 = async (wrapper: ReturnType<typeof mount>) => {
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2024');
    await monthSelect.setValue('5');
    await daySelect.setValue('15');
  };

  it('lets the user clear a field when clearable, emitting null', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { clearable: true } });
    await pick2024_06_15(wrapper);
    await wrapper.findAll('select')[0].setValue('');
    expect(emittedDates(wrapper)).toEqual(['2024-6-15', null]);
    expect(values(wrapper)).toEqual(['', '5', '15']);
  });

  it('clear() resets the dropdowns and emits null', async () => {
    const wrapper = mount(SimpleDropdownDatepicker);
    await pick2024_06_15(wrapper);
    (wrapper.vm as unknown as { clear: () => void }).clear();
    await nextTick();
    expect(emittedDates(wrapper)).toEqual(['2024-6-15', null]);
    expect(values(wrapper)).toEqual(['', '', '']);
  });

  it('clear() resets an out-of-range selection while v-model is already null', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min: new Date(2021, 2, 1) } });
    const [yearSelect, monthSelect, daySelect] = wrapper.findAll('select');
    await yearSelect.setValue('2022');
    await monthSelect.setValue('0');
    await daySelect.setValue('15');
    await yearSelect.setValue('2021');
    (wrapper.vm as unknown as { clear: () => void }).clear();
    await nextTick();
    expect(emittedDates(wrapper)).toEqual(['2022-1-15', null]);
    expect(values(wrapper)).toEqual(['', '', '']);
  });
});

describe('v-model sync', () => {
  it('does not echo a value the parent sets', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { modelValue: new Date(2020, 0, 1) } });
    await wrapper.setProps({ modelValue: new Date(2024, 5, 15, 14, 30) });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('changeDate')).toBeUndefined();
  });

  it('shows an out-of-range value the parent sets without emitting', async () => {
    const wrapper = mount(SimpleDropdownDatepicker, { props: { min: new Date(2021, 2, 1) } });
    await wrapper.setProps({ modelValue: new Date(2020, 0, 1) });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect((wrapper.findAll('select')[0].element as HTMLSelectElement).value).toBe('2020');
  });
});
