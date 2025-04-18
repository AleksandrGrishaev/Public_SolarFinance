// src/composables/ui/useGridLayout.types.ts

import { type Ref, type ComputedRef } from 'vue';

export interface GridLayoutOptions {
  defaultItemsPerRow?: number;    // Default number of items per row (for small screens)
  largeScreenItemsPerRow?: number; // Number of items per row for larger screens
  minItemSize?: number;           // Minimum icon size in pixels
  optimalItemSize?: number;       // Standard/ideal icon size
  gapSize?: number;               // Gap between items
  breakpoint?: number;            // Width breakpoint for layout change
  debug?: boolean;                // Debug mode flag
}

export interface LayoutState {
  itemsPerRow: number;
  itemSize: number;
  containerWidth: number;
  calculatedItemWidth: number;
}

export interface GridCellStyle {
  width: string;
  marginRight: string;
  marginBottom: string;
}

export interface IconStyle {
  width: string;
  height: string;
}

export interface UseGridLayoutReturn {
  containerRef: Ref<HTMLElement | null>;
  layoutState: Ref<LayoutState>;
  fillerItemsCount: ComputedRef<number>;
  gridCellStyle: ComputedRef<GridCellStyle>;
  iconStyle: ComputedRef<IconStyle>;
  calculateLayout: () => void;
  setItems: (newItems: any[]) => void;
}