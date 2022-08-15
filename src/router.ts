import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './pages/Home.vue';

import PlayWithLocalPeople from './pages/PlayWithLocalPeople.vue';
import PlayWithOnlinePeople from './pages/PlayWithOnlinePeople.vue';
import PlayWithAI from './pages/PlayWithAI.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/play-with-local-people', component: PlayWithLocalPeople },
  { path: '/play-with-online-people', component: PlayWithOnlinePeople },
  { path: '/play-with-ai', component: PlayWithAI },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
