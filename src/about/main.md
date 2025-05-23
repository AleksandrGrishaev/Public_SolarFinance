# Vue 3 Console App

## Мы создаем приложение для учета семейных финансови активов, также управлению финансами семейных проектов. 

Со счетами, достпупом по пинкоду для членов семьим
Выводом текущего семейного капитала в usd
Управлением активами и пассивами. 
Учет денежных средств в разных валютах. 


Обзор проекта
Vue 3 Console App - это современная административная панель, разработанная на Vue 3 с использованием TypeScript и компонентной библиотеки Naive UI. Приложение предоставляет административный интерфейс с возможностью аутентификации по PIN-коду, управления пользователями и просмотра аналитики на дашборде.
Технологический стек

## Vue 3: Фреймворк для построения пользовательских интерфейсов
TypeScript: Типизированный JavaScript для повышения надежности кода
Naive UI: Компонентная библиотека для Vue 3
Vue Router: Для маршрутизации и навигации
Pinia: Управление состоянием приложения
Tabler Icons: Библиотека векторных иконок   "@tabler/icons-vue": "^3.31.0",  

## Структура проекта
src
src/about
src/about/WorkFlow
src/about/WorkFlow/BaseStores.md
src/about/WorkFlow/MainPlan.md
src/about/WorkFlow/Mock.md
src/about/Description.md
src/about/main.md
src/assets
src/components
src/components/categories
src/components/categories/CategoryAddPopup.vue
src/components/categories/CategoryFilterToggle.vue
src/components/categories/CategoryIcon.vue
src/components/categories/CategoryItem.vue
src/components/categories/CategoryListGrouped.vue
src/components/categories/CategoryListPopup.vue
src/components/categories/CategorySelector.vue
src/components/icons
src/components/navigation
src/components/navigation/NavMenu.vue
src/components/transactions
src/components/transactions/AccountSelector.vue
src/components/transactions/BookSelector.vue
src/components/transactions/NumberKeypad.vue
src/components/transactions/PercentageSlider.vue
src/components/transactions/TransactionTypeSelector.vue
src/components/ui
src/components/ui/inputs
src/components/ui/BasePopup.vue
src/components/ui/CreateCategoryButton.vue
src/data
src/layouts
src/layouts/EmptyLayout.vue
src/layouts/IosLayout.vue
src/router
src/router/index.ts
src/services
src/services/api
src/services/BaseCrudService.ts
src/stores
src/stores/account
src/stores/account/accountService.ts
src/stores/account/accountStore.ts
src/stores/account/defaultAccounts.ts
src/stores/account/index.ts
src/stores/account/types.ts
src/stores/book
src/stores/book/bookService.ts
src/stores/book/bookStore.ts
src/stores/book/defaultBooks.ts
src/stores/book/index.ts
src/stores/book/types.ts
src/stores/category
src/stores/category/categoryService.ts
src/stores/category/categoryStore.ts
src/stores/category/defaultCategories.ts
src/stores/category/index.ts
src/stores/category/types.ts
src/stores/common
src/stores/common/types.ts
src/stores/system
src/stores/system/constants.ts
src/stores/system/index.ts
src/stores/system/systemStore.ts
src/stores/system/types.ts
src/stores/transaction
src/stores/transaction/defaultTransactions.ts
src/stores/transaction/index.ts
src/stores/transaction/transactionService.ts
src/stores/transaction/transactionStore.ts
src/stores/transaction/types.ts
src/stores/user
src/stores/user/defaultUsers.ts
src/stores/user/index.ts
src/stores/user/types.ts
src/stores/user/userService.ts
src/stores/user/userStore.ts
src/stores/theme.ts
src/types
src/types/base.ts
src/views
src/views/AccountsView.vue
src/views/DashboardView.vue
src/views/MoreView.vue
src/views/NotFoundView.vue
src/views/PinLoginView.vue
src/views/TransactionView.vue
src/App.vue
src/main.ts

