// src/composables/useDropdown.ts
import { ref } from 'vue';
import { useClickOutside } from './useClickOutside';

export function useDropdown() {
  const isOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  // Используем composable для отслеживания кликов вне элемента
  useClickOutside(dropdownRef, () => {
    close();
  });

  return {
    isOpen,
    dropdownRef,
    toggle,
    open,
    close
  };
}