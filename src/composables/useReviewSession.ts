import { ref } from 'vue'
import { useReviewStore } from '../stores/review'

export function useReviewSession() {
  const store = useReviewStore()
  const isFlipped = ref(false)

  function flipCard() {
    isFlipped.value = true
  }

  async function handleAnswer(correct: boolean): Promise<boolean> {
    if (!store.currentCard) return false
    const saved = await store.submitAnswer(store.currentCard.id, correct, store.currentCard.difficulty)
    if (!saved) return false
    isFlipped.value = false
    return true
  }

  return { isFlipped, flipCard, handleAnswer }
}