## Основные функции
### Аутентификация

Вход в систему по 4-значному PIN-коду
Сохранение сессии между посещениями
Защита маршрутов от неавторизованного доступа
Управление разрешениями на основе ролей

### Пользовательский интерфейс

Адаптивный дизайн с использованием Naive UI
Поддержка светлой и темной темы
Боковая панель навигации с возможностью сворачивания
Анимированные переходы между страницами

### Панель управления (Dashboard)

Отображение ключевых показателей
Карточки с статистикой и аналитикой
Список последних активностей
Быстрые действия для частых операций


# Система семейного финансового учета

## Введение

Данная система предназначена для комплексного учета семейных финансов. Она решает ключевые проблемы совместного ведения бюджета:
- учет личных и общих доходов/расходов
- распределение общих расходов между членами семьи
- учет совместных активов и бизнесов с разными долями участия
- отслеживание взаимных обязательств и долгов
- формирование финансовых отчетов

## Основные концепции

### 1. Трехуровневая модель учета

Система использует трехуровневую модель учета:

1. **Реальные счета** - физические финансовые инструменты (банковские карты, наличные деньги, электронные кошельки)
2. **Книги учета** - виртуальные группировки для логического разделения финансов (личные, семейные, бизнес)
3. **Обязательства** - автоматически рассчитываемые взаимные долги между членами семьи

### 2. Владение и распределение

Система поддерживает:
- Индивидуальное владение активами (принадлежит одному человеку)
- Совместное владение с долями (например, бизнес 50/50)
- Правила распределения расходов (например, семейные расходы 50/50)

## Основные сущности

### Базовые сущности

#### Владелец (Owner)
```typescript
interface Owner {
  id: string;
  name: string;
}
```
Представляет члена семьи (муж, жена, ребенок).

#### Книга учета (Book)
```typescript
interface Book {
  id: string;
  name: string;
  description?: string;
  type: 'Personal' | 'Family' | 'Business';
  ownerIds: string[]; // Владельцы книги
  distributionRules?: DistributionRule[]; // Правила распределения расходов/доходов
}
```
Виртуальная группировка для логического разделения финансов.

#### Правило распределения (DistributionRule)
```typescript
interface DistributionRule {
  ownerId: string;
  percentage: number; // Процент участия (0-100)
}
```
Определяет, как распределяются расходы и доходы между владельцами.

### Финансовые активы

#### Финансовая сущность (FinancialEntity) - базовый тип
```typescript
interface FinancialEntity {
  id: string;
  name: string;
  iconUrl?: string;
  currency: Currency;
  initialBalance: number;
  currentBalance: number;
  ownerId: string; // Основной владелец
  coOwners?: Array<{ ownerId: string; share: number }>; // Совладельцы с долями
  bookId: string; // К какой книге относится актив
  createdAt: Date;
  updatedAt: Date;
}
```

#### Счет (Account)
```typescript
interface Account extends FinancialEntity {
  type: 'Debit' | 'Credit';
  bankName?: string;
  accountNumber?: string;
}
```
Представляет реальный финансовый инструмент (банковский счет, карта).

#### Наличные деньги (Cash)
```typescript
interface Cash extends FinancialEntity {
  location?: string; // Место хранения
}
```

#### Источник дохода (IncomeSource)
```typescript
interface IncomeSource {
  id: string;
  name: string;
  type: 'Job' | 'Freelance' | 'Pension' | 'Alimony' | 'Royalties' | 'Other';
  currency: Currency;
  ownerId: string;
  bookId: string;
  expectedMonthlyAmount?: number;
  paymentFrequency: 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'Irregular';
  taxRate?: number;
  isTaxDeducted: boolean;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  // ...
}
```
Регулярный источник дохода (работа, подработка).

