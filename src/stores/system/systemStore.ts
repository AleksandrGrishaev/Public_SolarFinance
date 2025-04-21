// src/stores/system/systemStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Определим интерфейсы прямо здесь, чтобы избежать проблем с импортом
export type PlatformType = 'ios' | 'android' | 'web';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface KeyboardState {
  isVisible: boolean;
  height: number;
}

export const useSystemStore = defineStore('system', () => {
  // Platform state
  const platform = ref<PlatformType>('web');
  const isIOS = ref(false);
  const isAndroid = ref(false);
  const isMobile = ref(false);
  
  // Safe area insets
  const safeAreaInsets = ref<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  
  // Keyboard state
  const keyboard = ref<KeyboardState>({
    isVisible: false,
    height: 0
  });

  // Computed properties
  const isNativePlatform = computed(() => isIOS.value || isAndroid.value);
  
  /**
   * Detect platform type based on user agent
   */
  function detectPlatform(): void {
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
  }

  /**
   * Calculate safe area insets based on platform
   */
  function calculateSafeArea(): void {
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
  }

  /**
   * Set keyboard state
   */
  function setKeyboardState(isVisible: boolean, height: number = 0): void {
    keyboard.value = {
      isVisible,
      height
    };
  }

  /**
   * Setup keyboard event listeners for native platforms
   */
  function setupKeyboardListeners(): void {
    // В реальном приложении здесь бы использовался Capacitor или другой фреймворк
    // для слушания нативных событий клавиатуры
    
    // Пример с Capacitor:
    /*
    import { Keyboard } from '@capacitor/keyboard';
    
    Keyboard.addListener('keyboardWillShow', (info) => {
      setKeyboardState(true, info.keyboardHeight);
    });
    
    Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardState(false, 0);
    });
    */
  }

  /**
   * Initialize the system store
   */
  function initialize(): void {
    detectPlatform();
    calculateSafeArea();
    
    // Setup keyboard event listeners for mobile platforms
    if (isMobile.value) {
      setupKeyboardListeners();
    }
  }

  return {
    // State
    platform,
    isIOS,
    isAndroid,
    isMobile,
    safeAreaInsets,
    keyboard,
    
    // Computed
    isNativePlatform,
    
    // Actions
    detectPlatform,
    calculateSafeArea,
    setKeyboardState,
    initialize,
    setupKeyboardListeners
  };
});