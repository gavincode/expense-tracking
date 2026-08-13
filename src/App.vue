<template>
  <div class="app-shell">
    <router-view />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: var(--color-bg);
}
</style>
