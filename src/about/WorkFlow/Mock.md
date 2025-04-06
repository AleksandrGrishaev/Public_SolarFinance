// Активы
const mockAssets = [
  {
    id: "asset1",
    name: "ИТ-консалтинг",
    iconUrl: "IconBuildingStore",
    currency: "RUB",
    initialBalance: 200000,
    currentBalance: 350000,
    ownerId: "owner1",
    bookId: "book4",
    type: "Business",
    isActivelyManaged: true,
    profitLossHistory: [
      {
        date: new Date("2023-02-01"),
        amount: 50000,
        description: "Прибыль за февраль"
      },
      {
        date: new Date("2023-03-01"),
        amount: 60000,
        description: "Прибыль за март"
      },
      {
        date: new Date("2023-04-01"),
        amount: 40000,
        description: "Прибыль за апрель"
      }
    ],
    linkedDebtIds: ["debt3"],
    equityValue: 250000, // 350000 - 100000 (бизнес-кредит)
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "asset2",
    name: "Онлайн-школа",
    iconUrl: "IconSchool",
    currency: "RUB",
    initialBalance: 150000,
    currentBalance: 280000,
    ownerId: "owner2",
    coOwners: [
      { ownerId: "owner1", share: 30 },
      { ownerId: "owner2", share: 70 }
    ],
    bookId: "book5",
    type: "Business",
    isActivelyManaged: true,
    profitLossHistory: [
      {
        date: new Date("2023-02-01"),
        amount: 30000,
        description: "Прибыль за февраль"
      },
      {
        date: new Date("2023-03-01"),
        amount: 50000,
        description: "Прибыль за март"
      },
      {
        date: new Date("2023-04-01"),
        amount: 50000,
        description: "Прибыль за апрель"
      }
    ],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  }
];

// Пассивы
const mockPassives = [
  {
    id: "passive1",
    name: "Квартира",
    iconUrl: "IconHome",
    currency: "RUB",
    initialBalance: 7500000,
    currentBalance: 8000000, // Текущая оценочная стоимость
    ownerId: "owner1",
    coOwners: [
      { ownerId: "owner1", share: 50 },
      { // Тестовые данные для прототипа приложения семейного финансового учета

// ==================== БАЗОВЫЕ СУЩНОСТИ ====================

// Члены семьи (владельцы)
const mockOwners = [
  {
    id: "owner1",
    name: "Алексей"
  },
  {
    id: "owner2",
    name: "Елена"
  }
];

// Книги учета
const mockBooks = [
  {
    id: "book1",
    name: "Личные финансы Алексея",
    description: "Личный бюджет Алексея",
    type: "Personal",
    ownerIds: ["owner1"]
  },
  {
    id: "book2",
    name: "Личные финансы Елены",
    description: "Личный бюджет Елены",
    type: "Personal",
    ownerIds: ["owner2"]
  },
  {
    id: "book3",
    name: "Семейный бюджет",
    description: "Общий бюджет семьи",
    type: "Family",
    ownerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 60 },
      { ownerId: "owner2", percentage: 40 }
    ]
  },
  {
    id: "book4",
    name: "ИТ-консалтинг",
    description: "Бизнес Алексея",
    type: "Business",
    ownerIds: ["owner1"]
  },
  {
    id: "book5",
    name: "Онлайн-школа",
    description: "Общий семейный бизнес",
    type: "Business",
    ownerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 30 },
      { ownerId: "owner2", percentage: 70 }
    ]
  }
];

