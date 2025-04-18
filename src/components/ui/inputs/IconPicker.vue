<!-- src/components/ui/inputs/IconPicker.vue -->
<template>
  <div class="icon-picker-container">
    <div class="icon-selector" @click="openIconSelector">
      <div v-if="modelValue" class="selected-icon">
        <component :is="modelValue" class="icon" />
      </div>
      <div v-else class="icon-plus">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.81212 14V0H8.18788V14H5.81212ZM0 8.18788V5.81212H14V8.18788H0Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const openIconSelector = () => {
  // На этом этапе просто эмитим пустой компонент
  // В будущем здесь будет открываться селектор иконок
  emit('update:modelValue', null);
};
</script>

<style scoped>
.icon-picker-container {
  position: relative;
}

.icon-selector {
  width: 60px;
  height: 60px;
  background-color: var(--bg-light);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.icon-selector:hover {
  background-color: var(--bg-contrast);
}

.icon-plus {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-usual);
}

.selected-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--text-usual);
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  width: var(--icon-size);
  height: var(--icon-size);
}
</style>