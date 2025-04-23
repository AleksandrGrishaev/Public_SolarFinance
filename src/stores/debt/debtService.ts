// src/stores/debt/debtService.ts
import type { Debt, DebtPayment, NewDebtPayload } from './types';
import { defaultDebts } from './defaultDebts';
import { LocalStorageApiService } from '@/services/api/LocalStorageApiService';

export class DebtService {
  private apiService: LocalStorageApiService;
  
  constructor() {
    this.apiService = new LocalStorageApiService();
  }

  /**
   * Получение всех долгов
   */
  async getDebts(): Promise<Debt[]> {
    try {
      return await this.apiService.get<Debt[]>('/debts');
    } catch (error) {
      console.error('[DebtService] Error getting debts:', error);
      return [];
    }
  }

  /**
   * Получение долга по ID
   */
  async getDebtById(id: string): Promise<Debt | null> {
    try {
      return await this.apiService.get<Debt>(`/debts/${id}`);
    } catch (error) {
      console.error(`[DebtService] Error getting debt with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Получение долгов по ID пользователя-должника
   */
  async getDebtsByDebtorId(userId: string): Promise<Debt[]> {
    try {
      const debts = await this.getDebts();
      return debts.filter(debt => debt.fromUserId === userId && debt.status !== 'paid' && debt.status !== 'cancelled');
    } catch (error) {
      console.error(`[DebtService] Error getting debts for debtor ${userId}:`, error);
      return [];
    }
  }

  /**
   * Получение долгов по ID пользователя-кредитора
   */
  async getDebtsByCreditorId(userId: string): Promise<Debt[]> {
    try {
      const debts = await this.getDebts();
      return debts.filter(debt => debt.toUserId === userId && debt.status !== 'paid' && debt.status !== 'cancelled');
    } catch (error) {
      console.error(`[DebtService] Error getting debts for creditor ${userId}:`, error);
      return [];
    }
  }

  /**
   * Получение долгов по ID книги
   */
  async getDebtsByBookId(bookId: string): Promise<Debt[]> {
    try {
      const debts = await this.getDebts();
      return debts.filter(debt => debt.bookId === bookId);
    } catch (error) {
      console.error(`[DebtService] Error getting debts for book ${bookId}:`, error);
      return [];
    }
  }

  /**
   * Добавление нового долга
   */
  async addDebt(newDebt: NewDebtPayload): Promise<Debt> {
    const id = `debt_${Date.now()}`;
    const now = new Date();
    
    const debtWithId: Debt = {
      ...newDebt,
      id,
      status: 'active',
      remainingAmount: newDebt.amount,
      createdAt: now,
      updatedAt: now,
      paymentHistory: []
    };
    
    try {
      await this.apiService.post('/debts', debtWithId);
      console.log('[DebtService] Debt added:', id);
      return debtWithId;
    } catch (error) {
      console.error('[DebtService] Error adding debt:', error);
      throw error;
    }
  }

  /**
   * Обновление долга
   */
  async updateDebt(id: string, debtData: Partial<Debt>): Promise<boolean> {
    try {
      // Получаем текущее состояние долга
      const currentDebt = await this.getDebtById(id);
      if (!currentDebt) {
        throw new Error(`Debt with id ${id} not found`);
      }
      
      // Обновляем поле updatedAt автоматически
      const updatedDebt = {
        ...debtData,
        updatedAt: new Date()
      };
      
      await this.apiService.put(`/debts/${id}`, updatedDebt);
      console.log('[DebtService] Debt updated:', id);
      return true;
    } catch (error) {
      console.error(`[DebtService] Error updating debt ${id}:`, error);
      return false;
    }
  }

  /**
   * Удаление долга
   */
  async deleteDebt(id: string): Promise<boolean> {
    try {
      await this.apiService.delete(`/debts/${id}`);
      console.log('[DebtService] Debt deleted:', id);
      return true;
    } catch (error) {
      console.error(`[DebtService] Error deleting debt ${id}:`, error);
      return false;
    }
  }

  /**
   * Добавление платежа по долгу
   */
  async addDebtPayment(debtId: string, payment: Omit<DebtPayment, 'id' | 'debtId'>): Promise<boolean> {
    try {
      // Получаем текущее состояние долга
      const debt = await this.getDebtById(debtId);
      if (!debt) {
        throw new Error(`Debt with id ${debtId} not found`);
      }
      
      // Создаем новую запись о платеже
      const paymentWithId: DebtPayment = {
        id: `payment_${Date.now()}`,
        debtId,
        ...payment
      };
      
      // Обновляем сумму оставшегося долга
      const newRemainingAmount = Math.max(0, debt.remainingAmount - payment.amount);
      
      // Определяем новый статус долга
      let newStatus = debt.status;
      if (newRemainingAmount <= 0) {
        newStatus = 'paid';
      } else if (newRemainingAmount < debt.amount) {
        newStatus = 'partially_paid';
      }
      
      // Обновляем историю платежей
      const paymentHistory = [...(debt.paymentHistory || []), paymentWithId];
      
      // Обновляем долг
      await this.updateDebt(debtId, {
        remainingAmount: newRemainingAmount,
        status: newStatus,
        paymentHistory,
        updatedAt: new Date()
      });
      
      console.log(`[DebtService] Payment added to debt ${debtId}:`, paymentWithId.id);
      return true;
    } catch (error) {
      console.error(`[DebtService] Error adding payment to debt ${debtId}:`, error);
      return false;
    }
  }

  /**
   * Отмена долга
   */
  async cancelDebt(id: string, reason?: string): Promise<boolean> {
    try {
      await this.updateDebt(id, {
        status: 'cancelled',
        description: reason ? `${reason} (отменен)` : 'Долг отменен',
        updatedAt: new Date()
      });
      console.log(`[DebtService] Debt ${id} cancelled`);
      return true;
    } catch (error) {
      console.error(`[DebtService] Error cancelling debt ${id}:`, error);
      return false;
    }
  }

  /**
   * Создание долгов по умолчанию, если нет ни одного
   */
  async ensureDefaultDebts(): Promise<void> {
    const debts = await this.getDebts();
    
    if (debts.length === 0) {
      // Используем долги из defaultDebts.ts
      for (const debt of defaultDebts) {
        await this.apiService.post('/debts', debt);
      }
      console.log('[DebtService] Created default debts');
    }
  }
}