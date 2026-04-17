// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import FarmLayout from '@/layouts/FarmLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Lab3 с вложенной маршрутизацией
    {
      path: '/lab3',
      name: 'lab3',
      component: FarmLayout,
      children: [
        { path: '', name: 'lab3-home', component: () => import('@/views/HomeView.vue') },
        { path: 'printers', name: 'lab3-printers', component: () => import('@/views/PrintersView.vue') },
        { path: 'filaments', name: 'lab3-filaments', component: () => import('@/views/FilamentsView.vue') },
        { path: 'models', name: 'lab3-models', component: () => import('@/views/ModelsView.vue') }
      ]
    },
    // Lab1 и Lab2
    {
      path: '/lab1',
      name: 'lab1',
      component: () => import('@/views/Lab1View.vue'),
    },
    {
      path: '/lab2',
      name: 'lab2',
      component: () => import('@/views/Lab2View.vue'),
    },
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/HomeView.vue'),
    }
  ],
})

export default router
