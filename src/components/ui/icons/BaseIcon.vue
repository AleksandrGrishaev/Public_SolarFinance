<!-- src/components/ui/icons/BaseIcon.vue -->
<template>
  <div 
    class="base-icon" 
    :class="[
      size ? `size-${size}` : '', 
      customClass, 
      clickable ? 'clickable' : '',
      rounded ? `rounded-${rounded}` : '',
      bordered ? 'bordered' : '',
      padding !== null ? 'has-padding' : ''
    ]"
    :style="mergedStyle"
    @click="handleClick"
  >
    <component 
      :is="icon" 
      :size="computedIconSize" 
      :stroke="stroke"
      :color="color"
      v-bind="$attrs"
      class="icon-component"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  // Icon component from @tabler/icons-vue
  icon: {
    type: Object,
    required: true
  },
  // Predefined sizes: xs, sm, md, lg, xl or custom number
  size: {
    type: [String, Number],
    default: 'md'
  },
  // Custom icon size in pixels (overrides the container size ratio)
  iconSize: {
    type: Number,
    default: null
  },
  // Stroke width for the icon
  stroke: {
    type: Number,
    default: 1.5
  },
  // Icon color
  color: {
    type: String,
    default: 'currentColor'
  },
  // Border radius: none, sm, md, lg, xl, xxl, xxxl or 'full' for circle
  rounded: {
    type: String,
    default: null
  },
  // Background color
  background: {
    type: String,
    default: null
  },
  // Border color (если null, то будет использоваться background)
  borderColor: {
    type: String,
    default: null
  },
  // Border width
  borderWidth: {
    type: [String, Number],
    default: 1
  },
  // Whether to show border
  bordered: {
    type: Boolean,
    default: false
  },
  // Padding around the icon
  padding: {
    type: [String, Number],
    default: null
  },
  // If the icon is clickable
  clickable: {
    type: Boolean,
    default: false
  },
  // Custom class for the icon
  customClass: {
    type: String,
    default: ''
  },
  // Custom styles for the icon
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // Auto sizing (автоматически рассчитывать размер контейнера)
  autoSize: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

// Получаем размер иконки в пикселях
const baseIconSize = computed(() => {
  if (props.iconSize) return props.iconSize;
  
  // Default size mapping for icon (smaller than container)
  const iconSizeMap = {
    'xs': 12,
    'sm': 16,
    'md': 18,
    'lg': 24,
    'xl': 30
  };
  
  if (typeof props.size === 'string') {
    return iconSizeMap[props.size] || 18;
  }
  
  // If size is a number, return it directly
  return typeof props.size === 'number' ? props.size : 18;
});

// Вычисляем размер иконки с учетом padding и других факторов
const computedIconSize = computed(() => {
  // Если autoSize = false, используем стандартный расчет
  if (!props.autoSize) {
    const iconSizeMap = {
      'xs': 12,
      'sm': 16,
      'md': 18,
      'lg': 24,
      'xl': 30
    };
    
    if (typeof props.size === 'string') {
      return iconSizeMap[props.size] || 18;
    }
    
    return typeof props.size === 'number' ? Math.round(props.size * 0.65) : 18;
  }
  
  // Если autoSize = true, просто возвращаем baseIconSize
  return baseIconSize.value;
});

// Получаем padding в пикселях
const paddingValue = computed(() => {
  if (props.padding === null) return 0;
  
  if (typeof props.padding === 'number') {
    return props.padding;
  }
  
  // Если padding задан как строка, пытаемся извлечь числовое значение
  const match = props.padding.match(/^(\d+)(?:px)?$/);
  return match ? parseInt(match[1], 10) : 6;
});

// Расчет ширины и высоты контейнера
const containerSize = computed(() => {
  if (!props.autoSize) return null;
  
  // Базовый размер иконки + padding с обеих сторон
  return baseIconSize.value + (paddingValue.value * 2);
});

// Расчет border-radius
const borderRadiusValue = computed(() => {
  if (!props.rounded) return null;
  
  if (props.rounded === 'full') {
    // Если autoSize = true, возвращаем 50% для круглой иконки
    if (props.autoSize) {
      return '50%';
    }
    
    // Иначе используем предопределенное значение для круглых иконок
    return '50%';
  }
  
  // Для других типов скругления используем CSS-переменные или фиксированные значения
  const radiusMap = {
    'sm': 'var(--border-radius-sm, 8px)',
    'md': 'var(--border-radius-md, 14px)',
    'lg': 'var(--border-radius-lg, 28px)',
    'xl': 'var(--border-radius-xl, 34px)',
    'xxl': '40px',
    'xxxl': 'var(--border-radius-xxxl, 48px)'
  };
  
  return radiusMap[props.rounded] || null;
});

// Объединяем пользовательские стили и вычисленные стили
const mergedStyle = computed(() => {
  const styles = { ...props.customStyle };
  
  // Apply background color if provided
  if (props.background) {
    styles.backgroundColor = props.background;
  }
  
  // Apply border styles if bordered
  if (props.bordered) {
    styles.borderStyle = 'solid';
    styles.borderWidth = typeof props.borderWidth === 'number' ? 
      `${props.borderWidth}px` : props.borderWidth;
    styles.borderColor = props.borderColor || props.background || 'currentColor';
  }
  
  // Apply padding if provided
  if (props.padding !== null) {
    styles.padding = typeof props.padding === 'number' ? 
      `${props.padding}px` : props.padding;
  }
  
  // Если включен autoSize, явно задаем ширину и высоту
  if (props.autoSize && containerSize.value) {
    styles.width = `${containerSize.value}px`;
    styles.height = `${containerSize.value}px`;
  }
  
  // Устанавливаем border-radius
  if (borderRadiusValue.value) {
    styles.borderRadius = borderRadiusValue.value;
  }
  
  return styles;
});

// Handle click event
const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event);
  }
};
</script>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  position: relative;
  box-sizing: border-box;
  aspect-ratio: 1;
}

.icon-component {
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
}

.bordered {
  border-style: solid;
}

.has-padding {
  /* Гарантируем, что padding применяется */
  padding: var(--padding, 6px);
}

/* Predefined sizes - используются только если autoSize = false */
.size-xs {
  width: 16px;
  height: 16px;
}

.size-sm {
  width: 20px;
  height: 20px;
}

.size-md {
  width: 24px;
  height: 24px;
}

.size-lg {
  width: 32px;
  height: 32px;
}

.size-xl {
  width: 40px;
  height: 40px;
}

/* For custom numeric sizes */
.base-icon[style*="width"][style*="height"] {
  display: inline-flex;
}

/* Rounded variants - используются только если не указан явный border-radius в styles */
.rounded-sm {
  border-radius: var(--border-radius-sm, 8px);
}

.rounded-md {
  border-radius: var(--border-radius-md, 14px);
}

.rounded-lg {
  border-radius: var(--border-radius-lg, 28px);
}

.rounded-xl {
  border-radius: var(--border-radius-xl, 34px);
}

.rounded-xxl {
  border-radius: 40px;
}

.rounded-xxxl {
  border-radius: var(--border-radius-xxxl, 48px);
}

.rounded-full {
  border-radius: 50%;
}

/* Clickable state */
.clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clickable:hover {
  opacity: 0.8;
}

.clickable:active {
  opacity: 0.6;
}
</style>