// Категории транзакций
const mockCategories = [
  // Категории доходов
  {
    id: "category1",
    name: "Зарплата",
    type: "Income",
    iconUrl: "IconCashBanknote",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category2",
    name: "Доход от бизнеса",
    type: "Income",
    iconUrl: "IconBuildingStore",
    bookIds: ["book4", "book5"]
  },
  {
    id: "category3",
    name: "Возврат долга",
    type: "Income",
    iconUrl: "IconArrowBack",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category4",
    name: "Инвестиционный доход",
    type: "Income",
    iconUrl: "IconChartLine",
    bookIds: ["book1", "book2", "book3"]
  },
  
  // Категории расходов
  {
    id: "category5",
    name: "Продукты",
    type: "Expense",
    iconUrl: "IconShoppingCart",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category6",
    name: "Рестораны",
    type: "Expense",
    iconUrl: "IconCoffee",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category7",
    name: "Транспорт",
    type: "Expense",
    iconUrl: "IconCar",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category8",
    name: "Аренда жилья",
    type: "Expense",
    iconUrl: "IconBuildingSkyscraper",
    bookIds: ["book3"]
  },
  {
    id: "category9",
    name: "Коммунальные услуги",
    type: "Expense",
    iconUrl: "IconBolt",
    bookIds: ["book3"]
  },
  {
    id: "category10",
    name: "Одежда",
    type: "Expense",
    iconUrl: "IconShirt",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category11",
    name: "Развлечения",
    type: "Expense",
    iconUrl: "IconMovie",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category12",
    name: "Здоровье",
    type: "Expense",
    iconUrl: "IconHeartbeat",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category13",
    name: "Образование",
    type: "Expense",
    iconUrl: "IconSchool",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category14",
    name: "Расходы на бизнес",
    type: "Expense",
    iconUrl: "IconBriefcase",
    bookIds: ["book4", "book5"]
  },
  
  // Категории переводов
  {
    id: "category15",
    name: "Перевод между счетами",
    type: "Transfer",
    iconUrl: "IconArrowsExchange",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category16",
    name: "Перевод в семейный бюджет",
    type: "Transfer",
    iconUrl: "IconUsers",
    bookIds: ["book1", "book2", "book3"]
  },
  
  // Долговые категории
  {
    id: "category17",
    name: "Выдача займа",
    type: "Expense",
    iconUrl: "IconCash",
    bookIds: ["book1", "book2", "book3"]
  },
  {
    id: "category18",
    name: "Выплата по кредиту",
    type: "Expense",
    iconUrl: "IconCreditCard",
    bookIds: ["book1", "book2", "book3", "book4", "book5"]
  },
  {
    id: "category19",
    name: "Получение кредита",
    type: "Income",
    iconUrl: "IconReceipt",
    bookIds: ["book1", "book2", "book3", "book4", "book5"]
  }
];

// ==================== ФИНАНСОВЫЕ АКТИВЫ ====================

// Счета
const mockAccounts = [
  {
    id: "account1",
    name: "Дебетовая карта Алексея",
    iconUrl: "IconCreditCard",
    currency: "RUB",
    initialBalance: 50000,
    currentBalance: 68500,
    ownerId: "owner1",
    bookId: "book1",
    type: "Debit",
    bankName: "Сбербанк",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "account2",
    name: "Кредитная карта Алексея",
    iconUrl: "IconCreditCard",
    currency: "RUB",
    initialBalance: 0,
    currentBalance: -15000,
    ownerId: "owner1",
    bookId: "book1",
    type: "Credit",
    bankName: "Альфа-Банк",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "account3",
    name: "Дебетовая карта Елены",
    iconUrl: "IconCreditCard",
    currency: "RUB",
    initialBalance: 30000,
    currentBalance: 42000,
    ownerId: "owner2",
    bookId: "book2",
    type: "Debit",
    bankName: "Тинькофф",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "account4",
    name: "Общий счет",
    iconUrl: "IconUsers",
    currency: "RUB",
    initialBalance: 100000,
    currentBalance: 130000,
    ownerId: "owner1",
    coOwners: [
      { ownerId: "owner1", share: 50 },
      { ownerId: "owner2", share: 50 }
    ],
    bookId: "book3",
    type: "Debit",
    bankName: "Сбербанк",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "account5",
    name: "Счет ИТ-консалтинга",
    iconUrl: "IconBuildingBank",
    currency: "RUB",
    initialBalance: 200000,
    currentBalance: 350000,
    ownerId: "owner1",
    bookId: "book4",
    type: "Debit",
    bankName: "Точка",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "account6",
    name: "Счет онлайн-школы",
    iconUrl: "IconBuildingBank",
    currency: "RUB",
    initialBalance: 150000,
    currentBalance: 280000,
    ownerId: "owner2",
    coOwners: [
      { ownerId: "owner1", share: 30 },
      { ownerId: "owner2", share: 70 }
    ],
    bookId: "book5",
    type: "Debit",
    bankName: "Точка",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  }
];

