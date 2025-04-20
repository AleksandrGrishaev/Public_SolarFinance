<!-- src/components/ui/selectors/BaseAccountSelector.vue -->
<template>
    <div class="account-element">
      <!-- For regular transactions (not transfer) -->
      <div v-if="!isTransfer" class="single-account">
        <div 
          class="account-section"
          @click="$emit('account-click', { mode: 'source' })"
        >
          <div class="account-icon" :style="{ backgroundColor: sourceAccount.color || '#5B8FF9' }">
            <!-- Если есть иконка, рендерим её -->
            <component 
              v-if="sourceAccount.icon && iconComponent(sourceAccount.icon)" 
              :is="iconComponent(sourceAccount.icon)" 
              size="14" 
              color="white" 
              stroke-width="1.5"
            />
            <!-- Иначе используем символ валюты -->
            <template v-else>
              {{ sourceAccount.symbol || sourceAccount.currency }}
            </template>
          </div>
          <div class="account-name">
            {{ truncateText(sourceAccount.name) }}
          </div>
          <div class="choose-button">
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.9047 6.11346L3.97424 6.25H4.12747H4.87281H5.02604L5.09558 6.11346L8.15148 0.113461L8.3366 -0.25L7.92871 -0.25L6.73616 -0.25L6.57911 -0.25L6.51094 -0.108509L4.50014 4.06517L2.48934 -0.108509L2.42117 -0.25L2.26411 -0.25L1.07157 -0.25L0.66368 -0.25L0.848797 0.113461L3.9047 6.11346Z" fill="#949496" stroke="#949496" stroke-width="0.5"/>
            </svg>
          </div>
        </div>
        
        <!-- Иконка для управления слайдером (показана только если showDistributionToggle = true) -->
        <div 
          v-if="showDistributionToggle" 
          class="distribution-toggle"
          :class="{ 'active': isDistributionVisible }"
          @click="$emit('toggle-distribution')"
        >
          <component 
            :is="iconComponent('IconChartPie')" 
            size="16" 
            :color="isDistributionVisible ? (sourceAccount.color || '#5B8FF9') : '#949496'" 
            stroke-width="1.5"
          />
        </div>
      </div>
      
      <!-- For transfers (with two accounts) -->
      <div v-else class="transfer-accounts">
        <div class="account-box" @click="$emit('account-click', { mode: 'source' })">
          <div class="account-icon" :style="{ backgroundColor: sourceAccount.color || '#5B8FF9' }">
            <!-- Если есть иконка, рендерим её -->
            <component 
              v-if="sourceAccount.icon && iconComponent(sourceAccount.icon)" 
              :is="iconComponent(sourceAccount.icon)" 
              size="14" 
              color="white" 
              stroke-width="1.5"
            />
            <!-- Иначе используем символ валюты -->
            <template v-else>
              {{ sourceAccount.symbol || sourceAccount.currency }}
            </template>
          </div>
          <div class="account-name">
            {{ truncateText(sourceAccount.name) }}
          </div>
        </div>
        
        <div class="transfer-arrow">
          &gt;
        </div>
        
        <div class="account-box" @click="$emit('account-click', { mode: 'destination' })">
          <div class="account-icon" :style="{ backgroundColor: destinationAccount.color || '#61DDAA' }">
            <!-- Если есть иконка, рендерим её -->
            <component 
              v-if="destinationAccount.icon && iconComponent(destinationAccount.icon)" 
              :is="iconComponent(destinationAccount.icon)" 
              size="14" 
              color="white" 
              stroke-width="1.5"
            />
            <!-- Иначе используем символ валюты -->
            <template v-else>
              {{ destinationAccount.symbol || destinationAccount.currency }}
            </template>
          </div>
          <div class="account-name">
            {{ truncateText(destinationAccount.name) }}
          </div>
        </div>
      </div>
      
      <!-- Слоты для дополнительных элементов -->
      <slot name="popups"></slot>
    </div>
  </template>
  
  <script setup lang="ts">
  // Базовый компонент без специфичной бизнес-логики
  
  const props = defineProps({
    sourceAccount: {
      type: Object,
      required: true
    },
    destinationAccount: {
      type: Object,
      default: () => ({ 
        id: '', 
        name: 'Destination', 
        currency: 'USD', 
        color: '#61DDAA' 
      })
    },
    isTransfer: {
      type: Boolean,
      default: false
    },
    showDistributionToggle: {
      type: Boolean,
      default: false
    },
    isDistributionVisible: {
      type: Boolean,
      default: false
    },
    iconComponent: {
      type: Function,
      required: true
    }
  });
  
  const emit = defineEmits([
    'account-click',
    'toggle-distribution'
  ]);
  
  // Функция для ограничения длины текста
  const truncateText = (text: string, maxLength = 15) => {
    if (!text) return 'Account';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };
  </script>
  
  <style scoped>
  .account-element {
    width: 100%;
    height: 42px; /* Fixed height for stability */
    display: flex;
    justify-content: center; /* Center content */
    align-items: center;
    position: relative;
  }
  
  /* For regular transactions (single account) */
  .single-account {
    display: flex;
    align-items: center;
    height: 100%;
    width: auto;
    gap: 8px; /* Пространство между селектором аккаунта и иконкой распределения */
    background-color: var(--bg-light, #949496);
    border-radius: var(--border-radius-lg, 28px);
    padding: 0 2px 0 0px;
  }
  
  .account-section {
    padding: 6px 14px;
    background: #46484A;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    min-width: 50px;
    max-width: 200px;
    cursor: pointer;
  }
  
  /* Стиль для иконки переключения слайдера */
  .distribution-toggle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #46484A;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .distribution-toggle:hover {
    opacity: 0.8;
  }
  
  /* Активное состояние кнопки распределения (когда слайдер видим) */
  .distribution-toggle.active {
    background: #46484A; /* Оставляем фон серым */
    opacity: 1;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }
  
  /* For transfers (two accounts) */
  .transfer-accounts {
    display: flex;
    justify-content: center; /* Center content */
    align-items: center;
    gap: 8px;
    height: 100%;
    width: 100%;
  }
  
  .account-box {
    padding: 6px 14px;
    background: #46484A;
    border-radius: 28px;
    display: flex;
    align-items: center;
    height: 100%;
    cursor: pointer;
    min-width: 80px;
    max-width: 150px; /* Limit each account width */
    overflow: hidden;
    flex: 1;
  }
  
  .transfer-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #949496;
    font-size: 16px;
  }
  
  .account-icon {
    width: 28px;
    height: 28px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    flex-shrink: 0;
  }
  
  .account-name {
    padding: 0 8px;
    color: white;
    font-size: 16px;
    font-family: Inter, sans-serif;
    font-weight: 500;
    line-height: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 0 1 auto; /* Don't grow but can shrink, base size on content */
    min-width: 0; /* Prevent flex item from overflowing */
  }
  
  .choose-button {
    padding: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }
  </style>