#### Актив (Asset)
```typescript
// Для активов, связанных с долгами (например, бизнес с кредитами)
interface Asset extends FinancialEntity {
  type: 'Business' | 'Project' | 'Investment';
  isActivelyManaged: boolean; // Требует ли активного управления
  profitLossHistory: ProfitLossRecord[];
  linkedDebtIds?: string[]; // ID связанных долгов (например, бизнес-кредиты)
  equityValue?: number; // Стоимость за вычетом долгов (собственный капитал)
}
```
Бизнес или проект, который требует инвестиций и приносит прибыль.

#### Пассив (Passive)
```typescript
// Для пассивов, связанных с долгами (например, ипотечная квартира)
interface Passive extends FinancialEntity {
  type: 'RealEstate' | 'Vehicle' | 'Appliance' | 'Other';
  acquisitionCost: number; // Стоимость приобретения
  currentEstimatedValue: number; // Текущая оценочная стоимость
  appreciationRate?: number; // Коэффициент удорожания/обесценивания
  linkedDebtIds?: string[]; // ID связанных долгов (например, ипотека)
  equityValue?: number; // Стоимость за вычетом долгов (собственный капитал)
}
```
Имущество, которое не приносит прибыли, но отображается в капитале.

#### Инвестиция (Investment)
```typescript
interface Investment extends FinancialEntity {
  type: 'Stock' | 'Bond' | 'ETF' | 'MutualFund' | 'Other';
  units?: number; // Количество единиц (акций, облигаций)
  pricePerUnit?: number; // Цена за единицу
}
```

#### Криптовалюта (Crypto)
```typescript
interface Crypto extends FinancialEntity {
  coinType: string; // Bitcoin, Ethereum, etc.
  units: number; // Количество монет
  pricePerUnit: number; // Текущая стоимость монеты
}
```

#### Кредит (Credit)
```typescript
interface Credit extends FinancialEntity {
  interestRate: number; // Процентная ставка
  endDate: Date; // Дата окончания кредита
  paymentSchedule: PaymentSchedule; // График платежей
  collateral?: string; // Залог
}
```

### Транзакции и категории

#### Транзакция (Transaction)
```typescript
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: Currency;
  type: 'Income' | 'Expense' | 'Transfer' | 'Investment' | 'Withdrawal' | 'DebtCreate' | 'DebtRepayment' | 'DebtInterest';
  description?: string;
  categoryId: string; // Категория транзакции
  
  // Источник транзакции
  sourceEntityId: string; // ID счета/актива, откуда идет транзакция
  sourceEntityType: string; // Тип источника (Account, Cash, etc.)
  
  // Назначение транзакции (для переводов)
  destinationEntityId?: string; // ID счета/актива, куда идет транзакция
  destinationEntityType?: string; // Тип назначения
  
  // Владелец и распределение
  executedByOwnerId: string; // Кто выполнил транзакцию
  responsibleOwnerIds: string[]; // Кто отвечает за транзакцию (финансово)
  distributionRules?: DistributionRule[]; // Распределение между владельцами
  
  // Книга учета
  bookId: string; // К какой книге относится транзакция
  
  // Дополнительные поля для переводов между супругами
  transferPurpose?: 'Gift' | 'FamilyBudgetContribution' | 'ObligationSettlement' | 'InternalLoan';
  familyBudgetContribution?: {
    bookId: string; // ID книги семейного бюджета
    contributionPercentage?: number; // какой процент от общего взноса
  };
  obligationSettlement?: {
    obligationIds: string[]; // ID обязательств, которые погашаются
  };
  
  // Дополнительные поля для транзакций, связанных с долгами
  debtId?: string; // ID связанного долга
  debtPaymentId?: string; // ID платежа по долгу
  debtPaymentType?: 'Principal' | 'Interest' | 'Fee' | 'Penalty' | 'Combined'; // Тип платежа по долгу
  
  // Метаданные
  tags?: string[];
  attachments?: string[]; // Ссылки на чеки, счета и т.д.
  createdAt: Date;
  updatedAt: Date;
}
```
Представляет любое движение денег в системе.

