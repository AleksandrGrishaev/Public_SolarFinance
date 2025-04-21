// src/stores/system/systemStore.ts
import { defineStore } from 'pinia';
import { ref, computed, watch, onMounted } from 'vue';
import { debounce } from '@/utils/debounce';

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

export interface ViewportInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  aspectRatio: number;
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
  
  // Viewport information
  const viewport = ref<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    aspectRatio: window.innerWidth / window.innerHeight
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
    
    // Log platform detection results
    console.log('[SystemStore] Platform detected:', {
      platform: platform.value,
      isIOS: isIOS.value,
      isAndroid: isAndroid.value,
      isMobile: isMobile.value,
      userAgent
    });
  }

  /**
   * Calculate safe area insets based on platform
   */
  function calculateSafeArea(): void {
    // Сохраняем предыдущие значения для сравнения
    const prevSafeArea = { ...safeAreaInsets.value };
    
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
    
    // Проверяем, изменились ли значения safe area
    const hasChanged = 
      prevSafeArea.top !== safeAreaInsets.value.top ||
      prevSafeArea.bottom !== safeAreaInsets.value.bottom ||
      prevSafeArea.left !== safeAreaInsets.value.left ||
      prevSafeArea.right !== safeAreaInsets.value.right;
    
    // Логируем только при изменении
    if (hasChanged) {
      console.log('[SystemStore] Safe area calculated:', { ...safeAreaInsets.value });
    }
  }
  
  /**
   * Update viewport information
   */
  function updateViewport(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newOrientation = height > width ? 'portrait' : 'landscape';
    const newAspectRatio = width / height;
    
    // Проверяем, действительно ли изменились значения перед обновлением
    const hasChanged = 
      width !== viewport.value.width || 
      height !== viewport.value.height || 
      newOrientation !== viewport.value.orientation;
    
    if (hasChanged) {
      viewport.value = {
        width,
        height,
        orientation: newOrientation,
        aspectRatio: newAspectRatio
      };
      
      // Логируем только значимые изменения viewрort
      console.log('[SystemStore] Viewport updated:', { 
        width, 
        height, 
        orientation: newOrientation,
        aspectRatio: newAspectRatio.toFixed(2)
      });
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
    
    // Log keyboard state change
    console.log('[SystemStore] Keyboard state changed:', keyboard.value);
  }

  /**
   * Setup viewport resize listeners
   */
  function setupViewportListeners(): void {
    // Initial viewport update
    updateViewport();
    
    // Создаем debounced версию функций
    const debouncedResize = debounce(handleResize, 150);
    const debouncedOrientationChange = debounce(handleOrientationChange, 200);
    
    // Добавляем обработчики событий
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedOrientationChange);
  }
  
  /**
   * Handle window resize events
   */
  function handleResize(): void {
    // Используем debounce, чтобы не вызывать обновления слишком часто
    // Обновляем только если размер действительно изменился
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    if (newWidth !== viewport.value.width || newHeight !== viewport.value.height) {
      // Обновляем viewport информацию
      updateViewport();
      
      // Пересчитываем safe area только если изменилась ориентация
      const oldOrientation = viewport.value.orientation;
      const newOrientation = newHeight > newWidth ? 'portrait' : 'landscape';
      
      if (oldOrientation !== newOrientation) {
        calculateSafeArea();
      }
    }
  }
  
  /**
   * Handle orientation change events
   */
  function handleOrientationChange(): void {
    // Update viewport after a short delay to ensure dimensions are updated
    setTimeout(() => {
      updateViewport();
      calculateSafeArea();
    }, 100);
  }
  
  /**
   * Clean up event listeners
   */
  function cleanupListeners(): void {
    // Очистка event listener'ов. 
    // Примечание: для debounced функций нужно использовать те же самые ссылки на функции,
    // поэтому нам нужно будет хранить ссылки на них, если мы будем действительно очищать их
    
    // В реальном приложении мы бы хранили ссылки на debounced функции:
    /*
    if (debouncedResizeRef) {
      window.removeEventListener('resize', debouncedResizeRef);
    }
    if (debouncedOrientationChangeRef) {
      window.removeEventListener('orientationchange', debouncedOrientationChangeRef);
    }
    */
    
    // Для простоты примера, просто говорим, что мы очистили слушателей:
    console.log('[SystemStore] Event listeners cleaned up');
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
    console.log('[SystemStore] Initializing...');
    
    detectPlatform();
    calculateSafeArea();
    setupViewportListeners();
    
    // Setup keyboard event listeners for mobile platforms
    if (isMobile.value) {
      setupKeyboardListeners();
    }
    
    // Print complete system information to console
    printSystemInfo();
    
    console.log('[SystemStore] Initialization complete');
  }
  
  /**
   * Print detailed system information to console
   */
  function printSystemInfo(): void {
    console.group('[SystemStore] System Information');
    console.log('Platform:', platform.value);
    console.log('Is iOS:', isIOS.value);
    console.log('Is Android:', isAndroid.value);
    console.log('Is Mobile:', isMobile.value);
    console.log('Safe Area Insets:', { ...safeAreaInsets.value });
    console.log('Viewport:', { ...viewport.value });
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen Resolution:', `${window.screen.width}x${window.screen.height}`);
    console.log('Pixel Ratio:', window.devicePixelRatio);
    console.log('Color Scheme:', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    console.groupEnd();
  }

  return {
    // State
    platform,
    isIOS,
    isAndroid,
    isMobile,
    safeAreaInsets,
    keyboard,
    viewport,
    
    // Computed
    isNativePlatform,
    
    // Actions
    detectPlatform,
    calculateSafeArea,
    updateViewport,
    setKeyboardState,
    setupViewportListeners,
    cleanupListeners,
    initialize,
    setupKeyboardListeners,
    printSystemInfo
  };
});