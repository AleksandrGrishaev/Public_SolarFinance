// src/utils/forceThemeStyles.ts

/**
 * Принудительно применяет стили темы с помощью inline-стилей
 * Это гарантирует, что переменные CSS будут иметь правильные значения
 * даже если есть конфликты в CSS-файлах
 */
export function forceThemeStyles(isDark: boolean): void {
    // Определяем стили для темной и светлой тем
    const styles = isDark ? {
      // Темная тема
      '--text-header': '#FFFFFF',
      '--text-usual': '#F5F5F5',
      '--text-subheader': '#444444',
      '--text-grey': '#949496',
      '--text-inactive': '#DBDADD',
      '--text-contrast': '#FFFFFF',
      '--bg-icon': '#444444',
      '--color-primary': '#FFD452',
      '--color-warning': '#A44942',
      '--color-success': '#53B794',
      '--bg-contrast': '#404040',
      '--bg-light': '#949496',
      '--bg-main': '#333333',
      '--bg-superlight': '#F7F9F8',
      '--bg-screen': '#000000',
      '--bg-popup': '#404040',
      '--bg-field-light': '#949496',
      '--bg-field-dark': '#46484A',
      '--bg-dropdown': '#444444',
      '--bg-item-selected': '#000000',
      '--bg-item-unselected': '#949496',
      '--status-online': '#53B794',
      '--status-offline': '#FF5252',
      '--app-background': '#000000',
      '--text-primary': '#F5F5F5',
      '--text-secondary': '#949496',
      '--border-color': '#444444'
    } : {
      // Светлая тема
      '--text-header': '#333333',
      '--text-usual': '#333333',
      '--text-subheader': '#666666',
      '--text-grey': '#777777',
      '--text-inactive': '#999999',
      '--text-contrast': '#FFFFFF',
      '--bg-icon': '#FFFFFF',
      '--color-primary': '#FFB800',
      '--color-warning': '#D32F2F',
      '--color-success': '#2E7D32',
      '--bg-contrast': '#E0E0E0',
      '--bg-light': '#F0F0F0',
      '--bg-main': '#FFFFFF',
      '--bg-superlight': '#F8F9FA',
      '--bg-screen': '#FFFFFF',
      '--bg-popup': '#FFFFFF',
      '--bg-field-light': '#F0F0F0',
      '--bg-field-dark': '#E0E0E0',
      '--bg-dropdown': '#FFFFFF',
      '--bg-item-selected': '#FFB800',
      '--bg-item-unselected': '#F0F0F0',
      '--status-online': '#2E7D32',
      '--status-offline': '#D32F2F',
      '--app-background': '#FFFFFF',
      '--text-primary': '#333333',
      '--text-secondary': '#777777',
      '--border-color': '#E0E0E0'
    };
    
    // Применяем переменные непосредственно к html элементу
    Object.entries(styles).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    console.log(`[forceThemeStyles] Принудительно применены стили ${isDark ? 'темной' : 'светлой'} темы`);
  }