#### Категория (Category)
```typescript
interface Category {
  id: string;
  name: string;
  type: 'Income' | 'Expense' | 'Transfer';
  iconUrl?: string;
  parentCategoryId?: string; // Для иерархических категорий
  bookIds: string[]; // К каким книгам относится категория
}
```

### Обязательства и расчеты

#### Обязательство (Obligation)
```typescript
interface Obligation {
  id: string;
  fromOwnerId: string; // Кто должен
  toOwnerId: string; // Кому должен
  amount: number; 
  currency: Currency;
  reason: string; // Причина обязательства
  relatedTransactionIds: string[]; // Связанные транзакции
  status: 'Pending' | 'Settled' | 'Cancelled';
  createdAt: Date;
  settledAt?: Date; // Когда было погашено
  settledTransactionId?: string; // Транзакция погашения
  bookId?: string; // Книга, к которой относится обязательство (опционально)
}
```
Представляет внутренний долг одного члена семьи другому.

#### Долг (Debt)
```typescript
interface Debt {
  id: string;
  name: string; // Название долга
  description?: string;
  type: 'Borrowed' | 'Lent'; // Взятый долг или данный в долг
  
  // Связь с другими сущностями
  bookId: string; // Книга, к которой относится долг (личная, семейная, бизнес)
  assetId?: string; // Связанный актив (бизнес, недвижимость) - опционально
  passiveId?: string; // Связанный пассив (квартира в ипотеке) - опционально
  
  // Участники долга
  ownerIds: string[]; // Кто отвечает за долг (может быть несколько членов семьи)
  distributionRules?: DistributionRule[]; // Распределение ответственности
  externalPartyName?: string; // Имя внешней стороны (банк, друг и т.д.)
  externalPartyType?: 'Bank' | 'Person' | 'Organization' | 'Other'; // Тип внешней стороны
  
  // Финансовые параметры
  initialAmount: number; // Начальная сумма долга
  currentAmount: number; // Текущая сумма долга
  currency: Currency;
  interestRate?: number; // Процентная ставка (если есть)
  
  // Временные рамки
  startDate: Date; // Дата начала долга
  plannedEndDate?: Date; // Планируемая дата закрытия
  actualEndDate?: Date; // Фактическая дата закрытия
  
  // Простой график платежей
  plannedReturnDate?: Date; // Планируемая дата возврата (для простых займов без графика)
  
  // История платежей
  payments: DebtPayment[];
  
  // Статус
  status: 'Active' | 'FullyPaid' | 'PartiallyPaid' | 'Defaulted' | 'Cancelled';
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[]; // Ссылки на документы, связанные с долгом
  tags?: string[];
}
```
Представляет долг перед внешней стороной (банком, другом и т.д.) или долг внешней стороны семье.

#### Платеж по долгу (DebtPayment)
```typescript
interface DebtPayment {
  id: string;
  debtId: string; // ID долга
  transactionId: string; // ID транзакции оплаты
  date: Date;
  amount: number;
  currency: Currency;
  type: 'Principal' | 'Interest' | 'Fee' | 'Penalty' | 'Combined'; // Тип платежа
  breakdown?: { // Разбивка комбинированного платежа
    principal: number;
    interest: number;
    fee?: number;
    penalty?: number;
  };
  note?: string;
}
```
Представляет отдельный платеж по долгу.

#### Период расчетов (SettlementPeriod)
```typescript
interface SettlementPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'Open' | 'Calculating' | 'Settled';
  bookIds: string[]; // Какие книги включены в период
  obligations: Obligation[]; // Обязательства, сформированные за период
}
```
Группирует обязательства по периодам (месяц, квартал).

## Принципы работы

### 1. Учет реальных транзакций

Каждая транзакция привязывается к реальному счету и конкретной книге учета:
- При создании транзакции указывается счет-источник (и счет-назначение для переводов)
- Баланс счета автоматически обновляется
- Транзакция относится к определенной книге учета (личная, семейная, бизнес, долговая)

### 2. Разделение долгов и обязательств

