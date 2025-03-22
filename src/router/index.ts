// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'

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

// Create message instance outside component
let _messageInstance: ReturnType<typeof useMessage> | null = null;
const messageProvider = {
  createMessage: () => {
    if (!_messageInstance) {
      window.$message = useMessage();
      _messageInstance = window.$message;
    }
    return _messageInstance;
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard',
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

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = `${to.meta.title || 'Console'} - Vue Application`
  
  // Get user store
  const userStore = useUserStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // Redirect to login with intended destination
    next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  } 
  // Check role-based access
  else if (to.meta.roles && userStore.user) {
    // If route has role requirements, check if user has appropriate role
    if (to.meta.roles.includes(userStore.user.role)) {
      next() // User has required role, proceed
    } else {
      // User doesn't have required role, redirect to dashboard
      const message = messageProvider.createMessage()
      message.error(`You don't have permission to access ${to.meta.title}`)
      next({ name: 'dashboard' })
    }
  } 
  // If route doesn't require auth, but user is already logged in
  else if (to.name === 'login' && userStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'dashboard' })
  } 
  // All checks passed, proceed to route
  else {
    next()
  }
})

export default router