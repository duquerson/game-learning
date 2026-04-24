import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  async function init() {
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      session.value = s
      user.value = s?.user ?? null
    } catch {
      // Errors are handled server-side; keep client output generic and silent.
    } finally {
      loading.value = false
    }

    supabase.auth.onAuthStateChange((_event, s) => {
      session.value = s
      user.value = s?.user ?? null
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
    window.location.href = '/login'
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
