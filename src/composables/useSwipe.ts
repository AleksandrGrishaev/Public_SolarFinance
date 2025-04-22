// src/composables/useSwipe.ts
import { ref, computed } from 'vue';

export type SwipeDirection = 'none' | 'left' | 'right';

interface SwipeOptions {
  /**
   * Pixels needed to trigger a swipe action
   */
  threshold?: number;
  /**
   * Maximum swipe distance in pixels
   */
  maxSwipe?: number;
  /**
   * Resistance factor for swipe beyond maxSwipe (0-1, where 1 is no resistance)
   */
  resistance?: number;
  /**
   * Callback for left swipe action
   */
  onLeftSwipe?: () => void;
  /**
   * Callback for right swipe action
   */
  onRightSwipe?: () => void;
  /**
   * Automatically reset swipe position after action
   */
  autoReset?: boolean;
  /**
   * Reset delay in milliseconds when autoReset is true
   */
  resetDelay?: number;
}

/**
 * Composable to handle swipe gestures
 */
export function useSwipe(options: SwipeOptions = {}) {
  const {
    threshold = 80,
    maxSwipe = 150,
    resistance = 0.4,
    onLeftSwipe,
    onRightSwipe,
    autoReset = true,
    resetDelay = 100
  } = options;

  const isSwiping = ref(false);
  const swipeDirection = ref<SwipeDirection>('none');
  const swipeOffset = ref(0);
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const isVerticalScroll = ref(false);
  
  /**
   * Computed style for the swiped element
   */
  const swipeStyle = computed(() => {
    if (swipeOffset.value === 0) return {};
    return {
      transform: `translateX(${swipeOffset.value}px)`,
      transition: isSwiping.value ? 'none' : 'transform 0.3s ease'
    };
  });
  
  /**
   * Reset swipe state
   */
  const resetSwipe = () => {
    swipeOffset.value = 0;
    swipeDirection.value = 'none';
    isSwiping.value = false;
  };
  
  /**
   * Handle touch start event
   */
  const onTouchStart = (event: TouchEvent) => {
    touchStartX.value = event.touches[0].clientX;
    touchStartY.value = event.touches[0].clientY;
    isSwiping.value = true;
    isVerticalScroll.value = false;
  };
  
  /**
   * Handle touch move event
   */
  const onTouchMove = (event: TouchEvent) => {
    if (!isSwiping.value) return;
    
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const diffX = currentX - touchStartX.value;
    const diffY = currentY - touchStartY.value;
    
    // Detect if this is more of a vertical scroll
    if (!isVerticalScroll.value) {
      if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
        isVerticalScroll.value = true;
        return;
      }
    }
    
    if (isVerticalScroll.value) return;
    
    // Prevent default to avoid page scrolling
    event.preventDefault();
    
    // Limit swipe distance and add resistance for smooth feel
    let newOffset = diffX;
    if (Math.abs(diffX) > maxSwipe) {
      const excess = Math.abs(diffX) - maxSwipe;
      newOffset = (diffX > 0 ? 1 : -1) * (maxSwipe + excess * resistance);
    }
    
    swipeOffset.value = newOffset;
    
    // Determine swipe direction
    if (diffX > threshold) {
      swipeDirection.value = 'left';
    } else if (diffX < -threshold) {
      swipeDirection.value = 'right';
    } else {
      swipeDirection.value = 'none';
    }
  };
  
  /**
   * Handle touch end event
   */
  const onTouchEnd = () => {
    if (!isSwiping.value || isVerticalScroll.value) {
      isSwiping.value = false;
      return;
    }
    
    // Perform action based on swipe direction
    if (swipeDirection.value === 'left' && onLeftSwipe) {
      onLeftSwipe();
    } else if (swipeDirection.value === 'right' && onRightSwipe) {
      onRightSwipe();
    }
    
    // Reset swipe position
    if (autoReset) {
      setTimeout(resetSwipe, resetDelay);
    } else {
      isSwiping.value = false;
    }
  };
  
  return {
    isSwiping,
    swipeDirection,
    swipeOffset,
    swipeStyle,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    resetSwipe
  };
}