<template>
  <div class="date-dropdown__row" role="group">
    <component
        :is="Dropdown"
        v-for="dropdown in dropdownOrder"
        :key="dropdown.token"
        v-bind="dropdown.props"
        :clearable="clearable"
        :model-value="dropdown.vModel.value"
        @update:model-value="(value: number | string | null) => onSelect(dropdown.vModel, value)"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, type PropType, type Ref } from 'vue';
import Dropdown from './dropdown.vue';

const props = defineProps({
  modelValue: { type: Date as PropType<Date | null>, required: false, default: null },
  dayPlaceholder: { type: String, required: false, default: null },
  monthPlaceholder: { type: String, required: false, default: null },
  yearPlaceholder: { type: String, required: false, default: null },
  dayLabel: { type: String, required: false, default: '' },
  monthLabel: { type: String, required: false, default: '' },
  yearLabel: { type: String, required: false, default: '' },
  minYear: { type: Number, required: false, default: undefined },
  maxYear: { type: Number, required: false, default: undefined },
  min: { type: Date as PropType<Date | null>, required: false, default: null },
  max: { type: Date as PropType<Date | null>, required: false, default: null },
  dateFormat: { type: String, default: 'yyyymmdd' },
  locale: { type: String, default: 'en' },
  clearable: { type: Boolean, default: false },
});

const DEFAULT_MIN_YEAR = 1970;
const DEFAULT_MAX_YEAR = 2069;
const DEFAULT_TOKENS = ['yyyy', 'mm', 'dd'];
const DEFAULT_LOCALE = 'en';
const ENGLISH_FIELD_NAMES = { year: 'year', month: 'month', day: 'day' };

const resolvedLocale = computed(() => {
  try {
    return Intl.getCanonicalLocales(props.locale)[0] ?? DEFAULT_LOCALE;
  } catch {
    console.warn(
      `[vue3-simple-dropdown-datepicker] Invalid locale "${props.locale}". Falling back to "${DEFAULT_LOCALE}".`,
    );
    return DEFAULT_LOCALE;
  }
});

// Month-only formatting yields the standalone form (e.g. Polish "marzec", not "marca").
// Force Gregorian: option values and emitted dates are Gregorian, but locales like
// fa-IR (Persian) or tags with -u-ca-… would otherwise name another calendar's months.
const monthFormat = computed(
  () => new Intl.DateTimeFormat(resolvedLocale.value, { month: 'long', calendar: 'gregory' }),
);
const monthArray = computed(() =>
  Array.from({ length: 12 }, (_, m) => ({ text: monthFormat.value.format(new Date(2000, m, 1)), value: m })),
);

// Accessible names for the selects when no visible label is given.
const fieldNames = computed(() => {
  try {
    const names = new Intl.DisplayNames(resolvedLocale.value, { type: 'dateTimeField' });
    return { year: names.of('year')!, month: names.of('month')!, day: names.of('day')! };
  } catch {
    // Runtimes without dateTimeField support (Safari < 15.4).
    return ENGLISH_FIELD_NAMES;
  }
});

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase(resolvedLocale.value) + s.slice(1);
const defaultDayPlaceholder = computed(() => props.dayPlaceholder ?? capitalize(fieldNames.value.day));
const defaultMonthPlaceholder = computed(() => props.monthPlaceholder ?? capitalize(fieldNames.value.month));
const defaultYearPlaceholder = computed(() => props.yearPlaceholder ?? capitalize(fieldNames.value.year));

const selectedDay = ref<number | null>(props.modelValue?.getDate() ?? null);
const selectedMonth = ref<number | null>(props.modelValue?.getMonth() ?? null);
const selectedYear = ref<number | null>(props.modelValue?.getFullYear() ?? null);

// The value the parent last saw, either passed in or emitted by us.
let reported: Date | null = props.modelValue;

watch(
  () => props.modelValue,
  (v) => {
    // v-model handing back what we emitted: keep the dropdowns as they are,
    // including an out-of-range selection that was emitted as null.
    if (isSameDay(v, reported)) return;
    reported = v;
    selectedDay.value = v?.getDate() ?? null;
    selectedMonth.value = v?.getMonth() ?? null;
    selectedYear.value = v?.getFullYear() ?? null;
  },
);

const yearArray = computed(() => {
  const from = props.minYear ?? props.min?.getFullYear() ?? DEFAULT_MIN_YEAR;
  const to = props.maxYear ?? props.max?.getFullYear() ?? DEFAULT_MAX_YEAR;
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  const years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  // A v-model year outside the range still needs an option to render.
  const selected = selectedYear.value;
  if (selected !== null && selected < start) years.unshift(selected);
  if (selected !== null && selected > end) years.push(selected);
  return years.map(String);
});

