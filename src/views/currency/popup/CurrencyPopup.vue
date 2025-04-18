<!-- src/views/currency/popup/CurrencyPopup.vue -->
<template>
    <BasePopup
      v-model="isVisible"
      title="Currency"
      :closeOnOverlayClick="true"
    >
      <div class="currency-popup">
        <!-- Search input -->
        <div class="search-wrapper">
          <div class="search-icon">
            <IconSearch size="18" color="#FFFFFF" />
          </div>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Search"
            type="text"
          />
        </div>
  
        <!-- Currency list -->
        <div class="currency-list">
          <div v-for="(group, letter) in groupedCurrencies" :key="letter" class="currency-group">
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
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import BasePopup from '../../../components/ui/BasePopup.vue';
  import { useCurrencyStore } from '../../../stores/currency';
  import { IconSearch } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    selectedCurrency: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'update:selectedCurrency']);
  
  // Popup visibility
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  const currencyStore = useCurrencyStore();
  const searchQuery = ref('');
  
  // Grouped currencies by first letter
  const groupedCurrencies = computed(() => {
    const filtered = currencyStore.currencies.filter(currency => {
      if (!searchQuery.value) return true;
      
      const query = searchQuery.value.toLowerCase();
      return (
        currency.code.toLowerCase().includes(query) || 
        currency.name.toLowerCase().includes(query)
      );
    });
    
    const grouped = {};
    
    filtered.forEach(currency => {
      const firstLetter = currency.code.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(currency);
    });
    
    // Sort groups alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((result, key) => {
        result[key] = grouped[key];
        return result;
      }, {});
  });
  
  // Select currency and close popup
  const selectCurrency = (currencyCode) => {
    emit('update:selectedCurrency', currencyCode);
    isVisible.value = false;
  };
  </script>
  
  <style scoped>
  .currency-popup {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 70vh;
  }
  
  .search-wrapper {
    position: relative;
    margin-bottom: 16px;
    width: 100%;
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }
  
  .search-input {
    height: 36px;
    width: 100%;
    background-color: #949496;
    border: none;
    border-radius: 14px;
    padding: 8px 12px 8px 40px;
    color: #FFFFFF;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  .search-input:focus {
    outline: none;
  }
  
  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .currency-list {
    flex: 1;
    overflow-y: auto;
    margin: 0 -16px;
    padding: 0 16px;
  }
  
  .currency-group {
    margin-bottom: 16px;
  }
  
  .group-header {
    font-size: 18px;
    font-weight: 500;
    color: #FFFFFF;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .currency-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .currency-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .currency-code {
    font-weight: 500;
    color: #FFFFFF;
  }
  
  .currency-name {
    color: #BBBBBB;
  }
  </style>