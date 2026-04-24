import type { Badge, BadgeConditionContext } from '../types/app'
import type { BadgeConditionJson } from '../types/database'

function meetsCondition(condition: BadgeConditionJson, ctx: BadgeConditionContext): boolean {
  switch (condition.type) {
    case 'first_correct': return ctx.correctAnswers >= 1
    case 'correct_streak': return ctx.correctStreak >= condition.threshold
    case 'total_reviewed': return ctx.totalReviewed >= condition.threshold
    case 'daily_streak': return ctx.currentStreak >= condition.threshold
    case 'topic_mastery': {
      const tp = ctx.topicProgress[condition.topic]
      return !!tp && tp.reviewed >= tp.total && tp.total > 0
    }
    case 'total_correct': return ctx.correctAnswers >= condition.threshold
    case 'perfect_session':
      return ctx.sessionTotal >= condition.min_cards && ctx.sessionCorrect === ctx.sessionTotal
    case 'all_cards_mastery':
      return Object.values(ctx.topicProgress).every(tp => tp.reviewed >= tp.total && tp.total > 0)
    default: return false
  }
}

export function evaluateBadgeConditions(
  context: BadgeConditionContext,
  unlockedBadgeIds: string[],
  allBadges: Badge[]
): Badge[] {
  const unlockedSet = new Set(unlockedBadgeIds)
  return allBadges.filter(badge => !unlockedSet.has(badge.id) && meetsCondition(badge.condition, context))
}
