import { createRouter, createWebHistory } from 'vue-router'

import HomePage    from '@/views/home.vue'
import BookingPage   from '@/views/booking.vue'
import AdminPage   from '@/views/admin.vue'
// import NotFound    from '@/views/not-found.vue'

// Admin authentication guard
const requireAdminAuth = () => {
  const password = sessionStorage.getItem('adminAuth')
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD
  
  if (password === correctPassword) {
    return true
  }
  
  const inputPassword = prompt('請輸入管理員密碼:')
  
  if (inputPassword === correctPassword) {
    sessionStorage.setItem('adminAuth', inputPassword)
    return true
  }
  
  alert('密碼錯誤')
  return false
}

const routes = [
  { path: '/',        name: 'Home',  component: HomePage },
  { path: '/booking', name: 'Booking',  component: BookingPage },
  { 
    path: '/admin',   
    name: 'Admin', 
    component: AdminPage,
    beforeEnter: (to, from, next) => {
      if (requireAdminAuth()) {
        next()
      } else {
        next('/')
      }
    }
  },
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(), 
  routes,
})