// Наличные
const mockCash = [
  {
    id: "cash1",
    name: "Наличные Алексея",
    iconUrl: "IconCash",
    currency: "RUB",
    initialBalance: 10000,
    currentBalance: 5000,
    ownerId: "owner1",
    bookId: "book1",
    location: "Кошелек",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "cash2",
    name: "Наличные Елены",
    iconUrl: "IconCash",
    currency: "RUB",
    initialBalance: 8000,
    currentBalance: 3000,
    ownerId: "owner2",
    bookId: "book2",
    location: "Кошелек",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  }
];

// Источники дохода
const mockIncomeSources = [
  {
    id: "income1",
    name: "Работа Алексея",
    iconUrl: "IconBriefcase",
    type: "Job",
    currency: "RUB",
    ownerId: "owner1",
    bookId: "book1",
    expectedMonthlyAmount: 120000,
    paymentFrequency: "Monthly",
    nextPaymentDate: new Date("2023-05-10"),
    description: "Основная работа",
    taxRate: 13,
    isTaxDeducted: true,
    isActive: true,
    startDate: new Date("2022-01-15"),
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "income2",
    name: "Работа Елены",
    iconUrl: "IconBriefcase",
    type: "Job",
    currency: "RUB",
    ownerId: "owner2",
    bookId: "book2",
    expectedMonthlyAmount: 95000,
    paymentFrequency: "Monthly",
    nextPaymentDate: new Date("2023-05-05"),
    description: "Основная работа",
    taxRate: 13,
    isTaxDeducted: true,
    isActive: true,
    startDate: new Date("2022-03-01"),
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  }
];

// Активы
const mockAssets = [
  {
    id: "asset1",
    name: "ИТ-консалтинг",
    iconUrl: "business.png",
    currency: "RUB",
    initialBalance: 200000,
    currentBalance: 350000,
    ownerId: "owner1",
    bookId: "book4",
    type: "Business",
    isActivelyManaged: true,
    profitLossHistory: [
      {
        date: new Date("2023-02-01"),
        amount: 50000,
        description: "Прибыль за февраль"
      },
      {
        date: new Date("2023-03-01"),
        amount: 60000,
        description: "Прибыль за март"
      },
      {
        date: new Date("2023-04-01"),
        amount: 40000,
        description: "Прибыль за апрель"
      }
    ],
    linkedDebtIds: ["debt3"],
    equityValue: 250000, // 350000 - 100000 (бизнес-кредит)
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "asset2",
    name: "Онлайн-школа",
    iconUrl: "school.png",
    currency: "RUB",
    initialBalance: 150000,
    currentBalance: 280000,
    ownerId: "owner2",
    coOwners: [
      { ownerId: "owner1", share: 30 },
      { ownerId: "owner2", share: 70 }
    ],
    bookId: "book5",
    type: "Business",
    isActivelyManaged: true,
    profitLossHistory: [
      {
        date: new Date("2023-02-01"),
        amount: 30000,
        description: "Прибыль за февраль"
      },
      {
        date: new Date("2023-03-01"),
        amount: 50000,
        description: "Прибыль за март"
      },
      {
        date: new Date("2023-04-01"),
        amount: 50000,
        description: "Прибыль за апрель"
      }
    ],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-04-01")
  }
];