const datesInMonth = computed(() => {
  if (selectedMonth.value === null) return 31;
  // Without a year, offer 29 February; picking a non-leap year clamps it.
  const year = selectedYear.value ?? 2000;
  return new Date(year, selectedMonth.value + 1, 0).getDate();
});
const daysArray = computed(() =>
  Array.from({ length: datesInMonth.value }, (_, i) => (i + 1).toString()),
);

const disabledYears = computed<string[]>(() => {
  const out: string[] = [];
  if (props.min) for (const y of yearArray.value) if (Number(y) < props.min.getFullYear()) out.push(y);
  if (props.max) for (const y of yearArray.value) if (Number(y) > props.max.getFullYear()) out.push(y);
  return out;
});

const disabledMonths = computed<number[]>(() => {
  if (selectedYear.value === null) return [];
  const out: number[] = [];
  for (let m = 0; m < 12; m++) {
    if (props.min && selectedYear.value === props.min.getFullYear() && m < props.min.getMonth()) out.push(m);
    if (props.max && selectedYear.value === props.max.getFullYear() && m > props.max.getMonth()) out.push(m);
  }
  return out;
});

const disabledDays = computed<string[]>(() => {
  if (selectedYear.value === null || selectedMonth.value === null) return [];
  const out: string[] = [];
  for (let d = 1; d <= datesInMonth.value; d++) {
    if (!isWithinBounds(new Date(selectedYear.value, selectedMonth.value, d))) out.push(String(d));
  }
  return out;
});

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function isWithinBounds(date: Date) {
  if (props.min && date < startOfDay(props.min)) return false;
  if (props.max && date > endOfDay(props.max)) return false;
  return true;
}
function isSameDay(a: Date | null, b: Date | null) {
  if (a === null || b === null) return a === b;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// The selection as a date, or null while incomplete or outside min/max.
const selectedDate = computed<Date | null>(() => {
  if (selectedYear.value === null || selectedMonth.value === null || selectedDay.value === null) {
    return null;
  }
  const date = new Date(selectedYear.value, selectedMonth.value, selectedDay.value);
  if (Number.isNaN(date.getTime()) || !isWithinBounds(date)) return null;
  return date;
});

const formatTokens = computed(() => {
  const tokens = props.dateFormat.toLowerCase().match(/yyyy|mm|dd/g) ?? [];
  if (tokens.length === 3 && new Set(tokens).size === 3) return tokens;
  console.warn(
    `[vue3-simple-dropdown-datepicker] Invalid dateFormat "${props.dateFormat}": ` +
      'use each of dd, mm and yyyy exactly once. Falling back to "yyyymmdd".',
  );
  return DEFAULT_TOKENS;
});

const dropdownOrder = computed(() => {
  return formatTokens.value.map((token) => {
    if (token === 'yyyy') {
      return {
        token,
        vModel: selectedYear,
        props: {
          label: props.yearLabel,
          ariaLabel: fieldNames.value.year,
          placeholder: defaultYearPlaceholder.value,
          simpleOptions: yearArray.value,
          disabledOptions: disabledYears.value,
        },
      };
    }
    if (token === 'mm') {
      return {
        token,
        vModel: selectedMonth,
        props: {
          label: props.monthLabel,
          ariaLabel: fieldNames.value.month,
          placeholder: defaultMonthPlaceholder.value,
          objectOptions: monthArray.value,
          disabledOptions: disabledMonths.value,
        },
      };
    }
    return {
      token,
      vModel: selectedDay,
      props: {
        label: props.dayLabel,
        ariaLabel: fieldNames.value.day,
        placeholder: defaultDayPlaceholder.value,
        simpleOptions: daysArray.value,
        disabledOptions: disabledDays.value,
      },
    };
  });
});

const emit = defineEmits<{
  (e: 'changeDate', value: Date | null): void;
  (e: 'update:modelValue', value: Date | null): void;
}>();

// User input and bounds changes emit; values set by the parent are never echoed back.
function onSelect(part: Ref<number | null>, picked: number | string | null) {
  part.value = picked === null ? null : Number(picked);
  if (selectedDay.value !== null && selectedDay.value > datesInMonth.value) {
    selectedDay.value = datesInMonth.value;
  }
  reportSelection();
}

// Compared by timestamp so inline `new Date(...)` bounds don't fire on every parent render.
watch([() => props.min?.getTime(), () => props.max?.getTime()], reportSelection);

function reportSelection() {
  const date = selectedDate.value;
  if (isSameDay(date, reported)) return;
  reported = date;
  emit('changeDate', date);
  emit('update:modelValue', date);
}

// Lets the parent reset the picker, including an out-of-range selection
// shown while v-model is already null (which no prop change can reach).
function clear() {
  selectedDay.value = null;
  selectedMonth.value = null;
  selectedYear.value = null;
  reportSelection();
}

defineExpose({ clear });
</script>

<style lang="css" scoped>
.date-dropdown__row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
