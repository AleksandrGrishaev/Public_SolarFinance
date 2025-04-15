<!-- src/components/transactions/TransactionItem.vue -->
<template>
    <div 
      class="transaction-item"
      :class="{ 'with-border': withBorder }"
      @click="$emit('click', transaction)"
    >
      <!-- Иконка -->
      <div class="transaction-icon">
        <div v-if="iconComponent" class="icon-wrapper" :style="iconBackgroundStyle">
          <component :is="iconComponent" :size="24" color="white" />
        </div>
        <div v-else class="icon-placeholder"></div>
      </div>
      
      <!-- Название и данные -->
      <div class="transaction-name">
        <div class="transaction-title">{{ title }}</div>
        <div class="transaction-subtitle">{{ subtitle }}</div>
      </div>
      
      <!-- Сумма и счет -->
      <div class="transaction-amount">
        <div class="amount" :class="{ 'negative': isNegative, 'positive': !isNegative }">
          {{ formattedAmount }}
        </div>
        <div class="account-name">{{ accountName }}</div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { 
    IconWallet, 
    IconCreditCard, 
    IconCash, 
    IconHome, 
    IconBuildingBank,
    IconShoppingCart,
    IconDeviceTv,
    IconCoin
  } from '@tabler/icons-vue';
  
  const props = defineProps({
    transaction: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    accountName: {
      type: String,
      default: ''
    },
    iconName: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: '#D9D9D9'
    },
    withBorder: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['click']);
  
  // Иконка транзакции на основе iconName
  const iconComponent = computed(() => {
    const iconMap = {
      'wallet': IconWallet,
      'card': IconCreditCard,
      'cash': IconCash,
      'home': IconHome,
      'bank': IconBuildingBank,
      'shopping': IconShoppingCart,
      'entertainment': IconDeviceTv,
      'coin': IconCoin
    };
    
    return props.iconName ? iconMap[props.iconName] : null;
  });
  
  // Стиль фона иконки
  const iconBackgroundStyle = computed(() => ({
    backgroundColor: props.iconColor
  }));
  
  // Отрицательная ли сумма
  const isNegative = computed(() => props.transaction.amount < 0);
  
  // Форматированная сумма
  const formattedAmount = computed(() => {
    const prefix = isNegative.value ? '-' : '';
    const absAmount = Math.abs(props.transaction.amount);
    
    // Форматирование с разделителями тысяч
    const currency = props.transaction.currency || 'Rp';
    return `${prefix}${currency} ${absAmount.toLocaleString('id-ID')}`;
  });
  </script>
  
  <style scoped>
  .transaction-item {
    padding: 6px 20px 6px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .transaction-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .transaction-item.with-border {
    border-bottom: 0.5px solid #949496;
  }
  
  .transaction-icon {
    width: 37px;
    height: 54px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .icon-wrapper {
    width: 37px;
    height: 37px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .icon-placeholder {
    width: 37px;
    height: 37px;
    background: #D9D9D9;
    border-radius: 50%;
  }
  
  .transaction-name {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .transaction-title {
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  .transaction-subtitle {
    color: white;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
  
  .transaction-amount {
    width: 88px;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  
  .amount {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  .amount.negative {
    color: #A44942;
  }
  
  .amount.negative::before {
    content: "";
    width: 3.27px;
    height: 1.06px;
    background: #A44942;
    margin-right: 2px;
  }
  
  .amount.positive {
    color: #53B794;
  }
  
  .account-name {
    width: 100%;
    text-align: right;
    color: white;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
  </style>