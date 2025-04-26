<!-- src/views/debug/components/FinanceStoresDebugPanel.vue -->
<template>
  <div class="finance-stores-panel">
    <n-tabs type="segment" animated>
      <!-- Книги -->
      <n-tab-pane name="book" tab="Книги">
        <n-card title="Книги">
          <n-space vertical>
            <n-alert title="Информация о книгах" type="info">
              Всего книг: {{ bookStore.books.length }}, 
              Активных: {{ bookStore.activeBooks.length }},
              Доступных пользователю: {{ bookStore.userAccessibleBooks.length }}
            </n-alert>

            <n-tabs type="line">
              <n-tab-pane name="all" tab="Все книги">
                <n-data-table
                  :columns="bookColumns"
                  :data="bookStore.books"
                  :bordered="false"
                  :pagination="{ pageSize: 5 }"
                />
              </n-tab-pane>
              <n-tab-pane name="active" tab="Активные">
                <n-data-table
                  :columns="bookColumns"
                  :data="bookStore.activeBooks"
                  :bordered="false"
                  :pagination="{ pageSize: 5 }"
                />
              </n-tab-pane>
              <n-tab-pane name="user" tab="Пользовательские">
                <n-data-table
                  :columns="bookColumns"
                  :data="bookStore.userAccessibleBooks"
                  :bordered="false"
                  :pagination="{ pageSize: 5 }"
                />
              </n-tab-pane>
              <n-tab-pane name="raw" tab="Raw JSON">
                <!-- Замена n-code на JsonViewer -->
                <json-viewer :json="bookStore.$state" :show-card="false" />
              </n-tab-pane>
            </n-tabs>
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- Счета -->
      <n-tab-pane name="account" tab="Счета">
        <n-card title="Счета">
          <n-space vertical>
            <n-alert title="Информация о счетах" type="info">
              Всего счетов: {{ accountStore.accounts.length }}, 
              Активных: {{ accountStore.activeAccounts.length }},
              Общий баланс: {{ formatCurrency(accountStore.totalBalance) }}
            </n-alert>

            <n-tabs type="line">
              <n-tab-pane name="all" tab="Все счета">
                <n-data-table
                  :columns="accountColumns"
                  :data="accountStore.accounts"
                  :bordered="false"
                  :pagination="{ pageSize: 5 }"
                />
              </n-tab-pane>
              <n-tab-pane name="active" tab="Активные">
                <n-data-table
                  :columns="accountColumns"
                  :data="accountStore.activeAccounts"
                  :bordered="false"
                  :pagination="{ pageSize: 5 }"
                />
              </n-tab-pane>
              <n-tab-pane name="by-type" tab="По типам">
                <n-collapse>
                  <n-collapse-item v-for="type in accountTypes" :key="type.value" :title="type.label">
                    <n-data-table
                      :columns="accountColumns"
                      :data="accountStore.getAccountsByType(type.value)"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-tab-pane>
              <n-tab-pane name="raw" tab="Raw JSON">
                <!-- Замена n-code на JsonViewer -->
                <json-viewer :json="accountStore.$state" :show-card="false" />
              </n-tab-pane>
            </n-tabs>
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- Транзакции -->
      <n-tab-pane name="transaction" tab="Транзакции">
        <n-card title="Транзакции">
          <n-space vertical>
            <n-alert title="Информация о транзакциях" type="info">
              Всего транзакций: {{ transactionStore.transactions.length }}, 
              С фильтрами: {{ transactionStore.filteredTransactions.length }}
            </n-alert>

            <n-tabs type="line">
              <n-tab-pane name="all" tab="Все транзакции">
                <n-data-table
                  :columns="transactionColumns"
                  :data="transactionStore.transactions"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="filtered" tab="Отфильтрованные">
                <n-data-table
                  :columns="transactionColumns"
                  :data="transactionStore.filteredTransactions"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="by-type" tab="По типам">
                <n-collapse>
                  <n-collapse-item v-for="type in transactionTypes" :key="type.id" :title="type.name">
                    <n-data-table
                      :columns="transactionColumns"
                      :data="transactionStore.getTransactionsByType(type.id)"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-tab-pane>
              <n-tab-pane name="raw" tab="Raw JSON">
                <!-- Замена n-code на JsonViewer -->
                <json-viewer :json="transactionStore.$state" :show-card="false" />
              </n-tab-pane>
            </n-tabs>
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- Категории -->
      <n-tab-pane name="category" tab="Категории">
        <n-card title="Категории">
          <n-space vertical>
            <n-alert title="Информация о категориях" type="info">
              Всего категорий: {{ categoryStore.categories.length }}
            </n-alert>

            <n-tabs type="line">
              <n-tab-pane name="all" tab="Все категории">
                <n-data-table
                  :columns="categoryColumns"
                  :data="categoryStore.categories"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="raw" tab="Raw JSON">
                <!-- Замена n-code на JsonViewer -->
                <json-viewer :json="categoryStore.$state" :show-card="false" />
              </n-tab-pane>
            </n-tabs>
          </n-space>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { 
  NTabs, 
  NTabPane, 
  NCard, 
  NSpace, 
  NAlert, 
  NDataTable, 
  NCollapse, 
  NCollapseItem, 
  NTag 
} from 'naive-ui';

