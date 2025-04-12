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
  height: 36px;
  background-color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: #333;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
}

.text-input::placeholder {
  color: #999;
}

.text-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 183, 148, 0.3);
}
</style>