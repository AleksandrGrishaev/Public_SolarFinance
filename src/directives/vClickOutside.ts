// src/directives/vClickOutside.ts

// Расширяем тип HTMLElement
interface HTMLElementWithClickOutside extends HTMLElement {
    _clickOutside?: (event: Event) => void;
  }
  
  // Директива для закрытия компонентов при клике вне их
  export const vClickOutside = {
    mounted(el: HTMLElementWithClickOutside, binding: any) {
      el._clickOutside = (event: Event) => {
        if (!(el === event.target || el.contains(event.target as Node))) {
          binding.value(event);
        }
      };
      document.addEventListener('click', el._clickOutside);
    },
    unmounted(el: HTMLElementWithClickOutside) {
      if (el._clickOutside) {
        document.removeEventListener('click', el._clickOutside);
      }
    }
  };
  
  export default vClickOutside;