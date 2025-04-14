# Техническое задание: Архитектура хранилищ (Stores) 

## 1. Введение

### 1.1 Цель документа
Данный документ описывает архитектуру хранилищ (Stores) для приложения семейного финансового учета на Vue 3 с использованием Pinia. Особое внимание уделяется проектированию структуры данных, связанных с физическими лицами (Person) и их специализациями.

### 1.2 Область применения
Техническое задание распространяется на все модули приложения, использующие централизованное хранение состояния. Особенно актуально для модулей, работающих с учетом персон, категорий, счетов, транзакций и долговых обязательств.

### 1.3 Используемые технологии
- Vue 3
- TypeScript
- Pinia (хранилище состояния)
- Naive UI (компонентная библиотека)

## 2. Общая архитектура хранилищ

### 2.1 Структура каталогов

```
src/
└── stores/
    ├── index.ts            // Точка входа для всех хранилищ
    ├── common/             // Общие типы и утилиты
    │   └── types.ts        // Базовые интерфейсы
    ├── person/             // Базовое хранилище для всех персон
    │   ├── types.ts        // Типы персон
    │   ├── defaultData.ts  // Предустановленные данные
    │   ├── personService.ts// Сервисный слой для работы с персонами
    │   ├── personStore.ts  // Pinia store для персон
    │   └── index.ts        // Экспорты модуля
    ├── user/               // Пользователи системы (аутентификация)
    │   ├── types.ts        
    │   ├── userService.ts  
    │   ├── userStore.ts    
    │   └── index.ts        
    ├── owner/              // Владельцы финансов
    ├── category/           // Категории доходов/расходов
    ├── account/            // Финансовые счета
    ├── book/               // Книги учета
    ├── transaction/        // Транзакции
    └── debt/               // Долги и обязательства
```

### 2.2 Общие принципы организации хранилищ

Каждое хранилище должно придерживаться следующей структуры:

1. **types.ts** - интерфейсы и типы данных
2. **defaultData.ts** - предустановленные данные (если необходимо)
3. **[name]Service.ts** - сервисный слой для бизнес-логики
4. **[name]Store.ts** - хранилище Pinia для управления состоянием
5. **index.ts** - экспорты для удобного импорта

### 2.3 Взаимодействие между хранилищами

- Предпочтительно использовать инъекцию зависимостей через getters
- Избегать циклических зависимостей
- Использовать слабое связывание через ID объектов

## 3. Архитектура персон (Person)

### 3.1 Базовая сущность Person

**Расположение**: `src/stores/common/types.ts`

```typescript
export interface Person {
  id: string;
  name: string;
  type: PersonType;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PersonType = 'user' | 'owner' | 'family_member' | 'external_contact';
```

### 3.2 Специализированные типы персон

#### 3.2.1 User (Пользователь системы)

**Расположение**: `src/stores/user/types.ts`

```typescript
import { Person } from '../common/types';

export interface User extends Person {
  type: 'user';
  username: string;
  pin: string;
  email?: string;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt?: Date;
  settings: UserSettings;
}

export type UserRole = 'admin' | 'regular';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultBookId?: string;
  // Другие настройки пользователя
}
```

#### 3.2.2 Owner (Владелец финансов)

**Расположение**: `src/stores/owner/types.ts`

```typescript
import { Person } from '../common/types';

export interface Owner extends Person {
  type: 'owner';
  isPrimary: boolean;
  defaultBookId?: string;
  defaultCurrency: string;
  budgetShares: BudgetShare[];
  isActive: boolean;
}

export interface BudgetShare {
  bookId: string;
  percentage: number;  // Доля участия в бюджете (0-100)
}
```

#### 3.2.3 FamilyMember (Член семьи без аккаунта)

**Расположение**: `src/stores/person/types.ts`

```typescript
import { Person } from '../common/types';

export interface FamilyMember extends Person {
  type: 'family_member';
  relationshipType: 'child' | 'relative' | 'other';
  guardianId: string;  // ID связанного Owner/User
  birthDate?: Date;
  notes?: string;
}
```

#### 3.2.4 ExternalContact (Внешний контакт)

**Расположение**: `src/stores/person/types.ts`

```typescript
import { Person } from '../common/types';

export interface ExternalContact extends Person {
  type: 'external_contact';
  contactType: 'friend' | 'creditor' | 'debtor' | 'service_provider';
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
    other?: string;
  };
  notes?: string;
}
```

### 3.3 Централизованное хранилище персон

