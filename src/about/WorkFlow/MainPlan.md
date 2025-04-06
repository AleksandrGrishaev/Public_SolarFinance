Итоговый план реализации приложения семейных финансов
Структура проекта
Copysrc/
├── assets/               # Статические ресурсы (иконки, изображения)
├── components/           # Переиспользуемые компоненты
│   ├── common/           # Общие компоненты (кнопки, инпуты и т.д.)
│   ├── layout/           # Компоненты макета (шапка, меню, подвал)
│   ├── modals/           # Модальные окна для ввода данных
│   └── widgets/          # Виджеты для дашборда
├── composables/          # Переиспользуемая логика (хуки Vue)
├── router/               # Настройки маршрутизации
├── services/             # Сервисный слой для работы с данными
│   ├── api/              # Базовый сервис для работы с localStorage/API
│   ├── auth/             # Сервисы аутентификации
│   ├── finance/          # Сервисы финансов (счета, транзакции)
│   ├── assets/           # Сервисы активов и пассивов
│   └── settings/         # Сервисы настроек приложения
├── stores/               # Хранилища Pinia (с минимальной логикой)
├── types/                # Определения типов TypeScript
├── utils/                # Вспомогательные функции
├── views/                # Компоненты страниц
├── App.vue               # Корневой компонент
└── main.ts               # Точка входа
Этапы реализации
Этап 1: Базовая настройка и типы

Настройка проекта


Определение базовых типов

Создание базового интерфейса BaseEntity для всех сущностей
Определение типов транзакций и пользовательских категорий
Определение типов для счетов, наличных и ссуд
Определение типов для пользователей


Базовый сервисный слой

Реализация ApiService для работы с localStorage
Создание базового CRUD сервиса BaseCrudService
Создание простого сервисного регистра без DI



Этап 2: Аутентификация и базовая навигация

Сервис аутентификации

Реализация AuthService для работы с пользователями
Логика входа/выхода по PIN-коду


Хранилище аутентификации

Создание authStore для хранения состояния аутентификации
Интеграция с AuthService


Базовый макет и навигация

Создание базового макета приложения с меню
Настройка защищенных маршрутов


Интерфейс входа

Создание компонента страницы входа
Реализация ввода PIN-кода



Этап 3: Счета и базовые финансы

Сервисы для финансов

Реализация AccountService для управления счетами
Реализация CashService для управления наличными
Реализация LoanService для управления ссудами


Хранилище для финансов

Создание financeStore для счетов, наличных и ссуд
Интеграция с соответствующими сервисами


Компоненты для управления счетами

Создание компонента AccountsView для отображения списка счетов
Создание модального окна AccountModal для добавления/редактирования счетов
Реализация базовых операций CRUD для счетов


Компоненты для управления наличными и ссудами

Создание соответствующих компонентов и модальных окон
Реализация CRUD операций



Этап 4: Транзакции и категории

Сервисы для транзакций и категорий

Реализация TransactionService для управления транзакциями
Реализация CategoryService для управления пользовательскими категориями


Хранилища для транзакций и категорий

Создание transactionsStore для транзакций
Создание categoriesStore для категорий


Компоненты для управления транзакциями

Создание компонента TransactionsView для отображения списка транзакций
Создание модального окна TransactionModal для добавления/редактирования транзакций
Реализация фильтрации и сортировки транзакций


Компоненты для управления категориями

Создание компонента для управления пользовательскими категориями
Создание модального окна для добавления/редактирования категорий



Этап 5: Активы и пассивы

Типы и сервисы для активов и пассивов

Определение типов для активов, типов активов
Определение типов для пассивов, типов пассивов
Реализация AssetService и LiabilityService
Реализация AssetTypeService и LiabilityTypeService для типов


Хранилища для активов и пассивов

Создание assetsStore для активов и пассивов
Интеграция с соответствующими сервисами


Компоненты для управления активами

Создание компонента AssetsView для отображения списка активов
Создание модального окна AssetModal для добавления/редактирования активов
Реализация отображения операций по активу


Компоненты для управления пассивами

Создание компонента LiabilitiesView для пассивов
Создание модального окна LiabilityModal для пассивов



Этап 6: Инвестиции и криптовалюты

Типы и сервисы для инвестиций и криптовалют

Определение типов для инвестиций, типов инвестиций
Определение типов для криптовалют
Реализация InvestmentService и CryptoService


Хранилища для инвестиций и криптовалют

Создание investmentsStore для инвестиций
Создание cryptoStore для криптовалют


Компоненты для управления инвестициями

Создание компонента InvestmentsView для инвестиций
Создание модального окна InvestmentModal для инвестиций


Компоненты для управления криптовалютами

Создание компонента CryptoView для криптовалют
Создание модального окна CryptoModal для криптовалют



Этап 7: Дашборд и аналитика

Сервисы для аналитики

Реализация AnalyticsService для расчета аналитических данных
Методы для получения сводной информации


Виджеты для дашборда