Система разделяет два связанных, но разных понятия:
- **Обязательства** - внутренние "долги" между членами семьи, возникающие из-за распределения расходов
- **Долги** - формализованные заемные отношения (как внутри семьи, так и с внешними сторонами)

Ключевые отличия:
- Обязательства обычно не имеют процентов и сроков возврата
- Долги могут иметь процентную ставку, график платежей, штрафы за просрочку
- Долги обычно оформляются явно, а обязательства создаются автоматически
- Долги могут быть как у семьи (кредиты в банке), так и у других людей семье (данные в долг деньги)

### 3. Автоматическое создание обязательств

Система автоматически создает обязательства на основе транзакций:
- Для семейных расходов с распределением (например, 50/50)
- Для инвестиций в общие активы
- Для распределения прибыли от общих активов

Пример: Жена тратит 700₽ на общие семейные расходы с распределением 50/50:
1. Создается транзакция расхода с карты жены
2. Система создает обязательство: Муж должен жене 350₽
3. В отчетах отображается это обязательство

### 3. Погашение обязательств

Обязательства могут быть погашены:
1. Прямым переводом между счетами (муж → жена)
2. Взаимозачетом (если есть встречные обязательства)
3. Отменой обязательства (например, если решили не делить расход)

### 4. Формирование отчетов

Система формирует различные отчеты:
- Общий финансовый отчет семьи
- Персональный отчет для каждого члена семьи
- Отчет по взаимным обязательствам
- Отчет по категориям расходов/доходов
- Отчет по активам и пассивам

## Дополнительные примеры: Учет долгов

### Пример 1: Ипотека на квартиру

```
1. Создание пассива (квартиры):
   - Создается пассив в семейной книге:
     - type: 'RealEstate'
     - name: 'Квартира на Ленина'
     - acquisitionCost: 5000000₽
     - currentEstimatedValue: 5200000₽ (после оценки)
     - ownerIds: ['owner1', 'owner2'] (муж и жена)
     - distributionRules: [{ ownerId: 'owner1', percentage: 50 }, { ownerId: 'owner2', percentage: 50 }]

2. Создание связанного долга (ипотеки):
   - Создается долг в той же семейной книге:
     - name: 'Ипотека на квартиру'
     - type: 'Borrowed'
     - bookId: '[ID семейной книги]'
     - passiveId: '[ID пассива-квартиры]' // Связь с квартирой
     - ownerIds: ['owner1', 'owner2']
     - distributionRules: [{ ownerId: 'owner1', percentage: 50 }, { ownerId: 'owner2', percentage: 50 }]
     - externalPartyName: 'СберБанк'
     - externalPartyType: 'Bank'
     - initialAmount: 4000000₽
     - currentAmount: 3800000₽
     - interestRate: 8.5%
     - startDate: '2023-01-15'
     - plannedEndDate: '2043-01-15'

3. Обновление пассива (расчет собственного капитала):
   - equityValue = currentEstimatedValue - связанный долг
   - equityValue = 5200000₽ - 3800000₽ = 1400000₽
```

### Пример 2: Займ другу из семейного бюджета

```
1. Создание долга:
   - Создается долг в семейной книге:
     - name: 'Займ Ивану'
     - type: 'Lent' // Выданный займ
     - bookId: '[ID семейной книги]'
     - ownerIds: ['owner1', 'owner2']
     - distributionRules: [{ ownerId: 'owner1', percentage: 50 }, { ownerId: 'owner2', percentage: 50 }]
     - externalPartyName: 'Иван Петров'
     - externalPartyType: 'Person'
     - initialAmount: 50000₽
     - currentAmount: 50000₽
     - interestRate: 0% // Беспроцентный
     - startDate: '2023-05-20'
     - plannedReturnDate: '2023-08-20'

2. Транзакция выдачи займа:
   - type: 'DebtCreate'
   - amount: 50000₽
   - sourceEntityId: '[ID счета семьи]'
   - sourceEntityType: 'Account'
   - debtId: '[ID созданного долга]'
   - bookId: '[ID семейной книги]'
   - executedByOwnerId: 'owner1' // Выполнил муж
   - responsibleOwnerIds: ['owner1', 'owner2'] // Ответственны оба

3. Частичный возврат долга:
   - Создается транзакция:
     - type: 'DebtRepayment'
     - amount: 20000₽
     - sourceEntityId: 'external'
     - destinationEntityId: '[ID счета семьи]'
     - destinationEntityType: 'Account'
     - debtId: '[ID долга]'
     - bookId: '[ID семейной книги]'
   
   - Обновляется долг:
     - currentAmount: 30000₽ (50000₽ - 20000₽)
```

