<!-- src/components/ui/inputs/ToggleButtonGroup.vue -->
<template>
  <div class="toggle-group">
    <button 
      v-for="(option, index) in options"
      :key="index"
      class="toggle-button"
      :class="{ 
        'active': modelValue === option.value,
        'custom-active': modelValue === option.value && option.customActiveClass
      }"
      @click="updateValue(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  options: {
    type: Array,
    required: true,
    // Each option should have: { label, value, customActiveClass? }
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (value) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.toggle-group {
  display: flex;
  height: var(--toggle-height);
  background-color: var(--bg-light);
  border-radius: var(--border-radius-lg);
  padding: 6px;
  gap: var(--spacing-xs);
}

.toggle-button {
  height: 100%;
  padding: 0 var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-xl);
  background: transparent;
  color: var(--bg-contrast);
  font-size: var(--font-small-size);
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed) var(--transition-fn);
}

.toggle-button:hover {
  opacity: var(--state-hover-opacity);
}

.toggle-button.active {
  background-color: black;
  color: var(--text-contrast);
}

.toggle-button.custom-active {
  background-color: var(--custom-active-bg, var(--color-warning));
}
</style>