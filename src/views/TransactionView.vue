<template>
    <div class="transaction-screen">
      <!-- Верхняя часть с суммой -->
      <div class="amount-display">
        <div class="currency-symbol">{{ selectedAccount.symbol }}</div>
        <div class="amount">{{ displayAmount }}</div>
      </div>
  
      <!-- Селектор книг -->
      <BookSelector 
        :selectedBook="selectedBook" 
        @select-book="handleBookSelect" 
      />
  
      <!-- Тип транзакции -->
      <TransactionTypeSelector 
        :selectedType="transactionType" 
        @select-type="transactionType = $event" 
      />
  
      <!-- Селектор счета -->
      <AccountSelector 
        :selectedAccount="selectedAccount"
        @select-account="handleAccountSelect"
      />
  
      <!-- Ползунок распределения между членами семьи -->
      <DistributionSlider 
        v-if="showDistributionSlider"
        :leftOwner="owners[0]"
        :rightOwner="owners[1]"
        :distribution="distribution"
        @update-distribution="handleDistributionUpdate"
      />
  
      <!-- Цифровая клавиатура -->
      <NumericKeypad 
        @input="handleNumericInput" 
        @delete="handleDelete" 
        @submit="handleSubmit" 
      />
  
      <!-- Нижняя навигация -->
      <BottomNavigation 
        :activeTab="'books'" 
        @change-tab="handleTabChange"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import BookSelector from '@/components/transactions/BookSelector.vue'
  import TransactionTypeSelector from '@/components/transactions/TransactionTypeSelector.vue'
  import AccountSelector from '@/components/transactions/AccountSelector.vue'
  import DistributionSlider from '@/components/transactions/DistributionSlider.vue'
  import NumericKeypad from '@/components/transactions/NumericKeypad.vue'
  import BottomNavigation from '@/components/navigations/BottomNavigation.vue'
  
  // Текущая сумма
  const amount = ref('')
  const displayAmount = computed(() => {
    if (!amount.value) return '0'
    return amount.value
  })
  
  // Книги учета
  const books = ref([
    { id: 'my', name: 'My', type: 'Personal' },
    { id: 'family', name: 'Family', type: 'Family' },
    { id: 'wife', name: 'Wife', type: 'Personal' }
  ])
  const selectedBook = ref(books.value[1]) // По умолчанию Family
  
  // Тип транзакции (расход, доход, перевод)
  const transactionType = ref('expense') // expense, income, transfer
  
  // Счета
  const accounts = ref([
    { id: 'dollar', name: 'Dollar', symbol: '$', code: 'USD' },
    { id: 'euro', name: 'Euro', symbol: '€', code: 'EUR' },
    { id: 'ruble', name: 'Ruble', symbol: '₽', code: 'RUB' }
  ])
  const selectedAccount = ref(accounts.value[0]) // По умолчанию Dollar
  
  // Владельцы для распределения
  const owners = ref([
    { id: 'user', name: 'Alex', percentage: 50 },
    { id: 'wife', name: 'Wife', percentage: 50 }
  ])
  
  // Распределение между владельцами
  const distribution = ref(50) // 50% означает равное распределение
  
  // Показывать ли слайдер распределения (только для Family книги)
  const showDistributionSlider = computed(() => {
    return selectedBook.value.type === 'Family'
  })
  
  // Обработчики событий
  const handleBookSelect = (book) => {
    selectedBook.value = book
  }
  
  const handleAccountSelect = (account) => {
    selectedAccount.value = account
  }
  
  const handleDistributionUpdate = (value) => {
    distribution.value = value
    owners.value[0].percentage = value
    owners.value[1].percentage = 100 - value
  }
  
  const handleNumericInput = (value) => {
    // Ограничение на длину числа
    if (amount.value.length >= 9) return
  
    // Обработка десятичной точки
    if (value === '.' && amount.value.includes('.')) return
    
    // Добавление числа или точки
    amount.value += value
  }
  
  const handleDelete = () => {
    amount.value = amount.value.slice(0, -1)
  }
  
  const handleSubmit = () => {
    // Логика сохранения транзакции
    console.log('Submit transaction:', {
      amount: parseFloat(amount.value) || 0,
      book: selectedBook.value,
      type: transactionType.value,
      account: selectedAccount.value,
      distribution: owners.value
    })
    
    // Сброс формы после отправки
    amount.value = ''
  }
  
  const handleTabChange = (tab) => {
    console.log('Changed tab to:', tab)
    // Здесь будет логика навигации между вкладками
  }
  </script>
  
  <style scoped>
  .transaction-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #121212;
    color: white;
    padding: 20px;
  }
  
  .amount-display {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    margin-bottom: 20px;
  }
  
  .currency-symbol {
    font-size: 32px;
    margin-right: 8px;
  }
  
  .amount {
    font-size: 48px;
    font-weight: 300;
  }
  </style>