### Пример 3: Бизнес-кредит для компании мужа

```
1. Создание долга:
   - Создается долг в книге бизнеса мужа:
     - name: 'Кредит на развитие бизнеса'
     - type: 'Borrowed'
     - bookId: '[ID книги бизнеса]'
     - assetId: '[ID актива-бизнеса]' // Связь с бизнесом
     - ownerIds: ['owner1'] // Только муж
     - externalPartyName: 'Банк "Развитие"'
     - externalPartyType: 'Bank'
     - initialAmount: 500000₽
     - currentAmount: 500000₽
     - interestRate: 12%
     - startDate: '2023-06-01'
     - plannedEndDate: '2024-06-01'

2. Обновление актива (расчет собственного капитала):
   - equityValue = currentBalance - связанный долг
   - equityValue = 800000₽ - 500000₽ = 300000₽
```

### Дополнительный пример: Различные типы переводов между супругами

В системе можно учитывать разные типы переводов между супругами, что влияет на дальнейший учет и обязательства:

#### 1. Перевод как личный подарок

```
Муж передает жене 1000₽ как личный подарок:
- Транзакция: Расход в личной книге мужа (категория "Подарки")
- Транзакция: Доход в личной книге жены (категория "Подарки")
- transferPurpose: 'Gift'
- Обновление балансов: счет мужа -1000₽, счет жены +1000₽
- Не создаются обязательства
```

Когда жена тратит эти деньги на общие расходы, они учитываются как ее личные средства, а муж должен внести свою долю.

#### 2. Перевод как взнос в общий бюджет

```
Муж передает жене 1000₽ как взнос в общий бюджет:
- Транзакция: Перевод из личной книги мужа в семейную книгу
- transferPurpose: 'FamilyBudgetContribution'
- familyBudgetContribution: { bookId: 'book3', contributionPercentage: 100 }
- Обновление балансов: счет мужа -1000₽, счет жены +1000₽
- В системе учитывается взнос мужа в семейный бюджет (1000₽)
```

Когда жена тратит эти деньги на общие расходы, система учитывает, что муж уже внес свою долю.

#### 3. Перевод для погашения долга

```
Муж передает жене 500₽ для погашения существующего долга:
- Транзакция: Перевод между счетами
- transferPurpose: 'ObligationSettlement'
- obligationSettlement: { obligationIds: ['obligation123'] }
- Обновление балансов: счет мужа -500₽, счет жены +500₽
- Закрытие обязательства obligation123 на сумму 500₽
```

#### 4. Перевод как временный заем

```
Муж передает жене 2000₽ как временный заем:
- Транзакция: Перевод между счетами
- transferPurpose: 'InternalLoan'
- Обновление балансов: счет мужа -2000₽, счет жены +2000₽
- Создание обязательства: Жена должна мужу 2000₽
```

Система отслеживает этот долг, который должен быть возвращен в будущем.

### Пример 1: Типичный месяц семьи

1. Муж заработал 3000₽ из своего бизнеса
   - Транзакция: Доход в бизнес книгу мужа
   - Обновление баланса счета мужа: +3000₽

