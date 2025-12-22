<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  title: 'Ajouter un nouveau projet',
  middleware: ['auth'],
  layout: 'dashboard-layout',
})

// 1. Schéma de validation Zod
const schema = z.object({
  title: z.string().min(3, 'Le titre est trop court'),
  slug: z.string().min(3, 'Le slug est requis'),
  description: z.string().max(200, 'L\'accroche doit être courte'),
  content: z.string().min(10, 'Ajoute un peu de contenu technique !'),
  type: z.enum(['saas', 'open-source', 'side-project']),
  status: z.enum(['en-cours', 'termine', 'maintenance']),
  github_url: z.string().url().optional().or(z.literal('')),
  demo_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  images: z.array(z.string()).default([])
})

type Schema = z.output<typeof schema>

// 2. État du formulaire
const state = reactive<Partial<Schema>>({
  title: undefined,
  slug: '',
  description: undefined,
  content: '',
  type: 'saas',
  status: 'en-cours',
  github_url: '',
  demo_url: '',
  tags: [],
  is_featured: false,
  images: []
})

// Auto-génération du slug à partir du titre
watch(() => state.title, (newTitle) => {
  if (newTitle) {
    state.slug = newTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  }
})

// Options pour les sélecteurs
const typeOptions = [
  { label: 'SaaS', value: 'saas', icon: 'i-heroicons-banknotes' },
  { label: 'Open Source', value: 'open-source', icon: 'i-heroicons-code-bracket' },
  { label: 'Side Project', value: 'side-project', icon: 'i-heroicons-beaker' }
]

const statusOptions = [
  { label: 'En cours', value: 'en-cours' },
  { label: 'Terminé', value: 'termine' },
  { label: 'Maintenance', value: 'maintenance' }
]

// 3. Soumission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Formulaire valide !', event.data)
  // Ton appel API ici (ex: useFetch('/api/projects', { method: 'POST', body: event.data }))
}
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Nouveau Projet</h1>
      <p class="text-gray-500">Référence tes travaux pour ton blog technique.</p>
    </header>

    <UForm :schema="schema" :state="state" class="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full" @submit="onSubmit">

      <div class="lg:col-span-2 space-y-6 w-full">
        <UCard class="w-full">
          <div class="space-y-4 w-full">
            <UFormField label="Titre du projet" name="title" required class="w-full">
              <UInput v-model="state.title" placeholder="Ex: Ma Super App SaaS" icon="i-heroicons-pencil" class="w-full" />
            </UFormField>

            <UFormField label="Slug (URL)" name="slug" help="L'URL sera : /projets/mon-super-projet">
              <UInput v-model="state.slug"  placeholder="mon-super-projet" color="gray" variant="subtle" class="w-full" disabled />
            </UFormField>

            <UFormField label="Description courte (accroche)" name="description">
              <UTextarea v-model="state.description" autoresize placeholder="Une phrase qui donne envie de cliquer..." class="w-full" />
            </UFormField>

            <UFormField label="Contenu technique (Markdown)" name="content">
              <UTextarea v-model="state.content" :rows="10" placeholder="Explique les challenges techniques, la stack..." class="w-full" />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-semibold">Galerie photos</h3>
          </template>
          <div class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <UIcon name="i-heroicons-photo" class="w-10 h-10 mb-2 opacity-50" />
            <p class="text-sm">Ajouter des URLs d'images ou configurer un upload S3</p>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <div class="space-y-6">
            <UFormField label="Type de projet" name="type">
              <USelectMenu v-model="state.type" :items="typeOptions.map((option)=>option.value)" value-attribute="value" class="w-full" />
            </UFormField>

            <UFormField label="Statut" name="status">
              <USelectMenu v-model="state.status" :items="statusOptions.map((option)=>option.value)"  class="w-full" />
            </UFormField>

            <UFormField label="Tags / Techs" name="tags">
              <UInput v-model="state.tags" placeholder="React, Nuxt, Prisma (séparés par virgule)" @blur="state.tags = (state.tags as any).split(',').map((t: string) => t.trim())" class="w-full" />
            </UFormField>

            <UFormField label="Lien GitHub" name="github_url">
              <UInput v-model="state.github_url" icon="i-simple-icons-github" class="w-full"/>
            </UFormField>

            <UFormField label="Lien Démo / Site" name="demo_url">
              <UInput v-model="state.demo_url" icon="i-heroicons-globe-alt" class="w-full"/>
            </UFormField>

            <UFormField label="Mettre en avant" name="is_featured" description="Afficher en haut de page">
              <UCheckbox v-model="state.is_featured" class="w-full"/>
            </UFormField>

            <UButton type="submit" block size="lg">
              Enregistrer le projet
            </UButton>
          </div>
        </UCard>
      </div>

    </UForm>
  </UContainer>
</template>