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
import { defineComponent, computed } from 'vue';
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
  setup(props) {
    const formattedDate = computed(() => {
      if (!props.date) return '';
      
      // If already the correct format, return as is
      if (typeof props.date === 'string' && props.date.match(/^\d{1,2}\s\w+$/)) {
        return props.date;
      }
      
      try {
        let dateObj: Date;
        
        if (typeof props.date === 'string') {
          // Try to parse the date string
          dateObj = new Date(props.date);
          
          // Check if the date is valid
          if (!isValid(dateObj)) {
            // If not valid, try to parse as "d MMMM" format
            dateObj = parse(props.date, props.dateFormat, new Date());
          }
        } else {
          dateObj = props.date;
        }
        
        // Check if the resulting date is valid
        if (!isValid(dateObj)) {
          return props.date.toString();
        }
        
        return format(dateObj, props.dateFormat);
      } catch (error) {
        console.error('Error formatting date:', error);
        return props.date.toString();
      }
    });

    return {
      formattedDate
    };
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: var(--spacing-xs);
  margin-top: var(--spacing-md);
}

.base-list__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
}
</style>