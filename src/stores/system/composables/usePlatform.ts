// src/stores/system/composables/usePlatform.ts
import { computed, onMounted } from 'vue';
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
    }
  });

  return {
    // Platform information
    platform: computed(() => systemStore.platform),
    isIOS: computed(() => systemStore.isIOS),
    isAndroid: computed(() => systemStore.isAndroid),
    isMobile: computed(() => systemStore.isMobile),
    isNativePlatform: computed(() => systemStore.isNativePlatform),
    
    // Safe area insets
    safeAreaInsets: computed(() => systemStore.safeAreaInsets),
    
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
    })
  };
}