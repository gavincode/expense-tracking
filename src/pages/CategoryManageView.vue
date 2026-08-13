<template>
  <div class="page manage-page">
    <van-nav-bar title="分类管理" left-arrow @click-left="goBack" />

    <van-empty v-if="!customGroups.length && !orphanChildren.length" description="还没有自定义分类" />

    <div v-for="group in customGroups" :key="group.id" class="group-block">
      <div class="group-header">
        <span class="group-name">{{ group.name }}</span>
        <div class="actions">
          <button type="button" class="action-btn" @click="openRename(group, 'group')">重命名</button>
          <button type="button" class="action-btn danger" @click="confirmDelete(group)">
            删除
          </button>
        </div>
      </div>
      <div v-for="child in childrenOf(group.id)" :key="child.id" class="child-row">
        <span class="child-name">{{ child.name }}</span>
        <div class="actions">
          <button type="button" class="action-btn" @click="openRename(child, 'child')">重命名</button>
          <button type="button" class="action-btn danger" @click="confirmDelete(child)">
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="orphanChildren.length" class="group-block">
      <div class="group-header">
        <span class="group-name">预设分类下的自定义项目</span>
      </div>
      <div v-for="child in orphanChildren" :key="child.id" class="child-row">
        <span class="child-name">{{ parentName(child.groupId) }} / {{ child.name }}</span>
        <div class="actions">
          <button type="button" class="action-btn" @click="openRename(child, 'child')">重命名</button>
          <button type="button" class="action-btn danger" @click="confirmDelete(child)">
            删除
          </button>
        </div>
      </div>
    </div>

    <van-popup v-model:show="renamePopup" position="bottom" round>
      <div class="add-panel">
        <div class="add-title">重命名</div>
        <van-field v-model="renameName" placeholder="输入新名称（20 字以内）" maxlength="20" clearable />
        <div class="add-actions">
          <van-button plain round @click="renamePopup = false">取消</van-button>
          <van-button type="primary" round @click="confirmRename">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import {
  listCustomCategories,
  renameCategory,
  deleteCategory,
  type CustomCategory,
} from '../db/ledger';
import { PRESET_CATEGORIES } from '../data/categories';

const router = useRouter();
const items = ref<CustomCategory[]>([]);
const renamePopup = ref(false);
const renameName = ref('');
const renameTarget = ref<{ type: 'group' | 'child'; id: string } | null>(null);

const customGroups = computed(() => items.value.filter((c) => c.groupId === null));

const customGroupIds = computed(() => new Set(customGroups.value.map((g) => g.id)));

const orphanChildren = computed(() =>
  items.value.filter((c) => c.groupId !== null && !customGroupIds.value.has(c.groupId)),
);

function childrenOf(groupId: string): CustomCategory[] {
  return items.value.filter((c) => c.groupId === groupId);
}

function parentName(groupId: string | null): string {
  if (!groupId) {
    return '';
  }
  const preset = PRESET_CATEGORIES.find((g) => g.id === groupId);
  if (preset) {
    return preset.name;
  }
  return customGroups.value.find((g) => g.id === groupId)?.name ?? groupId;
}

async function load() {
  items.value = await listCustomCategories();
}

function goBack() {
  router.back();
}

function openRename(item: CustomCategory, type: 'group' | 'child') {
  renameTarget.value = { type, id: item.id };
  renameName.value = item.name;
  renamePopup.value = true;
}

async function confirmRename() {
  const name = renameName.value.trim();
  if (!name) {
    showToast('请输入名称');
    return;
  }
  if (renameTarget.value) {
    await renameCategory(renameTarget.value.id, name);
    showToast('已重命名');
    renamePopup.value = false;
    await load();
  }
}

async function confirmDelete(item: CustomCategory) {
  try {
    await showConfirmDialog({
      title: `删除"${item.name}"？`,
      message: '删除后记账时不再显示，历史支出不受影响',
      confirmButtonText: '删除',
      confirmButtonColor: '#ee0a24',
    });
  } catch {
    return;
  }
  await deleteCategory(item.id);
  showToast('已删除');
  await load();
}

onMounted(load);
</script>

<style scoped>
.manage-page {
  padding-top: 0;
}

.group-block {
  margin-bottom: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.group-header,
.child-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  min-height: var(--touch-target);
  border-bottom: 1px solid var(--color-border);
}

.group-header:last-child,
.child-row:last-child {
  border-bottom: none;
}

.group-name {
  font-weight: 600;
}

.child-row {
  padding-left: var(--space-lg);
}

.child-name {
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  appearance: none;
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary-dark);
  border-radius: 14px;
  padding: 5px 12px;
  font-size: var(--font-size-sm);
  min-height: 28px;
  cursor: pointer;
}

.action-btn.danger {
  border-color: #ee0a24;
  color: #ee0a24;
}

.add-panel {
  padding: var(--space-lg) var(--space-md) calc(var(--space-lg) + env(safe-area-inset-bottom));
}

.add-title {
  margin-bottom: var(--space-md);
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.add-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.add-actions .van-button {
  flex: 1;
}
</style>
