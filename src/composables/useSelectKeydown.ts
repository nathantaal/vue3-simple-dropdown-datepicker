import { getCurrentScope, onScopeDispose, type Ref } from 'vue';

type Option = { text: string; value: string | number };

export function useSelectKeydown(
  options: Ref<Option[]>,
  emit: (event: 'update:modelValue', value: number | string) => void,
  isDisabled: (option: Option) => boolean = () => false,
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
    const match = options.value.find(
      (opt) => !isDisabled(opt) && String(opt.text).toLowerCase().startsWith(buffer),
    );
    if (match) {
      const num = Number(match.value);
      emit('update:modelValue', Number.isNaN(num) ? match.value : num);
    }
    e.preventDefault();
  }

  // Outside a component (e.g. in unit tests) there is no scope to clean up with.
  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (bufferTimeout !== null) clearTimeout(bufferTimeout);
    });
  }

  return { onSelectKeydown, typedBuffer };
}
