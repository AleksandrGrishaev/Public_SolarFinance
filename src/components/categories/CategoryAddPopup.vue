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
          <ParentCategorySelector 
            v-model="categoryData.parent"
            :available-parents="availableParents"
          />
        </div>
  
        <!-- Type selection -->
        <div class="form-row">
          <label>Type</label>
          <ToggleButtonGroup 
            v-model="categoryData.type"
            :options="typeOptions"
          />
        </div>
  
        <!-- Share selection -->
        <div class="form-row">
          <label>Share</label>
          <ToggleButtonGroup 
            v-model="categoryData.share"
            :options="shareOptions"
          />
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
          <ToggleSwitch v-model="categoryData.useInCharts" />
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
  import ParentCategorySelector from '../ui/inputs/ParentCategorySelector.vue';
  import ToggleButtonGroup from '../ui/inputs/ToggleButtonGroup.vue';
  import ToggleSwitch from '../ui/inputs/ToggleSwitch.vue';
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
  
  const shareOptions = [
    { label: 'Personal', value: 'personal', customActiveClass: true },
    { label: 'Public', value: 'public' }
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
    min-width: 80px;
  }
  
  .toggle-group {
    display: flex;
    height: 32px;
    background-color: #949496;
    border-radius: 28px;
    padding: 6px;
    gap: 4px;
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
  }
  
  .toggle-button.active {
    background-color: black;
    color: white;
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