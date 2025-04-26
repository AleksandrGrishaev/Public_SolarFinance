<!-- src/components/JsonViewerComponent.vue -->
<template>
    <div class="json-viewer">
      <n-card title="JSON Data" v-if="showCard">
        <n-space vertical>
          <n-space>
            <n-button size="small" @click="expandAll">Развернуть все</n-button>
            <n-button size="small" @click="collapseAll">Свернуть корневые</n-button>
            <n-button size="small" @click="copyToClipboard">
              <template #icon>
                <n-icon><icon-copy /></n-icon>
              </template>
              Копировать
            </n-button>
          </n-space>
          <div class="json-content">
            <template v-if="parsed !== null">
              <json-node :data="parsed" :is-root="true" />
            </template>
            <template v-else>
              <n-text type="error">Невозможно распарсить JSON</n-text>
            </template>
          </div>
        </n-space>
      </n-card>
      <div v-else class="json-content">
        <template v-if="parsed !== null">
          <json-node :data="parsed" :is-root="true" />
        </template>
        <template v-else>
          <n-text type="error">Невозможно распарсить JSON</n-text>
        </template>
      </div>
    </div>
  </template>
  
  <script setup>
  import { h, defineComponent, ref, computed } from 'vue';
  import { 
    NCard, 
    NSpace, 
    NButton, 
    NIcon, 
    NText,
    useMessage
  } from 'naive-ui';
  import { IconCopy } from '@tabler/icons-vue';
  
  // Компонент для отображения узла JSON
  const JsonNode = defineComponent({
    name: 'JsonNode',
    props: {
      data: {
        type: [Object, Array, String, Number, Boolean],
        required: true
      },
      fieldName: {
        type: String,
        default: ''
      },
      level: {
        type: Number,
        default: 0
      },
      isRoot: {
        type: Boolean,
        default: false
      }
    },
    setup(props) {
      // По умолчанию корневые элементы свернуты, вложенные развернуты
      const isExpanded = ref(!props.isRoot);
      
      // Определяем тип данных
      const valueType = typeof props.data;
      const isObject = valueType === 'object' && props.data !== null;
      const isArray = Array.isArray(props.data);
      const isEmpty = isObject && Object.keys(props.data).length === 0;
      
      // Получаем идентификатор для отображения при свернутом состоянии
      const displayIdentifier = computed(() => {
        if (!isObject || isEmpty) return '';
        
        if (isArray) {
          return `Массив [${props.data.length} элем.]`;
        }
        
        // Пытаемся найти id или name или другие ключевые поля
        if (props.data.id) {
          return `id: ${props.data.id}`;
        } else if (props.data.name) {
          return `name: ${props.data.name}`;
        } else if (props.data._id) {
          return `_id: ${props.data._id}`;
        } else if (props.data.key) {
          return `key: ${props.data.key}`;
        } else if (props.data.code) {
          return `code: ${props.data.code}`;
        } else {
          // Количество полей
          return `${Object.keys(props.data).length} полей`;
        }
      });
      
      const toggle = () => {
        if (isObject && !isEmpty) {
          isExpanded.value = !isExpanded.value;
        }
      };
      
      return {
        isExpanded,
        toggle,
        valueType,
        isObject,
        isArray,
        isEmpty,
        displayIdentifier
      };
    },
    render() {
      const indent = this.level * 16; // Отступ для каждого уровня
      
      // Форматирование значения в зависимости от типа
      const formatValue = (value) => {
        if (value === null) return h('span', { class: 'value null-value' }, 'null');
        if (value === undefined) return h('span', { class: 'value undefined-value' }, 'undefined');
        
        switch (typeof value) {
          case 'boolean':
            return h('span', { class: 'value boolean-value' }, value.toString());
          case 'number':
            return h('span', { class: 'value number-value' }, value.toString());
          case 'string':
            return h('span', { class: 'value string-value' }, `"${value}"`);
          default:
            return h('span', { class: 'value' }, value.toString());
        }
      };
      
      // Отображение примитивного значения
      if (!this.isObject) {
        if (this.fieldName) {
          return h('div', { class: 'json-item', style: { paddingLeft: `${indent}px` } }, [
            h('span', { class: 'key' }, `"${this.fieldName}": `),
            formatValue(this.data)
          ]);
        } else {
          return h('div', { class: 'json-item', style: { paddingLeft: `${indent}px` } }, [
            formatValue(this.data)
          ]);
        }
      }
      
      // Для пустых объектов и массивов
      if (this.isEmpty) {
        if (this.fieldName) {
          return h('div', { class: 'json-item', style: { paddingLeft: `${indent}px` } }, [
            h('span', { class: 'key' }, `"${this.fieldName}": `),
            h('span', { class: 'value' }, this.isArray ? '[]' : '{}')
          ]);
        } else {
          return h('div', { class: 'json-item', style: { paddingLeft: `${indent}px` } }, [
            h('span', { class: 'value' }, this.isArray ? '[]' : '{}')
          ]);
        }
      }
      
      // Отображение разворачиваемого объекта или массива
      const children = [];
      
      // Заголовок с именем поля и открывающими скобками
      const headerClasses = ['json-item', 'expandable'];
      if (this.isRoot) headerClasses.push('root-node');
      
      const header = h('div', 
        { 
          class: headerClasses.join(' '), 
          style: { paddingLeft: `${indent}px` },
          onClick: this.toggle 
        }, 
        [
          this.fieldName ? h('span', { class: 'key' }, `"${this.fieldName}": `) : null,
          h('span', { class: 'toggle-icon' }, this.isExpanded ? '▼' : '►'),
          h('span', { class: 'bracket' }, this.isArray ? '[' : '{'),
          !this.isExpanded ? h('span', { class: 'preview' }, this.displayIdentifier ? `${this.displayIdentifier}...` : '...') : null,
          !this.isExpanded ? h('span', { class: 'bracket' }, this.isArray ? ']' : '}') : null
        ]
      );
      
      children.push(header);
      
      // Если развернуто, добавляем содержимое
      if (this.isExpanded) {
        const entries = this.isArray 
          ? [...this.data.entries()]
          : Object.entries(this.data);
        
        entries.forEach(([key, value]) => {
          children.push(h(JsonNode, {
            data: value,
            fieldName: this.isArray ? '' : key,
            level: this.level + 1,
            isRoot: false
          }));
        });
        
        // Закрывающая скобка
        children.push(
          h('div', 
            { 
              class: 'json-item', 
              style: { paddingLeft: `${indent}px` } 
            }, 
            [
              h('span', { class: 'bracket' }, this.isArray ? ']' : '}')
            ]
          )
        );
      }
      
      return h('div', { class: 'json-node' }, children);
    }
  });
  
  // Основной компонент
  const props = defineProps({
    json: {
      type: [String, Object, Array],
      required: true
    },
    showCard: {
      type: Boolean,
      default: true
    }
  });
  
  const message = useMessage();
  
  // Парсинг JSON если передан как строка
  const parsed = ref(null);
  try {
    if (typeof props.json === 'string') {
      parsed.value = JSON.parse(props.json);
    } else {
      parsed.value = props.json;
    }
  } catch (e) {
    console.error('Error parsing JSON:', e);
  }
  
  // Разворачивание всех узлов
  const expandAll = () => {
    // Сначала разворачиваем корневые узлы
    document.querySelectorAll('.json-viewer > .json-content > .json-node > .expandable:not(.expanded)').forEach(el => {
      el.click();
    });
    
    // Затем разворачиваем остальные
    setTimeout(() => {
      document.querySelectorAll('.json-viewer .expandable:not(.expanded)').forEach(el => {
        el.click();
      });
    }, 50);
  };
  
  // Сворачивание только корневых узлов
  const collapseAll = () => {
    document.querySelectorAll('.json-viewer > .json-content > .json-node > .expandable.expanded').forEach(el => {
      el.click();
    });
  };
  
  // Копирование JSON в буфер обмена
  const copyToClipboard = () => {
    try {
      const jsonString = JSON.stringify(parsed.value, null, 2);
      navigator.clipboard.writeText(jsonString);
      message.success('JSON скопирован в буфер обмена');
    } catch (e) {
      message.error('Не удалось скопировать JSON');
      console.error('Copy error:', e);
    }
  };
  </script>
  
  <style scoped>
  .json-viewer {
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.4;
    overflow: auto;
    max-height: 70vh;
  }
  
  .json-content {
    background-color: var(--bg-screen, #f6f6f6);
    border-radius: 4px;
    padding: 8px;
    overflow: auto;
  }
  
  .json-item {
    white-space: nowrap;
    cursor: default;
    padding: 2px 0;
  }
  
  .expandable {
    cursor: pointer;
  }
  
  .expandable:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .json-node > .expandable, .root-node {
    font-weight: bold;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.02);
    padding: 4px;
  }
  
  .json-node > .expandable:hover, .root-node:hover {
    background-color: rgba(0, 0, 0, 0.07);
  }
  
  .key {
    color: var(--color-primary, #0c63e4);
    font-weight: bold;
  }
  
  .value {
    color: var(--text-usual, #333);
  }
  
  .string-value {
    color: #22863a;
  }
  
  .number-value {
    color: #005cc5;
  }
  
  .boolean-value {
    color: #6f42c1;
  }
  
  .null-value, .undefined-value {
    color: #999;
  }
  
  .toggle-icon {
    color: #888;
    font-size: 10px;
    width: 12px;
    display: inline-block;
    text-align: center;
    margin-right: 3px;
  }
  
  .bracket {
    color: #333;
  }
  
  .preview {
    color: #888;
    margin: 0 4px;
  }
  
  :deep(.dark .json-content) {
    background-color: #24292e;
  }
  
  :deep(.dark .key) {
    color: #79b8ff;
  }
  
  :deep(.dark .value) {
    color: #e1e4e8;
  }
  
  :deep(.dark .string-value) {
    color: #85e89d;
  }
  
  :deep(.dark .number-value) {
    color: #79b8ff;
  }
  
  :deep(.dark .boolean-value) {
    color: #b392f0;
  }
  
  :deep(.dark .null-value), :deep(.dark .undefined-value) {
    color: #959da5;
  }
  
  :deep(.dark .bracket) {
    color: #e1e4e8;
  }
  
  :deep(.dark .expandable:hover) {
    background-color: rgba(255, 255, 255, 0.05);
  } 
  </style>