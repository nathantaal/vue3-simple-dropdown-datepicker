import type { Ref } from 'vue';

type Option = { text: string; value: string | number };

export function useSelectKeydown(
  options: Ref<Option[]>,
  emit: (event: 'update:modelValue', value: number | string) => void,
) {
  const typedBuffer = { value: '' };
  let bufferTimeout: number | null = null;

  function onSelectKeydown(e: KeyboardEvent) {
    if (e.key.length !== 1 || !/[\p{L}\p{N}]/u.test(e.key)) return;

    typedBuffer.value += e.key.toLowerCase();
    if (bufferTimeout !== null) clearTimeout(bufferTimeout);
    bufferTimeout = window.setTimeout(() => {
      typedBuffer.value = '';
    }, 500);

    const buffer = typedBuffer.value;
    const match = options.value.find((opt) => String(opt.text).toLowerCase().startsWith(buffer));
    if (match) {
      const num = Number(match.value);
      emit('update:modelValue', Number.isNaN(num) ? match.value : num);
    }
    e.preventDefault();
  }

  return { onSelectKeydown, typedBuffer };
}
