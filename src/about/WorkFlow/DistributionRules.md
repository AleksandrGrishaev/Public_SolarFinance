# Слайдер распределения в системе финансового учета

## Описание проблемы

В семейном финансовом приложении необходимо обеспечить гибкий механизм распределения доходов и расходов между участниками. Основные проблемы, требующие решения:

1. **Автоматическое отображение слайдера** в нужных контекстах (зависит от комбинации книги, счета и типа операции)
2. **Интуитивное определение** когда нужно показывать/скрывать слайдер
3. **Сохранение пользовательских настроек** для повторяющихся операций
4. **Отображение слайдера при нестандартных значениях** распределения

Текущая реализация частично решает эти задачи, но требует улучшения с учетом особенностей пользовательских сценариев.

## Основные сущности системы

### Книга (Book)
Место для записи и категоризации финансовых операций:
- **Личная книга**: для индивидуальных доходов и расходов (My, Wife)
- **Общая/семейная книга**: для общих финансов семьи (Family)

```typescript
// src/stores/book/types.ts (упрощенно)
interface Book {
  id: string;
  name: string;
  type: 'personal' | 'family';
  ownerIds: string[];
  distributionRules?: DistributionRule[];
  // Другие поля...
}

interface DistributionRule {
  ownerId: string;
  percentage: number;
}
```

### Категория (Category)
Тип финансовой операции с возможным стандартным распределением:
- **Обычные категории**: продукты, рестораны, одежда и т.д.
- **Категории с особым распределением**: детский сад, ипотека и т.д.

```typescript
// src/stores/category/types.ts (упрощенно с учетом новых требований)
interface Category {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  icon: string;
  type: 'expense' | 'income' | 'transfer';
  order?: number;
  isActive?: boolean;
  books?: string[];
  // Новое поле для хранения стандартного распределения
  defaultDistribution?: number; // Процент для первого владельца (0-100)
}
```

### Счет (Account)
Источник или получатель денежных средств:
- **Личный счет**: принадлежит одному члену семьи
- **Общий счет**: принадлежит семье

```typescript
// src/stores/account/types.ts (упрощенно)
interface Account {
  id: string;
  name: string;
  ownerId?: string;
  ownerIds?: string[];
  bookIds?: string[];
  isActive: boolean;
  // Другие поля...
}
```

### Пользователь (User)
Члены семьи, участвующие в финансовых отношениях:

```typescript
// src/stores/user/types.ts (упрощенно)
interface User {
  id: string;
  name: string;
  type: 'user';
  // Другие поля...
}
```

### Транзакция (Transaction)
Финансовая операция с возможностью распределения между участниками:

```typescript
// src/stores/transaction/types.ts (упрощенно)
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  sourceEntityId: string;
  bookId: string;
  distributionRules?: DistributionRule[];
  // Другие поля...
}

type TransactionType = 'income' | 'expense' | 'transfer' | 'debt' | 'correction' | 'exchange';
```

### Слайдер распределения (UI компонент)
Интерфейсный элемент для управления распределением сумм между участниками:

```html
<!-- src/components/transactions/PercentageSlider.vue (упрощенно) -->
<BasePercentageSlider
  :sides="owners"
  :modelValue="modelValue"
  :totalValue="totalAmount"
  :valueSuffix="currency"
  @update:modelValue="updateValue"
/>
```

## Примеры транзакций и их распределение

### 1. Общий расход с личного счета

**Сценарий**: Муж покупает продукты на 5000₽ со своей карты

```
Счет: Личный счет мужа
Книга: Семейная (Family)
Тип: Расход (expense)
Слайдер: 50/50
```

**Результат**: Жена должна компенсировать мужу 2500₽

### 2. Личный расход с общего счета

**Сценарий**: Оплата личной подписки мужа с общей карты на 500₽

```
Счет: Общий счет
Книга: Личная книга мужа (My)
Тип: Расход (expense)
Слайдер: 100/0
```

