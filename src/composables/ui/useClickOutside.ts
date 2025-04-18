// src/composables/ui/useClickOutside.ts
import { onMounted, onBeforeUnmount, type Ref } from 'vue';

export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: (event: MouseEvent) => void
) {
  if (typeof window === 'undefined') return;
  
  // Используем capture: true для перехвата события на этапе погружения
  const handleClickOutside = (event: MouseEvent) => {
    // Проверка, что elementRef существует и содержит элемент
    if (!elementRef.value) return;
    
    // Убедимся, что элемент, на который кликнули, не является дочерним для нашего ref
    if (!elementRef.value.contains(event.target as Node)) {
      callback(event);
    }
  };
  
  // Добавляем обработчик на фазе захвата для перехвата события до того, как оно дойдет до элементов с stopPropagation
  onMounted(() => {
    document.addEventListener('click', handleClickOutside, { capture: true });
    // Также добавим обработчик для touch событий на мобильных устройствах
    document.addEventListener('touchend', handleClickOutside as EventListener, { capture: true });
  });
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside, { capture: true });
    document.removeEventListener('touchend', handleClickOutside as EventListener, { capture: true });
  });
  
  return {
    handleClickOutside
  };
}