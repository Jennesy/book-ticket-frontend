<template>
  <!-- v-layout is required by v-navigation-drawer (the app has no v-app) -->
  <v-layout>
    <div class="admin-page w-full">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-6">
          管理員後台<span v-if="isAuthenticated && pageTitle" class="font-normal">｜{{ pageTitle }}</span>
        </h1>
        <Button
          v-if="isAuthenticated"
          icon="mdi-menu"
          variant="text"
          @click="isMenuOpen = true"
        />
      </div>

      <AdminKeyForm v-if="!isAuthenticated" />
      <router-view v-else />
    </div>

    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="isMenuOpen"
      location="right"
      temporary
    >
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :title="item.title"
          :prepend-icon="item.icon"
          color="primary"
          exact
        />
      </v-list>

      <template #append>
        <div class="pa-2 border-t">
          <Button block variant="text" prepend-icon="mdi-logout" @click="onLogout">
            登出
          </Button>
        </div>
      </template>
    </v-navigation-drawer>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from '@/components/common/button.vue'
import AdminKeyForm from '@/components/admin/admin-key-form.vue'
import { useAdminAuth } from '@/composables/useAdminAuth'

const route = useRoute()
const { isAuthenticated, logout } = useAdminAuth()

const isMenuOpen = ref(false)

const pageTitle = computed(() => route.meta.title as string | undefined)

const navItems = [
  { title: '當前場次', to: '/admin', icon: 'mdi-ticket-outline' },
  { title: '場次管理', to: '/admin/concerts', icon: 'mdi-playlist-edit' },
  { title: '歷史場次', to: '/admin/history', icon: 'mdi-history' },
]

// Close the menu once a page is picked
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

const onLogout = () => {
  isMenuOpen.value = false
  logout()
}
</script>

<style scoped>
.admin-page {
  padding: 20px;
  min-height: 100vh;
}
</style>
