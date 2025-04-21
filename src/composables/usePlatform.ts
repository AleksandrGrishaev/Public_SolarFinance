// src/composables/usePlatform.ts
import { ref, onMounted } from 'vue';

export type Platform = 'ios' | 'android' | 'web';

export function usePlatform() {
  const platform = ref<Platform>('web');
  const isIOS = ref(false);
  const isAndroid = ref(false);
  const isMobile = ref(false);
  
  // Safe area insets based on platform
  const safeAreaInsets = ref({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  onMounted(() => {
    detectPlatform();
    calculateSafeArea();
  });

  const detectPlatform = (): void => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      platform.value = 'ios';
      isIOS.value = true;
      isMobile.value = true;
    } 
    // Android detection
    else if (/android/i.test(userAgent)) {
      platform.value = 'android';
      isAndroid.value = true;
      isMobile.value = true;
    } 
    // Default to web
    else {
      platform.value = 'web';
      isIOS.value = false;
      isAndroid.value = false;
      isMobile.value = false;
    }
  };

  const calculateSafeArea = (): void => {
    // Default values based on common device safe areas
    if (platform.value === 'ios') {
      // Modern iPhones with notch or Dynamic Island
      safeAreaInsets.value = {
        top: 44,
        bottom: 34,
        left: 0,
        right: 0
      };
    } else if (platform.value === 'android') {
      // Most Android devices with status bar
      safeAreaInsets.value = {
        top: 24,
        bottom: 0,
        left: 0,
        right: 0
      };
    } else {
      // Web browsers
      safeAreaInsets.value = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
    }

    // Use environment variables if you want to override these values
    // for development or testing purposes
    const envTop = import.meta.env?.VITE_SAFE_AREA_TOP;
    if (envTop) {
      safeAreaInsets.value.top = parseInt(envTop, 10);
    }
  };

  return {
    platform,
    isIOS,
    isAndroid,
    isMobile,
    safeAreaInsets
  };
}