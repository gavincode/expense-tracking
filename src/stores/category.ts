import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface SelectedCategory {
  categoryId: string;
  name: string;
  path: string;
}

export const useCategoryStore = defineStore('category', () => {
  const selected = ref<SelectedCategory | null>(null);

  function setSelected(category: SelectedCategory | null) {
    selected.value = category;
  }

  return { selected, setSelected };
});
