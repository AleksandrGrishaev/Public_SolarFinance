// src/stores/system/types.ts

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