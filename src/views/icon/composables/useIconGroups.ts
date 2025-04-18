// src/views/icon/composables/useIconGroups.ts
import { ref, computed } from 'vue';
import { 
  IconHome, IconUser, IconSettings, IconSearch, IconPlus,
  IconCoin, IconCurrencyDollar, IconCreditCard
} from '@tabler/icons-vue';

// Предопределенные категории иконок
const ICONS = {
  Essential: {
    IconHome, IconSearch, IconSettings, IconUser, IconPlus
  },
  Money: {
    IconCoin, IconCurrencyDollar, IconCreditCard
  }
};

export function useIconGroups() {
  const searchQuery = ref('');
  
  // Фильтрация иконок по поисковому запросу
  const filteredIconGroups = computed(() => {
    const result = {};
    const query = searchQuery.value?.toLowerCase() || '';
    
    Object.entries(ICONS).forEach(([category, icons]) => {
      // Фильтруем иконки по запросу
      const filteredIcons = {};
      let hasMatch = false;
      
      Object.entries(icons).forEach(([iconName, icon]) => {
        const displayName = iconName.replace('Icon', '').toLowerCase();
        if (!query || displayName.includes(query)) {
          filteredIcons[iconName] = icon;
          hasMatch = true;
        }
      });
      
      // Добавляем категорию только если в ней есть иконки
      if (hasMatch) {
        result[category] = filteredIcons;
      }
    });
    
    return result;
  });
  
  // Сброс поискового запроса
  const resetSearch = () => {
    searchQuery.value = '';
  };
  
  // Получение компонента иконки
  const getIconComponent = (iconName) => {
    for (const category of Object.values(ICONS)) {
      if (category[iconName]) {
        return category[iconName];
      }
    }
    return null;
  };
  
  return {
    searchQuery,
    filteredIconGroups,
    getIconComponent,
    resetSearch,
    allIconCategories: Object.keys(ICONS)
  };
}