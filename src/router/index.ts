import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../pages/HomeView.vue';
import RecordView from '../pages/RecordView.vue';
import ListView from '../pages/ListView.vue';
import DetailView from '../pages/DetailView.vue';
import CategoryManageView from '../pages/CategoryManageView.vue';
import JoinView from '../pages/JoinView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/record', name: 'record', component: RecordView },
    { path: '/edit/:id', name: 'edit', component: RecordView },
    { path: '/list', name: 'list', component: ListView },
    { path: '/detail/:id', name: 'detail', component: DetailView },
    { path: '/categories-manage', name: 'categories-manage', component: CategoryManageView },
    { path: '/join', name: 'join', component: JoinView },
  ],
});

export default router;
