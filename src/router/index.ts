// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
// Layouts
import EmptyLayout from '@/layouts/EmptyLayout.vue'
import IosLayout from '@/layouts/IosLayout.vue'

// Define route meta types
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    title: string
    roles?: string[]
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/transaction',
    meta: {
      requiresAuth: true,
      title: 'Home'
    }
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
  // MoreView - используем IosLayout
  {
    path: '/more',
    component: IosLayout,
    children: [
      {
        path: '',
        name: 'more',
        component: () => import('@/views/MoreView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Настройки'
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
        component: () => import('@/views/TransactionView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Add Transaction'
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
  document.title = `${to.meta.title || 'Console'} - Finance App`
  
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
        console.log('[Router] User restored from localStorage:', userStore.user?.name)
      }
    } catch (error) {
      console.error('[Router] Error initializing user store:', error)
    }
  }
  
  // Проверка авторизации и перенаправление
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    console.log('[Router] Authentication required, redirecting to login')
    next({ name: 'login' })
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