<!-- src/components/ui/BasePopup.vue -->
<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="modelValue" class="popup-overlay" @click="closeOnOverlayClick && $emit('update:modelValue', false)">
        <div class="popup-container" :class="{ 'popup-open': modelValue }" @click.stop>
          <div class="popup-header">
            <div class="close-icon-wrapper" @click="$emit('update:modelValue', false)">
              <IconX class="icon-close" />
            </div>
            
            <div class="popup-title">
              <slot name="title">{{ title }}</slot>
            </div>
            
            <div v-if="rightIcon" class="right-icon-wrapper" @click="$emit('rightIconClick')">
              <component :is="rightIcon" class="icon-right" />
            </div>
            <div v-else class="icon-placeholder"></div>
          </div>
          
          <div class="popup-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  rightIcon: {
    type: Object,
    default: null
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  }
});

defineEmits(['update:modelValue', 'rightIconClick']);
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
}

.popup-container {
  background: #404040;
  border-top-left-radius: 48px;
  border-top-right-radius: 48px;
  width: 100vw;
  padding-top: 16px;
  max-height: 80vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  box-sizing: border-box;
  position: fixed;
  left: 0;
  bottom: 0;
}

.popup-open {
  transform: translateY(0);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 21px;
  width: 100%;
  box-sizing: border-box;
}

.close-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.right-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.icon-placeholder {
  width: 24px;
  height: 24px;
}

.popup-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

.popup-content {
  padding: 13px 16px 30px 16px;
  width: 100%;
  box-sizing: border-box;
}

.icon-close {
  color: #A44942;
  width: 18px;
  height: 18px;
}

.icon-right {
  color: #DBDADD;
  width: 18px;
  height: 18px;
}

/* Transitions */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-fade-enter-to,
.popup-fade-leave-from {
  opacity: 1;
}
</style>