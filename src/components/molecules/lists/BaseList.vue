<!-- src/components/molecules/lists/BaseList.vue -->
<template>
    <div class="base-list">
      <div v-if="showDate" class="base-list__date">
        <span class="en-caption">{{ formattedDate }}</span>
      </div>
      <div class="base-list__content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { format } from 'date-fns';
  
  export default defineComponent({
    name: 'BaseList',
    props: {
      date: {
        type: [Date, String],
        default: null
      },
      showDate: {
        type: Boolean,
        default: true
      },
      dateFormat: {
        type: String,
        default: 'd MMMM'
      }
    },
    computed: {
      formattedDate(): string {
        if (!this.date) return '';
        
        const dateObj = typeof this.date === 'string' ? new Date(this.date) : this.date;
        return format(dateObj, this.dateFormat);
      }
    }
  });
  </script>
  
  <style scoped>
  .base-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--spacing-md);
  }
  
  .base-list__date {
    padding: var(--spacing-xs) var(--spacing-lg);
    color: var(--text-secondary);
  }
  
  .base-list__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  </style>