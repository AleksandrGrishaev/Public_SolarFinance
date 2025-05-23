// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Layouts
import ConsoleLayout from '@/layouts/ConsoleLayout.vue'
import EmptyLayout from '@/layouts/EmptyLayout.vue'
import IosLayout from '@/layouts/IosLayout.vue'

// Define route meta types
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    title: string
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/transaction',
    meta: {
      requiresAuth: true,
      title: '',
      header: {
        show: true,
        showBack: true,
        showMessageIcon: false,
        hasNotifications: false,
    }}
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/PinLoginView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Login'
    }
  },
  // BooksView
  {
    path: '/books',
    component: IosLayout,
    children: [
      {
        path: '',
        name: 'books',
        component: () => import('@/views/book/page/BooksView.vue'),
        meta: {
          requiresAuth: true,
          title: ''
        }
      }
    ]
  },
  // Transaction route - используем IosLayout для транзакций
  {
    path: '/transaction',
    component: IosLayout,
    children: [
      {
        path: '',
        name: 'transaction',
        component: () => import('@/views/transaction/TransactionView.vue'),
        meta: {
          requiresAuth: true,
          title: '',
          header: {
            show: true,
            showBack: true,
            showMessageIcon: true,
            hasNotifications: true
          }
        }
      }
    ]
  },
  // Profile route - используем IosLayout
  {
    path: '/profile',
    component: IosLayout,
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('@/views/profile/pages/ProfileView.vue'),
        meta: {
          requiresAuth: true,
          title: '',
          header: {
            show: true,
            showBack: true,
            showMessageIcon: true,
            hasNotifications: true
          }
        }
      }
    ]
  },
  // Debt route - добавляем маршрут для долгов
  {
    path: '/debt',
    component: IosLayout,
    children: [
      {
        path: '',
        name: 'debt',
        component: () => import('@/views/debt/DebtView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Долги',
          header: {
            show: true,
            showBack: true,
            showMessageIcon: true,
            hasNotifications: true
          }
        }
      },
      {
        path: ':id',
        name: 'debt-details',
        component: () => import('@/views/debt/DebtDetailsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Детали долга',
          header: {
            show: true,
            showBack: true,
            showMessageIcon: true,
            hasNotifications: true
          }
        }
      }
    ]
  },
  // DebugStore
  {
    path: '/debug',
    component: ConsoleLayout,
    children: [
      {
        path: '',
        name: 'debug',
        component: () => import('@/views/debug/DebugStoreView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Debug Stores'
        }
      }
    ]
  },
  // 404 Not Found
  {
    path: '/:pathMatch(.*)*',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: {
          requiresAuth: false,
          title: '404 Not Found'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Отслеживание инициализации хранилища пользователя
let isUserStoreInitialized = false

// Навигационный guard с дополнительной логикой инициализации
router.beforeEach(async (to, from, next) => {
  // Обновление заголовка страницы
  document.title = `${to.meta.title || 'Finance'} - Family App`
  
  // Получение хранилища пользователя
  const userStore = useUserStore()
  
  // При первом переходе инициализируем данные пользователя из localStorage
  if (!isUserStoreInitialized) {
    console.log('[Router] First navigation, initializing user store')
    try {
      await userStore.init()
      isUserStoreInitialized = true
      console.log('[Router] User authentication status:', userStore.isAuthenticated)
      if (userStore.isAuthenticated) {
        console.log('[Router] User restored from localStorage:', userStore.username)
      }
    } catch (error) {
      console.error('[Router] Error initializing user store:', error)
    }
  }
  
  // Проверка авторизации и перенаправление
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    console.log('[Router] Authentication required, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
  } 
  // Если пользователь уже авторизован и пытается открыть страницу логина
  else if (to.name === 'login' && userStore.isAuthenticated) {
    console.log('[Router] Already authenticated, redirecting to transaction')
    next({ name: 'transaction' })
  }
  // В остальных случаях разрешаем переход
  else {
    next()
  }
})

export default router