<!-- src/components/ui/inputs/ColorPicker.vue -->
<template>
  <div class="color-picker-container">
    <div class="color-preview" @click="openColorPicker"></div>
  </div>
  <!-- n-color-picker вынесен за пределы основного контейнера -->
  <n-color-picker 
    v-model:value="colorValue" 
    :show="showPicker"
    :show-alpha="false"
    :actions="['confirm']"
    @confirm="handleConfirm"
    @close="showPicker = false"
    class="n-color-picker"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { NColorPicker } from 'naive-ui';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'var(--bg-light)'
  }
});

const emit = defineEmits(['update:modelValue']);

const colorValue = ref(props.modelValue);
const showPicker = ref(false);

// Sync with v-model
watch(() => props.modelValue, (newVal) => {
  colorValue.value = newVal;
});

watch(() => colorValue.value, (newVal) => {
  emit('update:modelValue', newVal);
});

const openColorPicker = () => {
  showPicker.value = true;
};

const handleConfirm = () => {
  showPicker.value = false;
  emit('update:modelValue', colorValue.value);
};
</script>

<style scoped>
.color-picker-container {
  position: relative;
}

.color-preview {
  width: 83px;
  height: var(--toggle-height);
  background-color: v-bind('colorValue || "var(--bg-light)"');
  border-radius: var(--input-radius);
  cursor: pointer;
  transition: box-shadow var(--transition-speed) var(--transition-fn);
}

.color-preview:hover {
  box-shadow: var(--shadow-sm);
}

/* Стили для наивного колорпикера */
:deep(.n-color-picker) {
  position: absolute;
  top: 40px;
  right: 0;
  z-index: var(--z-index-dropdown);
  box-shadow: var(--shadow-md);
}

:deep(.n-color-picker-trigger) {
  display: none;
}
</style>