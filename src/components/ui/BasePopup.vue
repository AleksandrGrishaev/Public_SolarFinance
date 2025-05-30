<!-- src/components/ui/BasePopup.vue -->
<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="modelValue" class="popup-overlay" @click="closeOnOverlayClick && $emit('update:modelValue', false)">
        <div 
          class="popup-container bg-popup" 
          :class="{ 
            'popup-open': modelValue,
            'popup-extended': extendedMode 
          }" 
          @click.stop
        >
          <!-- Заголовок попапа -->
          <div class="popup-header">
            <!-- Левая часть (кнопка закрытия) -->
            <div class="close-icon-wrapper" @click="$emit('update:modelValue', false)">
              <slot name="leftIcon">
                <IconX class="icon-close color-warning" />
              </slot>
            </div>
            
            <!-- Центральная часть (заголовок) -->
            <div class="popup-title text-header">
              <slot name="title">{{ title }}</slot>
            </div>
            
            <!-- Правая часть (кнопка действия) -->
            <div v-if="rightContent" class="right-content-wrapper">
              <slot name="rightContent"></slot>
            </div>
            <div v-else-if="rightIcon" class="right-icon-wrapper" @click="$emit('rightIconClick')">
              <component :is="rightIcon" class="icon-right text-subheader" />
            </div>
            <div v-else class="icon-placeholder">
              <slot name="rightIcon"></slot>
            </div>
          </div>
          
          <!-- Содержимое попапа -->
          <div class="popup-content" :class="{ 'content-extended': extendedMode }">
            <slot></slot>
          </div>
          
          <!-- Подвал попапа (опционально) -->
          <div v-if="hasFooter" class="popup-footer">
            <slot name="footer"></slot>
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
  rightContent: {
    type: Boolean,
    default: false
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  },
  extendedMode: {
    type: Boolean,
    default: false
  },
  hasFooter: {
    type: Boolean,
    default: false
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
  border-top-left-radius: 48px;
  border-top-right-radius: 48px;
  width: 100vw;
  padding-top: 16px;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease-out, max-height 0.3s ease;
  box-sizing: border-box;
  position: fixed;
  left: 0;
  bottom: 0;
}

/* Специальный класс для режима с календарем */
.popup-container.popup-extended {
  max-height: 90vh; /* Увеличиваем максимальную высоту */
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

.right-content-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  min-width: 24px;
}

.icon-placeholder {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  padding: 13px 16px 0px 16px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  color: var(--text-usual);
}

/* Специальный класс для контента при открытом календаре */
.popup-content.content-extended {
  overflow: visible !important;
  padding-bottom: 250px; /* Добавляем дополнительное пространство снизу для календаря */
}

.popup-footer {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.icon-close {
  width: 14px;
  height: 14px;
}

.icon-right {
  width: 18px;
  height: 18px;
}

/* Переопределение анимаций в соответствии с main.scss */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity var(--transition-speed) var(--transition-fn);
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