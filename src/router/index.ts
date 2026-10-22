import { createRouter, createWebHistory } from 'vue-router'

import HomePage    from '@/views/home.vue'
import BookingPage   from '@/views/booking.vue'
import AdminLayout from '@/views/admin/layout.vue'
import AdminPage   from '@/views/admin/index.vue'
// import NotFound    from '@/views/not-found.vue'

const routes = [
  { path: '/',        name: 'Home',  component: HomePage },
  { path: '/booking', name: 'Booking',  component: BookingPage },
  {
    path: '/admin',
    // Admin key is checked in AdminLayout (see useAdminAuth)
    component: AdminLayout,
    children: [
      { path: '', name: 'Admin', component: AdminPage, meta: { title: '當前場次' } },
    ],
  },
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(), 
  routes,
})