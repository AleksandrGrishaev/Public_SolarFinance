<!-- /src/components/navigation/NavMenu.vue -->
<template>
  <div class="menu-container">
    <!-- Затемненный и размытый фон при открытом меню -->
    <div v-if="showMoreIcons" class="overlay" @click="hideMoreIcons"></div>
    
    <!-- Подменю над навигацией -->
    <Transition name="fade">
      <SubNavigation 
        v-if="showMoreIcons" 
        class="sub-navigation" 
        :items="subNavItems" 
        @navigate="handleSubNavItemClick"
      />
    </Transition>
    
    <!-- Основное меню навигации -->
    <div class="menu-float-element">
      <div class="menu">
        <div class="buttons">
          <div 
            v-for="item in menuItems" 
            :key="item.id"
            class="menu-item"
            :class="{ 'active': activeItem === item.id }"
            @click="handleItemClick(item)"
          >
            <div v-if="item.id === 'new'" class="icon new-transaction">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.32121 8V0H4.67879V8H3.32121ZM0 4.67879V3.32121H8V4.67879H0Z" fill="white"/>
              </svg>
            </div>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SubNavigation from '@/components/navigation/SubNavigation.vue';
import { IconTool, IconUser } from '@tabler/icons-vue';

// Router для навигации
const router = useRouter();
const route = useRoute();

const menuItems = [
  { id: 'new', label: '', route: '/transaction' },
  { id: 'books', label: 'Books', route: '/books' },
  { id: 'assets', label: 'Assets', route: '/accounts' },
  { id: 'charts', label: 'Charts', route: '/dashboard' },
  { id: 'more', label: 'More', route: '#' }
];

// Элементы для подменю (SubNavigation)
const subNavItems = [
  {
    label: 'Debt',
    route: '/debt',
    icon: IconTool,
    background: '#FFD452',
  },
  {
    label: 'Name',
    route: '/profile',
    icon: IconUser,
    background: '#FFD452',
  }
];

const activeItem = ref('new');
const showMoreIcons = ref(false);

// Установка активного элемента в зависимости от текущего маршрута
const setActiveItemFromRoute = (path) => {
  const matchedItem = menuItems.find(item => path.startsWith(item.route));
  if (matchedItem) {
    activeItem.value = matchedItem.id;
  } else if (path.startsWith('/debt')) {
    // Если находимся на странице долгов, делаем активным more
    activeItem.value = 'more';
  } else if (path.startsWith('/profile')) {
    // Если находимся на странице профиля, оставляем текущий активный пункт
  }
};

// Обработчик клика по пункту меню
// Обработчик клика по пункту меню
const handleItemClick = (item) => {
  if (item.id === 'more') {
    // Переключаем видимость иконок при нажатии на More
    showMoreIcons.value = !showMoreIcons.value;
    // Устанавливаем активный элемент, но не переходим никуда
    activeItem.value = item.id;
  } else {
    // Для всех других пунктов скрываем иконки и переходим по маршруту
    showMoreIcons.value = false;
    activeItem.value = item.id;
    router.push(item.route);
  }
};

// Обработчик клика по иконке в дополнительном меню
const handleSubNavItemClick = (route) => {
  // Переходим по маршруту и скрываем меню
  router.push(route);
  showMoreIcons.value = false;
};

// Скрыть иконки без изменения активного пункта меню
const hideMoreIcons = () => {
  showMoreIcons.value = false;
};

// При монтировании компонента определяем активный элемент
onMounted(() => {
  setActiveItemFromRoute(route.path);
});

// Следим за изменениями маршрута
watch(
  () => route.path,
  (newPath) => {
    setActiveItemFromRoute(newPath);
  }
);
</script>

<style scoped>
.menu-container {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 5;
}

.sub-navigation {
  width: 100%;
  margin-bottom: 8px;
  padding-bottom: 0;
  z-index: 6;
  position: relative;
}

.menu-float-element {
  width: 100%;
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 7;
  position: relative;
}

.menu {
  padding: 6px 8px 6px 12px;
  background: #DBDADD;
  border-radius: 16px;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
}

.buttons {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #444444;
  font-size: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 16px;
  word-wrap: break-word;
  cursor: pointer;
}

.icon.new-transaction {
  width: 24px;
  height: 24px;
  padding: 2px 2px;
  background: #444444;
  border-radius: 12px;
  outline: 1px #444444 solid;
  outline-offset: -1px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

/* Добавляем стили для активного пункта меню */
.menu-item.active {
  font-weight: 600;
  color: #000000;
}

/* Анимация появления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>