<template>
  <div class="page join-page">
    <van-nav-bar title="加入装修账本" left-arrow @click-left="goBack" />

    <div class="join-card">
      <van-field v-model="code" label="邀请码" placeholder="输入 6 位邀请码" maxlength="6" />
      <van-field v-model="nickname" label="我的昵称" placeholder="默认：我" maxlength="10" />
      <van-button
        type="primary"
        round
        block
        size="large"
        class="join-btn"
        :loading="joining"
        @click="join"
      >
        加入账本
      </van-button>
      <p class="hint">无需注册登录，加入后与家人共享同一账本</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useIdentityStore } from '../stores/identity';
import { joinLedger } from '../api/client';
import { pullLedger } from '../db/sync';

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

const route = useRoute();
const router = useRouter();
const identity = useIdentityStore();
const code = ref('');
const nickname = ref(identity.nickname);
const joining = ref(false);

function goBack() {
  router.back();
}

async function join() {
  const trimmed = code.value.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    showToast('请输入 6 位邀请码');
    return;
  }
  joining.value = true;
  try {
    identity.setNickname(nickname.value);
    const deviceId = identity.ensureDeviceId();
    const result = await joinLedger(trimmed, deviceId, identity.nickname);
    safeSet('rl_ledger_id', result.ledgerId);
    safeSet('rl_invite_code', result.inviteCode);
    safeSet('rl_members', JSON.stringify(result.members));
    await pullLedger(result.ledgerId);
    showToast('已加入账本');
    router.replace('/');
  } catch (error) {
    showToast('加入失败：' + String(error));
  } finally {
    joining.value = false;
  }
}

onMounted(() => {
  const fromQuery = String(route.query.code ?? '').trim();
  if (fromQuery) {
    code.value = fromQuery;
  }
});
</script>

<style scoped>
.join-page {
  padding-top: 0;
}

.join-card {
  margin-top: var(--space-lg);
  padding: var(--space-lg) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.join-btn {
  margin-top: var(--space-lg);
}

.hint {
  margin: var(--space-md) 0 0;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
