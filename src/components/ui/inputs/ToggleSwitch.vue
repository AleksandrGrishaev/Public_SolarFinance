<!-- src/components/ui/inputs/ToggleSwitch.vue -->
<template>
  <div 
    class="toggle-switch" 
    :class="{ 'disabled': disabled }"
    @click="!disabled && toggle()"
  >
    <div 
      class="toggle-track" 
      :class="{ 'toggle-on': modelValue }"
      :style="{ 
        backgroundColor: modelValue ? activeColor : inactiveColor 
      }"
    >
      <div class="toggle-thumb"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  activeColor: {
    type: String,
    default: 'var(--toggle-bg-active)' // Используем переменную из дизайн-системы
  },
  inactiveColor: {
    type: String,
    default: 'var(--toggle-bg-inactive)' // Используем переменную из дизайн-системы
  },
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default', // Can be 'default' or 'error'
    validator: (value: string) => ['default', 'error'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};
</script>

<style scoped>
.toggle-switch {
  width: 59px;
  height: var(--toggle-height);
  cursor: pointer;
  transition: opacity var(--transition-speed) var(--transition-fn);
}

.toggle-switch.disabled {
  opacity: var(--state-disabled-opacity);
  cursor: not-allowed;
}

.toggle-track {
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-lg);
  position: relative;
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(var(--toggle-height) - 6px);
  height: calc(var(--toggle-height) - 6px);
  background-color: var(--text-contrast);
  border-radius: 50%;
  transition: left var(--transition-speed) var(--transition-fn);
}

.toggle-track.toggle-on .toggle-thumb {
  left: calc(100% - 3px - (var(--toggle-height) - 6px));
}
</style>