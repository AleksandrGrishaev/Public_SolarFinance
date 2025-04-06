import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Layouts
import EmptyLayout from '@/layouts/EmptyLayout.vue'
import ConsoleLayout from '@/layouts/ConsoleLayout.vue'

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
  // Transaction route - добавляем прямой маршрут для транзакций
  {
    path: '/transaction',
    name: 'transaction',
    component: () => import('@/views/TransactionView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Add Transaction'
    }
  },
  // Dashboard route
  {
    path: '/dashboard',
    component: ConsoleLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Dashboard'
        }
      }
    ]
  },
  // Accounts route
  {
    path: '/accounts',
    component: ConsoleLayout,
    children: [
      {
        path: '',
        name: 'accounts',
        component: () => import('@/views/AccountsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Accounts'
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

// Упрощенный guard для навигации
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = `${to.meta.title || 'Console'} - Finance App`
  
  // Get user store
  const userStore = useUserStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // Redirect to login
    next({ name: 'login' })
  } 
  // If route doesn't require auth, but user is already logged in
  else if (to.name === 'login' && userStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'transaction' })
  } 
  // All checks passed, proceed to route
  else {
    next()
  }
})

export default router