// Пассивы
const mockPassives = [
  {
    id: "passive1",
    name: "Квартира",
    iconUrl: "apartment.png",
    currency: "RUB",
    initialBalance: 7500000,
    currentBalance: 8000000, // Текущая оценочная стоимость
    ownerId: "owner1",
    coOwners: [
      { ownerId: "owner1", share: 50 },
      { ownerId: "owner2", share: 50 }
    ],
    bookId: "book3",
    type: "RealEstate",
    acquisitionCost: 7500000,
    currentEstimatedValue: 8000000,
    appreciationRate: 5, // % в год
    linkedDebtIds: ["debt1"],
    equityValue: 3000000, // 8000000 - 5000000 (остаток ипотеки)
    createdAt: new Date("2020-06-15"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "passive2",
    name: "Автомобиль",
    iconUrl: "car.png",
    currency: "RUB",
    initialBalance: 1800000,
    currentBalance: 1500000, // С учетом обесценивания
    ownerId: "owner1",
    bookId: "book1",
    type: "Vehicle",
    acquisitionCost: 1800000,
    currentEstimatedValue: 1500000,
    appreciationRate: -10, // % в год (обесценивание)
    linkedDebtIds: ["debt2"],
    equityValue: 900000, // 1500000 - 600000 (остаток автокредита)
    createdAt: new Date("2022-05-10"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "passive3",
    name: "Мебель",
    iconUrl: "furniture.png",
    currency: "RUB",
    initialBalance: 400000,
    currentBalance: 300000, // С учетом обесценивания
    ownerId: "owner1",
    coOwners: [
      { ownerId: "owner1", share: 50 },
      { ownerId: "owner2", share: 50 }
    ],
    bookId: "book3",
    type: "Appliance",
    acquisitionCost: 400000,
    currentEstimatedValue: 300000,
    appreciationRate: -20, // % в год (обесценивание)
    createdAt: new Date("2022-07-20"),
    updatedAt: new Date("2023-04-01")
  }
];

// Инвестиции
const mockInvestments = [
  {
    id: "investment1",
    name: "Акции Газпром",
    iconUrl: "stocks.png",
    currency: "RUB",
    initialBalance: 100000,
    currentBalance: 115000,
    ownerId: "owner1",
    bookId: "book1",
    type: "Stock",
    units: 100,
    pricePerUnit: 1150,
    createdAt: new Date("2022-10-15"),
    updatedAt: new Date("2023-04-01")
  },
  {
    id: "investment2",
    name: "ETF Финекс",
    iconUrl: "etf.png",
    currency: "RUB",
    initialBalance: 200000,
    currentBalance: 210000,
    ownerId: "owner1",
    coOwners: [
      { ownerId: "owner1", share: 70 },
      { ownerId: "owner2", share: 30 }
    ],
    bookId: "book3",
    type: "ETF",
    units: 20,
    pricePerUnit: 10500,
    createdAt: new Date("2022-11-20"),
    updatedAt: new Date("2023-04-01")
  }
];

// Криптовалюты
const mockCryptos = [
  {
    id: "crypto1",
    name: "Bitcoin",
    iconUrl: "bitcoin.png",
    currency: "RUB",
    initialBalance: 50000,
    currentBalance: 60000,
    ownerId: "owner1",
    bookId: "book1",
    coinType: "BTC",
    units: 0.001,
    pricePerUnit: 60000000,
    createdAt: new Date("2022-09-10"),
    updatedAt: new Date("2023-04-01")
  }
];

// ==================== ДОЛГИ ====================

const mockDebts = [
  {
    id: "debt1",
    name: "Ипотека",
    description: "Ипотечный кредит на квартиру",
    type: "Borrowed",
    
    // Связь с другими сущностями
    bookId: "book3", // Семейная книга
    passiveId: "passive1", // Связь с квартирой
    
    // Участники долга
    ownerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 60 },
      { ownerId: "owner2", percentage: 40 }
    ],
    externalPartyName: "Сбербанк",
    externalPartyType: "Bank",
    
    // Финансовые параметры
    initialAmount: 6000000,
    currentAmount: 5000000,
    currency: "RUB",
    interestRate: 7.5,
    
    // Временные рамки
    startDate: new Date("2020-06-15"),
    plannedEndDate: new Date("2035-06-15"),
    
    // Простой график платежей
    plannedReturnDate: new Date("2035-06-15"),
    
    // История платежей
    payments: [
      {
        id: "debtpayment1",
        date: new Date("2023-04-05"),
        amount: 45000,
        currency: "RUB",
        type: "Combined",
        breakdown: {
          principal: 15000,
          interest: 30000
        }
      },
      {
        id: "debtpayment2",
        date: new Date("2023-03-05"),
        amount: 45000,
        currency: "RUB",
        type: "Combined",
        breakdown: {
          principal: 14500,
          interest: 30500
        }
      }
    ],
    
    // Статус
    status: "Active",
    
    // Метаданные
    createdAt: new Date("2020-06-15"),
    updatedAt: new Date("2023-04-05")
  },
  {
    id: "debt2",
    name: "Автокредит",
    description: "Кредит на автомобиль",
    type: "Borrowed",
    
    // Связь с другими сущностями
    bookId: "book1", // Личная книга Алексея
    passiveId: "passive2", // Связь с автомобилем
    
    // Участники долга
    ownerIds: ["owner1"],
    externalPartyName: "Альфа-Банк",
    externalPartyType: "Bank",
    
    // Финансовые параметры
    initialAmount: 900000,
    currentAmount: 600000,
    currency: "RUB",
    interestRate: 9.5,
    
    // Временные рамки
    startDate: new Date("2022-05-10"),
    plannedEndDate: new Date("2025-05-10"),
    
    // История платежей
    payments: [
      {
        id: "debtpayment3",
        date: new Date("2023-04-10"),
        amount: 28000,
        currency: "RUB",
        type: "Combined",
        breakdown: {
          principal: 20000,
          interest: 8000
        }
      }
    ],
    
    // Статус
    status: "Active",
    
    // Метаданные
    createdAt: new Date("2022-05-10"),
    updatedAt: new Date("2023-04-10")
  },
  {
    id: "debt3",
    name: "Бизнес-кредит",
    description: "Кредит на развитие бизнеса",
    type: "Borrowed",
    
    // Связь с другими сущностями
    bookId: "book4", // Бизнес Алексея
    assetId: "asset1", // Связь с бизнесом
    
    // Участники долга
    ownerIds: ["owner1"],
    externalPartyName: "Точка",
    externalPartyType: "Bank",
    
    // Финансовые параметры
    initialAmount: 150000,
    currentAmount: 100000,
    currency: "RUB",
    interestRate: 12,
    
    // Временные рамки
    startDate: new Date("2023-01-10"),
    plannedEndDate: new Date("2024-01-10"),
    
    // История платежей
    payments: [
      {
        id: "debtpayment4",
        date: new Date("2023-04-15"),
        amount: 14000,
        currency: "RUB",
        type: "Combined",
        breakdown: {
          principal: 10000,
          interest: 4000
        }
      }
    ],
    
    // Статус
    status: "Active",
    
    // Метаданные
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-04-15")
  },
  {
    id: "debt4",
    name: "Займ Ивану",
    description: "Дали в долг другу на покупку техники",
    type: "Lent", // Выданный займ
    
    // Связь с другими сущностями
    bookId: "book3", // Семейная книга
    
    // Участники долга
    ownerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 50 },
      { ownerId: "owner2", percentage: 50 }
    ],
    externalPartyName: "Иван Петров",
    externalPartyType: "Person",
    
    // Финансовые параметры
    initialAmount: 60000,
    currentAmount: 60000,
    currency: "RUB",
    interestRate: 0, // Беспроцентный
    
    // Временные рамки
    startDate: new Date("2023-03-20"),
    plannedReturnDate: new Date("2023-06-20"),
    
    // История платежей
    payments: [],
    
    // Статус
    status: "Active",
    
    // Метаданные
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2023-03-20")
  }
];

