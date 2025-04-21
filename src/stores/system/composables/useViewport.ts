// src/stores/system/composables/useViewport.ts
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useSystemStore, type ViewportInfo } from '../systemStore';

/**
 * Composable для работы с размерами экрана и ориентацией
 */
export function useViewport() {
  const systemStore = useSystemStore();
  
  // Initialize viewport on component mount
  onMounted(() => {
    // Update viewport information if needed
    systemStore.updateViewport();
    
    // Setup resize listeners if not already setup
    systemStore.setupViewportListeners();
    
    // Log current viewport info
    console.log('[useViewport] Current viewport:', systemStore.viewport);
  });
  
  // Clean up event listeners when component is unmounted
  onBeforeUnmount(() => {
    systemStore.cleanupListeners();
  });
  
  // Watch for viewport changes with detailed logging
  watch(
    () => systemStore.viewport,
    (newViewport, oldViewport) => {
      // Проверяем, есть ли значимые изменения, чтобы не логировать каждый пиксель
      const significantWidthChange = Math.abs(newViewport.width - oldViewport.width) > 10;
      const significantHeightChange = Math.abs(newViewport.height - oldViewport.height) > 10;
      const orientationChange = newViewport.orientation !== oldViewport.orientation;
      
      // Логируем только при значимых изменениях
      if (orientationChange || significantWidthChange || significantHeightChange) {
        console.group('[useViewport] Viewport changed');
        
        // Логируем изменения ориентации в первую очередь
        if (orientationChange) {
          console.log(`Orientation changed: ${oldViewport.orientation} → ${newViewport.orientation}`);
        }
        
        // Логируем изменения размеров только если они значимые
        if (significantWidthChange) {
          console.log(`Width changed: ${oldViewport.width}px → ${newViewport.width}px`);
        }
        
        if (significantHeightChange) {
          console.log(`Height changed: ${oldViewport.height}px → ${newViewport.height}px`);
        }
        
        console.log(`Aspect ratio: ${newViewport.aspectRatio.toFixed(2)}`);
        console.groupEnd();
      }
    },
    { deep: true }
  );
  
  // Computed properties for responsive design
  const isMobile = computed(() => systemStore.viewport.width < 768);
  const isTablet = computed(() => systemStore.viewport.width >= 768 && systemStore.viewport.width < 1024);
  const isDesktop = computed(() => systemStore.viewport.width >= 1024);
  const isPortrait = computed(() => systemStore.viewport.orientation === 'portrait');
  const isLandscape = computed(() => systemStore.viewport.orientation === 'landscape');

  return {
    // Raw viewport information
    viewport: computed(() => systemStore.viewport),
    width: computed(() => systemStore.viewport.width),
    height: computed(() => systemStore.viewport.height),
    orientation: computed(() => systemStore.viewport.orientation),
    aspectRatio: computed(() => systemStore.viewport.aspectRatio),
    
    // Responsive breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    
    // Helper functions
    /**
     * Check if viewport width is at least the specified value
     */
    isMinWidth: (minWidth: number) => systemStore.viewport.width >= minWidth,
    
    /**
     * Check if viewport width is at most the specified value
     */
    isMaxWidth: (maxWidth: number) => systemStore.viewport.width <= maxWidth,
    
    /**
     * Force update viewport information
     */
    updateViewport: () => systemStore.updateViewport()
  };
}