**Расположение**: `src/stores/person/personStore.ts`

```typescript
import { defineStore } from 'pinia';
import { Person, PersonType } from '../common/types';
import { defaultPersons } from './defaultData';
import { PersonService } from './personService';

export const usePersonStore = defineStore('person', {
  state: () => ({
    persons: [...defaultPersons] as Person[],
  }),
  
  getters: {
    // Сервис для работы с персонами
    personService(): PersonService {
      return new PersonService(this.persons);
    },
    
    // Получение персоны по ID
    getPersonById(): (id: string) => Person | undefined {
      return (id: string) => this.persons.find(p => p.id === id);
    },
    
    // Фильтрация персон по типу
    getPersonsByType(): (type: PersonType) => Person[] {
      return (type: PersonType) => this.persons.filter(p => p.type === type);
    },
    
    // Предопределенные фильтры
    allUsers(): Person[] {
      return this.persons.filter(p => p.type === 'user');
    },
    
    allOwners(): Person[] {
      return this.persons.filter(p => p.type === 'owner');
    },
    
    allFamilyMembers(): Person[] {
      return this.persons.filter(p => p.type === 'family_member');
    },
    
    allExternalContacts(): Person[] {
      return this.persons.filter(p => p.type === 'external_contact');
    }
  },
  
  actions: {
    // CRUD операции
    addPerson(person: Person): Person {
      // Добавляем уникальный ID, если он не предоставлен
      if (!person.id) {
        person.id = `person_${Date.now()}`;
      }
      
      // Устанавливаем даты создания и обновления
      const now = new Date();
      person.createdAt = now;
      person.updatedAt = now;
      
      // Добавляем персону в хранилище
      this.persons.push(person);
      return person;
    },
    
    updatePerson(updatedPerson: Partial<Person> & { id: string }): Person | null {
      const index = this.persons.findIndex(p => p.id === updatedPerson.id);
      if (index === -1) return null;
      
      // Обновляем дату изменения
      updatedPerson.updatedAt = new Date();
      
      // Обновляем персону
      this.persons[index] = { ...this.persons[index], ...updatedPerson };
      return this.persons[index];
    },
    
    removePerson(id: string): boolean {
      const index = this.persons.findIndex(p => p.id === id);
      if (index === -1) return false;
      
      this.persons.splice(index, 1);
      return true;
    },
    
    // Поиск персон
    searchPersons(query: string): Person[] {
      const lowerQuery = query.toLowerCase();
      return this.persons.filter(person => 
        person.name.toLowerCase().includes(lowerQuery)
      );
    },
    
    // Импорт/экспорт
    importPersons(persons: Person[]): void {
      this.persons = persons;
    },
    
    resetToDefaults(): void {
      this.persons = [...defaultPersons];
    }
  }
});
```

### 3.4 Специализированное хранилище пользователей

**Расположение**: `src/stores/user/userStore.ts`

```typescript
import { defineStore } from 'pinia';
import { usePersonStore } from '../person';
import { User, UserSettings } from './types';
import { UserService } from './userService';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUserId: null as string | null,
    isAuthenticated: false,
  }),
  
  getters: {
    // Доступ к хранилищу персон
    personStore() {
      return usePersonStore();
    },
    
    // Сервис для работы с пользователями
    userService(): UserService {
      return new UserService();
    },
    
    // Текущий пользователь
    currentUser(): User | null {
      if (!this.currentUserId) return null;
      
      const person = this.personStore.getPersonById(this.currentUserId);
      if (!person || person.type !== 'user') return null;
      
      return person as User;
    },
    
    // Все пользователи системы
    allUsers(): User[] {
      return this.personStore.getPersonsByType('user') as User[];
    },
    
    // Активные пользователи
    activeUsers(): User[] {
      return this.allUsers.filter(user => user.isActive);
    }
  },
  
  actions: {
    // Аутентификация
    async login(pin: string): Promise<boolean> {
      // Логика аутентификации
      const user = this.allUsers.find(user => user.pin === pin && user.isActive);
      
      if (user) {
        this.currentUserId = user.id;
        this.isAuthenticated = true;
        
        // Обновляем дату последнего входа
        this.personStore.updatePerson({
          id: user.id,
          lastLoginAt: new Date()
        });
        
        return true;
      }
      
      return false;
    },
    
    logout(): void {
      this.currentUserId = null;
      this.isAuthenticated = false;
    },
    
    // Управление пользователями
    addUser(userData: Omit<User, 'id' | 'type' | 'createdAt' | 'updatedAt'>): User {
      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        ...userData,
        type: 'user',
      };
      
      return this.personStore.addPerson(newUser as User) as User;
    },
    
    updateUserSettings(userId: string, settings: Partial<UserSettings>): User | null {
      const user = this.personStore.getPersonById(userId) as User | undefined;
      if (!user || user.type !== 'user') return null;
      
      return this.personStore.updatePerson({
        id: userId,
        settings: { ...user.settings, ...settings }
      }) as User;
    },
    
    setUserActive(userId: string, isActive: boolean): User | null {
      return this.personStore.updatePerson({
        id: userId,
        isActive
      }) as User;
    }
  }
});
```

