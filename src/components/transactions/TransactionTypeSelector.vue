<!-- /Users/peaker/dev/solar-finance/src/components/transactions/TransactionTypeSelector.vue -->
<template>
  <div class="type-element">
    <div class="types">
      <div
        v-for="type in types"
        :key="type.id"
        class="type-item"
        :class="{ 'selected': modelValue === type.id }"
        @click="$emit('update:modelValue', type.id)"
      >
        {{ type.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  types: {
    type: Array as () => Array<{ id: string, name: string }>,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.type-element {
  width: 100%;

  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
}

.types {
  padding: 6px;
  background: #46484A;
  border-radius: 28px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
}

.type-item {
  padding-left: 16px;
  padding-right: 16px;

  background: #46484A;
  overflow: hidden;
  border-radius: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  /* Текстовые стили */
  color: white;
  font-size: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 16px;
  word-wrap: break-word;
}

.type-item.selected {
  background: black;
}
</style>