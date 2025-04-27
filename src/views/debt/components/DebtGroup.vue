<template>
  <div class="debt-group" v-if="debts.length > 0">
    <!-- Заголовок группы -->
    <div class="group-header">
      <div class="group-title">{{ title }}</div>
      <div 
        class="group-total" 
        :class="{
          'negative': totalAmount < 0, 
          'positive': totalAmount > 0
        }"
      >
        {{ formattedTotal }}
      </div>
    </div>
    
    <!-- Список долгов -->
    <div class="debt-list">
      <DebtItem 
        v-for="debt in debts" 
        :key="debt.id"
        :debt="debt"
        :isPositive="isDebtPositive(debt)"
        :showIcon="showIcons"
        @click="$emit('itemClick', debt.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DebtItem from './DebtItem.vue';
import { type Debt } from '@/stores/debt/debtStore';
import { useFormatBalance } from '@/composables/transaction/useFormatBalance';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  debts: {
    type: Array as () => Debt[],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  isDebtPositive: {
    type: Function as () => (debt: Debt) => boolean,
    required: true
  },
  showIcons: {
    type: Boolean,
    default: false
  },
  currencySymbol: {
    type: [String, Object],
    default: '$'
  }
});

defineEmits(['itemClick']);

// Используем форматирование из useFormatBalance
const { formatBalance, getCurrencySymbol } = useFormatBalance();

// Получаем символ валюты пользователя
const currencySymbolValue = computed(() => {
  if (typeof props.currencySymbol === 'function') {
    return props.currencySymbol();
  }
  return props.currencySymbol as string;
});

// Отформатированная общая сумма в валюте пользователя
const formattedTotal = computed(() => {
  // Получаем валюту первого долга, или используем default USD
  const firstDebtCurrency = props.debts[0]?.currency || 'USD';
  
  // Форматируем с помощью useFormatBalance
  return formatBalance(props.totalAmount, 2, firstDebtCurrency, {
    symbol: currencySymbolValue.value,
    useAbbreviations: true,
    minValueToAbbreviate: 10000, // Начинаем сокращать с 10к
    showDecimalsOnWhole: false
  });
});
</script>

<style scoped>
.debt-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}

.group-title {
  font-size: var(--font-small-size);
  color: var(--text-usual);
}

.group-total {
  font-size: var(--font-small-size);
  font-weight: 500;
}

.group-total.negative {
  color: var(--maincolor-colorwarrning, #a44942);
}

.group-total.positive {
  color: var(--maincolor-colorsucces, #53b794);
}

.debt-list {
  background-color: var(--bg-field-dark);
  border-radius: 32px;
  overflow: hidden;
}
</style>