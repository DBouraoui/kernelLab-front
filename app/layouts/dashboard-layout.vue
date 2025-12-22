<script setup lang="ts">
import SidebarAdmin from "~/components/Sidebar-admin.vue";
import {useUserStore} from "~/stores/userStore";

const userStore = useUserStore()
const accessToken = useCookie('access_token')
const config = useRuntimeConfig()
const toast = useToast()

if (accessToken.value && !userStore.username) {
  try {
    const data: {username: string, email: string} = await $fetch(`${config.public.apiBase}/user/me/`, {
      headers: { Authorization: `Bearer ${accessToken.value}` }
    })
    userStore.setUser(data)
  } catch {
    accessToken.value = null
    toast.add({title:'Vous n\'êtes plus connecté', color:'warning'})
    navigateTo('/login')
  }
}
</script>

<template>
 <UDashboardGroup>
   <SidebarAdmin/>
   <slot/>
 </UDashboardGroup>
</template>