### 3.5 Специализированное хранилище владельцев

**Расположение**: `src/stores/owner/ownerStore.ts`

```typescript
import { defineStore } from 'pinia';
import { usePersonStore } from '../person';
import { Owner, BudgetShare } from './types';
import { OwnerService } from './ownerService';

export const useOwnerStore = defineStore('owner', {
  state: () => ({
    // Дополнительное состояние, специфичное для владельцев
    currentOwnerId: null as string | null,
  }),
  
  getters: {
    // Доступ к хранилищу персон
    personStore() {
      return usePersonStore();
    },
    
    // Сервис для работы с владельцами
    ownerService(): OwnerService {
      return new OwnerService();
    },
    
    // Текущий владелец
    currentOwner(): Owner | null {
      if (!this.currentOwnerId) return null;
      
      const person = this.personStore.getPersonById(this.currentOwnerId);
      if (!person || person.type !== 'owner') return null;
      
      return person as Owner;
    },
    
    // Все владельцы
    allOwners(): Owner[] {
      return this.personStore.getPersonsByType('owner') as Owner[];
    },
    
    // Активные владельцы
    activeOwners(): Owner[] {
      return this.allOwners.filter(owner => owner.isActive);
    },
    
    // Основной владелец (Primary)
    primaryOwner(): Owner | null {
      return this.allOwners.find(owner => owner.isPrimary) || null;
    }
  },
  
  actions: {
    // Создание владельца
    addOwner(ownerData: Omit<Owner, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Owner {
      const newOwner: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'> = {
        ...ownerData,
        type: 'owner',
      };
      
      return this.personStore.addPerson(newOwner as Owner) as Owner;
    },
    
    // Установка текущего владельца
    setCurrentOwner(ownerId: string): Owner | null {
      const owner = this.personStore.getPersonById(ownerId) as Owner | undefined;
      if (!owner || owner.type !== 'owner') return null;
      
      this.currentOwnerId = ownerId;
      return owner;
    },
    
    // Установка основного владельца
    setPrimaryOwner(ownerId: string): boolean {
      // Сначала сбрасываем флаг у текущего основного владельца
      const currentPrimary = this.primaryOwner;
      if (currentPrimary) {
        this.personStore.updatePerson({
          id: currentPrimary.id,
          isPrimary: false
        });
      }
      
      // Устанавливаем нового основного владельца
      const result = this.personStore.updatePerson({
        id: ownerId,
        isPrimary: true
      });
      
      return !!result;
    },
    
    // Обновление долей бюджета
    updateBudgetShares(ownerId: string, budgetShares: BudgetShare[]): Owner | null {
      return this.personStore.updatePerson({
        id: ownerId,
        budgetShares
      }) as Owner;
    }
  }
});
```

## 4. Другие ключевые хранилища

### 4.1 Хранилище категорий (уже реализовано)

Хранилище категорий уже реализовано и может служить примером для других хранилищ. Оно использует следующую структуру:

1. **types.ts** - определение интерфейса Category
2. **defaultCategories.ts** - предустановленные категории
3. **categoryService.ts** - сервисный слой для работы с категориями
4. **categoryStore.ts** - Pinia store для управления категориями
5. **index.ts** - экспорты модуля

### 4.2 Хранилище счетов (Account)

**Расположение**: `src/stores/account/types.ts` (пример интерфейсов)

```typescript
export interface Account {
  id: string;
  name: string;
  ownerId: string;  // ID владельца счета (Owner)
  type: AccountType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment';
```

### 4.3 Хранилище книг учета (Book)

**Расположение**: `src/stores/book/types.ts` (пример интерфейсов)

