<template>
    <div class="form-row transaction">
      <BaseIcon :src="iconSrc" :alt="iconAlt" />
      
      <div class="text">
        <BaseTitle :text="title" />
        <BaseDescription>
          {{ notes }}
          <br />
          {{ description }}
        </BaseDescription>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { BaseIcon } from '../../atoms/icons';
  import { BaseTitle, BaseDescription } from '../../atoms/typography';
  
  export default defineComponent({
    name: 'InfoBlock',
    components: {
      BaseIcon,
      BaseTitle,
      BaseDescription
    },
    props: {
      iconSrc: {
        type: String,
        required: true
      },
      iconAlt: {
        type: String,
        default: 'Notification icon'
      },
      title: {
        type: String,
        required: true
      },
      notes: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      }
    }
  });
  </script>
  
  <style scoped>
  .transaction {
    padding: 0px 20px 0px 12px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  
  .text {
    padding: 4px 10px 4px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    justify-content: flex-start;
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  
  /* Стили для form-row из предоставленных стилей */
  .form-row {
    display: flex;
    width: 100%;
    margin-bottom: var(--spacing-md);
  }
  
  .form-row:last-child {
    margin-bottom: 0;
  }
  </style>