// src/services/TransactionFilterService.ts
import { DateFilterState } from '@/composables/useDateFilter';

export interface Transaction {
  id: number;
  date: Date;
  amount: number;
  // другие поля транзакции...
}

/**
 * Сервис для фильтрации транзакций по различным критериям
 */
export class TransactionFilterService {
  /**
   * Фильтрует транзакции по заданным параметрам фильтра
   * @param transactions массив транзакций для фильтрации
   * @param dateFilter фильтр дат
   * @returns отфильтрованный массив транзакций
   */
  public static filterByDate(transactions: Transaction[], dateFilter: DateFilterState): Transaction[] {
    if (!dateFilter || !transactions?.length) {
      return transactions;
    }

    return transactions.filter(transaction => {
      // Убедимся, что у нас есть дата транзакции
      if (!transaction.date) return false;

      // Конвертируем строку в дату, если необходимо
      const transactionDate = transaction.date instanceof Date 
        ? transaction.date 
        : new Date(transaction.date);

      switch (dateFilter.period) {
        case 'daily':
          // Для режима daily используем диапазон дат
          if (dateFilter.dateRange && dateFilter.dateRange.length === 2) {
            const startDate = new Date(dateFilter.dateRange[0]);
            const endDate = new Date(dateFilter.dateRange[1]);
            
            // Устанавливаем правильное время для корректного сравнения
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            return transactionDate >= startDate && transactionDate <= endDate;
          }
          return true;
          
        case 'monthly':
          // Фильтрация по месяцу и году
          if (dateFilter.date) {
            const filterDate = new Date(dateFilter.date);
            return transactionDate.getMonth() === filterDate.getMonth() && 
                   transactionDate.getFullYear() === filterDate.getFullYear();
          }
          return true;
          
        case 'yearly':
          // Фильтрация только по году
          if (dateFilter.date) {
            const filterDate = new Date(dateFilter.date);
            return transactionDate.getFullYear() === filterDate.getFullYear();
          }
          return true;
          
        default:
          return true;
      }
    });
  }

  /**
   * Комбинированная фильтрация по нескольким критериям
   * @param transactions исходный массив транзакций
   * @param filters объект с различными фильтрами
   * @returns отфильтрованный массив транзакций
   */
  public static applyFilters(
    transactions: Transaction[], 
    filters: { 
      dateFilter?: DateFilterState,
      // другие фильтры...
    }
  ): Transaction[] {
    let result = [...transactions];
    
    // Применяем фильтр по дате
    if (filters.dateFilter) {
      result = this.filterByDate(result, filters.dateFilter);
    }
    
    // Здесь можно добавить другие фильтры
    
    return result;
  }
}