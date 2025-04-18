<!-- src/components/ui/inputs/TextInput.vue -->
<template>
  <div class="text-input-container">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :type="type"
      class="text-input"
      @input="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', event.target.value);
};
</script>

<style scoped>
.text-input-container {
  width: 100%;
}

.text-input {
  height: var(--input-height);
  background-color: var(--input-bg);
  border: none;
  border-radius: var(--input-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--input-color);
  font-size: var(--font-body-size);
  width: 100%;
  box-sizing: border-box;
  transition: all var(--transition-speed) var(--transition-fn);
}

.text-input::placeholder {
  color: var(--text-inactive);
  opacity: 0.7;
}

.text-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-color);
}

.text-input:disabled {
  opacity: var(--state-disabled-opacity);
  cursor: not-allowed;
}
</style>