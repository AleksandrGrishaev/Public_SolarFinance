// src/stores/system/composables/useApp.ts
import { onMounted, onBeforeUnmount } from 'vue';
import { useSystemStore } from '../systemStore';
import { useRouter } from 'vue-router';
import { appInitService } from '@/services/system/AppInitService';

/**
 * Composable для основных настроек приложения и установки событий ЖЦ
 */
export function useApp() {
  const systemStore = useSystemStore();
  const router = useRouter();
  
  // Initialize the app when component is mounted
  onMounted(() => {
    // Initialize platform detection and settings
    systemStore.detectPlatform();
    systemStore.calculateSafeArea();
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);
    
    // Initial resize calculation
    handleResize();
  });
  
  // Clean up event listeners when component is unmounted
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });
  
  /**
   * Handle window resize events
   */
  const handleResize = () => {
    // Recalculate safe area insets if needed
    // This might be useful when device orientation changes
    systemStore.calculateSafeArea();
  };
  
  /**
   * Go back using native or browser navigation
   */
  const goBack = () => {
    router.back();
  };
  
  /**
   * Reinitialize the application
   * This is useful when you need to refresh app state
   */
  const reinitializeApp = async () => {
    try {
      await appInitService.initializeApp();
      return true;
    } catch (error) {
      console.error('[useApp] Failed to reinitialize app:', error);
      return false;
    }
  };
  
  return {
    goBack,
    reinitializeApp,
    isInitialized: appInitService.isInitialized
  };
}