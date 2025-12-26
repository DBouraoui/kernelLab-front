<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

// --- 1. SCHÉMAS SÉPARÉS ---
const proSchema = z.object({
  company: z.string().min(2, 'Nom de société requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  link: z.string().optional(),
  subject: z.string({ required_error: 'Sélectionnez un motif' }),
  budget: z.string().optional(),
  message: z.string().min(10, 'Le message doit être plus détaillée'),
  honeyPot: z.string().optional(),
})

const userSchema = z.object({
  firstname: z.string().min(2, 'Prénom requis'),
  lastname: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  subject: z.string({ required_error: 'Sélectionnez un motif' }),
  link: z.string().optional(),
  message: z.string().min(10, 'Dites-m\'en un peu plus'),
  honeyPot: z.string().optional(),
})

// Types déduits
type ProSchema = z.output<typeof proSchema>
type UserSchema = z.output<typeof userSchema>

// --- 2. ÉTATS SÉPARÉS (Plus propre) ---
const statePro = reactive({
  company: undefined,
  email: undefined,
  phone: undefined,
  link: undefined,
  subject: undefined,
  budget: undefined,
  message: undefined,
  honeyPot: undefined,
})

const stateUser = reactive({
  firstname: undefined,
  lastname: undefined,
  email: undefined,
  subject: undefined,
  link: undefined,
  message: undefined,
  honeyPot: undefined,
})

const toast = useToast()
const config = useRuntimeConfig()

// On crée une variable de chargement pour chaque formulaire
const pendingPro = ref(false)
const pendingUser = ref(false)

async function onSubmitPro(event: FormSubmitEvent<ProSchema>) {
  if (pendingPro.value) return // Sécurité anti-double clic

  // 1. Détection HoneyPot
  if (event.data.honeyPot && event.data.honeyPot.length > 0) {
    toast.add({ title: "Succès", description: "Votre demande a bien été transmise (lol)", color: "success" })
    // On vide quand même le form pour faire propre
    Object.assign(statePro, { firstname: '', lastname: '', email: '', message: '', company: '', phone: '', subject: '', honeyPot: '' })
    return
  }

  pendingPro.value = true // On bloque le bouton

  try {
    await $fetch(`${config.public.apiBase}/api/contact`, {
      method: "POST",
      body: event.data
    })

    toast.add({ title: "Succès", description: "Votre demande de contact a bien été transmise.", color: "success" })

    // 2. NETTOYAGE DU FORMULAIRE (on remet l'objet à zéro)
    // Remplace 'statePro' par le nom de ta variable reactive
    Object.assign(statePro, {
      firstname: '',
      lastname: '',
      company: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      honeyPot: ''
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    toast.add({ title: "Erreur", description: "Une erreur est survenue.", color: "error" })
  } finally {
    pendingPro.value = false // On débloque le bouton
  }
}

async function onSubmitUser(event: FormSubmitEvent<UserSchema>) {
  if (pendingUser.value) return

  if (event.data.honeyPot && event.data.honeyPot.length > 0) {
    toast.add({ title: "Succès", description: "Votre demande a bien été transmise (lol)", color: "success" })
    Object.assign(stateUser, { firstname: '', lastname: '', email: '', message: '', honeyPot: '' })
    return
  }

  pendingUser.value = true

  try {
    await $fetch(`${config.public.apiBase}/api/contact`, {
      method: "POST",
      body: event.data
    })

    toast.add({ title: "Succès", description: "Votre demande de contact a bien été transmise.", color: "success" })

    // 2. NETTOYAGE DU FORMULAIRE
    // Remplace 'stateUser' par ton objet reactive
    Object.assign(stateUser, {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      honeyPot: ''
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    toast.add({ title: "Erreur", description: "Une erreur est survenue.", color: "error" })
  } finally {
    pendingUser.value = false
  }
}

// --- DATA ---
const items = [
  { label: 'Je suis un professionnel', icon: 'i-lucide-shield-user', slot: "pro" },
  { label: 'Je suis un particulier', icon: 'i-lucide-user', slot: "user" }
]

const itemSelectedPro = [
  { label: 'Mission Freelance (Nouveau projet)', value: 'freelance_new' },
  { label: 'Mission Freelance (Projet Legacy)', value: 'freelance_old' },
  { label: 'Renfort d\'équipe (Staff Augmentation)', value: 'staff_aug' },
  { label: 'Audit technique & Performance', value: 'audit' },
  { label: 'Partenariat commercial', value: 'partnership' },
  { label: 'Conférence / Formation / Workshop', value: 'speaking' },
  { label: 'Proposition de poste (CDI)', value: 'hiring' },
  { label: 'Autre chose ? (Décrivez la demande plus bas)', value: 'other' },
]



const itemSelectedUser = [
  { label: 'Demande de Mentorat / Coaching', value: 'mentoring' },
  { label: 'Feedback sur un projet personnel', value: 'feedback' },
  { label: 'Collaboration Open Source', value: 'open_source' },
  { label: 'Demande d\'interview / Podcast', value: 'media' },
  { label: 'Aide technique ponctuelle', value: 'support' },
  { label: 'Juste pour dire merci ! ☕️', value: 'thanks' },
  { label: 'Autre demande (Décrivez la demande plus bas)', value: 'other' },
]

const budgets = ['< 1000€', '1000€ - 5000€', '> 5000€', 'Non défini']
</script>

<template>
  <section class="min-h-screen py-16 flex justify-center items-center ">
    <div class="w-full max-w-4xl px-6">

      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          On lance un <span class="text-primary-500">projet</span> ? 🚀
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          Que vous soyez une entreprise ou un passionné, je suis à votre écoute.
        </p>
      </div>

      <UTabs :items="items" class="w-full" :ui="{ list: { marker: { shadow: 'shadow-sm' } } }">

        <template #pro>
          <UForm :state="statePro" :schema="proSchema" class="flex flex-col gap-5 mt-8 p-6 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl" @submit="onSubmitPro">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Nom de la société" name="companyName" required>
                <UInput v-model="statePro.company" placeholder="Acme Corp" class="w-full" size="lg" />
              </UFormField>
              <UFormField label="Email Pro" name="email" required>
                <UInput v-model="statePro.email" placeholder="nom@entreprise.fr" type="email" class="w-full" size="lg" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Téléphone" name="phone" hint="Optionnel">
                <UInput v-model="statePro.phone" placeholder="06 xx xx xx xx" class="w-full" size="lg" />
              </UFormField>
              <UFormField label="Site Web" name="website" hint="Optionnel">
                <UInput v-model="statePro.link" placeholder="https://" class="w-full" size="lg" />
              </UFormField>
            </div>

            <UFormField label="Quel est votre besoin ?" name="reason" required>
              <USelect v-model="statePro.subject" :items="itemSelectedPro"  class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Budget" name="budget" hint="Optionnel">
              <USelect v-model="statePro.budget" :items="budgets" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Détails du projet" name="description" required>
              <UTextarea v-model="statePro.message" placeholder="Décrivez votre vision..." class="w-full" :rows="4" />
            </UFormField>

            <UFormField label="honey pot" name="honeypot" hidden="">
              <UInput v-model="statePro.honeyPot" />
            </UFormField>

            <UButton type="submit" icon="i-lucide-rocket" block size="xl" class="mt-4 font-bold transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer">
              Lancer ma demande Business
            </UButton>
          </UForm>
        </template>

        <template #user>
          <UForm :state="stateUser" :schema="userSchema" class="flex flex-col gap-5 mt-8 p-6 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl" @submit="onSubmitUser">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Prénom" name="firstName" required>
                <UInput v-model="stateUser.firstname" placeholder="Jean" class="w-full" size="lg" />
              </UFormField>
              <UFormField label="Nom" name="lastName" required>
                <UInput v-model="stateUser.lastname" placeholder="Dupont" class="w-full" size="lg" />
              </UFormField>
            </div>

            <UFormField label="Email" name="email" required>
              <UInput v-model="stateUser.email" placeholder="jean.dupont@gmail.com" type="email" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Sujet de votre message" name="reason" required>
              <USelect v-model="stateUser.subject" :items="itemSelectedUser" option-attribute="label" value-attribute="value" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Lien Portfolio ou Github" name="socialLink" hint="Optionnel">
              <UInput v-model="stateUser.link" placeholder="https://github.com/..." class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Votre message" name="description" required>
              <UTextarea v-model="stateUser.message" placeholder="Dites-moi tout !" class="w-full" :rows="4" />
            </UFormField>

            <UFormField label="honey pot" name="honeypot" hidden>
              <UInput v-model="stateUser.honeyPot" />
            </UFormField>

            <UButton type="submit" icon="i-lucide-send" block size="xl"   class="mt-4 font-bold transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer">
              Envoyer mon message
            </UButton>

          </UForm>
        </template>

      </UTabs>
    </div>
  </section>
</template>