// ==================== ТРАНЗАКЦИИ ====================

// Примеры транзакций (только несколько для примера)
const mockTransactions = [
  // Доходы
  {
    id: "transaction1",
    date: new Date("2023-04-05"),
    amount: 120000,
    currency: "RUB",
    type: "Income",
    description: "Зарплата за март",
    categoryId: "category1",
    sourceEntityId: "income1",
    sourceEntityType: "IncomeSource",
    destinationEntityId: "account1",
    destinationEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1"],
    bookId: "book1",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05")
  },
  {
    id: "transaction2",
    date: new Date("2023-04-05"),
    amount: 95000,
    currency: "RUB",
    type: "Income",
    description: "Зарплата за март",
    categoryId: "category1",
    sourceEntityId: "income2",
    sourceEntityType: "IncomeSource",
    destinationEntityId: "account3",
    destinationEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner2"],
    bookId: "book2",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05")
  },
  {
    id: "transaction3",
    date: new Date("2023-04-10"),
    amount: 40000,
    currency: "RUB",
    type: "Income",
    description: "Прибыль от ИТ-консалтинга",
    categoryId: "category2",
    sourceEntityId: "asset1",
    sourceEntityType: "Asset",
    destinationEntityId: "account5",
    destinationEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1"],
    bookId: "book4",
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-04-10")
  },
  
  // Переводы в семейный бюджет
  {
    id: "transaction4",
    date: new Date("2023-04-06"),
    amount: 60000,
    currency: "RUB",
    type: "Transfer",
    description: "Взнос в семейный бюджет",
    categoryId: "category16",
    sourceEntityId: "account1",
    sourceEntityType: "Account",
    destinationEntityId: "account4",
    destinationEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1"],
    bookId: "book3",
    transferPurpose: "FamilyBudgetContribution",
    familyBudgetContribution: {
      bookId: "book3",
      contributionPercentage: 100
    },
    createdAt: new Date("2023-04-06"),
    updatedAt: new Date("2023-04-06")
  },
  {
    id: "transaction5",
    date: new Date("2023-04-06"),
    amount: 40000,
    currency: "RUB",
    type: "Transfer",
    description: "Взнос в семейный бюджет",
    categoryId: "category16",
    sourceEntityId: "account3",
    sourceEntityType: "Account",
    destinationEntityId: "account4",
    destinationEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner2"],
    bookId: "book3",
    transferPurpose: "FamilyBudgetContribution",
    familyBudgetContribution: {
      bookId: "book3",
      contributionPercentage: 100
    },
    createdAt: new Date("2023-04-06"),
    updatedAt: new Date("2023-04-06")
  },
  
  // Расходы
  {
    id: "transaction6",
    date: new Date("2023-04-08"),
    amount: 15000,
    currency: "RUB",
    type: "Expense",
    description: "Продукты в Перекрестке",
    categoryId: "category5",
    sourceEntityId: "account4",
    sourceEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 60 },
      { ownerId: "owner2", percentage: 40 }
    ],
    bookId: "book3",
    createdAt: new Date("2023-04-08"),
    updatedAt: new Date("2023-04-08")
  },
  {
    id: "transaction7",
    date: new Date("2023-04-12"),
    amount: 8000,
    currency: "RUB",
    type: "Expense",
    description: "Рестораны",
    categoryId: "category6",
    sourceEntityId: "account3",
    sourceEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner2"],
    bookId: "book2",
    createdAt: new Date("2023-04-12"),
    updatedAt: new Date("2023-04-12")
  },
  {
    id: "transaction8",
    date: new Date("2023-04-15"),
    amount: 35000,
    currency: "RUB",
    type: "Expense",
    description: "Коммунальные платежи",
    categoryId: "category9",
    sourceEntityId: "account4",
    sourceEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 60 },
      { ownerId: "owner2", percentage: 40 }
    ],
    bookId: "book3",
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-15")
  },
  {
    id: "transaction9",
    date: new Date("2023-04-18"),
    amount: 12000,
    currency: "RUB",
    type: "Expense",
    description: "Одежда",
    categoryId: "category10",
    sourceEntityId: "account1",
    sourceEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1"],
    bookId: "book1",
    createdAt: new Date("2023-04-18"),
    updatedAt: new Date("2023-04-18")
  },
  {
    id: "transaction10",
    date: new Date("2023-04-20"),
    amount: 25000,
    currency: "RUB",
    type: "Expense",
    description: "Курсы для ребенка",
    categoryId: "category13",
    sourceEntityId: "account4",
    sourceEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 60 },
      { ownerId: "owner2", percentage: 40 }
    ],
    bookId: "book3",
    createdAt: new Date("2023-04-20"),
    updatedAt: new Date("2023-04-20")
  },
  
  // Бизнес-расходы
  {
    id: "transaction11",
    date: new Date("2023-04-16"),
    amount: 20000,
    currency: "RUB",
    type: "Expense",
    description: "Реклама онлайн-школы",
    categoryId: "category14",
    sourceEntityId: "account6",
    sourceEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 30 },
      { ownerId: "owner2", percentage: 70 }
    ],
    bookId: "book5",
    createdAt: new Date("2023-04-16"),
    updatedAt: new Date("2023-04-16")
  },
  
  // Платежи по кредитам
  {
    id: "transaction12",
    date: new Date("2023-04-05"),
    amount: 45000,
    currency: "RUB",
    type: "DebtRepayment",
    description: "Ипотечный платеж",
    categoryId: "category18",
    sourceEntityId: "account4",
    sourceEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 60 },
      { ownerId: "owner2", percentage: 40 }
    ],
    bookId: "book3",
    debtId: "debt1",
    debtPaymentType: "Combined",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05")
  },
  {
    id: "transaction13",
    date: new Date("2023-04-10"),
    amount: 28000,
    currency: "RUB",
    type: "DebtRepayment",
    description: "Платеж по автокредиту",
    categoryId: "category18",
    sourceEntityId: "account1",
    sourceEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1"],
    bookId: "book1",
    debtId: "debt2",
    debtPaymentType: "Combined",
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-04-10")
  },
  {
    id: "transaction14",
    date: new Date("2023-04-15"),
    amount: 14000,
    currency: "RUB",
    type: "DebtRepayment",
    description: "Платеж по бизнес-кредиту",
    categoryId: "category18",
    sourceEntityId: "account5",
    sourceEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1"],
    bookId: "book4",
    debtId: "debt3",
    debtPaymentType: "Combined",
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-15")
  },
  
  // Выдача займа
  {
    id: "transaction15",
    date: new Date("2023-03-20"),
    amount: 60000,
    currency: "RUB",
    type: "DebtCreate",
    description: "Займ Ивану на технику",
    categoryId: "category17",
    sourceEntityId: "account4",
    sourceEntityType: "Account",
    executedByOwnerId: "owner1",
    responsibleOwnerIds: ["owner1", "owner2"],
    distributionRules: [
      { ownerId: "owner1", percentage: 50 },
      { ownerId: "owner2", percentage: 50 }
    ],
    bookId: "book3",
    debtId: "debt4",
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2023-03-20")
  },
  
  // Личные переводы
  {
    id: "transaction16",
    date: new Date("2023-04-25"),
    amount: 10000,
    currency: "RUB",
    type: "Transfer",
    description: "Перевод мужу на личные расходы",
    categoryId: "category15",
    sourceEntityId: "account3",
    sourceEntityType: "Account",
    destinationEntityId: "account1",
    destinationEntityType: "Account",
    executedByOwnerId: "owner2",
    responsibleOwnerIds: ["owner2"],
    bookId: "book2",
    transferPurpose: "Gift",
    createdAt: new Date("2023-04-25"),
    updatedAt: new Date("2023-04-25")
  }
];

