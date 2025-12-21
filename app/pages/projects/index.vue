<script setup lang="ts">
const result = ref<any>(null)
const {data} = await useFetch('http://localhost:8000/projects/', {
  method: 'GET',
})

  result.value = data.value
</script>

<template>
  <UMain>
    {{result}}
  </UMain>
</template>