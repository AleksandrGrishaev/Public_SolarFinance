<!-- src/views/icon/popup/IconSelectorPopup.vue -->
<template>
    <BasePopup
      v-model="isVisible"
      title="Icons"
      :closeOnOverlayClick="true"
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
  
        <!-- Icon grid with categories -->
        <div 
          class="icon-selector-content"
          ref="containerRef"
        >
          <!-- Display filtered categories based on search -->
          <template v-for="category in filteredCategories" :key="category.name">
            <div class="category-header">{{ category.name }}</div>
            <div class="icon-grid" :style="gridStyle">
              <div 
                v-for="icon in category.icons" 
                :key="icon.name"
                class="grid-cell"
                @click="selectIcon(icon)"
              >
                <div 
                  class="icon-wrapper"
                  :class="{ 'selected': selectedIconName === icon.name }"
                >
                  <component 
                    :is="icon.component" 
                    size="24" 
                    stroke-width="1.5" 
                    color="white"
                  />
                </div>
              </div>
            </div>
          </template>
          
          <!-- Empty state when no search results -->
          <div v-if="filteredCategories.length === 0" class="empty-state">
            <div>No icons found matching your search</div>
            <div>Try a different search term</div>
          </div>
        </div>
      </div>
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import BasePopup from '../../../components/ui/BasePopup.vue';
  import { 
    // Money icons
    IconSearch, IconCoin, IconCurrencyDollar, IconCurrencyEuro, IconCurrencyBitcoin,
    IconCurrencyPound, IconCurrencyYen, IconCreditCard, IconWallet, IconPigMoney,
    // Business icons
    IconBriefcase, IconChartBar, IconChartPie, IconReportMoney, IconBuildingSkyscraper,
    IconGraph, IconTrendingUp, IconUserCircle, IconTimeline, IconFileInvoice,
    // Home icons
    IconHome, IconBed, IconSofa, IconDeviceTv, IconWifi, IconDoor, IconLamp,
    // Transport icons
    IconCar, IconBus, IconTrain, IconPlane, IconBike, IconScooter, IconWalk, IconShip,
    // Food icons
    IconMeat, IconEgg, IconGlass, IconCoffee, IconPizza,
    // Shopping icons
    IconShoppingCart, IconShoppingBag, IconBasket, IconDiscount, IconGift,
    // Health icons
    IconHeartbeat, IconStethoscope, IconPill, IconFirstAidKit, IconActivity,
    // Tech icons
    IconDevice, IconDeviceLaptop, IconDeviceMobile, IconPrinter, IconServer, IconMouse,
    // Travel icons
    IconMap, IconMapPin, IconCompass, IconSuitcase, IconBeach, IconMountain,
    // Sport icons
    IconBallFootball, IconBallBasketball, IconBallTennis, IconSwimming, IconRun,
    // Crypto icons
    IconCurrencyEthereum, IconCurrencyLitecoin, IconCurrencyMonero, IconBlockchain
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
  
  // Search query
  const searchQuery = ref('');
  
  // Container reference for width measurements
  const containerRef = ref(null);
  
  // Layout state
  const layoutState = ref({
    itemsPerRow: 4,
    containerWidth: 0,
    cellWidth: 72
  });
  
  // Calculate grid style
  const gridStyle = computed(() => {
    const { itemsPerRow, cellWidth } = layoutState.value;
    return {
      gridTemplateColumns: `repeat(${itemsPerRow}, ${cellWidth}px)`,
      justifyContent: 'space-between'
    };
  });
  
  // Track selected icon name
  const selectedIconName = ref('');
  
  // Icon categories definition
  const iconCategories = [
    {
      name: 'Money',
      icons: [
        { name: 'IconCoin', component: IconCoin },
        { name: 'IconCurrencyDollar', component: IconCurrencyDollar },
        { name: 'IconCurrencyEuro', component: IconCurrencyEuro },
        { name: 'IconCurrencyBitcoin', component: IconCurrencyBitcoin },
        { name: 'IconCurrencyPound', component: IconCurrencyPound },
        { name: 'IconCurrencyYen', component: IconCurrencyYen },
        { name: 'IconCreditCard', component: IconCreditCard },
        { name: 'IconWallet', component: IconWallet },
        { name: 'IconPigMoney', component: IconPigMoney }
      ]
    },
    {
      name: 'Business',
      icons: [
        { name: 'IconBriefcase', component: IconBriefcase },
        { name: 'IconChartBar', component: IconChartBar },
        { name: 'IconChartPie', component: IconChartPie },
        { name: 'IconReportMoney', component: IconReportMoney },
        { name: 'IconBuildingSkyscraper', component: IconBuildingSkyscraper },
        { name: 'IconGraph', component: IconGraph },
        { name: 'IconTrendingUp', component: IconTrendingUp },
        { name: 'IconUserCircle', component: IconUserCircle },
        { name: 'IconTimeline', component: IconTimeline }
      ]
    },
    {
      name: 'Home',
      icons: [
        { name: 'IconHome', component: IconHome },
        { name: 'IconBed', component: IconBed },
        { name: 'IconSofa', component: IconSofa },
        { name: 'IconDeviceTv', component: IconDeviceTv },
        { name: 'IconWifi', component: IconWifi },
        { name: 'IconDoor', component: IconDoor },
        { name: 'IconLamp', component: IconLamp }
      ]
    },
    {
      name: 'Transport',
      icons: [
        { name: 'IconCar', component: IconCar },
        { name: 'IconBus', component: IconBus },
        { name: 'IconTrain', component: IconTrain },
        { name: 'IconPlane', component: IconPlane },
        { name: 'IconBike', component: IconBike },
        { name: 'IconScooter', component: IconScooter },
        { name: 'IconWalk', component: IconWalk },
        { name: 'IconShip', component: IconShip }
      ]
    },
    {
      name: 'Food',
      icons: [
        { name: 'IconMeat', component: IconMeat },
        { name: 'IconEgg', component: IconEgg },
        { name: 'IconGlass', component: IconGlass },
        { name: 'IconCoffee', component: IconCoffee },
        { name: 'IconPizza', component: IconPizza }
      ]
    },
    {
      name: 'Shopping',
      icons: [
        { name: 'IconShoppingCart', component: IconShoppingCart },
        { name: 'IconShoppingBag', component: IconShoppingBag },
        { name: 'IconBasket', component: IconBasket },
        { name: 'IconDiscount', component: IconDiscount },
        { name: 'IconGift', component: IconGift }
      ]
    },
    {
      name: 'Health',
      icons: [
        { name: 'IconHeartbeat', component: IconHeartbeat },
        { name: 'IconStethoscope', component: IconStethoscope },
        { name: 'IconPill', component: IconPill },
        { name: 'IconFirstAidKit', component: IconFirstAidKit },
        { name: 'IconActivity', component: IconActivity }
      ]
    },
    {
      name: 'Technology',
      icons: [
        { name: 'IconDevice', component: IconDevice },
        { name: 'IconDeviceLaptop', component: IconDeviceLaptop },
        { name: 'IconDeviceMobile', component: IconDeviceMobile },
        { name: 'IconPrinter', component: IconPrinter },
        { name: 'IconServer', component: IconServer },
        { name: 'IconMouse', component: IconMouse }
      ]
    },
    {
      name: 'Travel',
      icons: [
        { name: 'IconMap', component: IconMap },
        { name: 'IconMapPin', component: IconMapPin },
        { name: 'IconCompass', component: IconCompass },
        { name: 'IconSuitcase', component: IconSuitcase },
        { name: 'IconBeach', component: IconBeach },
        { name: 'IconMountain', component: IconMountain }
      ]
    },
    {
      name: 'Sport',
      icons: [
        { name: 'IconBallFootball', component: IconBallFootball },
        { name: 'IconBallBasketball', component: IconBallBasketball },
        { name: 'IconBallTennis', component: IconBallTennis },
        { name: 'IconSwimming', component: IconSwimming },
        { name: 'IconRun', component: IconRun }
      ]
    },
    {
      name: 'Crypto',
      icons: [
        { name: 'IconCurrencyBitcoin', component: IconCurrencyBitcoin },
        { name: 'IconCurrencyEthereum', component: IconCurrencyEthereum },
        { name: 'IconCurrencyLitecoin', component: IconCurrencyLitecoin },
        { name: 'IconCurrencyMonero', component: IconCurrencyMonero },
        { name: 'IconBlockchain', component: IconBlockchain }
      ]
    }
  ];
  
  // Filtered categories based on search query
  const filteredCategories = computed(() => {
    const query = searchQuery.value.toLowerCase();
    
    if (!query) {
      return iconCategories;
    }
    
    return iconCategories
      .map(category => {
        // Filter icons in this category
        const filteredIcons = category.icons.filter(icon => {
          const iconName = icon.name.replace('Icon', '').toLowerCase();
          return iconName.includes(query);
        });
        
        // Return category with filtered icons
        return {
          name: category.name,
          icons: filteredIcons
        };
      })
      .filter(category => category.icons.length > 0); // Only keep categories with matching icons
  });
  
  // Update selected icon name from props when component mounts
  onMounted(() => {
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
    
    calculateLayout();
    window.addEventListener('resize', calculateLayout);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', calculateLayout);
  });
  
  // Calculate layout based on container width
  const calculateLayout = () => {
    if (!containerRef.value) return;
    
    const containerWidth = containerRef.value.clientWidth;
    const gapSize = 12; // Gap between items
    
    // Items per row based on screen width
    const itemsPerRow = window.innerWidth >= 390 ? 5 : 4;
    
    // Calculate cell width to fit itemsPerRow items
    const availableWidth = containerWidth - (gapSize * (itemsPerRow - 1));
    const cellWidth = Math.floor(availableWidth / itemsPerRow);
    
    layoutState.value = {
      itemsPerRow,
      containerWidth,
      cellWidth
    };
  };
  
  // Handle icon selection
  const selectIcon = (icon) => {
    selectedIconName.value = icon.name;
    emit('update:selectedIcon', icon.component);
    isVisible.value = false;
  };
  
  // Recalculate layout when popup becomes visible
  watch(isVisible, (newValue) => {
    if (newValue) {
      setTimeout(() => {
        calculateLayout();
      }, 50);
    }
  });
  </script>
  
  <style scoped>
  .icon-selector {
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
  
  .icon-selector-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 4px;
    max-height: calc(70vh - 80px);
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
    display: grid;
    grid-gap: 12px;
    margin-bottom: 16px;
    padding: 4px 0;
  }
  
  .grid-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #949496;
    transition: background-color 0.2s ease;
    width: 56px;
    height: 56px;
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