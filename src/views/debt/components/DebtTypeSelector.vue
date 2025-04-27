<template>
    <div class="debt-type-selector">
      <BaseSelectorAddButton
        v-model="localValue"
        :items="debtTypeOptions"
        icon="filter"
        iconColor="var(--text-contrast)"
        :showAddButton="true"
        @add-item="$emit('add-debt')"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BaseSelectorAddButton from '@/components/atoms/selectors/BaseSelectorAddButton.vue';
  import { IconFilter } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: 'all'
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'add-debt']);
  
  // Available debt type options for the selector
  const debtTypeOptions = [
    { id: 'all', name: 'All' },
    { id: 'book', name: 'Books' },
    { id: 'person', name: 'Persons' },
    { id: 'credit', name: 'Credits' }
  ];
  
  // Two-way binding for the selector value
  const localValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  </script>
  
  <style scoped>
  .debt-type-selector {
    margin-bottom: 16px;
  }
  </style>