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
  import { format, isValid, parse } from 'date-fns';
  
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
        
        // If already the correct format, return as is
        if (typeof this.date === 'string' && this.date.match(/^\d{1,2}\s\w+$/)) {
          return this.date;
        }
        
        try {
          let dateObj: Date;
          
          if (typeof this.date === 'string') {
            // Try to parse the date string
            dateObj = new Date(this.date);
            
            // Check if the date is valid
            if (!isValid(dateObj)) {
              // If not valid, try to parse as "d MMMM" format
              dateObj = parse(this.date, this.dateFormat, new Date());
            }
          } else {
            dateObj = this.date;
          }
          
          // Check if the resulting date is valid
          if (!isValid(dateObj)) {
            return this.date.toString();
          }
          
          return format(dateObj, this.dateFormat);
        } catch (error) {
          console.error('Error formatting date:', error);
          return this.date.toString();
        }
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