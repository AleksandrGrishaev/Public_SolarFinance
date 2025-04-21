// src/stores/system/composables/usePlatform.ts
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useSystemStore } from '../systemStore';

/**
 * Composable для работы с платформой и безопасными зонами
 */
export function usePlatform() {
  const systemStore = useSystemStore();
  
  // Initialize platform detection on component mount
  onMounted(() => {
    // If not already initialized
    if (!systemStore.isMobile && !systemStore.isNativePlatform) {
      systemStore.detectPlatform();
      systemStore.calculateSafeArea();
      systemStore.updateViewport();
    }
    
    // Setup resize listeners if not already setup
    systemStore.setupViewportListeners();
  });
  
  // Clean up event listeners when component is unmounted
  onBeforeUnmount(() => {
    systemStore.cleanupListeners();
  });
  
  // Watch for viewport changes
  watch(
    () => systemStore.viewport,
    (newViewport) => {
      // Выводим в консоль только когда меняется ориентация
      if (newViewport.orientation !== 'portrait' && newViewport.orientation !== 'landscape') {
        console.log('[usePlatform] Viewport changed:', newViewport);
      }
    },
    { deep: true }
  );

  return {
    // Platform information
    platform: computed(() => systemStore.platform),
    isIOS: computed(() => systemStore.isIOS),
    isAndroid: computed(() => systemStore.isAndroid),
    isMobile: computed(() => systemStore.isMobile),
    isNativePlatform: computed(() => systemStore.isNativePlatform),
    
    // Safe area insets
    safeAreaInsets: computed(() => systemStore.safeAreaInsets),
    
    // Viewport information
    viewport: computed(() => systemStore.viewport),
    
    // Keyboard information
    keyboard: computed(() => systemStore.keyboard),
    isKeyboardVisible: computed(() => systemStore.keyboard.isVisible),
    keyboardHeight: computed(() => systemStore.keyboard.height),
    
    // Helper for content padding when keyboard is visible
    // Useful for adjusting content layout when keyboard appears
    contentPadding: computed(() => {
      return {
        paddingBottom: systemStore.keyboard.isVisible 
          ? `${systemStore.keyboard.height}px` 
          : `${systemStore.safeAreaInsets.bottom}px`
      };
    }),
    
    // Print system information to console
    printSystemInfo: () => systemStore.printSystemInfo()
  };
}