<template>
  <div class="page category-page">
    <van-nav-bar title="选择分类" left-arrow @click-left="goBack" />

    <van-cell-group inset>
      <van-cell title="未分类" is-link @click="pickUncategorized" />
      <template v-for="group in groups" :key="group.id">
        <van-cell :title="group.name" is-link @click="toggleGroup(group.id)" />
        <van-cell
          v-for="child in expandedGroup === group.id ? group.children : []"
          :key="child.id"
          :title="child.name"
          class="child-cell"
          @click="pick(group, child)"
        />
      </template>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  PRESET_CATEGORIES,
  UNCATEGORIZED,
  type CategoryGroup,
  type CategoryChild,
} from '../data/categories';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const categoryStore = useCategoryStore();
const groups = PRESET_CATEGORIES;
const expandedGroup = ref<string | null>(null);

function goBack() {
  router.back();
}

function toggleGroup(id: string) {
  expandedGroup.value = expandedGroup.value === id ? null : id;
}

function pickUncategorized() {
  categoryStore.setSelected({
    categoryId: UNCATEGORIZED.id,
    name: UNCATEGORIZED.name,
    path: UNCATEGORIZED.name,
  });
  router.back();
}

function pick(group: CategoryGroup, child: CategoryChild) {
  categoryStore.setSelected({
    categoryId: child.id,
    name: child.name,
    path: `${group.name}/${child.name}`,
  });
  router.back();
}
</script>

<style scoped>
.category-page {
  padding-top: 0;
}

.child-cell {
  padding-left: 40px;
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  background: var(--color-primary-light);
}
</style>
