<!-- src/views/transaction/components/TransactionTypeSelector.vue -->
<template>
    <BaseTransactionSelector
      v-model="selectedType"
      :items="primaryTypes"
      :secondItems="secondaryTypes"
      :multiSelect="false"
      @update:modelValue="updateValue"
      @set-changed="handleSetChanged"
    />
  </template>
  
  <script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useSystemStore } from '../../../stores/system';
  import BaseTransactionSelector from '../../../components/ui/selectors/BaseTransactionSelector.vue';
  
  const props = defineProps({
    types: {
      type: Array as () => Array<{ id: string, name: string }>,
      required: false,
      default: () => []
    },
    modelValue: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  // Создаем локальную реактивную переменную для хранения значения селектора
  const selectedType = ref(props.modelValue);
  
  // Отслеживаем, какой набор типов активен
  const isSecondSetActive = ref(false);
  
  // Используем системное хранилище
  const systemStore = useSystemStore();
  
  // Получаем все типы транзакций
  const allTransactionTypes = computed(() => {
    // Если передан массив types в props, используем его
    if (props.types.length > 0) {
      return props.types;
    }
    
    // Иначе получаем из хранилища
    return systemStore.allTransactionTypes || [];
  });
  
  // Разделяем типы транзакций на два набора: 
  // Первый набор: income, expense, transfer
  // Второй набор: debt, correction, exchange
  const primaryTypes = computed(() => {
    return allTransactionTypes.value.filter(type => 
      ['income', 'expense', 'transfer'].includes(type.id)
    );
  });
  
  const secondaryTypes = computed(() => {
    return allTransactionTypes.value.filter(type => 
      ['debt', 'correction', 'exchange'].includes(type.id)
    );
  });
  
  // Проверяем, принадлежит ли текущий выбранный тип ко второму набору
  watch(() => props.modelValue, (newValue) => {
    const isSecondary = secondaryTypes.value.some(type => type.id === newValue);
    isSecondSetActive.value = isSecondary;
    selectedType.value = newValue;
  }, { immediate: true });
  
  // Обработчик изменения активного набора типов
  const handleSetChanged = (isSecondSet) => {
    isSecondSetActive.value = isSecondSet;
  };
  
  // Метод для обновления значения в родительском компоненте
  const updateValue = (value) => {
    emit('update:modelValue', value);
  };
  
  // Обновляем локальное значение при изменении modelValue
  watch(() => props.modelValue, (newValue) => {
    selectedType.value = newValue;
  }, { immediate: true });
  </script>