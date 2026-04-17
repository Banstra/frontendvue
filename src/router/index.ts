import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FarmLayout from '@/layouts/FarmLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/lab1',
      name: 'lab1',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Lab1View.vue'),
    },
    {
      path: '/lab2',
      name: 'lab2',
      component: () => import('../views/Lab2View.vue'),
    },
    {
      path: '/lab3',
      name: 'lab3',
      component: () => import('../views/Lab3View.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: 'printers', name: 'printers', component: () => import('@/views/PrintersView.vue') },
        { path: 'filaments', name: 'filaments', component: () => import('@/views/FilamentsView.vue') },
        { path: 'models', name: 'models', component: () => import('@/views/ModelsView.vue') }
      ]
    },
  ],
})

export default router
