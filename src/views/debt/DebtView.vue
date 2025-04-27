<template>
  <div class="debt-dashboard">
    <div class="debt-body">
      <!-- Верхняя часть с общей суммой и кнопкой добавления -->
      <div class="balance-section">
        <div class="balance-container">
          <span class="total-amount" :class="{'negative': totalDebtAmount < 0, 'positive': totalDebtAmount > 0}">
            {{ formatTotalInUserCurrency(totalDebtAmount) }}
          </span>
        </div>
        <AddIconButton @click="openAddDebtModal" />
      </div>
      
      <!-- Фильтр по владельцу долга используя BaseSelector -->
      <div class="owner-filter-section">
        <BaseSelector 
          v-model="currentOwnerFilter" 
          :options="ownerOptions"
        />
      </div>
      
      <!-- Список долгов по группам используя BaseGroup и BaseItem -->
      <div class="debts-container">
        <!-- Долги по книгам -->
        <BaseGroup 
          v-if="hasDebtsInGroup('book')"
          title="Books"
          :totalValue="formatTotalInUserCurrency(getTotalForGroup('book'))"
          :totalValueType="getTotalValueType(getTotalForGroup('book'))"
        >
          <BaseItem
            v-for="debt in getDebtsForGroup('book')"
            :key="debt.id"
            :title="debt.name"
            :subtitle="debt.subtitle"
            :value="formatDebtAmount(debt)"
            :valueType="isDebtOwed(debt) ? 'positive' : 'negative'"
            :inactive="debt.status === 'paid' || debt.status === 'cancelled'"
            @click="navigateToDebtDetails(debt.id)"
          />
        </BaseGroup>
        
        <!-- Долги с людьми -->
        <BaseGroup
          v-if="hasDebtsInGroup('person')"
          title="Persons"
          :totalValue="formatTotalInUserCurrency(getTotalForGroup('person'))"
          :totalValueType="getTotalValueType(getTotalForGroup('person'))"
        >
          <BaseItem
            v-for="debt in getDebtsForGroup('person')"
            :key="debt.id"
            :title="debt.name"
            :subtitle="debt.subtitle"
            :value="formatDebtAmount(debt)"
            :valueType="isDebtOwed(debt) ? 'positive' : 'negative'"
            :inactive="debt.status === 'paid' || debt.status === 'cancelled'"
            @click="navigateToDebtDetails(debt.id)"
          />
        </BaseGroup>
        
        <!-- Кредиты с иконками -->
        <BaseGroup
          v-if="hasDebtsInGroup('credit')"
          title="Credits"
          :totalValue="formatTotalInUserCurrency(getTotalForGroup('credit'))"
          :totalValueType="getTotalValueType(getTotalForGroup('credit'))"
        >
          <BaseItem
            v-for="debt in getDebtsForGroup('credit')"
            :key="debt.id"
            :title="debt.name"
            :subtitle="debt.subtitle"
            :value="formatDebtAmount(debt)"
            :valueType="isDebtOwed(debt) ? 'positive' : 'negative'"
            :showIcon="true"
            :iconColor="debt.color || 'var(--bg-light)'"
            :inactive="debt.status === 'paid' || debt.status === 'cancelled'"
            @click="navigateToDebtDetails(debt.id)"
          />
        </BaseGroup>
        
        <!-- Пустое состояние, если нет долгов -->
        <div v-if="!hasAnyDebts" class="empty-state">
          <div class="empty-message">No debts found</div>
          <div class="empty-description">Add a new debt to get started</div>
        </div>
        
        <!-- Кнопка добавления нового долга -->
        <div class="add-debt-container">
          <CreateActionButton text="Add new" @click="openAddDebtModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AddIconButton from '@/components/atoms/buttons/AddIconButton.vue';