// Импорт хранилищ
import { useBookStore } from '@/stores/book';
import { useAccountStore } from '@/stores/account';
import { useTransactionStore } from '@/stores/transaction';
import { useCategoryStore } from '@/stores/category';
import { useCurrencyStore } from '@/stores/currency';

// Импорт нового JsonViewer компонента
import JsonViewer from './JsonViewerComponent.vue';

// Инициализация хранилищ
const bookStore = useBookStore();
const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();
const currencyStore = useCurrencyStore();

// Форматирование JSON для отображения - оставляем для обратной совместимости
const formatJson = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

// Форматирование валюты
const formatCurrency = (amount: number): string => {
  return currencyStore.formatCurrency(amount, currencyStore.appBaseCurrency);
};

// Столбцы для таблицы книг
const bookColumns = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Тип', key: 'type' },
  { 
    title: 'Активна', 
    key: 'isActive',
    render: (row: any) => h(
      NTag,
      { type: row.isActive ? 'success' : 'error' },
      { default: () => row.isActive ? 'Да' : 'Нет' }
    )
  },
  { title: 'Цвет', key: 'color' }
];

// Типы счетов для отображения
const accountTypes = [
  { label: 'Наличные', value: 'cash' },
  { label: 'Банковские счета', value: 'bank' },
  { label: 'Карты', value: 'card' },
  { label: 'Кредитные карты', value: 'credit_card' },
  { label: 'Сбережения', value: 'savings' },
  { label: 'Инвестиции', value: 'investment' }
];

// Столбцы для таблицы счетов
const accountColumns = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Валюта', key: 'currency' },
  { 
    title: 'Баланс', 
    key: 'currentBalance',
    render: (row: any) => {
      return accountStore.getFormattedAccountBalance(row.id);
    }
  },
  { title: 'Тип', key: 'type' },
  { 
    title: 'Активен', 
    key: 'isActive',
    render: (row: any) => h(
      NTag,
      { type: row.isActive ? 'success' : 'error' },
      { default: () => row.isActive ? 'Да' : 'Нет' }
    )
  }
];

// Типы транзакций
const transactionTypes = transactionStore.transactionTypes;

// Столбцы для таблицы транзакций
const transactionColumns = [
  { title: 'ID', key: 'id' },
  { 
    title: 'Дата', 
    key: 'date',
    render: (row: any) => {
      return new Date(row.date).toLocaleDateString();
    }
  },
  { title: 'Тип', key: 'type' },
  { 
    title: 'Сумма', 
    key: 'amount',
    render: (row: any) => {
      return currencyStore.formatCurrency(row.amount, row.currency);
    }
  },
  { title: 'Описание', key: 'description' },
  { title: 'Книга', key: 'bookId' }
];

// Столбцы для таблицы категорий
const categoryColumns = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Тип', key: 'type' },
  { title: 'Родительская', key: 'parentId' },
  { title: 'Цвет', key: 'color' }
];
</script>

<style scoped>
.finance-stores-panel {
  width: 100%;
}

:deep(.n-data-table .n-data-table-base-table-body) {
  overflow: auto;
  max-height: 70vh;
}
</style>