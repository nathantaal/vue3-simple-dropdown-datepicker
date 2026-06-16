<template>
  <div class="date-dropdown__row">
    <component
        v-for="(dropdown, idx) in dropdownOrder"
        :is="Dropdown"
        v-model="dropdown.vModel.value"
        v-bind="dropdown.props"
        :key="idx"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import Dropdown from './dropdown.vue';

const props = defineProps({
  modelValue: { type: Date as PropType<Date | null>, required: false, default: null },
  dayPlaceholder: { type: String, required: false, default: null },
  monthPlaceholder: { type: String, required: false, default: null },
  yearPlaceholder: { type: String, required: false, default: null },
  dayLabel: { type: String, required: false, default: '' },
  monthLabel: { type: String, required: false, default: '' },
  yearLabel: { type: String, required: false, default: '' },
  minYear: { type: Number, required: false, default: 1970 },
  maxYear: { type: Number, required: false, default: 2069 },
  min: { type: Date as PropType<Date | null>, required: false, default: null },
  max: { type: Date as PropType<Date | null>, required: false, default: null },
  dateFormat: { type: String, default: 'yyyymmdd' },
});

const monthArray = [
  { text: 'January', value: 0 },
  { text: 'February', value: 1 },
  { text: 'March', value: 2 },
  { text: 'April', value: 3 },
  { text: 'May', value: 4 },
  { text: 'June', value: 5 },
  { text: 'July', value: 6 },
  { text: 'August', value: 7 },
  { text: 'September', value: 8 },
  { text: 'October', value: 9 },
  { text: 'November', value: 10 },
  { text: 'December', value: 11 },
];

const now = new Date();
const defaultDayPlaceholder = computed(() => props.dayPlaceholder ?? now.getDate().toString());
const defaultMonthPlaceholder = computed(
  () => props.monthPlaceholder ?? monthArray[now.getMonth()].text,
);
const defaultYearPlaceholder = computed(() => props.yearPlaceholder ?? now.getFullYear().toString());

const selectedDay = ref<number | null>(props.modelValue?.getDate() ?? null);
const selectedMonth = ref<number | null>(props.modelValue?.getMonth() ?? null);
const selectedYear = ref<number | null>(props.modelValue?.getFullYear() ?? null);

watch(
  () => props.modelValue,
  (v) => {
    selectedDay.value = v?.getDate() ?? null;
    selectedMonth.value = v?.getMonth() ?? null;
    selectedYear.value = v?.getFullYear() ?? null;
  },
);

const yearArray = computed(() => {
  const start = Math.min(props.minYear, props.maxYear);
  const end = Math.max(props.minYear, props.maxYear);
  return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
});

const datesInMonth = computed(() => {
  const year = selectedYear.value ?? now.getFullYear();
  const month = selectedMonth.value ?? now.getMonth();
  return new Date(year, month + 1, 0).getDate();
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
    const candidate = new Date(selectedYear.value, selectedMonth.value, d);
    if (props.min && candidate < startOfDay(props.min)) out.push(String(d));
    if (props.max && candidate > endOfDay(props.max)) out.push(String(d));
  }
  return out;
});

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// Clamp the selected day when the available day count shrinks.
watch(datesInMonth, (max) => {
  if (selectedDay.value !== null && selectedDay.value > max) {
    selectedDay.value = max;
  }
});

const selectedDate = computed<Date | null>(() => {
  if (selectedYear.value === null || selectedMonth.value === null || selectedDay.value === null) {
    return null;
  }
  const date = new Date(selectedYear.value, selectedMonth.value, selectedDay.value);
  return Number.isNaN(date.getTime()) ? null : date;
});

const dropdownOrder = computed(() => {
  const tokens = props.dateFormat.match(/(yyyy|mm|dd)/g) || ['yyyy', 'mm', 'dd'];
  return tokens.map((key) => {
    if (key === 'yyyy') {
      return {
        vModel: selectedYear,
        props: {
          label: props.yearLabel,
          placeholder: defaultYearPlaceholder.value,
          simpleOptions: yearArray.value,
          disabledOptions: disabledYears.value,
        },
      };
    }
    if (key === 'mm') {
      return {
        vModel: selectedMonth,
        props: {
          label: props.monthLabel,
          placeholder: defaultMonthPlaceholder.value,
          objectOptions: monthArray,
          disabledOptions: disabledMonths.value,
        },
      };
    }
    return {
      vModel: selectedDay,
      props: {
        label: props.dayLabel,
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

watch(selectedDate, (value) => {
  emit('changeDate', value);
  emit('update:modelValue', value);
});
</script>

<style lang="css" scoped>
.date-dropdown__row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
