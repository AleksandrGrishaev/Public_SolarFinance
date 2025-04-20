// src/views/transaction/composables/useDistributionControl.ts
import { ref, computed, watch } from 'vue';

/**
 * Композабл для управления отображением слайдера распределения
 * Расширяет функциональность useDistribution, добавляя возможность
 * явного переключения видимости слайдера через UI
 */
export function useDistributionControl(shouldShowDistribution, selectedTypeRef) {
  // Состояние для ручного переключения видимости слайдера
  const isSliderManuallyVisible = ref(false);
  
  // Флаг, указывающий, нужно ли показывать иконку переключения
  const showDistributionToggle = computed(() => {
    // Показываем иконку переключения только для доходов и расходов, но не для переводов
    return selectedTypeRef.value !== 'transfer';
  });
  
  // Конечная видимость слайдера: показываем, если он должен быть виден 
  // по умолчанию ИЛИ если пользователь явно включил его
  const isSliderVisible = computed(() => {
    return shouldShowDistribution.value || isSliderManuallyVisible.value;
  });
  
  // Обработчик переключения отображения слайдера
  const toggleDistributionVisibility = () => {
    isSliderManuallyVisible.value = !isSliderManuallyVisible.value;
  };
  
  // Сбрасываем ручную видимость при изменении типа транзакции
  watch(selectedTypeRef, () => {
    isSliderManuallyVisible.value = false;
  });
  
  return {
    isSliderVisible,
    showDistributionToggle,
    toggleDistributionVisibility
  };
}