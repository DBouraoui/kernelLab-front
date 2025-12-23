<script setup lang="ts">
  import {useUserStore} from "~/stores/userStore";

  definePageMeta({
    title: 'Pannel d\'administration',
    layout: 'dashboard-layout',
    middleware: ['auth'],
  })
  const userStore = useUserStore()
</script>

<template>
 <h1>Hello {{userStore.username}}</h1>
</template>