```typescript
export interface Book {
  id: string;
  name: string;
  type: BookType;
  description?: string;
  ownerIds: string[];  // ID владельцев книги
  distributionRules: DistributionRule[];  // Правила распределения расходов
  icon?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookType = 'personal' | 'family' | 'business' | 'project';

export interface DistributionRule {
  ownerId: string;
  percentage: number;  // Процент участия (0-100)
}
```

### 4.4 Хранилище транзакций (Transaction)

**Расположение**: `src/stores/transaction/types.ts` (пример интерфейсов)

```typescript
export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
  categoryId: string;
  
  // Источник транзакции
  sourceEntityId: string;  // ID счета/актива, откуда идет транзакция
  sourceEntityType: string;  // Тип источника
  
  // Назначение (для переводов)
  destinationEntityId?: string;
  destinationEntityType?: string;
  
  // Владелец и распределение
  executedByOwnerId: string;  // Кто выполнил транзакцию
  responsibleOwnerIds: string[];  // Кто отвечает за транзакцию
  distributionRules?: DistributionRule[];  // Распределение
  
  // Книга учета
  bookId: string;
  
  // Метаданные
  tags?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
```

### 4.5 Хранилище долгов и обязательств (Debt)

**Расположение**: `src/stores/debt/types.ts` (пример интерфейсов)

```typescript
export interface Debt {
  id: string;
  name: string;
  description?: string;
  type: 'borrowed' | 'lent';  // Взятый или данный долг
  
  // Связь с другими сущностями
  bookId: string;
  assetId?: string;
  passiveId?: string;
  
  // Участники
  ownerIds: string[];  // Кто отвечает за долг
  distributionRules?: DistributionRule[];
  externalPartyId?: string;  // ID внешнего контакта
  
  // Финансовые параметры
  initialAmount: number;
  currentAmount: number;
  currency: string;
  interestRate?: number;
  
  // Временные рамки
  startDate: Date;
  plannedEndDate?: Date;
  actualEndDate?: Date;
  
  // История платежей
  payments: DebtPayment[];
  
  // Статус
  status: DebtStatus;
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  tags?: string[];
}

export type DebtStatus = 'active' | 'fully_paid' | 'partially_paid' | 'defaulted' | 'cancelled';

export interface DebtPayment {
  id: string;
  debtId: string;
  transactionId: string;
  date: Date;
  amount: number;
  currency: string;
  type: 'principal' | 'interest' | 'fee' | 'penalty' | 'combined';
  breakdown?: {
    principal: number;
    interest: number;
    fee?: number;
    penalty?: number;
  };
  note?: string;
}
```

## 5. Миграция и переходный период

### 5.1 План миграции

1. Создать новую структуру директорий для хранилищ
2. Реализовать общие типы (src/stores/common/types.ts)
3. Реализовать хранилище для Person
4. Последовательно реализовать специализированные хранилища (User, Owner и т.д.)
5. Интегрировать новые хранилища с существующими компонентами

### 5.2 Приоритеты внедрения

1. Хранилище Person (базовое)
2. Хранилища User и Owner
3. Хранилище Account
4. Хранилище Book
5. Хранилище Transaction
6. Хранилище Debt

### 5.3 Поддержка обратной совместимости

В переходный период необходимо обеспечить обратную совместимость с существующим кодом:

1. Создать адаптеры для старых интерфейсов
2. Обеспечить перенаправление вызовов из старых файлов в новые хранилища
3. Пометить старые файлы как устаревшие (deprecated)

## 6. Требования к реализации

### 6.1 Общие требования

1. Строгая типизация (TypeScript)
2. Документирование методов и интерфейсов
3. Использование иммутабельного подхода при работе с данными
4. Обработка всех потенциальных ошибок
5. Соблюдение принципов SOLID

### 6.2 Требования к производительности

1. Оптимизация запросов и обновлений состояния
2. Минимизация ненужных перерендерингов компонентов
3. Использование компьютируемых свойств для кеширования результатов

### 6.3 Требования к тестированию

1. Модульные тесты для сервисных слоев (coverage > 80%)
2. Тесты хранилищ Pinia
3. Интеграционные тесты для взаимодействия между хранилищами

## 7. Заключение

Предложенная архитектура хранилищ обеспечивает гибкую и масштабируемую основу для приложения семейного финансового учета. Особое внимание уделено проектированию сущностей, связанных с физическими лицами (персонами), что позволяет эффективно работать с различными ролями и взаимоотношениями между участниками финансовых операций.

Внедрение данной архитектуры повысит модульность приложения, упростит тестирование и обеспечит четкое разделение ответственности между различными аспектами бизнес-логики.