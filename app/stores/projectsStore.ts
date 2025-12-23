import {defineStore} from 'pinia'

export const useProjectStore = defineStore('projects', {
    state: () => ({
        projects: [] as any[],
        currentProject: null as any | null,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        saasProjects: (state) => state.projects.filter(p => p.type === 'saas'),
        openSourceProjects: (state) => state.projects.filter(p => p.type === 'open-source'),

        getProjectBySlug: (state) => {
            return (slug: string) => state.projects.find(p => p.slug === slug)
        }
    },

    actions: {
        // 1. Récupérer tous les projets (pour la liste)
        async fetchProjects() {
            this.loading = true
            try {
                const config = useRuntimeConfig()
                this.projects = await $fetch(`${config.public.apiBase}/api/projects?limit=10`)
            } catch (err: any) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        // 2. Récupérer un projet spécifique (pour le détail ou l'admin)
        async fetchProjectBySlug(slug: string) {
            this.loading = true
            try {
                const config = useRuntimeConfig()
                this.currentProject = await $fetch(`${config.public.apiBase}/api/project/${slug}`)
            } catch (err: any) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },
        // 2. Récupérer un projet spécifique par ID (pour le détail ou l'admin)
        async fetchProjectById(id: string) {
            this.loading = true
            try {
                const config = useRuntimeConfig()
                const data = await $fetch<any>(`${config.public.apiBase}/api/project/id/${id}`)

                this.currentProject = data // On stocke dans le state
                return data // ✅ TRÈS IMPORTANT : On retourne la donnée pour le composant !
            } catch (err: any) {
                this.error = err.message
                throw err // On propage l'erreur pour le catch du composant
            } finally {
                this.loading = false
            }
        },

        // 3. Ajouter un projet (appelle ton controller Symfony)
        async addProject(formData: FormData) {
            this.loading = true
            try {
                const config = useRuntimeConfig()
                const access_token = useCookie('access_token')
                const newProject = await $fetch(`${config.public.apiBase}/api/projects`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${access_token.value}`
                    },
                    body: formData
                })
                // On l'ajoute direct à la liste pour éviter un refresh
                this.projects.push(newProject)
                return newProject
                // eslint-disable-next-line no-useless-catch
            } catch (err: any) {
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateProject(formData: any) {
            this.loading = true
            try {
                const config = useRuntimeConfig()
                const access_token = useCookie('access_token')
                const newProject = await $fetch(`${config.public.apiBase}/api/project/edit`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${access_token.value}`
                    },
                    body: formData
                })
                return newProject
                // eslint-disable-next-line no-useless-catch
            } catch (err: any) {
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteProject(id: string | number) {
            this.loading = true
            try {
                const config = useRuntimeConfig()
                const access_token = useCookie('access_token')

                await $fetch(`${config.public.apiBase}/api/project/delete/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${access_token.value}`
                    },
                })

                this.projects = this.projects.filter(project => project.id !== id && project.id.toString() !== id.toString())

                if (this.currentProject?.id === id) {
                    this.currentProject = null
                }

                return true // Pour confirmer au composant que c'est ok
            } catch (err: any) {
                console.error('Erreur suppression store:', err)
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})