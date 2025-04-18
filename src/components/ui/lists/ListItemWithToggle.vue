<!-- src/components/ui/lists/ListItemWithToggle.vue -->
<template>
  <div 
    class="list-item"
    :class="{ 'disabled': disabled }"
    @click="!disabled && $emit('select')"
  >
    <div class="item-info">
      <!-- Слот для иконки или аватара -->
      <slot name="icon">
        <div class="item-icon" :style="{ backgroundColor: iconBackgroundColor }">
          <slot name="icon-content">
            {{ iconText }}
          </slot>
        </div>
      </slot>
      
      <div class="item-text">
        <!-- Опциональный слот для родительского/дополнительного имени -->
        <div v-if="subTitle" class="item-subtitle">{{ subTitle }}</div>
        <div class="item-title">{{ title }}</div>
        <!-- Опциональный слот для дополнительного контента под заголовком -->
        <slot name="subtitle"></slot>
      </div>
    </div>
    
    <div class="item-actions">
      <!-- Переключатель активности -->
      <div class="toggle-wrapper" @click.stop="!disabled && toggleActive">
        <ToggleSwitch v-model="isActive" :disabled="disabled" />
      </div>
      
      <!-- Меню -->
      <div class="menu-wrapper" @click.stop="!disabled && $emit('menu')">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H19M1 7H19M1 13H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :stroke-opacity="disabled ? 0.5 : 1"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ToggleSwitch from '../inputs/ToggleSwitch.vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subTitle: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  iconBackgroundColor: {
    type: String,
    default: 'var(--bg-light)'
  },
  iconText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select', 'toggle', 'menu']);

const isActive = ref(props.active);

// Синхронизируем внутреннее состояние с пропсами
watch(() => props.active, (newValue) => {
  isActive.value = newValue;
});

function toggleActive() {
  if (props.disabled) return;
  isActive.value = !isActive.value;
  emit('toggle', isActive.value);
}
</script>

<style scoped>
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  height: 38px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.list-item:hover:not(.disabled) {
  background-color: rgba(255, 255, 255, 0.05);
}

.list-item.disabled {
  cursor: default;
  opacity: var(--state-disabled-opacity);
}

.item-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.item-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-contrast);
  font-weight: 500;
  font-size: 14px;
  background-color: v-bind('iconBackgroundColor');
}

.item-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-xs) 0;
}

.item-subtitle {
  color: var(--text-subheader);
  font-size: var(--font-super-small-size);
  font-weight: var(--font-super-small-weight);
  line-height: var(--font-super-small-line-height);
}

.item-title {
  color: var(--text-usual);
  font-size: var(--font-body-size);
  font-weight: var(--font-body-weight);
  line-height: var(--font-body-line-height);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-wrapper {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-usual);
}
</style>