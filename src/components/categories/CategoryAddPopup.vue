<!-- src/components/categories/CategoryAddPopup.vue -->
<template>
    <BasePopup
      v-model="isVisible"
      title="New Category"
      :rightContent="true"
      :closeOnOverlayClick="false"
    >
      <template #rightContent>
        <div class="save-button" @click="saveCategory">Save</div>
      </template>
  
      <div class="category-form">
        <!-- Icon and Color selection row -->
        <div class="form-row icon-color-row">
          <div class="form-group">
            <label>Icon</label>
            <IconPicker v-model="categoryData.iconComponent" />
          </div>
          
          <div class="form-group">
            <label>Color</label>
            <ColorPicker v-model="categoryData.color" />
          </div>
        </div>
  
        <!-- Name input -->
        <div class="form-row">
          <label>Name</label>
          <TextInput 
            v-model="categoryData.name"
            placeholder="Category name"
          />
        </div>
  
        <!-- Parent category dropdown -->
        <div class="form-row">
          <label>Parent</label>
          <div class="dropdown-select" @click="showParentSelector = true">
            <span>{{ categoryData.parent?.name || 'Category' }}</span>
            <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.05569 6L-0.000210353 0L1.19234 0L3.40973 4.60249L3.33519 4.56522H3.52153L3.447 4.60249L5.66439 0L6.85693 0L3.80103 6H3.05569Z" fill="#404040"/>
            </svg>
          </div>
        </div>
  
        <!-- Type selection -->
        <div class="form-row">
          <label>Type</label>
          <div class="toggle-group">
            <button 
              v-for="option in typeOptions" 
              :key="option.value"
              class="toggle-button" 
              :class="{ active: categoryData.type === option.value }"
              @click="categoryData.type = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
  
        <!-- Share selection -->
        <div class="form-row">
          <label>Share</label>
          <div class="toggle-group">
            <button 
              class="toggle-button" 
              :class="{ active: categoryData.share === 'personal', 'personal-active': categoryData.share === 'personal' }"
              @click="categoryData.share = 'personal'"
            >
              Personal
            </button>
            <button 
              class="toggle-button" 
              :class="{ active: categoryData.share === 'public' }"
              @click="categoryData.share = 'public'"
            >
              Public
            </button>
          </div>
        </div>
  
        <!-- Book selection -->
        <div class="form-row">
          <label>Book</label>
          <div class="toggle-group">
            <button 
              v-for="book in books" 
              :key="book.id"
              class="toggle-button" 
              :class="{ active: selectedBooks.includes(book.id) }"
              @click="toggleBook(book.id)"
            >
              {{ book.name }}
            </button>
          </div>
        </div>
  
        <!-- Use in Charts toggle -->
        <div class="form-row">
          <label>Use in Charts</label>
          <div class="toggle-switch" :class="{ 'toggle-on': categoryData.useInCharts }" @click="categoryData.useInCharts = !categoryData.useInCharts">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>
  
      <!-- Save button at the bottom -->
      <div class="save-category-button" @click="saveCategory">
        Save category
      </div>
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import BasePopup from '../ui/BasePopup.vue';
  import TextInput from '../ui/inputs/TextInput.vue';
  import ColorPicker from '../ui/inputs/ColorPicker.vue';
  import IconPicker from '../ui/inputs/IconPicker.vue';
  import { books, categories } from '../../data/categories';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    initialType: {
      type: String,
      default: 'expense'
    },
    initialBookId: {
      type: String,
      default: 'my'
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'save']);
  
  // Popup visibility
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  // Options for toggle groups
  const typeOptions = [
    { label: 'Expence', value: 'expense' },
    { label: 'Income', value: 'income' },
    { label: 'Transfer', value: 'transfer' }
  ];
  
  // Category data
  const categoryData = ref({
    name: '',
    parent: null,
    color: '#949496',
    iconComponent: null,
    icon: '',
    type: props.initialType,
    share: 'personal',
    useInCharts: false
  });
  
  // Selected books
  const selectedBooks = ref([props.initialBookId]);
  
  // UI states
  const showParentSelector = ref(false);
  
  // Available parent categories
  const availableParents = computed(() => {
    return categories.filter(cat => 
      cat.type === categoryData.value.type && 
      !cat.parentName  // Only top-level categories can be parents
    );
  });
  
  // Initialize with props
  watch(() => props.initialType, (newValue) => {
    categoryData.value.type = newValue;
  });
  
  watch(() => props.initialBookId, (newValue) => {
    if (!selectedBooks.value.includes(newValue)) {
      selectedBooks.value = [newValue];
    }
  });
  
  // Watch for icon component changes to update icon name
  watch(() => categoryData.value.iconComponent, (newValue) => {
    if (newValue) {
      // Extract icon name from component
      const iconName = newValue.type.name.replace('Icon', '');
      categoryData.value.icon = `Icon${iconName}`;
    } else {
      categoryData.value.icon = '';
    }
  });
  
  // Methods
  const toggleBook = (bookId) => {
    const index = selectedBooks.value.indexOf(bookId);
    if (index === -1) {
      selectedBooks.value.push(bookId);
    } else if (selectedBooks.value.length > 1) {
      // Ensure at least one book is selected
      selectedBooks.value.splice(index, 1);
    }
  };
  
  const saveCategory = () => {
    // Validate form
    if (!categoryData.value.name.trim()) {
      // Show error or handle validation
      console.error('Category name is required');
      return;
    }
  
    // Prepare category data
    const newCategory = {
      id: 'category_' + Date.now(), // Generate a unique ID
      name: categoryData.value.name,
      parentName: categoryData.value.parent ? categoryData.value.parent.name : undefined,
      color: categoryData.value.color,
      icon: categoryData.value.icon,
      type: categoryData.value.type,
      isPersonal: categoryData.value.share === 'personal',
      useInCharts: categoryData.value.useInCharts,
      bookIds: selectedBooks.value,
      order: 0, // Default order for new category
      isActive: true // New categories are active by default
    };
  
    // Emit save event with new category data
    emit('save', newCategory);
    
    // Close popup
    isVisible.value = false;
    
    // Reset form
    categoryData.value = {
      name: '',
      parent: null,
      color: '#949496',
      iconComponent: null,
      icon: '',
      type: props.initialType,
      share: 'personal',
      useInCharts: false
    };
    selectedBooks.value = [props.initialBookId];
  };
  </script>
  
  <style scoped>
  .category-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
  
  .form-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  
  .icon-color-row {
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .form-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  label {
    color: white;
    font-size: 16px;
    font-weight: 400;
    min-width: 64px;
  }
  
  .dropdown-select {
    height: 32px;
    background-color: #949496;
    border-radius: 14px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #404040;
    font-size: 12px;
    cursor: pointer;
    flex: 1;
  }
  
  .toggle-group {
    display: flex;
    height: 32px;
    background-color: #949496;
    border-radius: 28px;
    padding: 6px;
    gap: 4px;
    flex: 1;
  }
  
  .toggle-button {
    height: 100%;
    padding: 0 16px;
    border: none;
    border-radius: 34px;
    background: transparent;
    color: #404040;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    flex: 1;
    text-align: center;
  }
  
  .toggle-button.active {
    background-color: black;
    color: white;
  }
  
  .toggle-button.personal-active {
    background-color: #A44942;
  }
  
  .toggle-switch {
    width: 59px;
    height: 32px;
    background-color: #949496;
    border-radius: 16px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    background-color: #666;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .toggle-switch.toggle-on .toggle-thumb {
    left: calc(100% - 29px);
    background-color: white;
  }
  
  .save-category-button {
    margin-top: 20px;
    padding: 9px 19px;
    background-color: #53B794;
    color: white;
    border-radius: 34px;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    align-self: center;
    display: inline-block;
  }
  
  .save-button {
    color: #53B794;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }
  </style>