2. Муж дал 1000₽ жене на расходы
   - **Вариант A: Как взнос в семейный бюджет**
     - Транзакция: Перевод с `transferPurpose: 'FamilyBudgetContribution'`
     - Обновление балансов: счет мужа -1000₽, счет жены +1000₽
     - В системе учитывается взнос мужа в семейный бюджет (1000₽)
   
   - **Вариант B: Как личный подарок**
     - Транзакция: Перевод с `transferPurpose: 'Gift'`
     - Обновление балансов: счет мужа -1000₽, счет жены +1000₽
     - Деньги рассматриваются как личные средства жены

3. Жена заработала 300₽ из своей работы
   - Транзакция: Доход в личную книгу жены
   - Обновление баланса счета жены: +300₽

4. Жена потратила 700₽ на общие семейные расходы
   - Транзакция: Расход в семейной книге
   - Обновление баланса счета жены: -700₽
   - Создание обязательства: Муж должен жене 350₽ (50% от 700₽)

5. Жена получила 400₽ из общего бизнеса (50/50)
   - Транзакция: Доход в книгу общего бизнеса
   - Обновление баланса счета жены: +400₽
   - Система учитывает, что муж недополучил свою долю в 400₽

6. Жена потратила 300₽ на общий бизнес
   - Транзакция: Инвестиция в книгу общего бизнеса
   - Обновление баланса счета жены: -300₽
   - Создание обязательства: Муж должен в общий бизнес 150₽ (50% от 300₽)

**Итоговый баланс обязательств (для варианта B - "личный подарок"):**
- Муж должен жене 350₽ (его доля в семейных расходах)
- Муж должен "в общий бизнес" 150₽ (его доля в инвестициях)
- Муж недополучил 400₽ от общего бизнеса

Оптимизированное обязательство: Муж должен жене 100₽ (350₽ + 150₽ - 400₽)

**Итоговый баланс обязательств (для варианта A - "взнос в семейный бюджет"):**
- Муж внес в семейный бюджет 1000₽
- Из семейного бюджета потрачено 700₽ на общие расходы (доля мужа 350₽)
- Муж должен "в общий бизнес" 150₽ (его доля в инвестициях)
- Муж недополучил 400₽ от общего бизнеса
- Остаток взноса мужа в семейном бюджете: 650₽ (1000₽ - 350₽)

Оптимизированное обязательство: Муж имеет переплату 500₽ (650₽ + 0₽ - 150₽)

### Пример 2: Распределение общего дохода

Семья получила общий доход 1000₽ с распределением 70/30 (муж/жена):
1. Доход поступает на счет мужа
2. Система создает обязательство: Муж должен жене 300₽ (30% от 1000₽)
3. Муж переводит 300₽ жене
4. Система закрывает обязательство

## Преимущества системы

1. **Гибкость**:
   - Поддерживает как полностью раздельный, так и общий бюджет
   - Можно настраивать любые пропорции распределения расходов/доходов
   - Учитывает различные типы переводов между членами семьи

2. **Прозрачность**:
   - Четкое разделение личных и общих финансов
   - Автоматический расчет "кто кому должен"
   - Структурированный учет долгов и займов

3. **Полнота учета**:
   - Учет всех типов активов (счета, бизнесы, имущество)
   - Отслеживание и история всех финансовых операций
   - Комплексное управление долгами и обязательствами

4. **Избежание конфликтов**:
   - Четкие правила распределения расходов
   - Объективная система расчета обязательств
   - Исключение "двойного учета" расходов
   - Формализация внутрисемейных займов

5. **Учет долгов и кредитов**:
   - Управление как внутренними, так и внешними долгами
   - Отслеживание графиков платежей и процентов
   - Разбивка платежей на основной долг и проценты
   - Интеграция долгов в общую финансовую картину

## Заключение

Данная система обеспечивает комплексный подход к учету семейных финансов, разделяя физическое местонахождение денег (реальные счета) и их логическое назначение (книги учета). Система автоматически отслеживает взаимные обязательства, что позволяет избежать споров о том, "кто сколько потратил" и "кто кому должен".