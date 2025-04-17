<!-- src/views/account/popup/AccountSelectorPopup.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Select account" 
    :rightIcon="IconEdit"
    @rightIconClick="handleEditClick"
    @update:modelValue="handleVisibilityChange"
  >
    <div class="account-container">
      <div class="debug-info" v-if="debugMode">
        <div>Total accounts: {{ props.accounts.length }}</div>
        <div>Selectable: {{ selectableAccounts.length }}</div>
        <div>Items per row: {{ layoutState.itemsPerRow }}</div>
        <div>Item size: {{ layoutState.itemSize }}px</div>
        <div>Grid width: {{ layoutState.gridWidth }}px</div>
        <div>Gap: {{ GAP_SIZE }}px</div>
        <div>Cell width: {{ layoutState.calculatedItemWidth }}px</div>
      </div>
      
      <!-- Dynamically adaptive account grid -->
      <div class="account-grid" ref="gridRef">
        <!-- Account cells -->
        <div 
          v-for="account in selectableAccounts"
          :key="account.id"
          class="grid-cell"
          :style="gridCellStyle"
          @click="selectAccount(account)"
        >
          <!-- Account icon inside cell -->
          <div 
            class="account-icon"
            :style="[iconStyle, { backgroundColor: account.color || '#808080' }]"
          >
            <!-- Если есть иконка, рендерим её -->
            <component 
              v-if="account.icon && getTablerIcon(account.icon)" 
              :is="getTablerIcon(account.icon)" 
              :size="Math.round(layoutState.itemSize * 0.6)" 
              color="white" 
              stroke-width="1.5"
            />
            <!-- Иначе используем символ валюты -->
            <template v-else>
              {{ account.symbol || getCurrencySymbol(account.currency) }}
            </template>
          </div>
          <div class="account-balance">{{ formatAccountBalance(account, 5) }}</div>
          <div class="account-name">{{ truncateName(account.name) }}</div>
        </div>
        
        <!-- Add account cell -->
        <div 
          class="grid-cell"
          :style="gridCellStyle"
          @click="handleAddAccount"
        >
          <div 
            class="add-button"
            :style="iconStyle"
          >
            <IconPlus 
              :size="Math.round(layoutState.itemSize * 0.5)" 
              :stroke-width="1.5"
              class="plus-icon"
            />
          </div>
          <div class="account-balance">&nbsp;</div>
          <div class="account-name">Add</div>
        </div>
        
        <!-- Filler items for last row alignment -->
        <div 
          v-for="i in fillerItemsCount"
          :key="`filler-${i}`"
          class="grid-cell filler"
          :style="gridCellStyle"
        ></div>
      </div>
      
      <!-- Empty state - show only if no accounts -->
      <div v-if="selectableAccounts.length === 0" class="empty-state">
        <div>No accounts available</div>
        <div>Create a new account to get started</div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUpdated, nextTick, watch } from 'vue';
import BasePopup from '../../../components/ui/BasePopup.vue';
import { IconEdit, IconPlus } from '@tabler/icons-vue';
import * as TablerIcons from '@tabler/icons-vue';
import { useCurrencyStore } from '../../../stores/currency';
import { useFormatBalance } from '../../../composables/transaction/useFormatBalance';

// Initialize the balance formatting composable
const { getCurrencySymbol, formatAccountBalance } = useFormatBalance();

