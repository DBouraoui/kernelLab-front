<script setup lang="ts">
import SidebarAdmin from "~/components/Sidebar-admin.vue";
import {useUserStore} from "~/stores/userStore";

const userStore = useUserStore()
const accessToken = useCookie('access_token')
const config = useRuntimeConfig()
const toast = useToast()

if (accessToken.value && !userStore.email) {
  try {
    const data: {email: string} = await $fetch(`${config.public.apiBase}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken.value}` }
    })
    userStore.setUser(data)
  } catch {
    accessToken.value = null
    navigateTo('/login')
    toast.add({title:'Vous n\'êtes plus connecté', color:'warning'})
  }
}
</script>

<template>
 <UDashboardGroup>
   <SidebarAdmin/>
    <section class="h-full w-full overflow-y-scroll">
      <slot/>
    </section>
 </UDashboardGroup>
</template>

