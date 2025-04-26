<!-- src/views/person/components/PersonSelectionPopup.vue -->
<template>
    <BasePopup
      v-model="isVisible"
      title="Choose person"
      @update:modelValue="handleVisibilityChange"
    >
      <div class="person-selection-container">
        <!-- Book title -->
        <div class="book-title">
          <div class="book-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5816 13.3335H6.58159C5.80659 13.3335 5.41909 13.3335 5.10075 13.4185C4.67684 13.5322 4.29033 13.7554 3.98007 14.0658C3.6698 14.3763 3.44672 14.7629 3.33325 15.1868" stroke="white" stroke-width="1.5"/>
              <path d="M6.66658 5.83341H13.3333M6.66658 8.75008H10.8333M8.33325 18.3334C5.97658 18.3334 4.79742 18.3334 4.06575 17.6009C3.33325 16.8692 3.33325 15.6901 3.33325 13.3334V6.66675C3.33325 4.31008 3.33325 3.13091 4.06575 2.39925C4.79742 1.66675 5.97658 1.66675 8.33325 1.66675H11.6666C14.0233 1.66675 15.2024 1.66675 15.9341 2.39925C16.6666 3.13091 16.6666 4.31008 16.6666 6.66675M11.6666 18.3334C14.0233 18.3334 15.2024 18.3334 15.9341 17.6009C16.6666 16.8692 16.6666 15.6901 16.6666 13.3334V10.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="book-name">{{ bookName }}</div>
        </div>
        
        <!-- Persons grid -->
        <div class="persons-grid">
          <div 
            v-for="person in availablePersons" 
            :key="person.id"
            class="person-item"
            @click="selectPerson(person)"
          >
            <div class="person-avatar" :style="{ backgroundColor: person.color || '#53B794' }">
              {{ person.name.charAt(0) }}
            </div>
            <div class="person-name">{{ person.name }}</div>
          </div>
          
          <!-- Add person button -->
          <div class="person-item add-person" @click="handleAddPerson">
            <AddIconButton size="large" />
            <div class="person-name">Add</div>
          </div>
        </div>
      </div>
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BasePopup from '@/components/ui/BasePopup.vue';
  import AddIconButton from '@/components/atoms/buttons/AddIconButton.vue';
  import { useUserStore } from '@/stores/user';
  import { useBookStore } from '@/stores/book';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    bookId: {
      type: String,
      required: true
    },
    currentUserId: {
      type: String,
      required: true
    },
    slotIndex: {
      type: Number,
      default: 1 // По умолчанию заменяем второго участника
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'select', 'add']);
  
  // Store initialization
  const userStore = useUserStore();
  const bookStore = useBookStore();
  
  // Computed properties
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  const bookName = computed(() => {
    const book = bookStore.getBookById(props.bookId);
    return book ? book.name : 'My book';
  });
  
  const availablePersons = computed(() => {
    // Get all users except current one
    const users = userStore.getAllUsers();
    return users
      .filter(user => user.id !== props.currentUserId)
      .map(user => ({
        id: user.id,
        name: user.name,
        color: user.settings?.color || '#53B794'
      }));
  });
  
  // Methods
  const handleVisibilityChange = (value) => {
    emit('update:modelValue', value);
  };
  
  const selectPerson = (person) => {
    emit('select', { person, slotIndex: props.slotIndex });
    isVisible.value = false;
  };
  
  const handleAddPerson = () => {
    emit('add');
    isVisible.value = false;
  };
  </script>
  
  <style scoped>
  .person-selection-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 16px 0;
  }
  
  .book-title {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    padding: 0 16px;
  }
  
  .book-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }
  
  .book-name {
    font-size: 16px;
    font-weight: 500;
    color: white;
  }
  
  .persons-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 0 16px;
  }
  
  .person-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }
  
  .person-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .person-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #53B794;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: bold;
  }
  
  .person-name {
    color: white;
    font-size: 14px;
    text-align: center;
  }
  
  .add-person {
    opacity: 0.7;
  }
  
  .add-person:hover {
    opacity: 1;
  }
  </style>