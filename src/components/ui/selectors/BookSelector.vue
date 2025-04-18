<!-- src/components/ui/selectors/BookSelector.vue -->
<template>
  <UniversalSelector 
    v-model="selectedBookId" 
    :items="accessibleBooks"
    :backgroundColor="backgroundColor"
    :selectedColor="selectedColor"
  >
    <template #icon>
      <IconBook class="book-icon" :size="20" stroke-width="1.5" color="var(--text-contrast)" />
    </template>
  </UniversalSelector>
</template>

<script setup lang="ts">
// ...существующий код...

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  books: {
    type: Array,
    required: false,
    default: () => []
  },
  backgroundColor: {
    type: String,
    default: 'var(--bg-contrast)'  // Используем переменную из дизайн-системы
  },
  selectedColor: {
    type: String,
    default: 'black'  // Используем переменную из дизайн-системы
  }
});

// ...остальной код остается тем же
</script>

<style scoped>
.book-icon {
  color: var(--text-contrast);
}
</style>