// ==================== ОБЯЗАТЕЛЬСТВА ====================

const mockObligations = [
  // Обязательство от транзакции 6 (продукты)
  {
    id: "obligation1",
    fromOwnerId: "owner1", // Муж должен
    toOwnerId: "owner2", // Жене
    amount: 9000, // 60% от 15000
    currency: "RUB",
    reason: "Доля в расходе: Продукты в Перекрестке",
    relatedTransactionIds: ["transaction6"],
    status: "Pending",
    bookId: "book3",
    createdAt: new Date("2023-04-08")
  },
  
  // Обязательство от транзакции 8 (коммуналка)
  {
    id: "obligation2",
    fromOwnerId: "owner2", // Жена должна
    toOwnerId: "owner1", // Мужу
    amount: 14000, // 40% от 35000
    currency: "RUB",
    reason: "Доля в расходе: Коммунальные платежи",
    relatedTransactionIds: ["transaction8"],
    status: "Pending",
    bookId: "book3",
    createdAt: new Date("2023-04-15")
  },
  
  // Обязательство от транзакции 10 (курсы для ребенка)
  {
    id: "obligation3",
    fromOwnerId: "owner1", // Муж должен
    toOwnerId: "owner2", // Жене
    amount: 15000, // 60% от 25000
    currency: "RUB",
    reason: "Доля в расходе: Курсы для ребенка",
    relatedTransactionIds: ["transaction10"],
    status: "Pending",
    bookId: "book3",
    createdAt: new Date("2023-04-20")
  },
  
  // Обязательство от транзакции 11 (реклама бизнеса)
  {
    id: "obligation4",
    fromOwnerId: "owner1", // Муж должен
    toOwnerId: "owner2", // Жене
    amount: 6000, // 30% от 20000
    currency: "RUB",
    reason: "Доля в расходе: Реклама онлайн-школы",
    relatedTransactionIds: ["transaction11"],
    status: "Pending",
    bookId: "book5",
    createdAt: new Date("2023-04-16")
  },
  
  // Обязательство от транзакции 12 (ипотека)
  {
    id: "obligation5",
    fromOwnerId: "owner2", // Жена должна
    toOwnerId: "owner1", // Мужу
    amount: 18000, // 40% от 45000
    currency: "RUB",
    reason: "Доля в расходе: Ипотечный платеж",
    relatedTransactionIds: ["transaction12"],
    status: "Settled", // Уже погашено
    settledAt: new Date("2023-04-25"),
    settledTransactionId: "transaction16",
    bookId: "book3",
    createdAt: new Date("2023-04-05")
  }
];

