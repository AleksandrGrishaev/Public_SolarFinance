// src/composables/ui/useDropdown.ts
import { ref, onMounted, onBeforeUnmount } from 'vue';
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

  // Обработчик клавиши Escape для закрытия дропдауна
  const handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      close();
    }
  };

  // Используем улучшенный composable для отслеживания кликов вне элемента
  useClickOutside(dropdownRef, () => {
    if (isOpen.value) {
      close();
    }
  });

  // Добавляем и удаляем слушатель клавиши Escape
  onMounted(() => {
    document.addEventListener('keydown', handleEscKey);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscKey);
  });

  return {
    isOpen,
    dropdownRef,
    toggle,
    open,
    close
  };
}