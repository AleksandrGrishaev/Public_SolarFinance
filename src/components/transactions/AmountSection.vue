<!-- src/components/transactions/AmountSection.vue -->
<template>
    <div class="amount-section" :class="{ 'transfer-mode': isTransferWithDifferentCurrencies }">
      <!-- Стандартное отображение для обычных транзакций -->
      <div v-if="!isTransferWithDifferentCurrencies" class="standard-amount">
        <div class="currency-symbol">{{ sourceCurrencySymbol }}</div>
        <div class="amount-input">{{ amount }}</div>
      </div>
      
      <!-- Отображение с конвертацией для переводов между разными валютами -->
      <div v-else class="currency-conversion">
        <!-- Исходная сумма (активная по умолчанию) -->
        <div 
          class="source-amount" 
          :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }"
          @click="switchToSourceAmount"
        >
          <div class="currency-symbol" :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }">
            {{ sourceCurrencySymbol }}
          </div>
          <div class="amount-input" :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }">
            {{ amount }}
          </div>
        </div>
        
        <!-- Разделитель между суммами -->
        <div class="conversion-arrow">→</div>
        
        <!-- Конвертированная сумма (неактивная по умолчанию) -->
        <div 
          class="destination-amount" 
          :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }"
          @click="switchToDestinationAmount"
        >
          <div class="currency-symbol" :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }">
            {{ destinationCurrencySymbol }}
          </div>
          <div class="amount-input" :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }">
            {{ isSourceAmountActive ? convertedAmount : manualDestinationAmount }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, defineEmits, watch } from 'vue';
  
  const props = defineProps({
    amount: {
      type: String,
      required: true
    },
    sourceCurrencySymbol: {
      type: String,
      default: '$'
    },
    destinationCurrencySymbol: {
      type: String,
      default: '$'
    },
    convertedAmount: {
      type: String,
      default: '0'
    },
    isTransferWithDifferentCurrencies: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['sourceActive', 'destinationActive', 'updateDestinationAmount']);
  
  // Состояние для управления вводом суммы
  const isSourceAmountActive = ref(true);
  const manualDestinationAmount = ref('0');
  
  // Переключение к вводу исходной суммы
  const switchToSourceAmount = () => {
    isSourceAmountActive.value = true;
    emit('sourceActive');
  };
  
  // Переключение к вводу суммы назначения
  const switchToDestinationAmount = () => {
    isSourceAmountActive.value = false;
    
    // При первом переключении установим текущее конвертированное значение
    if (manualDestinationAmount.value === '0') {
      manualDestinationAmount.value = props.convertedAmount;
    }
    
    emit('destinationActive', manualDestinationAmount.value);
  };
  
  // Обновляем manualDestinationAmount, когда меняется convertedAmount
  watch(() => props.convertedAmount, (newValue) => {
    if (isSourceAmountActive.value) {
      manualDestinationAmount.value = newValue;
    }
  });
  
  // Экспортируем методы для внешнего использования
  defineExpose({
    isSourceAmountActive,
    manualDestinationAmount,
    updateManualAmount(value: string) {
      manualDestinationAmount.value = value;
      emit('updateDestinationAmount', value);
    }
  });
  </script>
  
  <style scoped>
  .amount-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 20px 0;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .amount-section.transfer-mode {
    padding: 0;
  }
  
  /* Стандартное отображение суммы */
  .standard-amount {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px 0;
  }
  
  /* Стили для конвертации валют */
  .currency-conversion {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 0;
  }
  
  .source-amount, .destination-amount {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    justify-content: center;
  }
  
  .conversion-arrow {
    color: #949496;
    font-size: 24px;
  }
  
  /* Стили для активной/неактивной суммы */
  .currency-symbol.active, .amount-input.active {
    color: white;
  }
  
  .currency-symbol.inactive, .amount-input.inactive {
    color: #949496;
  }
  
  .currency-symbol {
    font-size: 28px;
    font-weight: 300;
    line-height: 28px;
    transition: color 0.2s ease;
  }
  
  .amount-input {
    font-size: 64px;
    font-weight: 300;
    line-height: 64px;
    transition: color 0.2s ease;
  }
  </style>