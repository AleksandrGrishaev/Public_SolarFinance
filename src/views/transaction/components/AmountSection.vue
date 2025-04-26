<!-- src/views/transaction/components/AmountSection.vue -->
<template>
  <div class="amount-section" :class="{ 'transfer-mode': isTransferWithDifferentCurrencies }">
    <!-- Стандартное отображение для обычных транзакций -->
    <div v-if="!isTransferWithDifferentCurrencies" class="standard-amount">
      <div class="currency-wrapper">
        <div class="currency-symbol">{{ sourceCurrencySymbol }}</div>
        <div class="amount-input">{{ amount }}</div>
      </div>
    </div>
    
    <!-- Отображение с конвертацией для переводов между разными валютами -->
    <div v-else class="currency-conversion">
      <!-- Исходная сумма (активная по умолчанию) -->
      <div 
        class="source-amount"
        :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }"
        @click="switchToSourceAmount"
      >
        <div class="currency-wrapper">
          <div class="currency-symbol" :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }">
            {{ sourceCurrencySymbol }}
          </div>
          <div class="amount-input" :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }">
            {{ amount }}
          </div>
        </div>
      </div>
      
      <!-- Конвертированная сумма (неактивная по умолчанию) -->
      <div 
        class="destination-amount"
        :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }"
        @click="switchToDestinationAmount"
      >
        <div class="currency-wrapper">
          <div 
            class="currency-symbol" 
            :class="{ 
              'active': !isSourceAmountActive, 
              'inactive': isSourceAmountActive,
              'smaller-font': useSmallerDestinationFont
            }"
          >
            {{ destinationCurrencySymbol }}
          </div>
          <div 
            class="amount-input" 
            :class="{ 
              'active': !isSourceAmountActive, 
              'inactive': isSourceAmountActive,
              'smaller-font': useSmallerDestinationFont
            }"
          >
            {{ isSourceAmountActive ? convertedAmount : manualDestinationAmount }}
          </div>
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
  },
  useSmallerDestinationFont: {
    type: Boolean,
    default: false
  },
  isSourceActive: {
    type: Boolean,
    default: true
  },
  manualDestinationAmount: {
    type: String,
    default: '0'
  }
});

const emit = defineEmits(['sourceActive', 'destinationActive', 'updateDestinationAmount']);

// Состояние для управления вводом суммы
// Теперь мы используем локальное состояние, но синхронизируем его с пропсами
const isSourceAmountActive = ref(props.isSourceActive);
const localManualDestinationAmount = ref(props.manualDestinationAmount);

// Следим за изменениями в пропсах и обновляем локальное состояние
watch(() => props.isSourceActive, (newValue) => {
  if (isSourceAmountActive.value !== newValue) {
    isSourceAmountActive.value = newValue;
  }
}, { immediate: true });  // Immediate true для инициализации

watch(() => props.manualDestinationAmount, (newValue) => {
  if (localManualDestinationAmount.value !== newValue) {
    localManualDestinationAmount.value = newValue;
  }
}, { immediate: true });  // Immediate true для инициализации

// Следим за изменениями в конвертированной сумме и обновляем мануальную сумму,
// только если активен ввод исходной суммы
watch(() => props.convertedAmount, (newValue) => {
  if (isSourceAmountActive.value) {
    localManualDestinationAmount.value = newValue;
    emit('updateDestinationAmount', newValue);
  }
});

// Переключение к вводу исходной суммы
const switchToSourceAmount = () => {
  if (!isSourceAmountActive.value) {
    isSourceAmountActive.value = true;
    emit('sourceActive');
  }
};

// Переключение к вводу суммы назначения
const switchToDestinationAmount = () => {
  if (isSourceAmountActive.value) {
    isSourceAmountActive.value = false;
    
    // Сохраняем текущее значение для более удобного редактирования
    if (localManualDestinationAmount.value === '0') {
      localManualDestinationAmount.value = props.convertedAmount;
    }
    
    emit('destinationActive', localManualDestinationAmount.value);
  }
};

// Обновление значения мануальной суммы
const updateManualAmount = (value) => {
  localManualDestinationAmount.value = value;
  emit('updateDestinationAmount', value);
};

// Экспортируем методы и свойства для внешнего использования
defineExpose({
  isSourceAmountActive,
  manualDestinationAmount: localManualDestinationAmount,
  updateManualAmount,
  switchToSourceAmount,
  switchToDestinationAmount
});
</script>

<style scoped>
.amount-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 30px 0 20px;
  position: relative;
  transition: all 0.3s ease;
}

/* Стандартное отображение суммы */
.standard-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Стили для конвертации валют */
.currency-conversion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.source-amount, .destination-amount {
  display: flex;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

/* Обертка для символа валюты и суммы для выравнивания */
.currency-wrapper {
  display: flex;
  align-items: flex-start;
  position: relative;
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
  transition: all 0.2s ease;
  position: relative;
  top: 10px; /* Фиксированная позиция символа валюты */
  margin-right: 5px;
}

.amount-input {
  font-size: 64px;
  font-weight: 300;
  line-height: 64px;
  transition: all 0.2s ease;
}

/* Стили для меньшего шрифта в сумме назначения */
.amount-input.smaller-font {
  font-size: 48px;
  line-height: 48px;
}

.currency-symbol.smaller-font {
  font-size: 22px;
  line-height: 22px;
  top: 8px; /* Немного меньше отступ для меньшего символа */
}
</style>