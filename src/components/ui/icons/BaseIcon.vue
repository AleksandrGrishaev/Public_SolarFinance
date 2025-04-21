<!-- src/components/ui/icons/BaseIcon.vue -->
<template>
  <div 
    class="base-icon" 
    :class="[
      size ? `size-${size}` : '', 
      customClass, 
      clickable ? 'clickable' : '',
      rounded ? `rounded-${rounded}` : '',
      bordered ? 'bordered' : ''
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
  }
});

const emit = defineEmits(['click']);

// Merge custom styles with background color
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
  
  return styles;
});

// Calculate the actual icon size based on the container size
const computedIconSize = computed(() => {
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
  
  // If size is a number, use 65% of the container size
  return typeof props.size === 'number' ? Math.round(props.size * 0.65) : 18;
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

/* Predefined sizes */
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

/* Rounded variants */
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