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
  
  // Ведем отдельное состояние для отслеживания того, что пользователь
  // явно скрыл слайдер (даже если он должен показываться по умолчанию)
  const isManuallyHidden = ref(false);
  
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
  
  // Конечная видимость слайдера: показываем только если:
  // 1. Это не перевод
  // 2. Есть данные для распределения
  // 3. И слайдер НЕ был явно скрыт пользователем ИЛИ был явно показан
  const isSliderVisible = computed(() => {
    // Если это перевод, всегда скрываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если у нас нет данных для распределения, скрываем слайдер
    if (!hasDistributionData.value) return false;
    
    // Если пользователь явно переключил состояние слайдера, 
    // уважаем его выбор (isSliderManuallyVisible)
    if (isManuallyHidden.value || isSliderManuallyVisible.value) {
      return isSliderManuallyVisible.value;
    }
    
    // В остальных случаях используем автоматическое поведение
    return shouldShowDistribution.value;
  });
  
  // Обработчик переключения отображения слайдера
  const toggleDistributionVisibility = () => {
    // Если у нас нет данных для распределения, не разрешаем включать слайдер
    if (!hasDistributionData.value && !isSliderManuallyVisible.value) {
      console.log('[useDistributionControl] Cannot show slider: no distribution data available');
      return;
    }
    
    // Когда пользователь впервые нажимает на кнопку, если слайдер виден,
    // то мы просто скрываем его, запоминая что это было ручное действие
    if (isSliderVisible.value && !isManuallyHidden.value && !isSliderManuallyVisible.value) {
      isManuallyHidden.value = true;
      isSliderManuallyVisible.value = false;
    } else {
      // После первого переключения, просто меняем значение isSliderManuallyVisible
      isSliderManuallyVisible.value = !isSliderManuallyVisible.value;
      isManuallyHidden.value = !isSliderManuallyVisible.value;
    }
    
    console.log('[useDistributionControl] Slider visibility toggled:', 
                'manually visible =', isSliderManuallyVisible.value,
                'manually hidden =', isManuallyHidden.value);
    console.log('[useDistributionControl] Current values:', 
                'shouldShowDistribution =', shouldShowDistribution.value, 
                'hasDistributionData =', hasDistributionData.value, 
                'final visibility =', isSliderVisible.value);
  };
  
  // Сбрасываем ручную видимость при изменении типа транзакции
  watch(selectedTypeRef, (newType) => {
    console.log('[useDistributionControl] Transaction type changed:', newType);
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
  });
  
  // Сбрасываем ручную видимость также при изменении данных распределения
  if (distributionOwners) {
    watch(distributionOwners, (newOwners) => {
      console.log('[useDistributionControl] Distribution owners changed:', newOwners?.length || 0);
      // Если больше нет данных для распределения, сбрасываем состояние
      if (!hasDistributionData.value) {
        isSliderManuallyVisible.value = false;
        isManuallyHidden.value = false;
      }
    });
  }
  
  // Сбрасываем ручные настройки при смене книги (когда изменяется shouldShowDistribution)
  watch(() => shouldShowDistribution.value, (newValue) => {
    console.log('[useDistributionControl] shouldShowDistribution changed:', newValue);
    // Сбрасываем ручные настройки
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
  });
  
  return {
    isSliderVisible,
    showDistributionToggle,
    toggleDistributionVisibility,
    hasDistributionData
  };
}