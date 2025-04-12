<!-- src/components/ui/inputs/IconPicker.vue -->
<template>
    <div class="icon-picker-container">
      <div class="icon-selector" @click="isOpen = !isOpen">
        <div v-if="modelValue" class="selected-icon">
          <component :is="modelValue" />
        </div>
        <div v-else class="icon-plus">
          <IconPlus class="plus-icon" />
        </div>
      </div>
      
      <div v-if="isOpen" class="icon-palette">
        <div 
          v-for="icon in availableIcons" 
          :key="icon.name"
          class="icon-option"
          @click="selectIcon(icon.component)"
        >
          <component :is="icon.component" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { 
    IconPlus, 
    IconHome, 
    IconCar,
    IconBriefcase,
    IconShoppingCart,
    IconHeartbeat,
    IconDeviceTv,
    IconBook,
    IconPhone,
    IconBread,
    IconPlant,
    IconBaby,
    IconBus,
    IconCamera,
    IconCoin,
    IconCoffee,
    IconGift,
    IconShirt,
    IconSunglasses,
    IconToolkit
  } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: Object,
      default: null
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const isOpen = ref(false);
  
  const availableIcons = [
    { name: 'Home', component: IconHome },
    { name: 'Car', component: IconCar },
    { name: 'Briefcase', component: IconBriefcase },
    { name: 'ShoppingCart', component: IconShoppingCart },
    { name: 'Heartbeat', component: IconHeartbeat },
    { name: 'DeviceTv', component: IconDeviceTv },
    { name: 'Book', component: IconBook },
    { name: 'Phone', component: IconPhone },
    { name: 'Bread', component: IconBread },
    { name: 'Plant', component: IconPlant },
    { name: 'Baby', component: IconBaby },
    { name: 'Bus', component: IconBus },
    { name: 'Camera', component: IconCamera },
    { name: 'Coin', component: IconCoin },
    { name: 'Coffee', component: IconCoffee },
    { name: 'Gift', component: IconGift },
    { name: 'Shirt', component: IconShirt },
    { name: 'Sunglasses', component: IconSunglasses },
    { name: 'Toolkit', component: IconToolkit }
  ];
  
  const selectIcon = (icon) => {
    emit('update:modelValue', icon);
    isOpen.value = false;
  };
  </script>
  
  <style scoped>
  .icon-picker-container {
    position: relative;
  }
  
  .icon-selector {
    width: 60px;
    height: 60px;
    background-color: #949496;
    border-radius: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  
  .icon-plus {
    color: #DBDADD;
  }
  
  .plus-icon {
    width: 14px;
    height: 14px;
  }
  
  .selected-icon {
    color: #DBDADD;
    width: 24px;
    height: 24px;
  }
  
  .icon-palette {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background-color: #555555;
    border-radius: 8px;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    z-index: 10;
    width: 260px;
  }
  
  .icon-option {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #777777;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
    color: #DBDADD;
  }
  
  .icon-option:hover {
    transform: scale(1.1);
    background-color: #949496;
  }
  </style>