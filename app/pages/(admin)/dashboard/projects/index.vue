<script setup lang="ts">
import type {Project} from "~/interface/projects";

definePageMeta({
  title: 'Modifier mes projects',
  layout: "dashboard-layout",
  middleware: ["auth"],
})
const projectStore = useProjectStore()
const projects = ref<Project[]>([])
const loading = ref<boolean>(false)
const config = useRuntimeConfig()

onMounted(async () => {
  try {
    loading.value = true
    await projectStore.fetchProjects()
    projects.value = projectStore.projects
  } catch (err) {
    console.error(err)
  }finally {
    loading.value = false
  }
})
const toast = useToast()
const router = useRouter()

async function confirmDelete(id :string) {
  try {
    projectStore.deleteProject(id)
    toast.add({ title: 'Supprimé', description: 'Le projet a été retiré.', color: 'success' })
    router.push('/dashboard/projects')
  } catch (err) {
    console.log(err)
    toast.add({ title: 'Erreur', description: 'Suppression impossible', color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-10">
    <header class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Gestion des Projets</h1>
        <p class="text-gray-500">Liste de tes réalisations enregistrées sur Symfony.</p>
      </div>
      <UButton to="/dashboard/projects/add" icon="i-heroicons-plus" size="lg">
        Nouveau projet
      </UButton>
    </header>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="i in 9" :key="i" class="overflow-hidden">
        <USkeleton class="h-48 w-full" />
        <div class="p-4 space-y-2">
          <USkeleton class="h-4 w-[250px]" />
          <USkeleton class="h-4 w-[200px]" />
        </div>
      </UCard>
    </div>

    <section v-else>
      <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard
            v-for="p in projects"
            :key="p.id"
            class="group overflow-hidden transition-all hover:ring-2 hover:ring-primary-500 shadow-sm"
        >
          <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
                v-if="p.pictures?.length"
                :src="config.public.apiBase + p.pictures[0]"
                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div v-else class="flex items-center justify-center h-full text-gray-400">
              <UIcon name="i-heroicons-photo" size="40" />
            </div>

            <div class="absolute top-2 left-2 flex gap-1">
              <UBadge size="xs" variant="solid">{{ p.type }}</UBadge>
              <UBadge v-if="p.featured" size="xs" color="primary" variant="solid">⭐ Top</UBadge>
            </div>
          </div>

          <div class="p-5">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-lg leading-tight truncate">{{ p.title }}</h3>
              <div class="flex gap-1">
                <UButton icon="i-heroicons-pencil-square" variant="ghost"  :to="`/dashboard/projects/${p.id}`" />
                <UButton icon="i-heroicons-trash" variant="ghost" @click="confirmDelete(p.id)" />
              </div>
            </div>

            <p class="text-gray-500 text-sm line-clamp-2 mb-4">
              {{ p.description || 'Aucune description fournie.' }}
            </p>

            <div class="flex items-center justify-between mt-auto pt-4 border-t dark:border-gray-800">
              <div class="flex flex-wrap gap-1">
                <UBadge v-for="tag in p.tags?.slice(0, 3)" :key="tag" size="xs" variant="soft" >
                  {{ tag }}
                </UBadge>
              </div>
              <span class="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
<!--                {{ p.createdAt ? formatDate(p.createdAt) : '2024' }}-->
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else class="text-center py-20 flex flex-col items-center">
        <UIcon name="i-heroicons-folder-open" class="w-12 h-12 text-gray-300 mb-4" />
        <p class="text-gray-500 text-lg">Aucun projet trouvé pour le moment.</p>
        <UButton to="/dashboard/projects/add" variant="link">Créer ton premier projet</UButton>
      </UCard>
    </section>
  </UContainer>
</template>