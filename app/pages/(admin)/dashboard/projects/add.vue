<script setup lang="ts">
import { z } from 'zod'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const colorMode = useColorMode()
const loading = ref<boolean>(false)
const toast = useToast()
const router = useRouter()
const projectStore = useProjectStore()

definePageMeta({
  title: 'Ajouter un nouveau projet',
  middleware: ['auth'],
  layout: 'dashboard-layout',
})

// 1. Schéma Zod (on valide que c'est bien un tableau d'images)
const schema = z.object({
  title: z.string().min(3, 'Le titre est trop court'),
  slug: z.string().min(3, 'Le slug est requis'),
  description: z.string().max(200, 'L\'accroche doit être courte'),
  content: z.string().min(10, 'Le contenu est trop court'),
  type: z.enum(['saas', 'open-source', 'side-project']),
  status: z.enum(['en-cours', 'termine', 'maintenance']),
  github_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  image: z.any()
})
const state = reactive({
  title: '',
  slug: '',
  description: '',
  content: '',
  type: 'saas' as const,
  status: 'en-cours' as const,
  github_url: '',
  website_url: '',
  tags: [] as string[],
  is_featured: false,
  image: [] as File[],
})

// --- LOGIQUE SLUG ---
const isSlugLocked = ref(true)
watch(() => state.title, (newTitle) => {
  if (isSlugLocked.value && newTitle) {
    state.slug = newTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }
})

// --- TAGS ---
const tempTag = ref('')
const addTag = () => {
  const tag = tempTag.value.trim()
  if (tag && !state.tags.includes(tag)) {
    state.tags.push(tag)
    tempTag.value = ''
  }
}

const typeOptions = [
  { label: 'SaaS', value: 'saas' },
  { label: 'Open Source', value: 'open-source' },
  { label: 'Side Project', value: 'side-project' }
]

async function onSubmit() {
  loading.value = true

  try {
    const formData = new FormData()

    formData.append('title', state.title)
    formData.append('slug', state.slug)
    formData.append('description', state.description)
    formData.append('content', state.content)
    formData.append('type', state.type)
    formData.append('status', state.status)
    formData.append('is_featured', state.is_featured ? '1' : '0')

    if (state.github_url) formData.append('github_url', state.github_url)
    if (state.website_url) formData.append('website_url', state.website_url)

    state.tags.forEach(tag => {
      formData.append('tags[]', tag)
    })

    // 3. On ajoute les images
    if (state.image && state.image.length > 0) {
      state.image.forEach((file: File) => {
        formData.append('images[]', file)
      })
    }

    await projectStore.addProject(formData)

    toast.add({ title: 'Succès !', description: 'Le projet a été publié.', color: 'success' })
     await router.push({ path: '/dashboard/projects' })

  } catch (err: any) {
    console.error(err)
    toast.add({
      title: 'Erreur',
      description: err.data?.message || 'Impossible de sauvegarder le projet',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-6xl">
    <UForm :schema="schema" :state="state" class="grid grid-cols-1 lg:grid-cols-3 gap-8" @submit="onSubmit">

      <div class="lg:col-span-2 space-y-6">
        <UCard class="w-full">
          <div class="space-y-4">
            <UFormField label="Nom du projet" name="title" required class="w-full">
              <UInput v-model="state.title" size="xl" placeholder="Mon projet incroyable" class="w-full" />
            </UFormField>

            <UFormField label="URL Slug" name="slug" class="w-full">
              <UInput v-model="state.slug" :disabled="isSlugLocked" class="w-full" color="gray">
                <template #trailing>
                  <UButton :icon="isSlugLocked ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'" variant="ghost"  @click="isSlugLocked = !isSlugLocked" />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Pitch court" name="description" class="w-full">
              <UTextarea v-model="state.description" placeholder="Une description rapide pour les cartes SEO..." class="w-full" />
            </UFormField>

            <UFormField label="Documentation technique" name="content" class="w-full">
              <client-only>
                <MdEditor v-model="state.content" :theme="colorMode.value === 'dark' ? 'dark' : 'light'" language="en-US" class="!rounded-lg border dark:border-gray-800" />
              </client-only>
            </UFormField>
          </div>
        </UCard>

      </div>

      <div class="space-y-6">
        <UCard class="w-full lg:sticky lg:top-8">
          <div class="space-y-6">
            <UFormField label="Type de projet" name="type" class="w-full">
              <USelectMenu v-model="state.type" :items="typeOptions.map((option)=>option.value)" value-attribute="value" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Technologies (Tags)" class="w-full">
              <UInput v-model="tempTag" placeholder="Ajouter une techno..." class="w-full" @keydown.enter.prevent="addTag">
                <template #trailing>
                  <UButton  variant="ghost" icon="i-heroicons-plus" @click="addTag" />
                </template>
              </UInput>
              <div class="flex flex-wrap gap-2 mt-3">
                <UBadge v-for="tag in state.tags" :key="tag" variant="subtle" closable @close="state.tags = state.tags.filter(t => t !== tag)">{{ tag }}</UBadge>
              </div>
            </UFormField>

            <USeparator/>

            <UFormField label="Lien GitHub" name="github_url" class="w-full">
              <UInput v-model="state.github_url" icon="i-simple-icons-github" placeholder="https://github.com/..." class="w-full" />
            </UFormField>

            <UFormField label="Lien Site Web" name="website_url" class="w-full">
              <UInput v-model="state.website_url" icon="i-heroicons-globe-alt" placeholder="https://mon-site.com" class="w-full" />
            </UFormField>

            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold">Mettre en avant</span>
                <USwitch v-model="state.is_featured" />
              </div>
            </div>
              <UFileUpload v-model="state.image" label="Déposer les images" multiple/>

            <UButton type="submit" block size="xl">
              Publier le projet
            </UButton>
          </div>
        </UCard>
      </div>

    </UForm>
  </UContainer>
</template>