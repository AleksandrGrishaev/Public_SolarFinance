<template>
    <div class="debt-icons-container">
      <div class="debt-icons">
        <div 
          v-for="debt in debts" 
          :key="debt.id" 
          class="debt-icon-wrapper"
          :class="{ 'selected': debt.id === selectedDebtId }"
          @click="$emit('select-debt', debt.id)"
        >
          <div 
            class="debt-icon" 
            :class="{ 
              'debt-icon-positive': isDebtOwed(debt), 
              'debt-icon-negative': !isDebtOwed(debt)
            }"
            :style="getIconStyle(debt)"
          >
            <span v-if="debt.icon" class="icon-image">
              <img :src="debt.icon" alt="Debt icon" />
            </span>
            <span v-else class="icon-text">
              {{ getInitials(debt.name) }}
            </span>
          </div>
          <div class="debt-icon-label" :class="{ 'selected': debt.id === selectedDebtId }">
            {{ getShortName(debt.name) }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import { useDebts } from '../composables/useDebts';
  
  const props = defineProps({
    debts: {
      type: Array,
      required: true
    },
    selectedDebtId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['select-debt']);
  
  // Use the useDebts composable to get the isDebtOwed function
  const { isDebtOwed } = useDebts();
  
  // Get icon style based on debt properties
  const getIconStyle = (debt) => {
    return {
      backgroundColor: debt.color || (isDebtOwed(debt) ? 'var(--maincolor-colorsucces)' : 'var(--maincolor-colorwarrning)')
    };
  };
  
  // Get initials for debt icon when no image is available
  const getInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };
  
  // Get shortened name for display
  const getShortName = (name) => {
    if (!name) return '';
    
    if (name.length <= 10) {
      return name;
    }
    
    return name.substring(0, 8) + '...';
  };
  </script>
  
  <style scoped>
  .debt-icons-container {
    margin-bottom: 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* For Firefox */
    -ms-overflow-style: none; /* For IE and Edge */
  }
  
  .debt-icons-container::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Opera */
  }
  
  .debt-icons {
    display: flex;
    gap: 16px;
    padding: 4px 0;
  }
  
  .debt-icon-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  
  .debt-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: var(--text-contrast);
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }
  
  .debt-icon-positive {
    border-color: var(--maincolor-colorsucces);
  }
  
  .debt-icon-negative {
    border-color: var(--maincolor-colorwarrning);
  }
  
  .icon-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon-image img {
    width: 70%;
    height: 70%;
    object-fit: contain;
  }
  
  .icon-text {
    font-size: 18px;
  }
  
  .debt-icon-label {
    font-size: var(--font-small-size);
    color: var(--text-grey);
    text-align: center;
    transition: color 0.2s ease;
  }
  
  .debt-icon-label.selected {
    color: var(--text-usual);
    font-weight: 500;
  }
  
  .debt-icon-wrapper.selected .debt-icon {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  </style>