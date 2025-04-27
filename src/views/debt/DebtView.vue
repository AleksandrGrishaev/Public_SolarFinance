<template>
    <div class="debt-dashboard">
      <div class="debt-body">
        <!-- Верхняя часть с общей суммой и кнопкой добавления -->
        <div class="balance-section">
          <div class="balance-container">
            <span class="total-amount" :class="{'negative': totalDebtAmount < 0, 'positive': totalDebtAmount > 0}">
              {{ formatTotalInUserCurrency(totalDebtAmount) }}
            </span>
            <div class="dropdown-arrow" @click="toggleCurrencyFilter">
              <span class="currency-code">{{ userBaseCurrency }}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M5 6L0 0L10 0L5 6Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <AddIconButton @click="openAddDebtModal" />
        </div>
        
        <!-- Фильтр по владельцу долга -->
        <div class="owner-filter-section">
          <div class="owner-filter">
            <div 
              class="filter-option" 
              :class="{'active': selectedOwner === 'all'}"
              @click="setSelectedOwner('all')"
            >
              All
            </div>
            <div 
              class="filter-option" 
              :class="{'active': selectedOwner === 'my'}"
              @click="setSelectedOwner('my')"
            >
              My
            </div>
            <div 
              class="filter-option" 
              :class="{'active': selectedOwner === 'family'}"
              @click="setSelectedOwner('family')"
            >
              Family
            </div>
          </div>
        </div>
        
        <!-- Список долгов по группам -->
        <div class="debts-container">
          <!-- Долги по книгам -->
          <DebtGroup
            v-if="debtsByGroup['book'].length > 0"
            title="Books"
            :debts="debtsByGroup['book']"
            :totalAmount="totalByGroup['book']"
            :isDebtPositive="isDebtOwed"
            :currencySymbol="getUserCurrencySymbol"
            @itemClick="navigateToDebtDetails"
          />
          
          <!-- Долги с людьми -->
          <DebtGroup
            v-if="debtsByGroup['person'].length > 0"
            title="Persons"
            :debts="debtsByGroup['person']"
            :totalAmount="totalByGroup['person']"
            :isDebtPositive="isDebtOwed"
            :currencySymbol="getUserCurrencySymbol"
            @itemClick="navigateToDebtDetails"
          />
          
          <!-- Кредиты -->
          <DebtGroup
            v-if="debtsByGroup['credit'].length > 0"
            title="Credits"
            :debts="debtsByGroup['credit']"
            :totalAmount="totalByGroup['credit']"
            :isDebtPositive="isDebtOwed"
            :currencySymbol="getUserCurrencySymbol"
            :showIcons="true"
            @itemClick="navigateToDebtDetails"
          />
          
          <!-- Кнопка добавления нового долга -->
          <div class="add-debt-container">
            <CreateActionButton text="Add new" @click="openAddDebtModal" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import AddIconButton from '@/components/atoms/buttons/AddIconButton.vue';
  import CreateActionButton from '@/components/ui/buttons/CreateActionButton.vue';
  import { DebtGroup } from './components';
  import { useDebts } from './composables/useDebts';
  
  const router = useRouter();
  const {
    selectedOwner,
    totalDebtAmount,
    debtsByGroup,
    totalByGroup,
    userBaseCurrency,
    getUserCurrencySymbol,
    isDebtOwed,
    formatTotalInUserCurrency,
    setSelectedOwner,
    loadDebts
  } = useDebts();
  
  // Состояние для выбора валюты (для будущей функциональности)
  const showCurrencySelector = ref(false);
  
  // Обновляем заголовок и настройки в родительском IosLayout
  const updateHeaderSettings = () => {
    // Отправляем событие родительскому компоненту IosLayout
    router.currentRoute.value.meta.title = 'Debts';
    router.currentRoute.value.meta.header = {
      show: true,
      showBack: true,
      showMessageIcon: true,
      hasNotifications: true,
      showProfileIcon: true
    };
  };
  
  const toggleCurrencyFilter = () => {
    showCurrencySelector.value = !showCurrencySelector.value;
    console.log('Toggle currency filter:', showCurrencySelector.value);
    // TODO: Реализовать переключение валют для просмотра
  };
  
  const openAddDebtModal = () => {
    // TODO: Реализовать модальное окно для добавления долга
    console.log('Open add debt modal');
  };
  
  // Навигация к деталям долга с добавлением отладочной информации
  const navigateToDebtDetails = (debtId: string) => {
    console.log('Navigating to debt details with ID:', debtId);
    
    // Проверяем, что ID не undefined и не null
    if (!debtId) {
      console.error('Error: Trying to navigate with empty debtId');
      return;
    }
    
    // Проверяем, существует ли долг с таким ID
    const debt = debtsByGroup.value.book.find(d => d.id === debtId) ||
                 debtsByGroup.value.person.find(d => d.id === debtId) ||
                 debtsByGroup.value.credit.find(d => d.id === debtId);
    
    if (!debt) {
      console.warn(`Warning: Navigating to debt with ID ${debtId}, but no matching debt found in store`);
    } else {
      console.log('Found matching debt:', debt.name);
    }
    
    router.push(`/debt/${debtId}`);
  };
  
  // Инициализация данных
  onMounted(async () => {
    // Обновляем заголовок
    updateHeaderSettings();
    
    // Загружаем данные
    await loadDebts();
  });
  </script>
  
  <style scoped>
  .debt-dashboard {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bg-screen);
    color: var(--text-usual);
  }
  
  .debt-body {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  /* Стили для секции с общей суммой */
  .balance-section {
    padding: 16px 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
  
  .balance-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  
  .total-amount {
    font-size: var(--font-heading-size);
    font-weight: var(--font-heading-weight);
    line-height: var(--font-heading-line-height);
  }
  
  .total-amount.negative {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .total-amount.positive {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .dropdown-arrow {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-grey);
  }
  
  .currency-code {
    font-size: var(--font-small-size);
    color: var(--text-usual);
  }
  
  /* Стили для фильтра владельца */
  .owner-filter-section {
    padding: 8px 0;
    display: flex;
    justify-content: center;
  }
  
  .owner-filter {
    background-color: var(--bg-field-dark);
    border-radius: 28px;
    display: flex;
    padding: 6px;
    gap: 4px;
  }
  
  .filter-option {
    padding: 8px 16px;
    border-radius: 34px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-usual);
    cursor: pointer;
  }
  
  .filter-option.active {
    background-color: black;
    color: var(--text-contrast);
  }
  
  /* Стили для списка долгов */
  .debts-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 80px; /* Добавляем отступ снизу для навигационной панели */
  }
  
  /* Контейнер для кнопки добавления долга */
  .add-debt-container {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
  </style>