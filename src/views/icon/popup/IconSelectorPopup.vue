<!-- src/views/icon/popup/IconSelectorPopup.vue -->
<template>
    <BasePopup
      v-model="isVisible"
      title="Icons"
      :closeOnOverlayClick="true"
      :extendedMode="true"
    >
      <div class="icon-selector">
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
  
        <!-- Icon grid sections by category -->
        <div 
          class="icon-selector-content"
          ref="containerRef"
        >
          <div class="scrollable-content">
            <template v-for="(categoryIcons, category) in filteredIconGroups" :key="category">
              <div class="category-header">{{ category }}</div>
              
              <div class="icon-grid">
                <!-- Icons -->
                <div
                  v-for="(icon, iconName) in categoryIcons"
                  :key="iconName"
                  class="grid-cell"
                  :style="gridCellStyle"
                  @click="selectIcon(iconName, icon)"
                >
                  <div 
                    class="icon-wrapper"
                    :style="iconStyle"
                    :class="{ 'selected': iconName === selectedIconName }"
                  >
                    <component 
                      :is="icon"
                      :size="32"
                      :stroke-width="1.5"
                      color="white"
                    />
                  </div>
                </div>
                
                <!-- Filler items for last row -->
                <div 
                  v-for="i in fillerItemsCount" 
                  :key="`filler-${i}`"
                  class="grid-cell filler"
                  :style="gridCellStyle"
                ></div>
              </div>
            </template>
            
            <!-- Empty state when no icons match search -->
            <div v-if="Object.keys(filteredIconGroups).length === 0" class="empty-state">
              <div>No icons found matching your search</div>
              <div>Try a different search term</div>
            </div>
          </div>
        </div>
      </div>
    </BasePopup>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import BasePopup from '../../../components/ui/BasePopup.vue';
  import { useGridLayout } from '../../../composables/ui/useGridLayout';
  import {
    // Иконки для UI
    IconSearch,
    
    // Основные иконки
    IconHome, IconUser, IconSettings, IconPlus, IconMinus,
    IconX, IconCheck, IconHeart, IconStar,
    
    // Иконки денег
    IconCoin, IconCurrencyDollar, IconCreditCard, IconWallet, IconReceipt,
    
    // Иконки коммуникации
    IconMail, IconPhone, IconMessage, IconSend, IconBell,
    
    // Иконки навигации
    IconMap, IconMapPin, IconCompass, IconArrowLeft, IconArrowRight,
    
    // Иконки медиа
    IconCamera, IconPhoto, IconVideo, IconMusic, IconMicrophone
  } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    selectedIcon: {
      type: [String, Object],
      default: null
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'update:selectedIcon']);
  
  // Popup visibility
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  // Иконки, сгруппированные по категориям
  const ICON_CATEGORIES = {
    Essential: {
      IconHome, IconUser, IconSettings, IconPlus, IconMinus,
      IconX, IconCheck, IconHeart, IconStar
    },
    Money: {
      IconCoin, IconCurrencyDollar, IconCreditCard, IconWallet, IconReceipt
    },
    Communication: {
      IconMail, IconPhone, IconMessage, IconSend, IconBell
    },
    Navigation: {
      IconMap, IconMapPin, IconCompass, IconArrowLeft, IconArrowRight
    },
    Media: {
      IconCamera, IconPhoto, IconVideo, IconMusic, IconMicrophone
    }
  };
  
  // Поисковый запрос
  const searchQuery = ref('');
  
  // Используем композабл для расчета сетки
  const {
    containerRef,
    layoutState,
    fillerItemsCount,
    gridCellStyle,
    iconStyle,
    calculateLayout,
    setItems
  } = useGridLayout({
    defaultItemsPerRow: 5,
    largeScreenItemsPerRow: 6,
    optimalItemSize: 56,
    gapSize: 12
  });
  
  // Track selected icon name
  const selectedIconName = ref('');
  
  // Отфильтрованные группы иконок
  const filteredIconGroups = computed(() => {
    const result = {};
    const query = searchQuery.value?.toLowerCase() || '';
    
    // Общий счетчик иконок для расчета филлеров
    let totalIcons = 0;
    
    // Обработка категорий
    for (const [category, icons] of Object.entries(ICON_CATEGORIES)) {
      // Фильтрация иконок по поисковому запросу
      const filteredIcons = {};
      let hasMatch = false;
      
      for (const [iconName, icon] of Object.entries(icons)) {
        // Удаляем префикс 'Icon' и преобразуем в нижний регистр для поиска
        const displayName = iconName.replace('Icon', '').toLowerCase();
        if (!query || displayName.includes(query)) {
          filteredIcons[iconName] = icon;
          hasMatch = true;
          totalIcons++;
        }
      }
      
      // Добавляем категорию только если в ней есть подходящие иконки
      if (hasMatch) {
        result[category] = filteredIcons;
      }
    }
    
    // Обновляем количество элементов для правильного расчета филлеров
    setItems(Array(totalIcons).fill(null));
    
    return result;
  });
  
  // Handle icon selection
  const selectIcon = (iconName, icon) => {
    if (!iconName || !icon) return;
    
    selectedIconName.value = iconName;
    
    // Emit selected icon component
    emit('update:selectedIcon', icon);
    isVisible.value = false;
  };
  
  // Reset search query
  const resetSearch = () => {
    searchQuery.value = '';
  };
  
  // Вычисляем оптимальную высоту контента для скролла
  const calculateContentHeight = () => {
    // Если попап открыт и у нас есть ссылка на контейнер
    if (isVisible.value && containerRef.value) {
      // Пересчитываем сетку после небольшой задержки, чтобы DOM успел обновиться
      setTimeout(() => {
        // Получаем высоту окна
        const windowHeight = window.innerHeight;
        // Проверяем высоту контента с учетом запаса для скролла
        const contentElement = containerRef.value;
        if (contentElement) {
          // Проверяем, достаточно ли места для скролла
          console.log('Content scrollHeight:', contentElement.scrollHeight);
          console.log('Window height:', windowHeight);
        }
        
        // Пересчитываем макет
        calculateLayout();
      }, 150);
    }
  };
  
  // Определяем высоту контента для скролла
  onMounted(() => {
    // Сбрасываем поиск при монтировании
    resetSearch();
    
    // Рассчитываем макет и проверяем высоту
    setTimeout(() => {
      calculateLayout();
      calculateContentHeight();
    }, 100);
    
    if (props.selectedIcon) {
      // If selectedIcon is an object with type property (component)
      if (typeof props.selectedIcon === 'object' && props.selectedIcon?.type?.name) {
        selectedIconName.value = props.selectedIcon.type.name;
      } 
      // If selectedIcon is a string
      else if (typeof props.selectedIcon === 'string') {
        selectedIconName.value = props.selectedIcon;
      }
    }
  });
  
  // Восстанавливаем скролл при закрытии
  watch(isVisible, (newValue) => {
    if (!newValue) {
      resetSearch();
    } else {
      // Пересчитываем сетку и контент при открытии
      setTimeout(() => {
        calculateLayout();
        calculateContentHeight();
      }, 100);
    }
  });
  
  // Пересчитываем сетку при изменении запроса поиска
  watch(searchQuery, () => {
    setTimeout(() => {
      calculateLayout();
    }, 100);
  });
  
  // Наблюдаем за изменениями в отфильтрованных группах иконок
  watch(filteredIconGroups, () => {
    // Обновляем макет после изменения результатов фильтрации
    setTimeout(() => {
      calculateLayout();
    }, 100);
  }, { deep: true });
  </script>
  
  <style scoped>
  .icon-selector {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 70vh;
    position: relative;
  }
  
  .search-wrapper {
    position: sticky;
    top: 0;
    z-index: 10;
    margin-bottom: 16px;
    width: 100%;
    flex-shrink: 0; /* Предотвращает сжатие поисковой строки */
    background-color: #404040;
    padding-bottom: 10px;
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
  
  .icon-selector-content {
    flex: 1;
    overflow-y: auto; /* Обеспечиваем скролл */
    overflow-x: hidden;
    padding: 0 4px;
    -webkit-overflow-scrolling: touch; /* Для плавной прокрутки на iOS */
    height: calc(80vh - 120px); /* Фиксированная высота для скролла */
    position: relative;
  }
  
  .scrollable-content {
    min-height: 100%;
    width: 100%;
    padding-bottom: 30px; /* Добавляем отступ внизу для лучшего UX */
  }
  
  .category-header {
    font-size: 18px;
    font-weight: 500;
    color: #FFFFFF;
    padding: 16px 0 8px 0;
    position: sticky;
    top: 0;
    background-color: #404040;
    z-index: 1;
  }
  
  .icon-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 16px;
  }
  
  .grid-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-sizing: border-box;
  }
  
  .grid-cell.filler {
    cursor: default;
  }
  
  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #949496;
    transition: background-color 0.2s ease;
  }
  
  .icon-wrapper:hover {
    background-color: #7a7a7c;
  }
  
  .icon-wrapper.selected {
    background-color: #53B794;
  }
  
  .empty-state {
    text-align: center;
    color: #949496;
    padding: 32px 16px;
    font-size: 16px;
    line-height: 24px;
  }
  </style>