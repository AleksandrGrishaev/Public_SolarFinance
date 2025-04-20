// src/views/transaction/composables/useDistributionControl.ts
import { ref, computed, watch } from 'vue';

/**
 * Композабл для управления отображением слайдера распределения
 * Расширяет функциональность useDistribution, добавляя возможность
 * явного переключения видимости слайдера через UI
 */
export function useDistributionControl(shouldShowDistribution, selectedTypeRef, distributionOwners = null) {
  // Состояние для ручного переключения видимости слайдера
  const isSliderManuallyVisible = ref(false);
  
  // Флаг, указывающий, нужно ли показывать иконку переключения
  const showDistributionToggle = computed(() => {
    // Показываем иконку переключения только для доходов и расходов, но не для переводов
    return selectedTypeRef.value !== 'transfer';
  });
  
  // Проверяем, есть ли данные для распределения
  const hasDistributionData = computed(() => {
    if (!distributionOwners) return shouldShowDistribution.value;
    
    // Проверяем, что у нас есть хотя бы два владельца для распределения
    return distributionOwners.value && 
           Array.isArray(distributionOwners.value) && 
           distributionOwners.value.length >= 2;
  });
  
  // Конечная видимость слайдера: показываем, если он должен быть виден 
  // по умолчанию ИЛИ если пользователь явно включил его
  const isSliderVisible = computed(() => {
    // Если это перевод, всегда скрываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если у нас нет данных для распределения и пользователь не включил слайдер вручную,
    // скрываем его
    if (!hasDistributionData.value && !isSliderManuallyVisible.value) return false;
    
    // В остальных случаях показываем слайдер, если он должен быть виден
    // по умолчанию или если пользователь включил его вручную
    return shouldShowDistribution.value || isSliderManuallyVisible.value;
  });
  
  // Обработчик переключения отображения слайдера
  const toggleDistributionVisibility = () => {
    // Если у нас нет данных для распределения, не разрешаем включать слайдер
    if (!hasDistributionData.value && !isSliderManuallyVisible.value) {
      console.log('[useDistributionControl] Cannot show slider: no distribution data available');
      return;
    }
    
    isSliderManuallyVisible.value = !isSliderManuallyVisible.value;
    console.log('[useDistributionControl] Slider visibility toggled:', isSliderManuallyVisible.value);
  };
  
  // Сбрасываем ручную видимость при изменении типа транзакции
  watch(selectedTypeRef, (newType) => {
    console.log('[useDistributionControl] Transaction type changed:', newType);
    isSliderManuallyVisible.value = false;
  });
  
  // Сбрасываем ручную видимость также при изменении данных распределения
  if (distributionOwners) {
    watch(distributionOwners, (newOwners) => {
      console.log('[useDistributionControl] Distribution owners changed:', newOwners?.length || 0);
      // Если больше нет данных для распределения, скрываем слайдер
      if (!hasDistributionData.value) {
        isSliderManuallyVisible.value = false;
      }
    });
  }
  
  return {
    isSliderVisible,
    showDistributionToggle,
    toggleDistributionVisibility,
    hasDistributionData
  };
}