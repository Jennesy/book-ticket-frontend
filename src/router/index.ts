import { createRouter, createWebHistory } from 'vue-router'

import HomePage    from '@/views/home.vue'
import BookingPage   from '@/views/booking.vue'
import AdminPage   from '@/views/admin.vue'
// import NotFound    from '@/views/not-found.vue'

const routes = [
  { path: '/',        name: 'Home',  component: HomePage },
  { path: '/booking', name: 'Booking',  component: BookingPage },
  // Admin key is checked inside AdminPage (see useAdminAuth)
  { path: '/admin',   name: 'Admin', component: AdminPage },
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(), 
  routes,
})