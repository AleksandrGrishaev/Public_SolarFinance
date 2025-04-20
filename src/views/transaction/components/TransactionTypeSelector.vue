<!-- src/views/transaction/components/TransactionTypeSelector.vue -->
<template>
  <div class="selector-wrapper">
    <div class="transaction-selector">
      <!-- Контейнер для элементов -->
      <div class="items-container">
        <div 
          v-for="item in displayedTypes" 
          :key="item.id"
          class="selector-item"
          :class="{ 'active': selectedType === item.id }"
          @click="handleItemClick(item)"
        >
          {{ item.name }}
        </div>
      </div>
      
      <!-- Иконка переключения наборов типов -->
      <div class="toggle-button" @click="toggleTypeSet">
        <div class="toggle-icon" :class="{ 'rotated': isSecondSetActive }">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="icon">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { 
  TransactionType, 
  PRIMARY_TRANSACTION_TYPES, 
  SECONDARY_TRANSACTION_TYPES,
  isSecondaryTransactionType 
} from '../../../constants/transactionTypes';

const props = defineProps({
  modelValue: {
    type: String as () => TransactionType,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Локальное состояние для отслеживания активного набора типов
const isSecondSetActive = ref(false);

// Отображаемые типы в зависимости от активного набора
const displayedTypes = computed(() => {
  return isSecondSetActive.value 
    ? SECONDARY_TRANSACTION_TYPES 
    : PRIMARY_TRANSACTION_TYPES;
});

// Используем modelValue напрямую для упрощения
const selectedType = computed(() => props.modelValue);

// Переключение между наборами типов транзакций
const toggleTypeSet = () => {
  isSecondSetActive.value = !isSecondSetActive.value;
  
  // Если выбранный элемент не отображается в текущем наборе, выбираем первый доступный
  const currentTypeIds = displayedTypes.value.map(type => type.id);
  if (!currentTypeIds.includes(selectedType.value)) {
    const newType = displayedTypes.value[0];
    emit('update:modelValue', newType.id);
    console.log('Автоматический выбор типа при переключении набора:', newType);
  }
};

// Обработчик клика по элементу
const handleItemClick = (item) => {
  console.log('Выбран тип транзакции:', item);
  updateValue(item.id);
};

// Метод для обновления значения в родительском компоненте
const updateValue = (value: TransactionType) => {
  emit('update:modelValue', value);
};

// При изменении типа транзакции извне, переключаем активный набор если необходимо
watch(() => props.modelValue, (newValue) => {
  // Находим объект типа транзакции для вывода в консоль
  const selectedTypeObj = [...PRIMARY_TRANSACTION_TYPES, ...SECONDARY_TRANSACTION_TYPES]
    .find(type => type.id === newValue);
  
  console.log('Изменение типа транзакции (извне):', selectedTypeObj);
  
  const shouldBeSecondSet = isSecondaryTransactionType(newValue);
  if (shouldBeSecondSet !== isSecondSetActive.value) {
    isSecondSetActive.value = shouldBeSecondSet;
    console.log('Переключение набора на:', shouldBeSecondSet ? 'дополнительный' : 'основной');
  }
}, { immediate: true });
</script>

<style scoped>
/* Обертка для центрирования */
.selector-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.transaction-selector {
  display: inline-flex;
  align-items: center;
  background-color: var(--bg-light, #949496);
  border-radius: var(--border-radius-lg, 28px);
  padding: 0 2px 0 0px;
  gap: 6px;
  max-width: 100%;
}

.items-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px;
  border-radius: var(--border-radius-lg, 28px);
  gap: var(--spacing-xs, 4px);
  background-color: var(--bg-contrast, #444444);
  box-shadow: var(--shadow-tabs, 0px 4px 4px rgba(0, 0, 0, 0.25));
  overflow-x: auto;
}

.selector-item {
  height: 28px;
  padding: 4px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius-xl, 34px);
  font-size: var(--font-small-size, 12px);
  font-weight: var(--font-small-weight, 400);
  line-height: var(--font-small-line-height, 16px);
  white-space: nowrap;
  color: var(--text-usual);
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) var(--transition-fn, ease);
}

.selector-item:hover {
  opacity: var(--state-hover-opacity, 0.8);
}

.selector-item.active {
  background-color: var(--bg-item-selected, #000000);
  color: var(--text-contrast, white);
}

.toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-contrast, #444444);
  color: var(--text-usual, #F5F5F5);
  transition: all var(--transition-speed, 0.2s) var(--transition-fn, ease);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-speed, 0.2s) var(--transition-fn, ease);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.toggle-button:hover {
  opacity: var(--state-hover-opacity, 0.8);
}

.toggle-button:active {
  opacity: var(--state-active-opacity, 0.6);
}

.icon {
  color: inherit;
}
</style>