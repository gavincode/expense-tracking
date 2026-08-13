import { onMounted, onUnmounted, ref } from 'vue';
import { buildLocalFile, pushLedger, pullLedger } from '../db/sync';
import type { LedgerMember } from '../types/ledger';

const POLL_INTERVAL = 30000;

function safeGet(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function readMembers(): LedgerMember[] {
  try {
    return JSON.parse(safeGet('rl_members') || '[]') as LedgerMember[];
  } catch {
    return [];
  }
}

/**
 * 账本同步：定时轮询（30s）+ 页面激活立即拉取；离线时静默失败、下轮重试。
 */
export function useSync(ledgerId: () => string, inviteCode: () => string, onUpdated?: () => void) {
  const syncing = ref(false);
  let timer: number | undefined;
  let started = false;

  async function syncOnce(): Promise<void> {
    const id = ledgerId();
    if (!id || syncing.value) {
      return;
    }
    syncing.value = true;
    try {
      const local = await buildLocalFile(id, inviteCode(), readMembers());
      await pushLedger(local);
      const remote = await pullLedger(id);
      if (remote.inviteCode) {
        safeSet('rl_invite_code', remote.inviteCode);
      }
      safeSet('rl_members', JSON.stringify(remote.members));
      onUpdated?.();
    } catch {
      // 离线/网络失败：静默，下轮轮询自动重试
    } finally {
      syncing.value = false;
    }
  }

  function handleVisibility(): void {
    if (document.visibilityState === 'visible') {
      syncOnce();
    }
  }

  onMounted(() => {
    if (started) {
      return;
    }
    started = true;
    syncOnce();
    timer = window.setInterval(syncOnce, POLL_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onUnmounted(() => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
    document.removeEventListener('visibilitychange', handleVisibility);
  });

  return { syncing, syncOnce };
}
