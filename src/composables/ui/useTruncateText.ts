// src/composables/ui/useTruncateText.ts
import { computed, ComputedRef } from 'vue';

/**
 * Функция для сокращения текста до указанной длины с добавлением многоточия
 * Учитывает ширину символов (например, 'W' шире чем 'i')
 * @param text - исходный текст
 * @param maxLength - максимальная длина текста в символах
 * @param suffix - строка, добавляемая в конец (по умолчанию "...")
 * @returns сокращенный текст
 */
export const truncateText = (text: string | null | undefined, maxLength: number, suffix: string = '...'): string => {
  if (!text) return '';
  
  // Если текст короче или равен максимальной длине, возвращаем его как есть
  if (text.length <= maxLength) {
    return text;
  }
  
  // Вычисляем, сколько символов нужно показать с учетом суффикса
  const truncatedLength = maxLength - suffix.length;
  if (truncatedLength <= 0) {
    return suffix; // Если максимальная длина меньше длины суффикса, просто возвращаем суффикс
  }
  
  // Сначала пробуем обрезать по словам
  const words = text.split(' ');
  let result = words[0];
  let i = 1;
  
  // Добавляем слова, пока не превысим лимит
  while (i < words.length && (result.length + 1 + words[i].length) <= truncatedLength) {
    result += ' ' + words[i];
    i++;
  }
  
  // Если у нас только одно слово или первое слово уже слишком длинное
  if (result.length > truncatedLength) {
    result = text.substring(0, truncatedLength);
  }
  
  // Если мы не включили весь текст, добавляем суффикс
  if (result.length < text.length) {
    return result + suffix;
  }
  
  return text;
};

/**
 * Хук для сокращения текста в шаблонах Vue
 * @returns Объект с функциями для сокращения разных типов текста
 */
export function useTruncateText() {
  /**
   * Создает вычисляемое свойство для обрезки исходного текста
   * @param source - исходный текст или вычисляемое свойство
   * @param maxLength - максимальная длина
   * @returns вычисляемое свойство с обрезанным текстом
   */
  const truncate = (source: ComputedRef<string | null | undefined> | string, maxLength: number): ComputedRef<string> => {
    if (typeof source === 'string') {
      // Если передана строка, создаем вычисляемое свойство из неё
      return computed(() => truncateText(source, maxLength));
    } else {
      // Если передано вычисляемое свойство, обрабатываем его значение
      return computed(() => truncateText(source.value, maxLength));
    }
  };

  /**
   * Сокращает название категории (короткие сокращения)
   * @param text - название категории или вычисляемое свойство
   * @returns сокращенное название
   */
  const category = (text: ComputedRef<string | null | undefined> | string): ComputedRef<string> => {
    return truncate(text, 18);
  };

  /**
   * Сокращает описание транзакции (средние сокращения)
   * @param text - описание транзакции или вычисляемое свойство
   * @returns сокращенное описание
   */
  const description = (text: ComputedRef<string | null | undefined> | string): ComputedRef<string> => {
    return truncate(text, 35);
  };

  /**
   * Сокращает имя пользователя (короткие сокращения)
   * @param text - имя пользователя или вычисляемое свойство
   * @returns сокращенное имя
   */
  const userName = (text: ComputedRef<string | null | undefined> | string): ComputedRef<string> => {
    return truncate(text, 20);
  };

  /**
   * Сокращает название счета (средние сокращения)
   * @param text - название счета или вычисляемое свойство
   * @returns сокращенное название
   */
  const accountName = (text: ComputedRef<string | null | undefined> | string): ComputedRef<string> => {
    return truncate(text, 25);
  };

  // Строчные функции для использования непосредственно в шаблоне
  const $category = (text: string | null | undefined): string => truncateText(text, 18);
  const $description = (text: string | null | undefined): string => truncateText(text, 35);
  const $userName = (text: string | null | undefined): string => truncateText(text, 20);
  const $accountName = (text: string | null | undefined): string => truncateText(text, 25);

  return {
    truncate,
    category,
    description,
    userName,
    accountName,
    $category,
    $description,
    $userName,
    $accountName
  };
}

// Экспортируем функции для использования вне composable
export const $truncateCategory = (text: string | null | undefined): string => truncateText(text, 18);
export const $truncateDescription = (text: string | null | undefined): string => truncateText(text, 35);
export const $truncateUserName = (text: string | null | undefined): string => truncateText(text, 20);
export const $truncateAccountName = (text: string | null | undefined): string => truncateText(text, 25);