Создание виджета общего капитала
Создание виджета для активов по пользователям
Создание виджета последних операций
Создание графиков и диаграмм


Компонент дашборда

Создание компонента DashboardView
Интеграция всех виджетов
Настройка и персонализация дашборда



Этап 8: Пользователи и настройки

Сервисы для пользователей и настроек

Доработка AuthService для управления пользователями
Реализация SettingsService для настроек приложения


Компоненты для управления пользователями

Создание компонента UsersView для управления пользователями
Создание модального окна UserModal для добавления/редактирования пользователей


Компоненты для настроек

Создание компонента SettingsView для настроек приложения
Настройки валют, форматов и т.д.



Детали реализации
Базовые интерфейсы и сервисы
Базовый интерфейс сущности
typescriptCopy// types/base.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
Базовый интерфейс CRUD-сервиса
typescriptCopy// services/BaseCrudService.ts
import { BaseEntity } from '@/types/base';

export interface BaseCrudService<T extends BaseEntity, CreateDTO = Omit<T, 'id' | 'createdAt' | 'updatedAt'>, UpdateDTO = Partial<CreateDTO>> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}
Базовая реализация CRUD-сервиса
typescriptCopy// services/BaseCrudServiceImpl.ts
import { BaseEntity } from '@/types/base';
import { BaseCrudService } from './BaseCrudService';
import { ApiService } from './api/ApiService';

export abstract class BaseCrudServiceImpl<T extends BaseEntity, CreateDTO = Omit<T, 'id' | 'createdAt' | 'updatedAt'>, UpdateDTO = Partial<CreateDTO>> 
  implements BaseCrudService<T, CreateDTO, UpdateDTO> {
  
  protected abstract entityName: string;
  protected apiService: ApiService;
  
  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }
  
  async getAll(): Promise<T[]> {
    return this.apiService.get<T[]>(`/${this.entityName}`);
  }
  
  async getById(id: string): Promise<T | null> {
    try {
      return await this.apiService.get<T>(`/${this.entityName}/${id}`);
    } catch (error) {
      return null;
    }
  }
  
  async create(data: CreateDTO): Promise<T> {
    const newItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as T;
    
    return this.apiService.post<T>(`/${this.entityName}`, newItem);
  }
  
  async update(id: string, data: UpdateDTO): Promise<T> {
    const updatedItem = {
      ...data,
      updatedAt: new Date()
    };
    
    return this.apiService.put<T>(`/${this.entityName}/${id}`, updatedItem);
  }
  
  async delete(id: string): Promise<boolean> {
    await this.apiService.delete(`/${this.entityName}/${id}`);
    return true;
  }
}
ApiService для работы с localStorage
typescriptCopy// services/api/ApiService.ts
export interface ApiService {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
  put<T>(url: string, data: any): Promise<T>;
  delete(url: string): Promise<void>;
}

// services/api/LocalStorageApiService.ts
import { ApiService } from './ApiService';

export class LocalStorageApiService implements ApiService {
  private getStorageKey(url: string): string {
    return `family-finance-app${url.replace(/\//g, '_')}`;
  }
  
  private getCollectionKey(url: string): string {
    const parts = url.split('/');
    return `family-finance-app_${parts[1]}`;
  }
  
  async get<T>(url: string): Promise<T> {
    // Реализация для получения данных из localStorage
    // ...
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    // Реализация для сохранения данных в localStorage
    // ...
  }
  
  async put<T>(url: string, data: any): Promise<T> {
    // Реализация для обновления данных в localStorage
    // ...
  }
  
  async delete(url: string): Promise<void> {
    // Реализация для удаления данных из localStorage
    // ...
  }
}
Сервисный регистр
typescriptCopy// services/index.ts
import { ApiService } from './api/ApiService';
import { LocalStorageApiService } from './api/LocalStorageApiService';
import { AccountService } from './finance/AccountService';
import { AccountServiceImpl } from './finance/AccountServiceImpl';
import { TransactionService } from './finance/TransactionService';
import { TransactionServiceImpl } from './finance/TransactionServiceImpl';
// Импорт других сервисов

// Создаем экземпляры сервисов
const apiService = new LocalStorageApiService();
const accountService = new AccountServiceImpl(apiService);
const transactionService = new TransactionServiceImpl(apiService, accountService);
// Создание других сервисов

// Экспортируем экземпляры для использования
export {
  apiService,
  accountService,
  transactionService,
  // Другие сервисы
};

## Модальные окна для ввода данных
Модальные окна будут базироваться на компоненте BaseModal.vue, который будет служить основой для всех модальных окон в приложении. Ниже приведена список основных модальных окон и их назначение:

