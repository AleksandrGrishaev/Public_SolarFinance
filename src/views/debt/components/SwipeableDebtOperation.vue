<template>
    <div class="swipeable-operation">
      <div 
        class="operation-content"
        :style="swipeStyle"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div class="operation-icon" :style="{ backgroundColor: operation.color || getDefaultColor() }">
          <span class="icon-text">{{ getOperationInitials() }}</span>
        </div>
        
        <div class="operation-details">
          <div class="operation-title">{{ operation.title }}</div>
          <div class="operation-description">{{ operation.description }}</div>
          <div class="operation-date">{{ formatDate(operation.date) }}</div>
        </div>
        
        <div class="operation-amount" :class="{'negative': operation.amount < 0}">
          {{ formatAmount() }}
        </div>
      </div>
      
      <!-- Action buttons that become visible on swipe -->
      <div class="operation-actions">
        <button class="action-button decline" @click="$emit('decline', operation)">
          Decline
        </button>
        <button class="action-button view" @click="$emit('view', operation)">
          View
        </button>
        <button class="action-button accept" @click="$emit('accept', operation)">
          Accept
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted } from 'vue';
  import { format, isValid } from 'date-fns';
  import { useDebts } from '../composables/useDebts';
  
  const props = defineProps({
    operation: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['accept', 'decline', 'view', 'swipe']);
  
  // Use the debts composable for formatting
  const { formatCurrency } = useDebts();
  
  // Swipe state
  const isSwiping = ref(false);
  const touchStartX = ref(0);
  const swipeOffset = ref(0);
  
  // Touch event handlers
  const onTouchStart = (event) => {
    touchStartX.value = event.touches[0].clientX;
    isSwiping.value = true;
  };
  
  const onTouchMove = (event) => {
    if (!isSwiping.value) return;
    
    const currentX = event.touches[0].clientX;
    const diffX = currentX - touchStartX.value;
    
    // Only allow left swipe (negative values)
    if (diffX < 0) {
      // Apply some resistance to make it feel natural
      const maxSwipe = -120; // Maximum swipe distance
      const resistance = 0.4;
      
      if (diffX > maxSwipe) {
        swipeOffset.value = diffX;
      } else {
        // Apply resistance past the max swipe point
        const excess = Math.abs(diffX) - Math.abs(maxSwipe);
        swipeOffset.value = maxSwipe - (excess * resistance);
      }
      
      // Emit swipe event with the offset
      emit('swipe', swipeOffset.value);
    } else {
      swipeOffset.value = 0;
      emit('swipe', 0);
    }
  };
  
  const onTouchEnd = () => {
    isSwiping.value = false;
    
    // Snap to positions
    if (swipeOffset.value < -60) {
      // Snap to open position
      swipeOffset.value = -120;
    } else {
      // Snap back to closed position
      swipeOffset.value = 0;
    }
    
    // Emit final swipe position
    emit('swipe', swipeOffset.value);
  };
  
  // Reset swipe state
  const resetSwipe = () => {
    swipeOffset.value = 0;
    isSwiping.value = false;
  };
  
  // Computed styles for swipe animation
  const swipeStyle = {
    transform: `translateX(${swipeOffset.value}px)`,
    transition: isSwiping.value ? 'none' : 'transform 0.3s ease'
  };
  
  // Helper methods
  const getOperationInitials = () => {
    if (!props.operation.title) return '?';
    
    const words = props.operation.title.split(' ');
    if (words.length === 1) {
      return props.operation.title.substring(0, 2).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };
  
  const getDefaultColor = () => {
    return props.operation.amount >= 0 
      ? 'var(--maincolor-colorsucces)' 
      : 'var(--maincolor-colorwarrning)';
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      if (!isValid(dateObj)) return '';
      
      return format(dateObj, 'MMM d');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  const formatAmount = () => {
    return formatCurrency(props.operation.amount, props.operation.currency);
  };
  
  // Reset swipe when component is unmounted
  onUnmounted(() => {
    resetSwipe();
  });
  
  // Expose reset method to parent
  defineExpose({
    resetSwipe
  });
  </script>
  
  <style scoped>
  .swipeable-operation {
    position: relative;
    overflow: hidden;
    margin-bottom: 1px;
  }
  
  .operation-content {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    gap: 12px;
    background-color: var(--bg-field-dark);
    position: relative;
    z-index: 2;
    min-height: 80px;
  }
  
  .operation-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-contrast);
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .icon-text {
    font-size: 16px;
  }
  
  .operation-details {
    flex: 1;
    min-width: 0;
  }
  
  .operation-title {
    font-size: var(--font-body-size);
    font-weight: 500;
    color: var(--text-usual);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .operation-description {
    font-size: var(--font-small-size);
    color: var(--text-grey);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .operation-date {
    font-size: var(--font-super-small-size);
    color: var(--text-inactive);
  }
  
  .operation-amount {
    font-size: var(--font-body-size);
    font-weight: 600;
    color: var(--maincolor-colorsucces);
    white-space: nowrap;
  }
  
  .operation-amount.negative {
    color: var(--maincolor-colorwarrning);
  }
  
  .operation-actions {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 1;
  }
  
  .action-button {
    height: 100%;
    padding: 0 12px;
    border: none;
    font-size: var(--font-small-size);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .action-button.decline {
    background-color: var(--maincolor-colorwarrning);
    color: var(--text-contrast);
  }
  
  .action-button.view {
    background-color: var(--bg-light);
    color: var(--text-grey);
  }
  
  .action-button.accept {
    background-color: var(--maincolor-colorsucces);
    color: var(--text-contrast);
  }
  </style>