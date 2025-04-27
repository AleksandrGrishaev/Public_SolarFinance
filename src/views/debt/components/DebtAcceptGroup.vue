<template>
    <div class="debt-accept-group" v-if="showGroup">
      <div class="group-header">
        <h2 class="section-title">Pending Operations</h2>
      </div>
      
      <div class="operations-list">
        <SwipeableDebtOperation
          v-for="operation in operations" 
          :key="operation.id"
          :operation="operation"
          @accept="onAccept"
          @decline="onDecline"
          @view="onView"
          @swipe="handleSwipe(operation.id, $event)"
          :ref="el => { if (el) operationRefs[operation.id] = el }"
        />
        
        <div v-if="operations.length === 0" class="empty-operations">
          <p>No pending operations</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, reactive, onBeforeUpdate } from 'vue';
  import SwipeableDebtOperation from './SwipeableDebtOperation.vue';
  
  const props = defineProps({
    operations: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['accept', 'decline', 'view']);
  
  // Show group only if there are operations or explicitly set to show empty state
  const showGroup = computed(() => {
    return props.operations && props.operations.length > 0;
  });
  
  // Refs for swipeable operation components
  const operationRefs = reactive({});
  
  // Clear refs before update
  onBeforeUpdate(() => {
    for (const key in operationRefs) {
      delete operationRefs[key];
    }
  });
  
  // Handle swipe event from any operation
  const handleSwipe = (operationId, offset) => {
    // If this operation is being swiped open, close all others
    if (offset < 0) {
      closeAllExcept(operationId);
    }
  };
  
  // Close all operations except the specified one
  const closeAllExcept = (exceptId) => {
    for (const [id, ref] of Object.entries(operationRefs)) {
      if (id !== exceptId && ref && ref.resetSwipe) {
        ref.resetSwipe();
      }
    }
  };
  
  // Event handlers with simplified signature - forwarding to parent
  const onAccept = (operation) => {
    closeAllExcept(null); // Close all operations
    emit('accept', operation);
  };
  
  const onDecline = (operation) => {
    closeAllExcept(null); // Close all operations  
    emit('decline', operation);
  };
  
  const onView = (operation) => {
    closeAllExcept(null); // Close all operations
    emit('view', operation);
  };
  </script>
  
  <style scoped>
  .debt-accept-group {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  
  .group-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .section-title {
    font-size: var(--font-subheading-size);
    font-weight: var(--font-subheading-weight);
    color: var(--text-header);
    margin: 0;
  }
  
  .operations-list {
    overflow: hidden;
  }
  
  .empty-operations {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    color: var(--text-grey);
    font-size: var(--font-small-size);
  }
  </style>