<!-- src/views/account/popup/components/AccountTypeSelector.vue -->
<template>
  <div class="account-type-selector" ref="dropdownRef">
    <div class="form-select" @click="toggle">
      <div class="select-display">
        <component :is="selectedIcon" class="type-icon" :size="20" stroke-width="1.5" />
        <span>{{ selectedLabel }}</span>
      </div>
      <DropdownArrow class="dropdown-arrow" :color="isOpen ? 'var(--text-contrast)' : 'var(--text-grey)'" />
    </div>
    
    <div v-if="isOpen" class="dropdown-menu">
      <div 
        v-for="option in typeOptions" 
        :key="option.value"
        class="dropdown-item"
        @click="selectType(option.value)"
      >
        <component :is="option.icon" class="type-icon" :size="20" stroke-width="1.5" />
        <span>{{ option.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { IconCreditCard, IconWallet, IconCash, IconPigMoney } from '@tabler/icons-vue';
import DropdownArrow from '../../../../components/ui/icons/DropdownArrow.vue';
import { useDropdown } from '../../../../composables/ui/useDropdown';

const typeOptions = [
  { value: 'card', label: 'Card', icon: IconCreditCard },
  { value: 'cash', label: 'Cash', icon: IconCash },
  { value: 'wallet', label: 'Wallet', icon: IconWallet },
  { value: 'saving', label: 'Savings', icon: IconPigMoney }
];

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Используем созданный composable для работы с выпадающим списком
const { isOpen, dropdownRef, toggle, close } = useDropdown();

// Выбранная опция
const selectedOption = computed(() => {
  return typeOptions.find(option => option.value === props.modelValue) || typeOptions[0];
});

// Выбранная иконка
const selectedIcon = computed(() => {
  return selectedOption.value.icon;
});

// Выбранный текст
const selectedLabel = computed(() => {
  return selectedOption.value.label;
});

// Выбор типа
const selectType = (value) => {
  emit('update:modelValue', value);
  close();
};

// Следим за изменениями извне
watch(() => props.modelValue, (newValue) => {
  if (!typeOptions.some(option => option.value === newValue)) {
    // Если выбран недопустимый тип, сбрасываем на первый вариант
    emit('update:modelValue', typeOptions[0].value);
  }
});
</script>

<style scoped>
/* Стили остаются те же */
.account-type-selector {
  position: relative;
  width: 100%;
}

.form-select {
  height: var(--input-height);
  background-color: var(--input-bg);
  border: none;
  border-radius: var(--input-radius);
  padding: 0 var(--spacing-md);
  color: var(--input-color);
  font-size: var(--font-body-size);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.form-select:hover {
  opacity: var(--state-hover-opacity);
}

.select-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.type-icon {
  color: var(--text-usual);
}

.dropdown-arrow {
  transition: transform var(--transition-speed) var(--transition-fn);
  transform: rotate(0deg);
}

.form-select:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--spacing-xs);
  background-color: var(--bg-contrast);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) 0;
  z-index: var(--z-index-dropdown);
  box-shadow: var(--shadow-md);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-usual);
  cursor: pointer;
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>