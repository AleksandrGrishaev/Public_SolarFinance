// src/stores/alert/alertService.ts
import { defineStore } from 'pinia';

export interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  showIcon?: boolean;
  clickable?: boolean;
  action?: () => void;
}

export const useAlertStore = defineStore('alerts', {
  state: () => ({
    alerts: [] as Alert[]
  }),
  
  actions: {
    add(alert: Omit<Alert, 'id'>) {
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const newAlert = { id, ...alert };
      this.alerts.push(newAlert);
      
      // Auto-remove after duration if specified
      if (alert.duration !== 0) {
        setTimeout(() => {
          this.remove(id);
        }, alert.duration || 3000);
      }
      
      return id;
    },
    
    remove(id: string) {
      this.alerts = this.alerts.filter(alert => alert.id !== id);
    },
    
    clearAll() {
      this.alerts = [];
    },
    
    // Shortcuts for common alert types
    success(message: string, options: Partial<Omit<Alert, 'id' | 'type' | 'message'>> = {}) {
      return this.add({
        type: 'success',
        message,
        ...options
      });
    },
    
    info(message: string, options: Partial<Omit<Alert, 'id' | 'type' | 'message'>> = {}) {
      return this.add({
        type: 'info',
        message,
        ...options
      });
    },
    
    warning(message: string, options: Partial<Omit<Alert, 'id' | 'type' | 'message'>> = {}) {
      return this.add({
        type: 'warning',
        message,
        ...options
      });
    },
    
    error(message: string, options: Partial<Omit<Alert, 'id' | 'type' | 'message'>> = {}) {
      return this.add({
        type: 'error',
        message,
        ...options
      });
    }
  }
});

/**
 * Composable для удобного использования алертов в компонентах
 */
export function useAlerts() {
  const store = useAlertStore();
  
  return {
    // Доступ к состоянию
    alerts: () => store.alerts,
    
    // Методы
    add: store.add,
    remove: store.remove,
    clearAll: store.clearAll,
    
    // Сокращения для типовых алертов
    success: store.success,
    info: store.info,
    warning: store.warning,
    error: store.error
  };
}