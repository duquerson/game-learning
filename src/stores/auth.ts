import { defineStore } from 'pinia'
import { ref } from 'vue'
import { actions } from 'astro:actions'
import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== 'undefined' ? (import.meta.env.PUBLIC_SUPABASE_URL || '') : ''
const supabaseAnonKey = typeof window !== 'undefined' ? (import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '') : ''

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, { 
      auth: { 
        persistSession: true,
        autoRefreshToken: true 
      } 
    }) 
  : null

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  async function init() {
    try {
      if (!supabase) {
        loading.value = false
        return
      }
      const { data: { session: s } } = await supabase.auth.getSession()
      session.value = s
      user.value = s?.user ?? null
    } catch {
      // Errors are handled server-side; keep client output generic and silent.
    } finally {
      loading.value = false
    }

    supabase?.auth.onAuthStateChange((_event, s) => {
      session.value = s
      user.value = s?.user ?? null
    })
  }

  async function logout() {
    let serverLogoutDone = false
    
    try {
      // 1. PRIMERO: Llamar al servidor para invalidar la sesión en Supabase
      const result = await actions.auth.logout()
      serverLogoutDone = true
      
      if (!result.data?.success) {
        console.warn('Server logout returned:', result.data)
      }
    } catch (err) {
      console.error('Server logout failed:', err)
      // Continuar de todos modos - el cliente limpiará todo
    }
    
    // Solo navegar después de que el servidor responda
    if (serverLogoutDone) {
      // 2. Limpiar estado local
      session.value = null
      user.value = null
      
      // 3. Limpiar localStorage
      localStorage.removeItem('supabase.auth.token')
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // 4. Limpiar cookies del navegador
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const cookieName = cookie.split('=')[0].trim()
          if (cookieName.startsWith('sb-')) {
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        }
      }
      
      // 5. Forzar logout del cliente de Supabase
      if (supabase) {
        supabase.auth.signOut()
      }
      
      // 6. Navegar a login solo después de todo lo anterior
      window.location.href = '/login'
    }
  }

  function setUser(newUser: User | null, newSession: Session | null) {
    user.value = newUser
    session.value = newSession
  }

  function clearUser() {
    user.value = null
    session.value = null
  }

  return { user, session, loading, init, logout, setUser, clearUser }
})
