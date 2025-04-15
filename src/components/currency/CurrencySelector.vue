// src/components/currency/CurrencySelector.vue
<template>
  <div class="currency-selector">
    <div class="currency-selector__header">
      <div class="close-button" @click="$emit('close')">×</div>
      <h2>Currency</h2>
    </div>
    
    <div class="currency-selector__search">
      <n-input 
        v-model:value="searchQuery" 
        placeholder="Search" 
        clearable
      >
        <template #prefix>
          <n-icon>
            <search-icon />
          </n-icon>
        </template>
      </n-input>
    </div>
    
    <div class="currency-selector__list">
      <div 
        v-for="(group, letter) in groupedCurrencies" 
        :key="letter" 
        class="currency-group"
      >
        <div class="group-header">{{ letter }}</div>
        <div 
          v-for="currency in group" 
          :key="currency.code" 
          class="currency-item"
          @click="selectCurrency(currency.code)"
        >
          <div class="currency-code">{{ currency.code }}</div>
          <div class="currency-name">{{ currency.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NIcon } from 'naive-ui';
import { SearchOutlined as SearchIcon } from '@tabler/icons-vue';
import { useCurrencyStore } from '@/stores/currency';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'close'): void;
}>();

const currencyStore = useCurrencyStore();
const searchQuery = ref('');

// Группировка валют по первой букве кода и фильтрация по поиску
const groupedCurrencies = computed(() => {
  const filtered = currencyStore.currencies.filter(currency => {
    if (!searchQuery.value) return true;
    
    const query = searchQuery.value.toLowerCase();
    return (
      currency.code.toLowerCase().includes(query) || 
      currency.name.toLowerCase().includes(query)
    );
  });
  
  const grouped: Record<string, typeof filtered> = {};
  
  filtered.forEach(currency => {
    const firstLetter = currency.code.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(currency);
  });
  
  // Сортировка групп по алфавиту
  return Object.keys(grouped)
    .sort()
    .reduce((result, key) => {
      result[key] = grouped[key];
      return result;
    }, {} as Record<string, typeof filtered>);
});

// Выбор валюты
const selectCurrency = (currencyCode: string) => {
  emit('update:modelValue', currencyCode);
  emit('close');
};
</script>

<style scoped>
.currency-selector {
  background-color: #333;
  color: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  width: 100%;
  max-width: 400px;
}

.currency-selector__header {
  padding: 16px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.currency-selector__search {
  padding: 16px;
}

.currency-selector__list {
  flex: 1;
  overflow-y: auto;
}

.currency-group {
  margin-bottom: 8px;
}

.group-header {
  padding: 8px 16px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #999;
}

.currency-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
}

.currency-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.currency-code {
  font-weight: 500;
}

.currency-name {
  color: #999;
}
</style>