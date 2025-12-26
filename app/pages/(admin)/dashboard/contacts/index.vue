<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type {ContactType} from "~/interface/contact";

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')


definePageMeta({
  title: 'Mes contacts',
  middleware: ['auth'],
  layout: "dashboard-layout"
})

const config = useRuntimeConfig()
const access_token = useCookie('access_token')

const { data: contacts, pending, refresh } = await useAsyncData<ContactType[]>(
    'contacts-list-admin',
    () => $fetch(`${config.public.apiBase}/api/contact`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token.value}`
      },
    }),
    { default: () => [] }
)

const isOpen = ref(false)
const selected = ref<ContactType | null>(null)
const searchQuery = ref('')

function viewContact(contact: ContactType) {
  selected.value = contact
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
  selected.value = null
}

// Filtrage des données
const filteredContacts = computed(() => {
  if (!contacts.value) return []

  if (!searchQuery.value) return contacts.value

  const search = searchQuery.value.toLowerCase()
  return contacts.value.filter(contact =>
      contact.email.toLowerCase().includes(search) ||
      contact.subject.toLowerCase().includes(search) ||
      contact.firstname?.toLowerCase().includes(search) ||
      contact.lastname?.toLowerCase().includes(search) ||
      contact.company?.toLowerCase().includes(search)
  )
})

// Définition des colonnes avec les fonctions h()
const columns: TableColumn<ContactType>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => {
      const firstname = row.original.firstname || ''
      const lastname = row.original.lastname || ''
      return [firstname, lastname].filter(Boolean).join(' ') || '-'
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'company',
    header: 'Entreprise',
    cell: ({ row }) => row.original.company || '-'
  },
  {
    accessorKey: 'subject',
    header: 'Objet'
  },
  {
    accessorKey: 'pro',
    header: 'Type',
    cell: ({ row }) => {
      const color = row.original.pro ? 'blue' : 'gray'
      return h(UBadge, {
        color,
        variant: 'subtle'
      }, () => row.original.pro ? 'Professionnel' : 'Particulier')
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h(UButton, {
        icon: 'i-heroicons-eye',
        size: 'xs',
        color: 'gray',
        variant: 'ghost',
        onClick: () => viewContact(row.original)
      })
    }
  }
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Mes contacts
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez vos demandes de contact
        </p>
      </div>
      <UButton
          icon="i-heroicons-arrow-path"
          @click="refresh()"
          :loading="pending"
          variant="outline"
      >
        Actualiser
      </UButton>
    </div>

    <!-- Barre de recherche et statistiques -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <UCard class="lg:col-span-3">
        <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher un contact..."
            size="lg"
        />
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-primary">
            {{ contacts?.length || 0 }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Contact{{ (contacts?.length || 0) > 1 ? 's' : '' }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Tableau des contacts -->
    <UCard>
      <UTable
          :data="filteredContacts"
          :columns="columns"
          :loading="pending"
          class="w-full"
      />
    </UCard>

    <!-- Modal de détails -->
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              Détails du contact
            </h3>
            <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                @click="closeModal"
            />
          </div>
        </template>

        <div v-if="selected" class="space-y-4">
          <!-- Informations personnelles -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selected.firstname || '-' }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selected.lastname || '-' }}
              </p>
            </div>
          </div>

          <!-- Contact -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                <a :href="`mailto:${selected.email}`" class="text-primary hover:underline">
                  {{ selected.email }}
                </a>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                <a v-if="selected.phone" :href="`tel:${selected.phone}`" class="text-primary hover:underline">
                  {{ selected.phone }}
                </a>
                <span v-else>-</span>
              </p>
            </div>
          </div>

          <!-- Entreprise -->
          <div v-if="selected.company">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Entreprise
            </label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selected.company }}
            </p>
          </div>

          <!-- Lien -->
          <div v-if="selected.link">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Site web
            </label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              <a :href="selected.link" target="_blank" class="text-primary hover:underline">
                {{ selected.link }}
              </a>
            </p>
          </div>

          <!-- Sujet -->
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Objet
            </label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selected.subject }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {{ selected.description }}
            </p>
          </div>

          <!-- Métadonnées -->
          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <UBadge :color="selected.pro ? 'blue' : 'gray'" variant="subtle">
              {{ selected.pro ? 'Professionnel' : 'Particulier' }}
            </UBadge>
            <span v-if="selected.budget" class="text-xs text-gray-500 dark:text-gray-400">
              Budget : {{ selected.budget }}
            </span>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="closeModal">
              Fermer
            </UButton>
            <UButton
                v-if="selected?.email"
                icon="i-heroicons-envelope"
                :to="`mailto:${selected.email}`"
                external
            >
              Répondre
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>