AccountModal.vue - Добавление/редактирование счетов
CashModal.vue - Добавление/редактирование наличных средств
LoanModal.vue - Добавление/редактирование ссуд
TransactionModal.vue - Добавление/редактирование операций
AssetModal.vue - Добавление/редактирование активов
LiabilityModal.vue - Добавление/редактирование пассивов
InvestmentModal.vue - Добавление/редактирование инвестиций
CryptoModal.vue - Добавление/редактирование криптовалют
UserModal.vue - Добавление/редактирование пользователей
CategoryModal.vue - Добавление/редактирование пользовательских категорий
AssetTypeModal.vue - Добавление/редактирование пользовательских типов активов
LiabilityTypeModal.vue - Добавление/редактирование пользовательских типов пассивов

## Types

// Базовый интерфейс для всех сущностей
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// === Пользователи ===
interface User extends BaseEntity {
  name: string;
  pin: string; // Зашифрованный PIN-код
  avatar?: string;
  isAdmin: boolean;
}

// === Финансы ===

// Счета
enum AccountType {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

interface Account extends BaseEntity {
  name: string;
  icon: string;
  currency: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

// Наличные
interface Cash extends BaseEntity {
  icon: string;
  currency: string;
  initialAmount: number;
  currentAmount: number;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

// === Транзакции ===
enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

// Предустановленные категории транзакций
enum DefaultTransactionCategory {
  SALARY = 'salary',
  GIFT = 'gift',
  FOOD = 'food',
  TRANSPORT = 'transport',
  ENTERTAINMENT = 'entertainment',
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  HEALTH = 'health',
  EDUCATION = 'education',
  INVESTMENT = 'investment',
  ASSET_PURCHASE = 'assetPurchase',
  LIABILITY_PURCHASE = 'liabilityPurchase',
  DEBT_PAYMENT = 'debtPayment',
  OTHER = 'other'
}

// Интерфейс для пользовательских категорий
interface CustomCategory extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  parentCategory?: DefaultTransactionCategory | string; // Может быть связана с предустановленной категорией
}

// Транзакция может использовать как предустановленную, так и пользовательскую категорию
interface Transaction extends BaseEntity {
  type: TransactionType;
  amount: number;
  currency: string;
  category: DefaultTransactionCategory | string; // Строка для ID пользовательской категории
  date: Date;
  sourceId?: string; 
  sourceType?: string; 
  destinationId?: string;
  destinationType?: string;
  relatedAssetId?: string;
  createdBy: string;
}

// === Активы и пассивы ===

// Интерфейс для пользовательских типов активов
interface AssetTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

// Предустановленные типы активов
enum DefaultAssetType {
  BUSINESS = 'business',
  PROJECT = 'project',
  REAL_ESTATE = 'realEstate'
}

interface Asset extends BaseEntity {
  name: string;
  type: DefaultAssetType | string; // Строка для ID пользовательского типа
  icon: string;
  initialValue: number;
  currentValue: number;
  currency: string;
  description: string;
  isManaged: boolean;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

// Интерфейс для пользовательских типов пассивов
interface LiabilityTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

// Предустановленные типы пассивов
enum DefaultLiabilityType {
  PROPERTY = 'property',
  VEHICLE = 'vehicle',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  OTHER = 'other'
}

interface Liability extends BaseEntity {
  name: string;
  type: DefaultLiabilityType | string; // Строка для ID пользовательского типа
  icon: string;
  initialValue: number;
  currentValue: number;
  currency: string;
  description: string;
  purchaseDate: Date;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

// === Инвестиции ===

// Предустановленные типы инвестиций
enum DefaultInvestmentType {
  STOCK = 'stock',
  BOND = 'bond',
  ETF = 'etf',
  MUTUAL_FUND = 'mutualFund',
  DEPOSIT = 'deposit',
  OTHER = 'other'
}

// Интерфейс для пользовательских типов инвестиций
interface InvestmentTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

interface Investment extends BaseEntity {
  name: string;
  type: DefaultInvestmentType | string; // Строка для ID пользовательского типа
  icon: string;
  amount: number;
  initialValue: number;
  currentValue: number;
  currency: string;
  purchaseDate: Date;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

// === Криптовалюта ===
interface Cryptocurrency extends BaseEntity {
  symbol: string;
  name: string;
  amount: number;
  initialValueUSD: number;
  currentValueUSD: number;
  walletAddress?: string;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

// === Кредиты/Ссуды ===

// Предустановленные типы кредитов
enum DefaultLoanType {
  MORTGAGE = 'mortgage',
  CAR_LOAN = 'carLoan',
  PERSONAL_LOAN = 'personalLoan',
  BUSINESS_LOAN = 'businessLoan',
  CREDIT_CARD = 'creditCard',
  FAMILY_LOAN = 'familyLoan',
  OTHER = 'other'
}

// Интерфейс для пользовательских типов кредитов
interface LoanTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

interface Loan extends BaseEntity {
  name: string;
  type: DefaultLoanType | string; // Строка для ID пользовательского типа
  icon: string;
  initialAmount: number;
  currentAmount: number;
  currency: string;
  interestRate?: number;
  startDate: Date;
  endDate?: Date;
  paymentSchedule?: string;
  lenderId?: string;
  borrowerId: string;
  ownershipShares?: Record<string, number>;
  relatedAssetId?: string;
}