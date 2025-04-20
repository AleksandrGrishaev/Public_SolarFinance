<!-- src/components/categories/view/CategoryTransactionsList.vue -->
<template>
  <div>
    <!-- Список транзакций -->
    <div 
      class="transactions-container" 
      v-if="Object.keys(groupedTransactions).length > 0"
    >
      <CategoryTransactionGroup 
        v-for="(transactions, dateKey) in groupedTransactions" 
        :key="dateKey"
        :date="dateKey"
        :totalAmount="getDateTotal(transactions)"
        :currency="transactions[0]?.currency || 'Rp'"
      >
        <CategoryTransactionItem
          v-for="transaction in transactions"
          :key="transaction.id"
          :transaction="transaction"
          :title="getTransactionTitle(transaction)"
          :subtitle="getTransactionSubtitle(transaction)"
          :accountName="getAccountName(transaction)"
          :iconName="getTransactionIconName(transaction)"
          :iconColor="categoryColor"
          :withBorder="transactions.indexOf(transaction) < transactions.length - 1"
          @click="handleTransactionClick(transaction)"
        />
      </CategoryTransactionGroup>
    </div>
    
    <!-- Пустое состояние при отсутствии транзакций -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <IconReceipt2 size="48" color="#949496" />
      </div>
      <div class="empty-text">No transactions found for this period</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryTransactionGroup from './CategoryTransactionGroup.vue';
import CategoryTransactionItem from './CategoryTransactionItem.vue';
import { IconReceipt2 } from '@tabler/icons-vue';

const props = defineProps({
  groupedTransactions: {
    type: Object,
    default: () => ({})
  },
  categoryColor: {
    type: String,
    default: '#D9D9D9'
  },
  bookStore: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['transaction-click']);

// Получение общей суммы за день
const getDateTotal = (transactions) => {
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
};

// Получение заголовка транзакции
const getTransactionTitle = (transaction) => {
  // Используем описание транзакции или название книги
  if (transaction.description) {
    return transaction.description;
  }
  
  // Получаем название книги из BookStore
  const book = props.bookStore.getBookById(transaction.bookId);
  return book ? book.name : 'Unknown';
};

// Получение подзаголовка транзакции
const getTransactionSubtitle = (transaction) => {
  // Получаем имя пользователя из UserStore
  const user = props.userStore.getUserById?.(transaction.executedByOwnerId);
  // Если getUserById не существует или не вернул пользователя, используем запасной вариант
  if (user) {
    return user.name || 'Unknown';
  }
  
  // Запасной вариант
  const userMap = {
    'user_1': 'Me',
    'user_2': 'Wife'
  };
  return userMap[transaction.executedByOwnerId] || 'Unknown';
};

// Получение имени счета
const getAccountName = (transaction) => {
  // Запасной вариант для названий счетов
  const accountMap = {
    'card1': 'Card',
    'card2': 'Family Card',
    'card3': 'Wife Card',
    'bank1': 'Bank',
    'bank2': 'Bank 2',
    'cash1': 'Cash'
  };
  
  if (transaction.type === 'expense') {
    return accountMap[transaction.sourceEntityId] || 'Unknown';
  } else {
    return accountMap[transaction.destinationEntityId] || 'Unknown';
  }
};

// Получение имени иконки для транзакции
const getTransactionIconName = (transaction) => {
  // Иконки по типу транзакции
  const typeIconMap = {
    'expense': 'shopping',
    'income': 'coin',
    'transfer': 'credit-card'
  };
  
  return typeIconMap[transaction.type] || 'wallet';
};

// Обработчик клика на транзакцию
const handleTransactionClick = (transaction) => {
  emit('transaction-click', transaction);
};
</script>

<style scoped>
.transactions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 50px 0;
  border-radius: 32px;
  margin: 16px 0;
}

.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.empty-text {
  color: #949496;
  font-size: 16px;
  font-weight: 400;
  text-align: center;
}
</style>