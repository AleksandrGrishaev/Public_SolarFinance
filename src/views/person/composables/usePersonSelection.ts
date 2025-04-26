// src/views/person/composables/usePersonSelection.ts
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';

/**
 * Хук для управления выбором пользователей
 */
export function usePersonSelection(initialPersonIds: string[] = []) {
  const userStore = useUserStore();
  
  // Состояние для хранения выбранных пользователей
  const selectedPersonIds = ref<string[]>(initialPersonIds);
  const personSelectionPopupVisible = ref(false);
  const currentSlotIndex = ref(0);
  
  // Получаем текущего пользователя
  const currentUser = computed(() => userStore.currentUser);
  
  // Получаем данные выбранных пользователей
  const selectedPersons = computed(() => {
    return selectedPersonIds.value.map(id => {
      // Ищем пользователя в хранилище
      const user = userStore.getAllUsers().find(u => u.id === id);
      
      if (user) {
        return {
          id: user.id,
          name: user.name,
          color: user.settings?.color || '#53B794'
        };
      }
      
      // Если пользователь не найден, создаем заглушку
      return {
        id,
        name: id === 'user_1' ? 'Alex' : id === 'user_2' ? 'Sasha' : 'Unknown',
        color: '#53B794'
      };
    });
  });
  
  // Получаем пользователей, доступных для выбора (кроме уже выбранных)
  const availablePersons = computed(() => {
    const users = userStore.getAllUsers();
    
    return users
      .filter(user => !selectedPersonIds.value.includes(user.id) && 
                      user.id !== currentUser.value?.id)
      .map(user => ({
        id: user.id,
        name: user.name,
        color: user.settings?.color || '#53B794'
      }));
  });
  
  /**
   * Открыть попап выбора пользователя для определенного слота
   */
  const openPersonSelectionPopup = (slotIndex: number) => {
    currentSlotIndex.value = slotIndex;
    personSelectionPopupVisible.value = true;
  };
  
  /**
   * Выбрать пользователя для определенного слота
   */
  const selectPerson = ({ person, slotIndex }: { person: any, slotIndex: number }) => {
    // Если в этом слоте уже есть пользователь, заменяем его
    if (selectedPersonIds.value.length > slotIndex) {
      const newIds = [...selectedPersonIds.value];
      newIds[slotIndex] = person.id;
      selectedPersonIds.value = newIds;
    } else {
      // Иначе добавляем нового пользователя
      selectedPersonIds.value = [...selectedPersonIds.value, person.id];
    }
    
    personSelectionPopupVisible.value = false;
  };
  
  /**
   * Удалить пользователя из слота
   */
  const removePerson = (slotIndex: number) => {
    const newIds = [...selectedPersonIds.value];
    newIds.splice(slotIndex, 1);
    selectedPersonIds.value = newIds;
  };
  
  /**
   * Сброс выбранных пользователей
   */
  const resetPersons = (defaultIds: string[] = []) => {
    selectedPersonIds.value = defaultIds;
  };
  
  return {
    selectedPersonIds,
    selectedPersons,
    availablePersons,
    personSelectionPopupVisible,
    currentSlotIndex,
    currentUser,
    openPersonSelectionPopup,
    selectPerson,
    removePerson,
    resetPersons
  };
}