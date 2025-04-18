// src/composables/useClickOutside.ts
import { onMounted, onBeforeUnmount, type Ref } from 'vue';

export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: (event: MouseEvent) => void
) {
  const handleClickOutside = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      callback(event);
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  return {
    handleClickOutside
  };
}