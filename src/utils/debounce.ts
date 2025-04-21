// src/utils/debounce.ts

/**
 * Создает debounced версию функции, которая откладывает вызов
 * до тех пор, пока не пройдет указанное время с момента последнего вызова.
 * 
 * @param fn Функция, которую нужно debounce
 * @param wait Время ожидания в миллисекундах
 * @returns Debounced функция
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T, 
    wait: number = 300
  ): (...funcArgs: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return function(...args: Parameters<T>): void {
      const later = () => {
        timeout = null;
        fn(...args);
      };
      
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(later, wait);
    };
  }