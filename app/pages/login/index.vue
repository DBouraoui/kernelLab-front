<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  username: z.string(),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  username: '',
  password: ''
})

const toast = useToast()

const result = ref<any>(null)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { data, error } = await useFetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    body: event.data
  })

  if (error.value) {
    toast.add({
      title: 'Erreur',
      description: error.value.message,
      color: 'red'
    })
    return
  }

  result.value = data.value

  toast.add({
    title: 'Success',
    description: 'Connexion réussie',
    color: 'success'
  })
}
</script>


<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.username" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>

    <UButton type="submit">
      Submit
    </UButton>

    <pre v-if="result">{{ result }}</pre>
  </UForm>
</template>

