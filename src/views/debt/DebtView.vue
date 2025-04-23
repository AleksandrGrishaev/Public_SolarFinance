<!-- src/views/debt/DebtView.vue -->
<template>
    <div class="debt-view">
      <div class="debt-view__header">
        <app-top-header
          title="Долги"
          :showBackButton="false"
          :hasNotifications="true"
          :showMessageIcon="true"
          :showProfileIcon="true"
        />
      </div>
      
      <div class="debt-view__filters">
        <div class="filter-section">
          <button 
            v-for="status in statusFilters" 
            :key="status.value"
            class="filter-button" 
            :class="{ active: selectedStatus === status.value }"
            @click="toggleStatusFilter(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
        
        <div class="filter-section">
          <div class="filter-dropdown">
            <select v-model="selectedCurrency" @change="filterByCurrency(selectedCurrency)">
              <option value="">Все валюты</option>
              <option v-for="currency in debtCurrencies" :key="currency" :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>
          
          <div class="filter-dropdown">
            <select v-model="selectedBookId" @change="filterByBook(selectedBookId)">
              <option value="">Все книги</option>
              <option v-for="book in availableBooks" :key="book.id" :value="book.id">
                {{ book.name }}
              </option>
            </select>
          </div>
          
          <button class="filter-button reset-button" @click="resetFilters">
            Сбросить
          </button>
        </div>
      </div>
      
      <div class="debt-view__content">
        <div class="debt-balance-cards">
          <div 
            v-for="(balance, currency) in formattedDebtBalance" 
            :key="currency" 
            class="balance-card"
            :class="getBalanceCardClass(debtBalance[currency])"
          >
            <div class="balance-amount">{{ balance }}</div>
            <div class="balance-currency">{{ currency }}</div>
          </div>
        </div>
        
        <div class="debt-tabs">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            Все долги
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'my-debts' }"
            @click="activeTab = 'my-debts'"
          >
            Я должен
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'debts-to-me' }"
            @click="activeTab = 'debts-to-me'"
          >
            Мне должны
          </div>
        </div>
        
        <div class="debt-list-container">
          <debt-list
            :debts="currentTabDebts"
            :isLoading="isLoading"
            @select-debt="selectDebt"
            @add-debt="openAddDebtDialog"
          />
        </div>
      </div>
      
      <!-- Диалоговые окна -->
      <base-floating-popup
        v-model="showDebtDetailDialog"
        position="center"
        :max-width="'500px'"
        :max-height="'90vh'"
      >
        <debt-detail
          :debt="selectedDebt"
          @add-payment="openPaymentDialog"
          @cancel-debt="openCancelDebtDialog"
          @close="closeDebtDetailDialog"
        />
      </base-floating-popup>
      
      <base-floating-popup
        v-model="showAddDebtDialog"
        position="center"
        :max-width="'600px'"
        :max-height="'90vh'"
      >
        <debt-add-form
          @submit="handleAddDebt"
          @cancel="closeAddDebtDialog"
        />
      </base-floating-popup>
      
      <base-floating-popup
        v-model="showPaymentDialog"
        position="center"
        :max-width="'500px'"
      >
        <debt-payment-form
          :debt="selectedDebt"
          @submit="handleAddPayment"
          @cancel="closePaymentDialog"
        />
      </base-floating-popup>
      
      <base-floating-popup
        v-model="showCancelDebtDialog"
        position="center"
        :max-width="'400px'"
      >
        <div class="cancel-debt-dialog">
          <h2>Отменить долг</h2>
          <p>Вы уверены, что хотите отменить этот долг?</p>
          <div class="reason-input">
            <label for="cancel-reason">Причина отмены (опционально):</label>
            <textarea
              id="cancel-reason"
              v-model="cancelReason"
              class="form-textarea"
              rows="2"
              placeholder="Укажите причину отмены долга"
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button 
              class="dialog-button secondary-button" 
              @click="closeCancelDebtDialog"
            >
              Отмена
            </button>
            <button 
              class="dialog-button primary-button"
              @click="handleCancelDebt"
            >
              Подтвердить
            </button>
          </div>
        </div>
      </base-floating-popup>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch } from 'vue';
  import { useDebts } from './composables/useDebts';
  import { useBookStore } from '@/stores/book';
  import AppTopHeader from '@/components/navigation/AppTopHeader.vue';
  import BaseFloatingPopup from '@/components/organisms/popups/BaseFloatingPopup.vue';
  import DebtList from './components/DebtList.vue';
  import DebtDetail from './components/DebtDetail.vue';
  import DebtAddForm from './components/DebtAddForm.vue';
  import DebtPaymentForm from './components/DebtPaymentForm.vue';
  import type { DebtStatus } from '@/stores/debt/types';
  
  type ActiveTab = 'all' | 'my-debts' | 'debts-to-me';
  
  export default defineComponent({
    name: 'DebtView',
    components: {
      AppTopHeader,
      BaseFloatingPopup,
      DebtList,
      DebtDetail,
      DebtAddForm,
      DebtPaymentForm
    },
    setup() {
      const bookStore = useBookStore();
      const {
        // Состояние
        isLoading,
        selectedDebt,
        selectedStatus,
        selectedCurrency,
        selectedBookId,
        
        // Диалоги
        showAddDebtDialog,
        showPaymentDialog,
        showDebtDetailDialog,
        showCancelDebtDialog,
        
        // Данные
        allDebts,
        activeDebts,
        debtsByCurrentUser,
        debtsToCurrentUser,
        filteredDebts,
        debtBalance,
        formattedDebtBalance,
        debtCurrencies,
        
        // Функции
        selectDebt,
        filterByStatus,
        filterByCurrency,
        filterByBook,
        resetFilters,
        openAddDebtDialog,
        closeAddDebtDialog,
        addDebt,
        openPaymentDialog,
        closePaymentDialog,
        addPayment,
        openCancelDebtDialog,
        closeCancelDebtDialog,
        cancelDebt,
        closeDebtDetailDialog
      } = useDebts();
      
      // Доступные статусы для фильтрации
      const statusFilters = [
        { value: null, label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'partially_paid', label: 'Частично оплаченные' },
        { value: 'paid', label: 'Оплаченные' },
        { value: 'cancelled', label: 'Отмененные' }
      ];
      
      // Доступные книги
      const availableBooks = computed(() => {
        return bookStore.books.filter(book => book.isActive);
      });
      
      // Активная вкладка (все долги, я должен, мне должны)
      const activeTab = ref<ActiveTab>('all');
      
      // Данные для текущей вкладки
      const currentTabDebts = computed(() => {
        switch (activeTab.value) {
          case 'my-debts':
            return filteredDebts.value.filter(debt => 
              debt.fromUserId === 'user_1' // Hardcoded currentUserId
            );
          case 'debts-to-me':
            return filteredDebts.value.filter(debt => 
              debt.toUserId === 'user_1' // Hardcoded currentUserId
            );
          case 'all':
          default:
            return filteredDebts.value;
        }
      });
      
      // Переключение фильтра статуса
      const toggleStatusFilter = (status: DebtStatus | null) => {
        if (selectedStatus.value === status) {
          // Сбрасываем фильтр при повторном нажатии
          filterByStatus(null);
        } else {
          filterByStatus(status);
        }
      };
      
      // Получение класса для карточки баланса
      const getBalanceCardClass = (balance: number) => {
        if (!balance) return '';
        return balance > 0 ? 'positive-balance' : 'negative-balance';
      };
      
      // Обработчик добавления долга
      const handleAddDebt = (data: any) => {
        addDebt(data, data.createTransaction);
      };
      
      // Обработчик добавления платежа
      const handleAddPayment = (data: any) => {
        addPayment(data, data.createTransaction);
      };
      
      // Причина отмены долга
      const cancelReason = ref('');
      
      // Обработчик отмены долга
      const handleCancelDebt = () => {
        if (selectedDebt.value) {
          cancelDebt(selectedDebt.value, cancelReason.value);
          cancelReason.value = ''; // Сбрасываем причину после отмены
        }
      };
      
      return {
        // Состояние
        isLoading,
        selectedDebt,
        selectedStatus,
        selectedCurrency,
        selectedBookId,
        
        // Диалоги
        showAddDebtDialog,
        showPaymentDialog,
        showDebtDetailDialog,
        showCancelDebtDialog,
        
        // Данные
        allDebts,
        activeDebts,
        debtBalance,
        formattedDebtBalance,
        debtCurrencies,
        availableBooks,
        
        // Вкладки
        activeTab,
        currentTabDebts,
        
        // Фильтры
        statusFilters,
        toggleStatusFilter,
        
        // Функции
        selectDebt,
        filterByCurrency,
        filterByBook,
        resetFilters,
        openAddDebtDialog,
        closeAddDebtDialog,
        handleAddDebt,
        openPaymentDialog,
        closePaymentDialog,
        handleAddPayment,
        openCancelDebtDialog,
        closeCancelDebtDialog,
        handleCancelDebt,
        closeDebtDetailDialog,
        
        // Вспомогательные
        getBalanceCardClass,
        cancelReason
      };
    }
  });
  </script>
  
  <style scoped>
  .debt-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-screen);
  }
  
  .debt-view__header {
    flex-shrink: 0;
  }
  
  .debt-view__filters {
    padding: 12px 16px;
    background-color: var(--bg-dropdown);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-section {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .filter-button {
    padding: 6px 12px;
    border-radius: 16px;
    background-color: var(--bg-light);
    color: var(--text-usual);
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .filter-button.active {
    background-color: var(--accent-color);
    color: white;
  }
  
  .filter-button.reset-button {
    background-color: transparent;
    border: 1px solid var(--border-color);
  }
  
  .filter-dropdown {
    position: relative;
  }
  
  .filter-dropdown select {
    padding: 6px 28px 6px 12px;
    border-radius: 16px;
    background-color: var(--bg-light);
    color: var(--text-usual);
    border: none;
    font-size: 14px
  }

  </style>