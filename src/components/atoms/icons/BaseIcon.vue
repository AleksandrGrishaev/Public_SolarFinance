<template>
    <div class="icon-big">
      <img class="icon-box" :src="src" :alt="alt" />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'BaseIcon',
    props: {
      src: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: 'Icon'
      }
    }
  });
  </script>
  
  <style scoped>
  .icon-big {
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  
  .icon-box {
    border-radius: var(--border-radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--icon-size-lg);
    height: var(--icon-size-lg);
    position: relative;
    overflow: visible;
    aspect-ratio: 1;
    background-color: var(--bg-icon, var(--bg-dropdown));
    border: 1px solid var(--icon-border, var(--border-color));
  }
  </style>