// ==================== ПЕРИОДЫ РАСЧЕТОВ ====================

const mockSettlementPeriods = [
  {
    id: "period1",
    name: "Март 2023",
    startDate: new Date("2023-03-01"),
    endDate: new Date("2023-03-31"),
    status: "Settled",
    bookIds: ["book1", "book2", "book3", "book4", "book5"],
    obligations: []
  },
  {
    id: "period2",
    name: "Апрель 2023",
    startDate: new Date("2023-04-01"),
    endDate: new Date("2023-04-30"),
    status: "Open",
    bookIds: ["book1", "book2", "book3", "book4", "book5"],
    obligations: [
      "obligation1",
      "obligation2",
      "obligation3",
      "obligation4",
      "obligation5"
    ]
  }
];

// ==================== УВЕДОМЛЕНИЯ ====================

const mockNotifications = [
  {
    id: "notification1",
    type: "Debt",
    title: "Платеж по ипотеке",
    message: "Завтра необходимо внести платеж по ипотеке в размере 45000₽",
    ownerIds: ["owner1", "owner2"],
    isRead: false,
    createdAt: new Date("2023-05-04"),
    expiresAt: new Date("2023-05-06")
  },
  {
    id: "notification2",
    type: "Budget",
    title: "Превышение бюджета",
    message: "Вы превысили бюджет на категорию 'Рестораны' на 3000₽",
    ownerIds: ["owner2"],
    isRead: true,
    createdAt: new Date("2023-04-20"),
    expiresAt: new Date("2023-04-27")
  },
  {
    id: "notification3",
    type: "Debt",
    title: "Возврат займа",
    message: "Иван должен вернуть займ через 1 месяц",
    ownerIds: ["owner1", "owner2"],
    isRead: false,
    createdAt: new Date("2023-05-01"),
    expiresAt: new Date("2023-05-20")
  },
  {
    id: "notification4",
    type: "System",
    title: "Закрытие расчетного периода",
    message: "Расчетный период 'Апрель 2023' будет закрыт через 3 дня",
    ownerIds: ["owner1", "owner2"],
    isRead: false,
    createdAt: new Date("2023-04-28"),
    expiresAt: new Date("2023-05-01")
  }
];

// Экспорт мок-данных
export const mockData = {
  owners: mockOwners,
  books: mockBooks,
  categories: mockCategories,
  accounts: mockAccounts,
  cash: mockCash,
  incomeSources: mockIncomeSources,
  assets: mockAssets,
  passives: mockPassives,
  investments: mockInvestments,
  cryptos: mockCryptos,
  debts: mockDebts,
  transactions: mockTransactions,
  obligations: mockObligations,
  settlementPeriods: mockSettlementPeriods,
  notifications: mockNotifications
};

// Функция для инициализации хранилища данными
export function initializeStore(store) {
  store.owners = [...mockOwners];
  store.books = [...mockBooks];
  store.categories = [...mockCategories];
  store.accounts = [...mockAccounts];
  store.cash = [...mockCash];
  store.incomeSources = [...mockIncomeSources];
  store.assets = [...mockAssets];
  store.passives = [...mockPassives];
  store.investments = [...mockInvestments];
  store.cryptos = [...mockCryptos];
  store.debts = [...mockDebts];
  store.transactions = [...mockTransactions];
  store.obligations = [...mockObligations];
  store.settlementPeriods = [...mockSettlementPeriods];
  store.notifications = [...mockNotifications];
  
  return store;
}