// Функция для получения иконки Tabler по имени
const getTablerIcon = (iconName) => {
  if (!iconName) return null;
  
  // Если начинается с "Icon", используем как есть
  const lookupName = iconName.startsWith('Icon') 
    ? iconName 
    : `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
  
  return TablerIcons[lookupName] || null;
};

// Debug mode
const debugMode = ref(false);

// Reference to the grid container DOM element
const gridRef = ref(null);

// Constant for gaps - minimum gap is 4px
const GAP_SIZE =12; // Увеличили с 4px до 12px для большего расстояния

// Adaptive layout state
const layoutState = ref({
  itemsPerRow: 4,        // Number of items per row
  itemSize: 56,          // Icon size in pixels
  gridWidth: 0,          // Grid width
  calculatedItemWidth: 0 // Calculated item width
});

// Browser window width
const windowWidth = ref(window.innerWidth);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  accounts: {
    type: Array,
    default: () => []
  },
  transactionType: {
    type: String,
    default: 'expense'
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'add', 'edit']);

// Popup visibility
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Handle visibility changes
const handleVisibilityChange = (value: boolean) => {
  if (!value) {
    // You can add warning message here if needed
  }
};

// Currency store
const currencyStore = useCurrencyStore();

// Filtered accounts
const selectableAccounts = computed(() => {
  if (!props.accounts || props.accounts.length === 0) {
    console.log('No accounts available');
    return [];
  }
  console.log('Available accounts:', props.accounts);
  return props.accounts;
});

// Calculate number of filler items for the last row
const fillerItemsCount = computed(() => {
  const totalItems = selectableAccounts.value.length + 1; // Accounts + add button
  const remainder = totalItems % layoutState.value.itemsPerRow;
  
  // If items are evenly divisible by itemsPerRow, no fillers needed
  if (remainder === 0) return 0;
  
  // Otherwise add enough to fill the last row
  return layoutState.value.itemsPerRow - remainder;
});

// Grid cell style
const gridCellStyle = computed(() => {
  // Reduce cell width by 1px to ensure proper placement
  const cellWidth = layoutState.value.calculatedItemWidth - 3;
  
  return { 
    width: `${cellWidth}px`,
    marginRight: `${GAP_SIZE}px`,
    marginBottom: `${GAP_SIZE}px`
  };
});

// Icon style
const iconStyle = computed(() => {
  const { itemSize } = layoutState.value;
  return {
    width: `${itemSize}px`,
    height: `${itemSize}px`
  };
});

// Function to calculate optimal layout
const calculateLayout = () => {
  if (!gridRef.value) return;
  
  // Measure the current grid container width - round to integer
  const gridWidth = Math.floor(gridRef.value.clientWidth);
  const minItemSize = 45; // Minimum icon size
  const optimalItemSize = 56; // Standard medium icon size
  
  // Determine optimal number of items per row
  let itemsPerRow = 4; // Default 4 items
  
  const screenWidth = windowWidth.value;
  if (screenWidth >= 390) {
    // Check if 5 items can fit with gaps
    const totalGapWidthFor5 = GAP_SIZE * 5; // Account for all gaps
    const availableWidthFor5 = gridWidth - totalGapWidthFor5;
    const itemWidthFor5 = Math.floor(availableWidthFor5 / 5);
    
    if (itemWidthFor5 >= minItemSize) {
      itemsPerRow = 5;
    }
  }
  
  // Calculate item size based on available space
  const totalGapWidth = GAP_SIZE * (itemsPerRow - 1);
  const availableWidth = gridWidth - totalGapWidth;
  
  // Calculate item width and round down to integer
  const calculatedItemWidth = Math.floor(availableWidth / itemsPerRow);
  
  // Determine final icon size
  let itemSize = Math.min(calculatedItemWidth, optimalItemSize * 1.2);
  itemSize = Math.floor(Math.max(itemSize, minItemSize)); // Not less than minimum
  
  if (debugMode.value) {
    console.group('Account grid layout calculation');
    console.log('Window width:', Math.floor(windowWidth.value), 'px');
    console.log('Grid width:', gridWidth, 'px');
    console.log('Items per row:', itemsPerRow);
    console.log('Gap:', GAP_SIZE, 'px');
    console.log('Total gap width:', GAP_SIZE * (itemsPerRow - 1), 'px');
    console.log('Available width for cells:', gridWidth - GAP_SIZE * (itemsPerRow - 1), 'px');
    console.log('Calculated cell width:', calculatedItemWidth, 'px');
    console.log('Actual cell width:', calculatedItemWidth - 1, 'px');
    console.log('Final icon size:', itemSize, 'px');
    console.log('Total accounts:', selectableAccounts.value.length);
    console.log('Filler items count:', fillerItemsCount.value);
    console.groupEnd();
  }
  
  // Update state
  layoutState.value = {
    itemsPerRow,
    itemSize,
    gridWidth,
    calculatedItemWidth
  };
};

// Window resize handler
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  calculateLayout();
};

// Maximum account name length
const maxNameLength = computed(() => {
  return layoutState.value.itemsPerRow === 4 ? 6 : 8;
});

// Truncate long names
const truncateName = (name) => {
  if (!name) return 'Account';
  const maxLen = maxNameLength.value;
  if (name.length > maxLen) {
    return name.substring(0, maxLen) + '...';
  }
  return name;
};

// Initialize and update on visibility change
onMounted(() => {
  if (isVisible.value) {
    nextTick(calculateLayout);
  }
  window.addEventListener('resize', handleResize);
});

onUpdated(() => {
  if (isVisible.value) {
    nextTick(calculateLayout);
  }
});

// Watch for visibility changes
watch(isVisible, (newVal) => {
  if (newVal) {
    nextTick(calculateLayout);
  }
});

// Select account
const selectAccount = (account) => {
  console.log('Selecting account:', account);
  emit('select', account);
  isVisible.value = false;
};

// Add new account
const handleAddAccount = () => {
  emit('add');
  isVisible.value = false;
};

// Edit accounts
const handleEditClick = () => {
  emit('edit');
  isVisible.value = false;
};
</script>

<style scoped>
.account-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 0 16px;
}

.debug-info {
  padding: 4px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: yellow;
  font-size: 12px;
  margin-bottom: 16px;
}

.account-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Left alignment */
  width: 100%;
  box-sizing: border-box;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px; /* Вернули к меньшему значению для более компактного вида с новым порядком элементов */
  cursor: pointer;
  box-sizing: border-box;
  margin-bottom: 12px; /* Сохраняем отступ снизу */
  margin-top: 8px;
}

/* Invisible filler elements */
.grid-cell.filler {
  visibility: hidden;
  height: 0;
  margin-bottom: 0;
  pointer-events: none;
}

.account-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transform-origin: center;
}

.add-button {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1.5px dashed #949496;
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.2s ease;
  box-sizing: border-box;
}

.plus-icon {
  color: #949496; /* Same gray color as the border */
}

.grid-cell:hover .add-button {
  background-color: rgba(148, 148, 150, 0.1);
}

.account-name {
  color: #ffffff; /* Изменили цвет на более светло-серый для названия */
  font-size: 10px;
  line-height: 12px;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-balance {
  color: #AEAEAE;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  text-align: center;
  color: #949496;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
  margin-top: 16px;
}
</style>