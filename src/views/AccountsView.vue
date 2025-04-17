<!-- src/components/categories/CategorySelector.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Select category" 
    :rightIcon="IconEdit"
    @rightIconClick="handleEditClick"
    @update:modelValue="handleVisibilityChange"
  >
    <div class="category-container">
      <div class="debug-info" v-if="debugMode">
        <div>Total categories: {{ props.categories.length }}</div>
        <div>Selectable: {{ selectableCategories.length }}</div>
      </div>
      
      <!-- Сетка категорий по 5 в ряду -->
      <div class="category-grid">
        <div 
          v-for="category in selectableCategories"
          :key="category.id"
          class="category-item"
          @click="selectCategory(category)"
        >
          <CategoryIcon 
            :icon-name="category.icon" 
            :background-color="category.color" 
            size="small"
          />
          <div class="category-name">{{ truncateName(category.name) }}</div>
        </div>
        
        <!-- Кнопка добавления категории (всегда отображается) -->
        <div class="category-item" @click="handleAddCategory">
          <div class="add-icon-container">
            <IconPlus class="add-icon" />
          </div>
          <div class="category-name">Add</div>
        </div>
      </div>
      
      <!-- Пустое состояние - показываем, только если нет категорий -->
      <div v-if="selectableCategories.length === 0" class="empty-state">
        <div>No categories available</div>
        <div>Create a new category to get started</div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import CategoryIcon from './CategoryIcon.vue';
import { IconEdit, IconPlus } from '@tabler/icons-vue';
import { useCategoryStore, type Category } from '../../stores/category';
import { messageService } from '../../services/system/MessageService';

const categoryStore = useCategoryStore();

// Режим отладки (установите в true, чтобы видеть отладочную информацию)
const debugMode = ref(false);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  bookId: {
    type: String,
    default: 'my'
  },
  transactionType: {
    type: String,
    default: 'expense'
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'add', 'edit']);

// Видимость попапа
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Обработчик изменения видимости
const handleVisibilityChange = (value: boolean) => {
  if (!value) {
    // Если закрываем попап без выбора категории, показываем сообщение
    if (props.transactionType !== 'transfer') {
      messageService.warning('Операция не сохранена. Для создания транзакции необходимо выбрать категорию.');
    }
  }
};

// Отфильтрованные категории - принимаем их уже отфильтрованными
const filteredCategories = computed(() => {
  if (!props.categories || props.categories.length === 0) return [];
  console.log('Filtered categories for selector:', props.categories);
  return props.categories;
});

// Категории, которые можно выбрать - все, что пришли в props
const selectableCategories = computed(() => {
  return filteredCategories.value;
});

// Усечение длинных названий
const truncateName = (name) => {
  if (!name) return '';
  if (name.length > 8) {
    return name.substring(0, 8) + '...';
  }
  return name;
};

// Выбор категории
const selectCategory = (category) => {
  // Проверяем, что выбранная категория не имеет дочерних элементов в текущей книге
  if (!categoryStore.hasChildCategoriesInBook(category.id, props.bookId)) {
    // Вызываем событие выбора категории
    emit('select', category);
    // Автоматически закрываем попап после выбора категории
    isVisible.value = false;
  } else {
    console.log("Категория с дочерними элементами не может быть выбрана");
    messageService.warning('Нельзя выбрать категорию с подкатегориями');
  }
};

// Добавление новой категории
const handleAddCategory = () => {
  emit('add');
};

// Редактирование категорий
const handleEditClick = () => {
  emit('edit');
};
</script>

<style scoped>
.category-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
}

.debug-info {
  padding: 4px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: yellow;
  font-size: 12px;
  margin-bottom: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.category-name {
  color: white;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-icon-container {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #949496;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-icon {
  width: 20px;
  height: 20px;
  color: #949496;
}

.empty-state {
  text-align: center;
  color: #949496;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
  margin-top: 16px;
}
</style>