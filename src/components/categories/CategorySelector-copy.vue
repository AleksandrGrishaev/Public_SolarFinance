<!-- src/components/GridPractice.vue -->
<template>
  <div class="container">
    <h2>Grid Practice with Squares</h2>
    
    <div class="controls">
      <div class="control-group">
        <label for="gap-size">Gap size (px): </label>
        <input 
          id="gap-size" 
          type="range" 
          min="0" 
          max="20" 
          v-model="gapSize" 
          @input="updateLayout"
        />
        <span>{{ gapSize }}px</span>
      </div>
      
      <div class="control-group">
        <label for="items-per-row">Items per row: </label>
        <input 
          id="items-per-row" 
          type="range" 
          min="2" 
          max="8" 
          v-model="itemsPerRow" 
          @input="updateLayout"
        />
        <span>{{ itemsPerRow }}</span>
      </div>
      
      <div class="control-group">
        <label for="item-size">Base item size (px): </label>
        <input 
          id="item-size" 
          type="range" 
          min="30" 
          max="100" 
          v-model="baseItemSize" 
          @input="updateLayout"
        />
        <span>{{ baseItemSize }}px</span>
      </div>
      
      <div class="display-mode">
        <button 
          :class="{ active: displayMode === 'flex' }" 
          @click="changeDisplayMode('flex')"
        >
          Flexbox
        </button>
        <button 
          :class="{ active: displayMode === 'grid' }" 
          @click="changeDisplayMode('grid')"
        >
          CSS Grid
        </button>
        <button 
          :class="{ active: displayMode === 'manual' }" 
          @click="changeDisplayMode('manual')"
        >
          Manual Calculation
        </button>
      </div>
    </div>
    
    <div class="debug-info">
      <div>Grid width: {{ layoutState.gridWidth }}px</div>
      <div>Total items: {{ items.length }}</div>
      <div>Actual item width: {{ layoutState.calculatedItemWidth }}px</div>
    </div>
    
    <!-- Flexbox Grid -->
    <div 
      v-if="displayMode === 'flex'" 
      class="grid-container flex-grid" 
      ref="gridRef"
      :style="{ gap: `${gapSize}px` }"
    >
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="grid-item"
        :style="{ 
          width: `${layoutState.calculatedItemWidth}px`,
          height: `${layoutState.calculatedItemWidth}px`,
          backgroundColor: item.color 
        }"
      >
        {{ index + 1 }}
      </div>
    </div>
    
    <!-- CSS Grid -->
    <div 
      v-else-if="displayMode === 'grid'" 
      class="grid-container css-grid" 
      ref="gridRef"
      :style="{ 
        gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
        gap: `${gapSize}px` 
      }"
    >
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="grid-item"
        :style="{ 
          aspectRatio: '1/1',
          backgroundColor: item.color 
        }"
      >
        {{ index + 1 }}
      </div>
    </div>
    
    <!-- Manual Calculation -->
    <div 
      v-else
      class="grid-container manual-grid" 
      ref="gridRef"
    >
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="grid-item"
        :style="{ 
          width: `${layoutState.calculatedItemWidth}px`,
          height: `${layoutState.calculatedItemWidth}px`,
          backgroundColor: item.color,
          marginRight: (index + 1) % itemsPerRow !== 0 ? `${gapSize}px` : '0',
          marginBottom: `${gapSize}px`
        }"
      >
        {{ index + 1 }}
      </div>
    </div>
    
    <div class="actions">
      <button @click="addItem">Add Item</button>
      <button @click="removeItem">Remove Item</button>
      <button @click="resetItems">Reset (12 items)</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

// Controls
const gapSize = ref(4);
const itemsPerRow = ref(4);
const baseItemSize = ref(60);
const displayMode = ref('flex'); // 'flex', 'grid', 'manual'

// Grid reference
const gridRef = ref(null);

// Layout state
const layoutState = reactive({
  gridWidth: 0,
  calculatedItemWidth: 0
});

// Generate random color
const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
    '#118AB2', '#073B4C', '#8A89C0', '#F49D37',
    '#EF476F', '#FFC43D', '#1B9AAA', '#6D6875'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Items
const items = ref([]);

// Initialize items
const initItems = (count = 12) => {
  items.value = Array.from({ length: count }, () => ({
    color: getRandomColor()
  }));
};

// Add an item
const addItem = () => {
  items.value.push({
    color: getRandomColor()
  });
};

// Remove an item
const removeItem = () => {
  if (items.value.length > 0) {
    items.value.pop();
  }
};

// Reset items
const resetItems = () => {
  initItems(12);
};

// Change display mode
const changeDisplayMode = (mode) => {
  displayMode.value = mode;
  // Allow DOM to update before calculating dimensions
  setTimeout(() => {
    updateLayout();
  }, 0);
};

// Calculate layout
const updateLayout = () => {
  if (!gridRef.value) return;
  
  const gridWidth = gridRef.value.clientWidth;
  layoutState.gridWidth = gridWidth;
  
  if (displayMode.value === 'flex' || displayMode.value === 'manual') {
    // Calculate item width for flexbox or manual layout
    const gap = parseInt(gapSize.value);
    const totalGapWidth = gap * (parseInt(itemsPerRow.value) - 1);
    const availableWidth = gridWidth - totalGapWidth;
    const itemWidth = Math.floor(availableWidth / parseInt(itemsPerRow.value));
    
    layoutState.calculatedItemWidth = Math.min(
      itemWidth, 
      parseInt(baseItemSize.value) * 1.5
    );
  } else {
    // For CSS Grid, we'll just use the base item size as reference
    layoutState.calculatedItemWidth = parseInt(baseItemSize.value);
  }
};

// Watch for changes
watch([gapSize, itemsPerRow, baseItemSize], () => {
  updateLayout();
});

// Initialize
onMounted(() => {
  initItems();
  updateLayout();
  
  // Handle window resize
  window.addEventListener('resize', updateLayout);
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  width: 150px;
  font-weight: bold;
}

input[type="range"] {
  flex: 1;
}

.display-mode {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.display-mode button {
  flex: 1;
  padding: 8px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.display-mode button.active {
  background-color: #118AB2;
  color: white;
}

.debug-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #333;
  color: #fff;
  border-radius: 4px;
  font-family: monospace;
}

/* Grid Containers */
.grid-container {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  min-height: 300px;
}

.flex-grid {
  display: flex;
  flex-wrap: wrap;
}

.css-grid {
  display: grid;
}

.manual-grid {
  display: flex;
  flex-wrap: wrap;
}

/* Grid Items */
.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.actions button {
  padding: 8px 16px;
  background-color: #4ECDC4;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.actions button:hover {
  background-color: #36B5AB;
}
</style>