<template>
  <div class="dropdown">
    <label v-if="label" :for="selectId" :class="['dropdown__label']" v-text="label"/>
    <select
        :id="selectId"
        :name="label || undefined"
        :value="modelValue"
        :class="selectClass"
        @change="updateValue"
        @keydown="onSelectKeydown"
    >
      <option v-if="placeholder && (modelValue === null || modelValue === undefined)" disabled value="">{{ placeholder }}</option>
      <option v-for="(option, index) in options"
              :key="`${option.value} ${index}`"
              :class="['dropdown__option', index % 2 === 0 ? 'dropdown__option--grey' : 'dropdown__option--white']"
              :disabled="props.disabledOptions.some((d) => d === option.value || d === option.text || String(d) === String(option.value))"
              :value="option.value"
              v-text="option.text"/>
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
  placeholder: { type: String, required: false, default: null },
  modelValue: { type: [Number, String] as PropType<number | string | null>, required: false, default: null },
  disabledOptions: { type: Array as PropType<(string | number)[]>, default: () => [] },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void;
}>();

const updateValue = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const raw = target.value;
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

const {onSelectKeydown} = useSelectKeydown(options, emit);

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

.dropdown__select option:disabled {
  color: #9ca3af;
}

.dropdown__option {
  zoom: 1.25;
}
</style>
