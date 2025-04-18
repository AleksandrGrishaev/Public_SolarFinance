// src/composables/ui/useGridLayout.ts
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { GridLayoutOptions, UseGridLayoutReturn } from './useGridLayoutTypes';

// This composable handles responsive grid layout calculations
export function useGridLayout(options: GridLayoutOptions = {}): UseGridLayoutReturn {
  // Default options
  const {
    defaultItemsPerRow = 4,    // Default number of items per row (for small screens)
    largeScreenItemsPerRow = 5, // Number of items per row for larger screens
    minItemSize = 45,          // Minimum icon size in pixels
    optimalItemSize = 56,      // Standard/ideal icon size
    gapSize = 12,              // Gap between items
    breakpoint = 390,          // Width breakpoint for layout change
    debug = false              // Debug mode flag
  } = options;

  // Refs for measurements
  const containerRef = ref(null);
  const windowWidth = ref(window.innerWidth);
  const items = ref([]);

  // Layout state
  const layoutState = ref({
    itemsPerRow: defaultItemsPerRow,
    itemSize: optimalItemSize,
    containerWidth: 0,
    calculatedItemWidth: 0
  });

  // Calculate number of filler items for the last row
  const fillerItemsCount = computed(() => {
    const totalItems = items.value.length;
    if (totalItems === 0) return 0;
    
    const itemsPerRow = layoutState.value.itemsPerRow;
    const remainder = totalItems % itemsPerRow;
    
    // If items fit perfectly, no fillers needed
    if (remainder === 0) return 0;
    
    // Otherwise add enough to fill the last row
    return itemsPerRow - remainder;
  });

  // Calculate grid cell style
  const gridCellStyle = computed(() => {
    // Reduce width by a small amount to prevent wrapping issues
    const cellWidth = layoutState.value.calculatedItemWidth - 3;
    
    return {
      width: `${cellWidth}px`,
      marginRight: `${gapSize}px`,
      marginBottom: `${gapSize}px`
    };
  });

  // Calculate icon style
  const iconStyle = computed(() => {
    const { itemSize } = layoutState.value;
    return {
      width: `${itemSize}px`,
      height: `${itemSize}px`
    };
  });

  // Function to calculate optimal layout
  const calculateLayout = () => {
    if (!containerRef.value) return;
    
    // Measure the current container width
    const containerWidth = Math.floor(containerRef.value.clientWidth);
    
    // Determine optimal number of items per row based on screen width
    let itemsPerRow = defaultItemsPerRow;
    
    if (windowWidth.value >= breakpoint) {
      // Check if larger itemsPerRow can fit with gaps
      const totalGapWidthForLarge = gapSize * largeScreenItemsPerRow;
      const availableWidthForLarge = containerWidth - totalGapWidthForLarge;
      const itemWidthForLarge = Math.floor(availableWidthForLarge / largeScreenItemsPerRow);
      
      if (itemWidthForLarge >= minItemSize) {
        itemsPerRow = largeScreenItemsPerRow;
      }
    }
    
    // Calculate item size based on available space
    const totalGapWidth = gapSize * (itemsPerRow - 1);
    const availableWidth = containerWidth - totalGapWidth;
    
    // Calculate item width and round down to integer
    const calculatedItemWidth = Math.floor(availableWidth / itemsPerRow);
    
    // Determine final icon size
    let itemSize = Math.min(calculatedItemWidth, optimalItemSize * 1.2);
    itemSize = Math.floor(Math.max(itemSize, minItemSize)); // Not less than minimum
    
    if (debug) {
      console.group('Grid layout calculation');
      console.log('Window width:', Math.floor(windowWidth.value), 'px');
      console.log('Container width:', containerWidth, 'px');
      console.log('Items per row:', itemsPerRow);
      console.log('Gap:', gapSize, 'px');
      console.log('Total gap width:', gapSize * (itemsPerRow - 1), 'px');
      console.log('Available width for cells:', containerWidth - gapSize * (itemsPerRow - 1), 'px');
      console.log('Calculated cell width:', calculatedItemWidth, 'px');
      console.log('Final icon size:', itemSize, 'px');
      console.log('Total items:', items.value.length);
      console.log('Filler items count:', fillerItemsCount.value);
      console.groupEnd();
    }
    
    // Update state
    layoutState.value = {
      itemsPerRow,
      itemSize,
      containerWidth,
      calculatedItemWidth
    };
  };

  // Window resize handler
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
    calculateLayout();
  };

  // Setup and cleanup
  onMounted(() => {
    window.addEventListener('resize', handleResize);
    // Initial calculation will happen when component using this calls calculateLayout
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  // Set items to calculate proper fillers
  const setItems = (newItems) => {
    items.value = newItems;
    calculateLayout();
  };

  return {
    containerRef,
    layoutState,
    fillerItemsCount,
    gridCellStyle,
    iconStyle,
    calculateLayout,
    setItems
  };
}