import CreateActionButton from '@/components/atoms/buttons/CreateActionButton.vue';
import BaseGroup from '@/components/molecules/groups/BaseGroup.vue';
import BaseItem from '@/components/atoms/items/BaseItem.vue';
import BaseSelector from '@/components/atoms/selectors/BaseSelector.vue';
import { useDebts } from './composables/useDebts';

const router = useRouter();
const {
  isLoading,
  selectedOwner,
  totalDebtAmount,
  debtsByGroup,
  totalByGroup,
  userBaseCurrency,
  getUserCurrencySymbol,
  isDebtOwed,
  formatDebtAmount,
  formatTotalInUserCurrency,
  setSelectedOwner,
  loadDebts
} = useDebts();

// Состояние для выбора валюты
const showCurrencySelector = ref(false);

// Опции для селектора владельца долга
const ownerOptions = [
  { label: 'All', value: 'all' },
  { label: 'My', value: 'my' },
  { label: 'Family', value: 'family' }
];

// Текущий выбранный фильтр
const currentOwnerFilter = computed({
  get: () => selectedOwner.value || 'all',
  set: (value) => setSelectedOwner(value as 'all' | 'my' | 'family')
});

// Функция для получения долгов по группе с защитой от undefined
const getDebtsForGroup = (group: string) => {
  if (!debtsByGroup || !debtsByGroup.value || !debtsByGroup.value[group]) {
    return [];
  }
  return debtsByGroup.value[group] || [];
};

// Функция для проверки наличия долгов в группе
const hasDebtsInGroup = (group: string) => {
  const debts = getDebtsForGroup(group);
  return debts && debts.length > 0;
};

// Функция для получения суммы по группе с защитой от undefined
const getTotalForGroup = (group: string) => {
  if (!totalByGroup || !totalByGroup.value) {
    return 0;
  }
  return totalByGroup.value[group] || 0;
};

// Функция для определения типа значения (positive/negative) для общей суммы
const getTotalValueType = (amount: number): 'positive' | 'negative' | 'neutral' => {
  if (amount > 0) return 'positive';
  if (amount < 0) return 'negative';
  return 'neutral';
};

// Проверка наличия долгов с учетом возможных null/undefined значений
const hasAnyDebts = computed(() => {
  return hasDebtsInGroup('book') || hasDebtsInGroup('person') || hasDebtsInGroup('credit');
});

// Обновляем заголовок и настройки в родительском IosLayout
const updateHeaderSettings = () => {
  if (router && router.currentRoute && router.currentRoute.value && router.currentRoute.value.meta) {
    // Отправляем событие родительскому компоненту IosLayout
    router.currentRoute.value.meta.title = 'Debts';
    router.currentRoute.value.meta.header = {
      show: true,
      showBack: true,
      showMessageIcon: true,
      hasNotifications: true,
      showProfileIcon: true
    };
  }
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
  const debt = getDebtsForGroup('book').find(d => d.id === debtId) ||
               getDebtsForGroup('person').find(d => d.id === debtId) ||
               getDebtsForGroup('credit').find(d => d.id === debtId);
  
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
  min-height: 100%;
  width: 100%;
  background-color: var(--bg-screen);
  color: var(--text-usual);
  position: relative;
}

.debt-body {
  flex: 1;
  width: 100%;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 0px;
}

/* Стили для секции с общей суммой */
.balance-section {
  padding: 16px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
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


.currency-code {
  font-size: var(--font-small-size);
  color: var(--text-usual);
}

/* Стили для фильтра владельца */
.owner-filter-section {
  padding: 8px 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

/* Стили для списка долгов */
.debts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 80px;
  flex: 1;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background-color: var(--bg-field-dark);
  border-radius: 32px;
  margin: 16px 0;
}

.empty-message {
  font-size: var(--font-body-size);
  font-weight: 500;
  color: var(--text-usual);
  margin-bottom: 8px;
}

.empty-description {
  font-size: var(--font-small-size);
  color: var(--text-grey);
}

/* Контейнер для кнопки добавления долга */
.add-debt-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  flex-shrink: 0;
}
</style>