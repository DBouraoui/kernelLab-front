<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import {useAuth} from "~/hooks/useAuth";

const {logout} = useAuth()
const userStore = useUserStore()
const route = useRoute()

const items: NavigationMenuItem[][] = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/dashboard',
  active: route.path.startsWith('/dashboard')
}],
  [{
  label: 'Deconnexion',
  icon: 'i-lucide-log-out',
  onSelect: logout,
  to: '/login'
}]]
</script>

<template>
<UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
  <template #header>
    <h2>PyPulse</h2>
  </template>

  <template #default="{ collapsed }">

    <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
    />

    <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        class="mt-auto"
    />
  </template>

  <template #footer="{ collapsed }">
    <UButton
        icon="i-lucide-user"
        :label="collapsed ? undefined : userStore.email"
        color="neutral"
        variant="ghost"
        class="w-full"
        :block="collapsed"
    />
  </template>
</UDashboardSidebar>
</template>