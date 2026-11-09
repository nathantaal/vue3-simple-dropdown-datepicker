<template>
  <div class="dropdown">
    <label v-if="label" :for="selectId" :class="['dropdown__label']" v-text="label"/>
    <select
        :id="selectId"
        :name="label || undefined"
        :aria-label="label ? undefined : ariaLabel || undefined"
        :value="modelValue"
        :class="selectClass"
        @change="updateValue"
        @keydown="onSelectKeydown"
    >
      <option
          v-if="placeholder && (clearable || modelValue === null || modelValue === undefined)"
          :disabled="!clearable"
          value=""
      >{{ placeholder }}</option>
      <option
          v-for="(option, index) in options"
          :key="`${option.value} ${index}`"
          class="dropdown__option"
          :disabled="isDisabled(option)"
          :value="option.value"
          v-text="option.text"
      />
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, useId, type PropType } from 'vue';
import { useSelectKeydown } from './composables/useSelectKeydown';

type ObjectOption = { text: string; value: string | number };

const props = defineProps({
  objectOptions: { type: Array as PropType<ObjectOption[]>, default: () => [] },
  simpleOptions: { type: Array as PropType<string[]>, default: () => [] },
  label: { type: String, required: false, default: '' },
  ariaLabel: { type: String, required: false, default: '' },
  placeholder: { type: String, required: false, default: null },
  clearable: { type: Boolean, required: false, default: false },
  modelValue: { type: [Number, String] as PropType<number | string | null>, required: false, default: null },
  disabledOptions: { type: Array as PropType<(string | number)[]>, default: () => [] },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | null): void;
}>();

const updateValue = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const raw = target.value;
  // The placeholder option has value "", which Number() would turn into 0.
  if (raw === '') {
    emit('update:modelValue', null);
    return;
  }
  const num = Number(raw);
  emit('update:modelValue', Number.isNaN(num) ? raw : num);
};

const selectId = useId();

onBeforeMount(() => {
  if (props.objectOptions?.length > 0 && props.simpleOptions?.length > 0) {
    throw new Error("Don't use both options. Component will exit.");
  }
  if (props.objectOptions?.length === 0 && props.simpleOptions?.length === 0) {
    throw new Error("Any of the options props must be provided. Component will exit.");
  }
});

const options = computed(() => {
  if (props.objectOptions?.length > 0) {
    return props.objectOptions;
  }
  return props.simpleOptions.map((opt) => ({ value: opt, text: opt }));
});

const isDisabled = (option: ObjectOption) =>
  props.disabledOptions.some((d) => d === option.value || d === option.text || String(d) === String(option.value));

const {onSelectKeydown} = useSelectKeydown(options, emit, isDisabled);

const selectClass = computed(() => [
  "dropdown__select",
  (props.modelValue === null || props.modelValue === undefined) ? "dropdown__select--placeholder" : ""
]);
</script>

<style scoped lang="css">
.dropdown {
  position: relative;
}

.dropdown__label {
  font-weight: 600;
}

.dropdown__select {
  width: 100%;
  height: 45px;
}

.dropdown__select--placeholder {
  color: #6b7280;
}

/* Firefox lets options inherit the select's placeholder grey. */
.dropdown__select--placeholder option:not(:disabled) {
  color: CanvasText;
}

.dropdown__select option:disabled {
  color: #9ca3af;
}
</style>
