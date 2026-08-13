import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../pages/HomeView.vue';
import RecordView from '../pages/RecordView.vue';
import ListView from '../pages/ListView.vue';
import DetailView from '../pages/DetailView.vue';
import CategoryManageView from '../pages/CategoryManageView.vue';

const router = createRouter({
  // v2-local-file：纯静态文件版本，用 hash 路由，任何静态托管/直接打开都能用
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/record', name: 'record', component: RecordView },
    { path: '/edit/:id', name: 'edit', component: RecordView },
    { path: '/list', name: 'list', component: ListView },
    { path: '/detail/:id', name: 'detail', component: DetailView },
    { path: '/categories-manage', name: 'categories-manage', component: CategoryManageView },
  ],
});

export default router;
