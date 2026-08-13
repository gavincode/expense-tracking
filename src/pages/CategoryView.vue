<template>
  <div class="page category-page">
    <van-nav-bar
      :title="currentGroup ? currentGroup.name : '选择分类'"
      left-arrow
      @click-left="goBack"
    />

    <van-cell-group v-if="!currentGroup" inset>
      <van-cell
        v-for="group in groups"
        :key="group.id"
        :title="group.name"
        is-link
        @click="currentGroup = group"
      />
    </van-cell-group>

    <van-cell-group v-else inset>
      <van-cell
        v-for="child in currentGroup.children"
        :key="child.id"
        :title="child.name"
        @click="pick(currentGroup, child)"
      />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { PRESET_CATEGORIES, type CategoryGroup, type CategoryChild } from '../data/categories';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const categoryStore = useCategoryStore();
const groups = PRESET_CATEGORIES;
const currentGroup = ref<CategoryGroup | null>(null);

function goBack() {
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
</style>
