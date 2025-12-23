<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const colorMode = useColorMode()
const loading = ref(true)
const sending = ref(false)
const projectStore = useProjectStore()
const tempTag = ref('')


definePageMeta({
  title: 'Modifier le projet',
  layout: "dashboard-layout",
  middleware: ["auth"],
})

// 1. Schéma Zod aligné sur ton DTO Symfony
const schema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Trop court'),
  slug: z.string().min(3, 'Requis'),
  description: z.string().max(200, 'Trop long'),
  content: z.string().min(10, 'Contenu requis'),
  type: z.enum(['saas', 'open-source', 'side-project']),
  github_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
})

type Schema = z.output<typeof schema>


// 2. État initial (Clés identiques au DTO)
const state = reactive({
  id: '',
  title: '',
  slug: '',
  description: '',
  content: '',
  type: 'saas' as const,
  github_url: '',
  website_url: '',
  tags: [] as string[],
  is_featured: false,
})

const isSlugLocked = ref(true)
watch(() => state.title, (newTitle) => {
  if (isSlugLocked.value && newTitle) {
    state.slug = newTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }
})

// 3. Récupération et Mapping
onMounted(async () => {
  loading.value = true
  try {
    const rawId = route.params.id
    const projectId = Array.isArray(rawId) ? rawId[0] : rawId

    if (!projectId) throw new Error("ID manquant")

    const project = await projectStore.fetchProjectById(projectId)

    // On mappe les clés de ton API vers les clés de ton DTO
    state.id = project.id.toString()
    state.title = project.title
    state.slug = project.slug
    state.description = project.description
    state.content = project.content
    state.type = project.type
    state.tags = project.tags || []
    state.github_url = project.githubUrl || ''
    state.website_url = project.webUrl || ''
    state.is_featured = project.featured || false

  } catch (err: never) {
    toast.add({ title: 'Erreur', description: 'Impossible de charger le projet', color: 'error' })
    router.push('/dashboard/projects')
  } finally {
    loading.value = false
  }
})

// 4. Envoi du DTO à Symfony
async function onSubmit(event: FormSubmitEvent<Schema>) {
  sending.value = true
  try {

    projectStore.updateProject(event.data)

    toast.add({ title: 'Succès', description: 'Projet mis à jour', color: 'success' })
    router.push('/dashboard/projects')
  } catch (err) {
    toast.add({ title: 'Erreur', description: 'Échec de la mise à jour', color: 'error' })
  } finally {
    sending.value = false
  }
}

const addTag = () => {
  if (tempTag.value.trim() && !state.tags.includes(tempTag.value.trim())) {
    state.tags.push(tempTag.value.trim())
    tempTag.value = ''
  }
}
</script>

<template>
  <UContainer class="py-10">
    <UForm v-if="!loading" :schema="schema" :state="state" class="grid grid-cols-1 lg:grid-cols-3 gap-8" @submit="onSubmit">

      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-4">
              <UButton icon="i-heroicons-arrow-left" variant="ghost" to="/dashboard/projects" />
              <h1 class="text-xl font-bold italic">Editer : {{ state.title }}</h1>
            </div>
          </template>

          <div class="space-y-4">
            <input v-model="state.id" type="hidden" />

            <UFormField label="Titre du projet" name="title" required>
              <UInput v-model="state.title" size="lg" placeholder="Nom du projet" class="w-full" />
            </UFormField>

            <UFormField label="Slug" name="slug" help="Le slug est verrouillé pour préserver le SEO.">
              <UInput v-model="state.slug" :disabled="isSlugLocked" class="w-full" color="gray">
                <template #trailing>
                  <UButton :icon="isSlugLocked ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'" variant="ghost"  @click="isSlugLocked = !isSlugLocked" />
                </template>
              </UInput>            </UFormField>

            <UFormField label="Pitch (Description courte)" name="description">
              <UTextarea v-model="state.description" autoresize placeholder="Décrivez le projet en une phrase..." class="w-full" />
            </UFormField>

            <UFormField label="Documentation technique (Markdown)" name="content">
              <client-only>
                <MdEditor
                    v-model="state.content"
                    :theme="colorMode.value === 'dark' ? 'dark' : 'light'"
                    language="en-US"
                    class="!rounded-lg border dark:border-gray-800 w-full"
                />
              </client-only>
            </UFormField>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard class="lg:sticky lg:top-8">
          <div class="space-y-6">
            <UFormField label="Catégorie" name="type">
              <USelectMenu
                  v-model="state.type"
                  :items="['saas', 'open-source', 'side-project']"
                  size="lg"
                  class="w-full"
              />
            </UFormField>

            <UFormField label="Stack Technique">
              <UInput v-model="tempTag" placeholder="Appuyez sur Entrée" @keydown.enter.prevent="addTag" class="w-full" >
                <template #trailing>
                  <UButton icon="i-heroicons-plus" variant="ghost" @click="addTag" />
                </template>
              </UInput>
              <div class="flex flex-wrap gap-1 mt-2">
                <UBadge v-for="tag in state.tags" :key="tag" variant="soft" color="primary" closable @close="state.tags = state.tags.filter(t => t !== tag)">
                  {{ tag }}
                </UBadge>
              </div>
            </UFormField>

            <UDivider />

            <UFormField label="URL GitHub" name="github_url">
              <UInput v-model="state.github_url" icon="i-simple-icons-github" placeholder="https://github.com/..." class="w-full" />
            </UFormField>

            <UFormField label="URL Démo / Live" name="website_url">
              <UInput v-model="state.website_url" icon="i-heroicons-globe-alt" placeholder="https://..." class="w-full" />
            </UFormField>

            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <span class="text-sm font-semibold">Mettre en avant</span>
              <USwitch v-model="state.is_featured" class="w-full" />
            </div>

            <div class="pt-4 space-y-2">
              <UButton type="submit" block size="xl" :loading="sending" icon="i-heroicons-check-circle">
                Enregistrer les modifications
              </UButton>
              <UButton to="/dashboard/projects"  variant="ghost" block>
                Annuler
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

    </UForm>

    <div v-else class="flex flex-col items-center justify-center py-40 gap-4">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-primary-500" />
      <p class="text-gray-500 animate-pulse">Récupération des données...</p>
    </div>
  </UContainer>
</template>