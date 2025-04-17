<!-- src/components/ui/CreateActionButton.vue -->
<template>
  <div class="create-action-button" @click="$emit('click')">
    <div class="icon-wrapper">
      <IconPlus class="plus-icon" />
    </div>
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue';

defineEmits(['click']);

defineProps({
  text: {
    type: String,
    default: 'Add item'
  },
  color: {
    type: String,
    default: '#53B794'
  }
});
</script>

<style scoped>
.create-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
  transition: background-color 0.2s;
}

.create-action-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.plus-icon {
  color: v-bind(color);
  width: 18px;
  height: 18px;
}
</style>