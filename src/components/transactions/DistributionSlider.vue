<template>
    <div class="distribution-slider">
      <div class="slider-container">
        <div class="slider-track">
          <div class="slider-track-left" :style="{ width: `${sliderValue}%` }"></div>
          <div class="slider-track-right" :style="{ width: `${100 - sliderValue}%` }"></div>
        </div>
        <div 
          class="slider-thumb"
          :style="{ left: `calc(${sliderValue}% - 12px)` }"
          @mousedown="startDrag"
          @touchstart="startDrag"
        ></div>
      </div>
  
      <div class="distribution-labels">
        <div class="distribution-label">
          <span class="owner-name">{{ leftOwner.name }}</span>
          <span class="percentage">{{ leftOwner.percentage }}%</span>
        </div>
        <div class="distribution-label">
          <span class="owner-name">{{ rightOwner.name }}</span>
          <span class="percentage">{{ rightOwner.percentage }}%</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    leftOwner: {
      type: Object,
      required: true
    },
    rightOwner: {
      type: Object,
      required: true
    },
    distribution: {
      type: Number,
      default: 50
    }
  });
  
  const emit = defineEmits(['update-distribution']);
  
  const sliderValue = ref(props.distribution);
  const isDragging = ref(false);
  const sliderTrack = ref(null);
  
  onMounted(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  });
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchend', stopDrag);
  });
  
  const startDrag = (event) => {
    event.preventDefault();
    isDragging.value = true;
  };
  
  const onDrag = (event) => {
    if (!isDragging.value) return;
    
    const track = document.querySelector('.slider-track');
    if (!track) return;
    
    const trackRect = track.getBoundingClientRect();
    const trackWidth = trackRect.width;
    
    let clientX;
    if (event.type === 'touchmove') {
      clientX = event.touches[0].clientX;
    } else {
      clientX = event.clientX;
    }
    
    // Вычисляем положение относительно трека
    let position = clientX - trackRect.left;
    
    // Ограничиваем положение
    if (position < 0) position = 0;
    if (position > trackWidth) position = trackWidth;
    
    // Преобразуем в проценты
    const percentage = Math.round((position / trackWidth) * 100);
    sliderValue.value = percentage;
    
    // Обновляем распределение
    emit('update-distribution', percentage);
  };
  
  const stopDrag = () => {
    isDragging.value = false;
  };
  </script>
  
  <style scoped>
  .distribution-slider {
    margin: 24px 0;
  }
  
  .slider-container {
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
  }
  
  .slider-track {
    height: 4px;
    width: 100%;
    background-color: #444;
    border-radius: 2px;
    position: relative;
    display: flex;
  }
  
  .slider-track-left {
    height: 100%;
    background-color: #4CAF50; /* Зеленый цвет для левой части */
    border-radius: 2px 0 0 2px;
  }
  
  .slider-track-right {
    height: 100%;
    background-color: #2196F3; /* Синий цвет для правой части */
    border-radius: 0 2px 2px 0;
  }
  
  .slider-thumb {
    width: 24px;
    height: 24px;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    top: -10px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  
  .distribution-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  
  .distribution-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 14px;
  }
  
  .owner-name {
    margin-bottom: 4px;
  }
  
  .percentage {
    font-weight: 500;
  }
  </style>