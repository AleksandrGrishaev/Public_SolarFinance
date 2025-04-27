<template>
    <div class="debt-dashboard">
      <div class="debt-body">
        <!-- Верхняя часть с общей суммой и кнопкой добавления -->
        <div class="balance-section">
          <div class="balance-container">
            <span class="total-amount" :class="{'negative': totalDebtAmount < 0, 'positive': totalDebtAmount > 0}">
              {{ formatCurrency(totalDebtAmount) }}
            </span>
            <div class="dropdown-arrow" @click="toggleCurrencyFilter">
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
            @itemClick="navigateToDebtDetails"
          />
          
          <!-- Долги с людьми -->
          <DebtGroup
            v-if="debtsByGroup['person'].length > 0"
            title="Persons"
            :debts="debtsByGroup['person']"
            :totalAmount="totalByGroup['person']"
            :isDebtPositive="isDebtOwed"
            @itemClick="navigateToDebtDetails"
          />
          
          <!-- Кредиты -->
          <DebtGroup
            v-if="debtsByGroup['credit'].length > 0"
            title="Credits"
            :debts="debtsByGroup['credit']"
            :totalAmount="totalByGroup['credit']"
            :isDebtPositive="isDebtOwed"
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
  import { onMounted } from 'vue';
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
    isDebtOwed,
    formatCurrency,
    setSelectedOwner,
    loadDebts
  } = useDebts();
  
  // Обновляем заголовок и настройки в родительском IosLayout
  const updateHeaderSettings = () => {
    // Отправляем событие родительскому компоненту IosLayout
    // для обновления настроек заголовка
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
    // TODO: Реализовать фильтрацию по валюте
    console.log('Toggle currency filter');
  };
  
  const openAddDebtModal = () => {
    // TODO: Реализовать модальное окно для добавления долга
    console.log('Open add debt modal');
  };
  
  const navigateToDebtDetails = (debtId: string) => {
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
    color: var(--text-grey);
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