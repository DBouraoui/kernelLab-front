<script setup lang="ts">
import type { Project } from "~/interface/projects";

const config = useRuntimeConfig();
const openImage = ref(false);

const { data: projects, pending, error } = await useAsyncData<Project[]>(
    'projects-list',
    () => $fetch(`${config.public.apiBase}/api/projects?limit=10`)
);

const getImageUrl = (path: string) => {
  return `${config.public.apiBase}${path}`;
};

const getTagColor = (index: number) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
  return colors[index % colors.length];
};

const open = () =>{
  openImage.value = !openImage.value;
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Mes Projets
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Découvrez mes réalisations et expérimentations
        </p>
      </div>

      <!-- Chargement avec skeleton -->
      <div v-if="pending">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <USkeleton v-for="i in 6" :key="i" class="h-80 rounded-xl" />
        </div>
      </div>

      <!-- Erreur avec UAlert -->
      <UAlert
          v-else-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          title="Erreur de chargement"
          description="Impossible de récupérer les projets. Veuillez réessayer."
          class="mb-6"
      />

      <!-- Liste des projets -->
      <template v-else-if="projects && projects.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
              v-for="project in projects"
              :key="project.id"
              class="hover:shadow-xl transition-all duration-300"
              :ui="{
              body: { padding: 'p-0' },
              header: { padding: 'px-6 py-4' },
              footer: { padding: 'px-6 py-4' }
            }"
          >
            <!-- Image principale -->
            <template #header>
              <div class="relative overflow-hidden rounded-t-lg h-48 bg-gray-200 dark:bg-gray-800">
                <LazyNuxtImg
                    v-if="project.pictures && project.pictures.length"
                    :src="getImageUrl(project.pictures[0])"
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-500 cursor-zoom-in"
                    @click="open"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
                </div>

                <UModal v-model:open="openImage" fullscreen>
                  <template #body >
                    <div>
                    <LazyNuxtImg   :src="getImageUrl(project.pictures[0])" :alt="project.title" />
                    </div>
                  </template>
                </UModal>

                <!-- Badge featured -->
                <UBadge
                    v-if="project.featured"
                    color="primary"
                    variant="solid"
                    class="absolute top-3 right-3"
                    size="xs"
                >
                  <UIcon name="i-heroicons-star-solid" class="w-3 h-3 mr-1" />
                  Featured
                </UBadge>
              </div>
            </template>

            <!-- Contenu -->
            <div class="px-6 py-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ project.title }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                {{ project.description }}
              </p>

              <!-- Tags -->
              <div v-if="project.tags && project.tags.length" class="flex flex-wrap gap-2">
                <UBadge
                    v-for="(tag, index) in project.tags.slice(0, 3)"
                    :key="tag"
                    :color="getTagColor(index)"
                    variant="soft"
                    size="xs"
                >
                  {{ tag }}
                </UBadge>
                <UBadge
                    v-if="project.tags.length > 3"
                    color="gray"
                    variant="soft"
                    size="xs"
                >
                  +{{ project.tags.length - 3 }}
                </UBadge>
              </div>
            </div>

            <!-- Footer avec Slideover -->
            <template #footer>
              <div class="flex items-center justify-between">
                <UBadge color="gray" variant="subtle" size="xs">
                  {{ project.type || 'Projet' }}
                </UBadge>

                <UDrawer
                    :title="project.title"
                    :description="project.description"
                    direction="right"
                >
                  <UButton
                      icon="i-heroicons-arrow-right"
                      size="xs"
                      color="primary"
                      variant="ghost"
                      class="cursor-pointer"
                      trailing
                  >
                    Voir plus
                  </UButton>

                  <!-- Carrousel d'images -->
                  <template #body>
                    <div class="space-y-6 w-[40rem]">
                      <div v-if="project.pictures && project.pictures.length" class="w-full px-10">
                        <UCarousel
                            v-slot="{ item }"
                            :items="project.pictures.map(p => getImageUrl(p))"
                            :ui="{
                            container: 'rounded-lg'
                          }"
                            arrows
                            indicators
                            fade
                        >
                          <NuxtImg
                              :src="item"
                              class="w-full h-80 object-cover rounded-lg"
                              :alt="project.title"
                          />
                        </UCarousel>
                      </div>

                      <!-- Description complète -->
                      <div v-if="project.content">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Description
                        </h3>
                        <div class="prose prose-primary dark:prose-invert max-w-none">

                          <MDC :value="project.content" />
                        </div>
                      </div>

                      <USeparator/>
                      <!-- Tags complets -->
                      <div v-if="project.tags && project.tags.length">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Technologies
                        </h3>
                        <div class="flex flex-wrap gap-2">
                          <UBadge
                              v-for="(tag, index) in project.tags"
                              :key="tag"
                              :color="getTagColor(index)"
                              variant="soft"
                          >
                            {{ tag }}
                          </UBadge>
                        </div>
                      </div>

                      <USeparator/>

                      <!-- Type et statut -->
                      <div class="flex gap-4">
                        <div v-if="project.type">
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Type de projet
                          </h3>
                          <UBadge color="primary" variant="subtle" class="ml-2">
                            {{ project.type }}
                          </UBadge>
                        </div>
                        <div v-if="project.featured">
                          <UBadge color="yellow" variant="soft">
                            <UIcon name="i-heroicons-star-solid" class="w-3 h-3 mr-1" />
                            Projet phare
                          </UBadge>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Footer avec liens -->
                  <template #footer>
                    <div class="flex gap-3">
                      <UButton
                          v-if="project.githubUrl"
                          :to="project.githubUrl"
                          target="_blank"
                          color="gray"
                          variant="soft"
                          icon="i-simple-icons-github"
                          block
                      >
                        GitHub
                      </UButton>
                      <UButton
                          v-if="project.webUrl"
                          :to="project.webUrl"
                          target="_blank"
                          color="primary"
                          icon="i-heroicons-arrow-top-right-on-square"
                          block
                      >
                        Voir le site
                      </UButton>
                    </div>
                  </template>
                </UDrawer>
              </div>
            </template>
          </UCard>
        </div>
      </template>

      <!-- État vide -->
      <UCard v-else class="text-center">
        <div class="py-12">
          <UIcon name="i-heroicons-folder-open" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun projet disponible
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Les projets apparaîtront ici une fois ajoutés.
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>