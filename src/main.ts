import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  Button,
  Cell,
  CellGroup,
  DatePicker,
  Empty,
  Field,
  NavBar,
  NumberKeyboard,
  Popup,
  SwipeCell,
} from 'vant';
import App from './App.vue';
import router from './router';
import 'vant/lib/index.css';
import './styles/tokens.css';
import { registerSW } from 'virtual:pwa-register';

const app = createApp(App);

[Button, Cell, CellGroup, DatePicker, Empty, Field, NavBar, NumberKeyboard, Popup, SwipeCell].forEach(
  (component) => app.use(component),
);

app.use(createPinia()).use(router).mount('#app');

// 纯静态版本：仅在 http(s) 下注册 PWA，file:// 直接打开时不注册
if (location.protocol.startsWith('http')) {
  registerSW({ immediate: true });
}
