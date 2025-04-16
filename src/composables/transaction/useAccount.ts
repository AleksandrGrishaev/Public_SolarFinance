// src/composables/transaction/useAccount.ts
import { ref, computed, watch } from 'vue';
import { useAccountStore } from '../../stores/account';
import { useBookStore } from '../../stores/book';
import { useCurrencyStore } from '../../stores/currency';

/**
 * Хук для управления аккаунтами в контексте транзакций
 */
export function useAccount(selectedBookRef, selectedTypeRef) {
  // Инициализируем хранилища
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  const currencyStore = useCurrencyStore();

  // Состояние аккаунтов
  const selectedAccount = ref('');
  const destinationAccount = ref('');

  // Фильтруем счета по выбранной книге
  const filteredAccounts = computed(() => {
    // Если хранилища не инициализированы, вернуть пустой массив
    if (!accountStore.isInitialized || !bookStore.isInitialized) {
      console.log('[useAccount] Stores not initialized yet');
      return [];
    }
    
    // Если нет активных счетов, вернуть пустой массив
    if (!accountStore.activeAccounts.length) {
      console.log('[useAccount] No active accounts available');
      return [];
    }
    
    // Если тип транзакции перевод, показываем все счета
    if (selectedTypeRef.value === 'transfer') {
      console.log('[useAccount] Transfer mode - showing all active accounts');
      return accountStore.activeAccounts;
    }
    
    // Если выбранная книга не существует, возвращаем все активные счета
    const selectedBookExists = bookStore.books.some(book => book.id === selectedBookRef.value);
    if (!selectedBookExists) {
      console.log('[useAccount] Selected book does not exist, showing all active accounts');
      return accountStore.activeAccounts;
    }
    
    console.log('[useAccount] Filtering accounts for book:', selectedBookRef.value);
    
    // Иначе фильтруем счета по выбранной книге
    const filtered = accountStore.activeAccounts.filter(account => {
      // Проверяем наличие счета в выбранной книге через bookIds
      if (account.bookIds && account.bookIds.includes(selectedBookRef.value)) {
        return true;
      }
      
      // Если у счета нет привязки к книгам, ищем по владельцу книги
      if (!account.bookIds || account.bookIds.length === 0) {
        const book = bookStore.getBookById(selectedBookRef.value);
        if (book && book.ownerIds && account.ownerId && book.ownerIds.includes(account.ownerId)) {
          return true;
        }
      }
      
      return false;
    });
    
    return filtered;
  });

  // Вычисляемое свойство для получения символа валюты с использованием currencyStore
  const currentCurrencySymbol = computed(() => {
    // Если счет не выбран или не удалось получить данные, возвращаем символ валюты по умолчанию
    if (!selectedAccount.value) {
      return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
    }
    
    // Получаем выбранный счет
    const account = accountStore.getAccountById(selectedAccount.value);
    if (!account) {
      return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
    }
    
    // Получаем код валюты из счета
    const currencyCode = account.currency;
    
    // Пытаемся получить валюту из хранилища валют
    const currency = currencyStore.getCurrency(currencyCode);
    if (currency) {
      return currency.symbol;
    }
    
    // Если валюта не найдена в хранилище, используем символ из счета или символ по умолчанию
    return account.symbol || currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
  });

  // Получаем код валюты для выбранного счета
  const getAccountCurrencyCode = (accountId: string): string => {
    const account = accountStore.getAccountById(accountId);
    if (!account) return currencyStore.appBaseCurrency;
    
    return account.currency;
  };

  // Установить начальный аккаунт и аккаунт назначения
  const setupInitialAccounts = () => {
    // Проверяем, есть ли отфильтрованные счета
    if (filteredAccounts.value.length > 0) {
      // Если выбранный счет не установлен или не найден среди отфильтрованных, выбираем первый доступный
      if (!selectedAccount.value || !filteredAccounts.value.some(account => account.id === selectedAccount.value)) {
        selectedAccount.value = filteredAccounts.value[0].id;
        console.log('[useAccount] Set account to first filtered account:', selectedAccount.value);
      }
    } else if (accountStore.activeAccounts.length > 0) {
      // Если нет отфильтрованных счетов, но есть активные, выбираем первый активный
      selectedAccount.value = accountStore.activeAccounts[0].id;
      console.log('[useAccount] No filtered accounts, set to first active account:', selectedAccount.value);
    } else if (accountStore.accounts.length > 0) {
      // Если нет активных счетов, но есть счета в хранилище, выбираем первый счет
      selectedAccount.value = accountStore.accounts[0].id;
      console.log('[useAccount] No active accounts, set to first account:', selectedAccount.value);
    } else {
      console.warn('[useAccount] No accounts available in store');
    }

    // Установим destinationAccount, если нужно
    if (selectedTypeRef.value === 'transfer' && accountStore.accounts.length > 1) {
      // Выбираем любой счет, отличный от selectedAccount
      const otherAccount = accountStore.accounts.find(acc => acc.id !== selectedAccount.value && acc.isActive);
      if (otherAccount) {
        destinationAccount.value = otherAccount.id;
        console.log('[useAccount] Set destination account to:', destinationAccount.value);
      } else {
        // Если нет другого активного счета, просто берем любой отличный от selectedAccount
        const anyOtherAccount = accountStore.accounts.find(acc => acc.id !== selectedAccount.value);
        if (anyOtherAccount) {
          destinationAccount.value = anyOtherAccount.id;
          console.log('[useAccount] Set destination to available account:', destinationAccount.value);
        }
      }
    }
  };

  // Наблюдаем за изменением книги для обновления выбранного счета
  watch(selectedBookRef, (newBookId) => {
    console.log('[useAccount] Book changed to:', newBookId);
    
    // Проверяем, есть ли выбранный счет в новой книге
    const isAccountInNewBook = filteredAccounts.value.some(account => account.id === selectedAccount.value);
    
    // Если счет не найден в новой книге, выбираем первый доступный
    if (!isAccountInNewBook && filteredAccounts.value.length > 0) {
      selectedAccount.value = filteredAccounts.value[0].id;
      console.log('[useAccount] Changed selected account to:', selectedAccount.value);
    }
  });

  // Наблюдаем за изменением отфильтрованных счетов
  watch(filteredAccounts, (newAccounts) => {
    if (newAccounts.length > 0 && !newAccounts.some(account => account.id === selectedAccount.value)) {
      selectedAccount.value = newAccounts[0].id;
      console.log('[useAccount] Selected account updated to:', selectedAccount.value);
    }
  }, { immediate: true });

  // Устанавливаем наблюдение за изменением типа транзакции
  watch(selectedTypeRef, (newType) => {
    // Если тип изменился на "transfer", убедимся что оба счета различны
    if (newType === 'transfer' && accountStore.accounts.length > 1) {
      if (selectedAccount.value === destinationAccount.value || !destinationAccount.value) {
        // Устанавливаем другой счет в качестве получателя
        const otherAccounts = accountStore.accounts.filter(acc => 
          acc.id !== selectedAccount.value && acc.isActive
        );
        
        if (otherAccounts.length > 0) {
          destinationAccount.value = otherAccounts[0].id;
        } else {
          // Если нет других активных счетов, используем первый неактивный, отличный от выбранного
          const anyOtherAccount = accountStore.accounts.find(acc => acc.id !== selectedAccount.value);
          if (anyOtherAccount) {
            destinationAccount.value = anyOtherAccount.id;
          }
        }
      }
    }
  });

  return {
    selectedAccount,
    destinationAccount,
    filteredAccounts,
    currentCurrencySymbol,
    getAccountCurrencyCode,
    setupInitialAccounts
  };
}