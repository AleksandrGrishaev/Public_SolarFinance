<!-- src/components/ui/ListItemWithToggle.vue -->
<template>
    <div 
      class="list-item"
      @click="$emit('select')"
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
        <div class="toggle-wrapper" @click.stop="toggleActive">
        <svg v-if="isActive" width="33" height="18" viewBox="0 0 33 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0C6.61305 0 4.32387 0.948212 2.63604 2.63604C0.948211 4.32387 0 6.61305 0 9C0 11.3869 0.948211 13.6761 2.63604 15.364C4.32387 17.0518 6.61305 18 9 18H24C26.3869 18 28.6761 17.0518 30.364 15.364C32.0518 13.6761 33 11.3869 33 9C33 6.61305 32.0518 4.32387 30.364 2.63604C28.6761 0.948212 26.3869 0 24 0H9ZM24 15C25.5913 15 27.1174 14.3679 28.2426 13.2426C29.3679 12.1174 30 10.5913 30 9C30 7.4087 29.3679 5.88258 28.2426 4.75736C27.1174 3.63214 25.5913 3 24 3C22.4087 3 20.8826 3.63214 19.7574 4.75736C18.6321 5.88258 18 7.4087 18 9C18 10.5913 18.6321 12.1174 19.7574 13.2426C20.8826 14.3679 22.4087 15 24 15Z" fill="white"/>
        </svg>
        <svg v-else width="33" height="18" viewBox="0 0 33 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0C6.61305 0 4.32387 0.948212 2.63604 2.63604C0.948211 4.32387 0 6.61305 0 9C0 11.3869 0.948211 13.6761 2.63604 15.364C4.32387 17.0518 6.61305 18 9 18H24C26.3869 18 28.6761 17.0518 30.364 15.364C32.0518 13.6761 33 11.3869 33 9C33 6.61305 32.0518 4.32387 30.364 2.63604C28.6761 0.948212 26.3869 0 24 0H9ZM9 15C10.5913 15 12.1174 14.3679 13.2426 13.2426C14.3679 12.1174 15 10.5913 15 9C15 7.4087 14.3679 5.88258 13.2426 4.75736C12.1174 3.63214 10.5913 3 9 3C7.4087 3 5.88258 3.63214 4.75736 4.75736C3.63214 5.88258 3 7.4087 3 9C3 10.5913 3.63214 12.1174 4.75736 13.2426C5.88258 14.3679 7.4087 15 9 15Z" fill="#949496"/>
        </svg>
      </div>
        
        <!-- Меню -->
        <div class="menu-wrapper" @click.stop="$emit('menu')">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H19M1 7H19M1 13H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
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
    iconBackgroundColor: {
      type: String,
      default: 'white'
    },
    iconText: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['select', 'toggle', 'menu']);
  
  const isActive = ref(props.active);
  
  function toggleActive() {
    isActive.value = !isActive.value;
    emit('toggle', isActive.value);
  }
  </script>
  
  <style scoped>
  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 10px;
    height: 38px;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  
  .list-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .item-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }
  
  .item-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-weight: 500;
    font-size: 14px;
  }
  
  .item-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 38px;
    padding: 2px 0;
  }
  
  .item-subtitle {
    color: white;
    font-size: 10px;
    font-weight: 400;
    line-height: 12px;
    opacity: 0.8;
  }
  
  .item-title {
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  .item-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .toggle-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 21px;
  }
  
  .menu-wrapper {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>