**Результат**: Муж должен внести 500₽ на погашение общей карты

### 3. Расход на ребенка с нестандартным распределением

**Сценарий**: Оплата детского сада 7000₽ с личной карты мужа

```
Счет: Личный счет мужа
Книга: Семейная (Family)
Тип: Расход (expense)
Слайдер: 70/30
```

**Результат**: Жена должна компенсировать мужу 2100₽ (30% от 7000₽)

### 4. Долговая операция

**Сценарий**: Муж оплатил покупку жены 3000₽

```
Счет: Личный счет мужа
Книга: Общая книга (Family)
Тип: Долг (debt)
Слайдер: 0/100
```

**Результат**: Жена должна вернуть мужу 3000₽

### 5. Ресторан за счет жены, оплаченный мужем

**Сценарий**: Жена пригласила мужа в ресторан, обещая заплатить, но забыла деньги. Муж оплатил счет своими наличными.

```
Счет: Наличные мужа
Книга: Семейная (Family)
Тип: Расход (expense)
Слайдер: 0/100 (0% муж / 100% жена)
```

**Результат**: Жена должна вернуть мужу всю сумму 5000₽

![Пример распределения ответственности за транзакцию](https://i.ibb.co/s3ZDJg3/restaurant-example.jpg)

Этот пример наглядно демонстрирует преимущество системы распределения: несмотря на то, что физически деньги были потрачены из кармана мужа, система правильно отражает, что финансовая ответственность за транзакцию лежит полностью на жене. Это позволяет четко разделять фактическое движение денег и финансовую ответственность за трату.

## Текущая реализация (кратко)

### Основные файлы:

1. **useDistribution.ts** - базовый композабл для работы с распределением
   - Определяет `shouldShowDistribution`, `distributionOwners` и `distributionPercentage`
   - Считывает правила распределения из выбранной книги

2. **useDistributionControl.ts** - композабл для управления видимостью слайдера
   - Расширяет useDistribution
   - Добавляет возможность вручную переключать видимость слайдера
   - Определяет `isSliderVisible` и `showDistributionToggle`

3. **AccountSelector.vue** - передает состояние слайдера в UI
   - Отображает кнопку переключения видимости слайдера
   - Эмитит события переключения

4. **TransactionView.vue** - главный компонент транзакций
   - Интегрирует все компоненты и композаблы
   - Сохраняет транзакцию с правилами распределения

### Текущая логика отображения:

Слайдер отображается, если:
1. Это не операция перевода (тип != 'transfer')
2. В выбранной книге есть правила распределения
3. Слайдер не был вручную скрыт пользователем

## Предлагаемые изменения

### 1. Улучшенная логика отображения слайдера

Создать новый файл `src/composables/transaction/useAdvancedDistribution.ts`:

```typescript
import { computed, ref, watch } from 'vue';
import { useDistribution } from './useDistribution';
import { useBookStore } from '../../stores/book';
import { useAccountStore } from '../../stores/account';

export function useAdvancedDistribution(selectedBookRef, selectedTypeRef, selectedAccountRef) {
  const bookStore = useBookStore();
  const accountStore = useAccountStore();
  
  // Используем базовую функциональность
  const {
    distributionPercentage,
    shouldShowDistribution,
    distributionOwners
  } = useDistribution(selectedBookRef, selectedTypeRef);
  
  // Хранение настроек нестандартного распределения
  const customDistributionSettings = ref({});
  
  // Определение стандартного значения для текущей комбинации
  const getStandardDistributionValue = () => {
    const book = bookStore.getBookById(selectedBookRef.value);
    const account = accountStore.getAccountById(selectedAccountRef.value);
    
    if (!book || !account) return 50; // По умолчанию 50/50
    
    // Семейная книга - стандартное значение 50/50
    if (book.type === 'family') return 50;
    
    // Личная книга - стандартное значение 100% на владельца книги
    if (book.type === 'personal') {
      // Для личной книги owner_1, возвращаем 100% на него
      if (book.ownerIds.includes('user_1')) return 100;
      // Для личной книги owner_2, возвращаем 0% на owner_1 (т.е. 100% на owner_2)
      if (book.ownerIds.includes('user_2')) return 0;
    }
    
    return 50; // Если не определили, используем 50/50
  };
  
  // Проверка, отличается ли текущее значение от стандартного
  const isNonStandardDistribution = computed(() => {
    const standardValue = getStandardDistributionValue();
    return Math.abs(distributionPercentage.value - standardValue) > 1; // Допуск в 1%
  });
  
  // Проверка для автоматического отображения слайдера
  const shouldAutoShowSlider = computed(() => {
    // Если это перевод, не показываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если это долг, всегда показываем слайдер
    if (selectedTypeRef.value === 'debt') return true;
    
    const book = bookStore.getBookById(selectedBookRef.value);
    const account = accountStore.getAccountById(selectedAccountRef.value);
    
    if (!book || !account) return false;
    
    // Семейная книга + любой счет = показываем слайдер
    if (book.type === 'family') return true;
    
    // Личная книга + общий счет = показываем слайдер
    if (book.type === 'personal' && account.ownerIds && account.ownerIds.length > 1) {
      return true;
    }
    
    // Если распределение отличается от стандартного
    if (isNonStandardDistribution.value) return true;
    
    return false;
  });
  
  // Сохранение нестандартных настроек для комбинации
  const saveDistributionSetting = (bookId, categoryId) => {
    if (isNonStandardDistribution.value) {
      const key = `${bookId}-${categoryId}`;
      customDistributionSettings.value[key] = distributionPercentage.value;
    }
  };
  
  // Загрузка сохраненных настроек для комбинации
  const loadDistributionSetting = (bookId, categoryId) => {
    const key = `${bookId}-${categoryId}`;
    if (customDistributionSettings.value[key] !== undefined) {
      distributionPercentage.value = customDistributionSettings.value[key];
      return true;
    }
    return false;
  };
  
  // При изменении книги или типа транзакции, сбрасываем распределение
  watch([selectedBookRef, selectedTypeRef], () => {
    distributionPercentage.value = getStandardDistributionValue();
  });
  
  return {
    distributionPercentage,
    distributionOwners,
    shouldShowDistribution,
    shouldAutoShowSlider,
    isNonStandardDistribution,
    getStandardDistributionValue,
    saveDistributionSetting,
    loadDistributionSetting
  };
}
```

### 2. Модификация useDistributionControl.ts

```typescript
import { ref, computed, watch } from 'vue';

export function useDistributionControl(
  shouldShowDistribution,
  shouldAutoShowSlider,
  isNonStandardDistribution,
  selectedTypeRef,
  distributionOwners = null
) {
  // Состояние для ручного переключения видимости слайдера
  const isSliderManuallyVisible = ref(false);
  const isManuallyHidden = ref(false);
  
  // Показываем иконку переключения для расходов и доходов
  const showDistributionToggle = computed(() => {
    return selectedTypeRef.value !== 'transfer';
  });
  
  // Проверяем, есть ли данные для распределения
  const hasDistributionData = computed(() => {
    if (!distributionOwners) return shouldShowDistribution.value;
    return distributionOwners.value && 
           Array.isArray(distributionOwners.value) && 
           distributionOwners.value.length >= 2;
  });
  
  // Конечная видимость слайдера
  const isSliderVisible = computed(() => {
    // Если это перевод, всегда скрываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если у нас нет данных для распределения, скрываем слайдер
    if (!hasDistributionData.value) return false;
    
    // Если распределение нестандартное, всегда показываем
    if (isNonStandardDistribution.value) return true;
    
    // Если пользователь явно переключил состояние слайдера
    if (isManuallyHidden.value || isSliderManuallyVisible.value) {
      return isSliderManuallyVisible.value;
    }
    
    // Проверяем, нужно ли автоматически показывать слайдер
    if (shouldAutoShowSlider.value) return true;
    
    // В остальных случаях используем базовую логику
    return shouldShowDistribution.value;
  });
  
  // Обработчик переключения отображения слайдера
  const toggleDistributionVisibility = () => {
    if (!hasDistributionData.value && !isSliderManuallyVisible.value) {
      console.log('[useDistributionControl] Cannot show slider: no distribution data available');
      return;
    }
    
    if (isSliderVisible.value && !isManuallyHidden.value && !isSliderManuallyVisible.value) {
      isManuallyHidden.value = true;
      isSliderManuallyVisible.value = false;
    } else {
      isSliderManuallyVisible.value = !isSliderManuallyVisible.value;
      isManuallyHidden.value = !isSliderManuallyVisible.value;
    }
  };
  
  // Сбрасываем ручную видимость при изменении типа транзакции
  watch(selectedTypeRef, () => {
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
  });
  
  // Сбрасываем при изменении правил распределения
  watch(() => shouldShowDistribution.value, () => {
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
  });
  
  return {
    isSliderVisible,
    showDistributionToggle,
    toggleDistributionVisibility,
    hasDistributionData
  };
}
```

### 3. Обновление TransactionView.vue для интеграции изменений

```typescript
// В секции, где импортируются композаблы
import { useAdvancedDistribution } from './composables/useAdvancedDistribution';
import { ref } from 'vue';

// Добавляем состояние для диалога подтверждения
const confirmationDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  onConfirm: null,
  onCancel: null
});

// Функция для отображения диалога подтверждения
const showConfirmationDialog = (options) => {
  confirmationDialog.value = {
    show: true,
    title: options.title || 'Подтверждение',
    message: options.message || '',
    confirmText: options.confirmText || 'Подтвердить',
    cancelText: options.cancelText || 'Отмена',
    onConfirm: options.onConfirm || (() => {}),
    onCancel: options.onCancel || (() => {})
  };
};

// Замена или дополнение существующей инициализации
const {
  distributionPercentage,
  distributionOwners,
  shouldShowDistribution,
  shouldAutoShowSlider,
  isNonStandardDistribution,
  getStandardDistributionValue,
  saveDistributionSetting,
  loadDistributionSetting
} = useAdvancedDistribution(selectedBook, selectedType, selectedAccount);

// Обновленная инициализация useDistributionControl
const {
  isSliderVisible,
  showDistributionToggle,
  toggleDistributionVisibility
} = useDistributionControl(
  shouldShowDistribution,
  shouldAutoShowSlider,
  isNonStandardDistribution,
  selectedType,
  distributionOwners
);

// Обновить обработчик выбора категории с проверкой соответствия распределения
const handleCategorySelect = (category) => {
  if (category) {
    selectedCategory.value = category;
    
    // Проверяем, есть ли у категории стандартное распределение
    if (category.defaultDistribution) {
      const categoryDistribution = category.defaultDistribution;
      
      // Если текущее распределение на слайдере не совпадает с категорией
      if (Math.abs(distributionPercentage.value - categoryDistribution) > 5) { // допуск 5%
        
        // Показываем диалог подтверждения
        showConfirmationDialog({
          title: 'Подтвердите распределение',
          message: `Обычно расходы в категории "${category.name}" распределяются как ${categoryDistribution}/${100-categoryDistribution}, но сейчас установлено ${distributionPercentage.value}/${100-distributionPercentage.value}. Сохранить с текущим распределением?`,
          confirmText: 'Сохранить как есть',
          cancelText: 'Использовать стандартное',
          onConfirm: () => {
            // Сохраняем с текущим распределением
            saveRegularTransaction();
          },
          onCancel: () => {
            // Обновляем на стандартное и сохраняем
            distributionPercentage.value = categoryDistribution;
            saveRegularTransaction();
          }
        });
        
        return true;
      }
    }
    
    // Загружаем сохраненное значение распределения для этой категории
    // только если нет конфликта с defaultDistribution
    if (!category.defaultDistribution) {
      loadDistributionSetting(selectedBook.value, category.id);
    }
    
    // Автоматически сохраняем транзакцию после выбора категории
    saveRegularTransaction();
    
    return true;
  } else {
    console.warn('[TransactionView] Attempted to select null category');
    return false;
  }
};

// Обновить обработчик сохранения транзакции
const saveRegularTransaction = async () => {
  try {
    // ... существующий код

    // Сохраняем нестандартную настройку распределения
    if (selectedCategory.value) {
      saveDistributionSetting(selectedBook.value, selectedCategory.value.id);
    }
    
    // ... остальной код
  } catch (error) {
    // ... обработка ошибок
  }
};
```

### 4. Улучшение визуализации PercentageSlider.vue

```html
<template>
  <BasePercentageSlider
    :sides="owners"
    :modelValue="modelValue"
    :totalValue="totalAmount"
    :valueSuffix="currency"
    :valueDecimals="2"
    :valueFormatter="formatAmountValue"
    :class="{
      'standard-distribution': !isNonStandard,
      'custom-distribution': isNonStandard
    }"
    @update:modelValue="updateValue"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasePercentageSlider from '@/components/ui/views/BasePercentageSlider.vue';

const props = defineProps({
  // ... существующие props
  isNonStandard: {
    type: Boolean,
    default: false
  }
});

// ... существующий код
</script>

<style scoped>
.custom-distribution {
  border: 2px solid var(--accent-color, #ff9800);
  border-radius: var(--border-radius-md, 8px);
  padding: 5px;
}
</style>
```

## Компонент диалога подтверждения распределения

Для реализации функциональности подтверждения распределения, необходимо создать компонент диалога:

```html
<!-- src/components/transactions/DistributionConfirmDialog.vue -->
<template>
  <div class="dialog-overlay" v-if="modelValue">
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
      </div>
      <div class="dialog-content">
        <p>{{ message }}</p>
      </div>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleCancel">{{ cancelText }}</button>
        <button class="btn-confirm" @click="handleConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-container {
  background-color: var(--bg-contrast, #1a1a1a);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 16px;
}

.dialog-header {
  margin-bottom: 16px;
}

.dialog-header h3 {
  margin: 0;
  color: var(--text-contrast, white);
  font-size: 18px;
}

.dialog-content {
  margin-bottom: 24px;
}

.dialog-content p {
  margin: 0;
  color: var(--text-usual, #e0e0e0);
  font-size: 14px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background-color: transparent;
  color: var(--text-usual, #e0e0e0);
}

.btn-confirm {
  background-color: var(--accent-color, #2196F3);
  color: white;
}
</style>
```

## Заключение

Предложенные изменения обеспечивают улучшенную работу слайдера распределения с учетом различных пользовательских сценариев:

1. **Автоматическое отображение** в контекстах, где распределение важно:
   - Семейная книга + любой счет
   - Личная книга + общий счет
   - Тип транзакции "Долг"
   - Нестандартное распределение

2. **Запоминание пользовательских настроек** для повторяющихся операций с одинаковой категорией.

3. **Улучшенная визуализация** для выделения нестандартных значений распределения.

4. **Более гибкая логика** отображения слайдера с учетом различных комбинаций книг, счетов и типов транзакций.

5. **Система подтверждения распределения** при несовпадении текущего значения слайдера и стандартного распределения для выбранной категории:
   - Предотвращает случайные ошибки в распределении
   - Не требует дополнительных действий для стандартных случаев
   - Обучает пользователя типичным распределениям для разных категорий

Эти изменения сделают работу с семейным финансовым учетом более интуитивной и гибкой, требуя меньше ручных действий со стороны пользователя, но при этом обеспечивая большую точность и осознанность при распределении финансовой ответственности.