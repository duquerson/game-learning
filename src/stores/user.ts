/**
 * @deprecated useUserStore is not currently used in the application.
 * User data is managed through auth.ts (useAuthStore) and review.ts (useReviewStore).
 * This store was defined in the spec but implementation diverged.
 * Can be safely removed in the next refactor or reactivated if needed.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { UserStats, UserPreferences, UserBadge } from '../types/app'

export const useUserStore = defineStore('user', () => {
  const stats = ref<UserStats | null>(null)
  const preferences = ref<UserPreferences | null>(null)
  const badges = ref<UserBadge[]>([])

  async function loadUserData(userId: string) {
    const [statsRes, prefsRes, badgesRes] = await Promise.all([
      supabase.from('user_stats').select('*').eq('user_id', userId).single(),
      supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      supabase.from('user_badges').select('*').eq('user_id', userId),
    ])

    if (statsRes.data) {
      const d = statsRes.data
      stats.value = {
        totalPoints: d.total_points,
        currentStreak: d.current_streak,
        longestStreak: d.longest_streak,
        lastStudyDate: d.last_study_date ?? null,
      }
    }

    if (prefsRes.data) {
      const d = prefsRes.data
      preferences.value = {
        selectedTopics: d.selected_topics,
        onboardingCompleted: d.onboarding_completed,
      }
    }

    if (badgesRes.data) {
      badges.value = badgesRes.data.map((d) => ({
        badgeId: d.badge_id,
        unlockedAt: d.unlocked_at,
      }))
    }
  }

  function updateStats(partial: Partial<UserStats>) {
    if (stats.value) {
      stats.value = { ...stats.value, ...partial }
    } else {
      stats.value = partial as UserStats
    }
  }

  function addBadge(badge: UserBadge) {
    badges.value.push(badge)
  }

  return { stats, preferences, badges, loadUserData, updateStats, addBadge }
})
