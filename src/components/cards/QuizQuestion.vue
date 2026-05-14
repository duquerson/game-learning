<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import MarkdownRenderer from '../ui/MarkdownRenderer.vue'

interface Option {
  id: string
  label: 'A' | 'B' | 'C' | 'D'
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  options: Option[]
  explanation?: string
}

const props = defineProps<{
  questions: Question[]
  topicLabel: string
}>()

const emit = defineEmits<{
  (e: 'quiz-finished', payload: { answers: any[] }): void
  (e: 'answer-submitted', payload: { questionId: string, isCorrect: boolean, optionId: string }): void
}>()

// Internal state
const currentIndex = ref(0)
const answers = ref<any[]>([])
const selectedOptionId = ref<string | null>(null)
const answered = ref(false)
const currentShuffledOptions = ref<any[]>([])

const currentQuestion = computed(() => props.questions[currentIndex.value])

// Functional Fix: Randomize options and reassign letters A-D exactly once per question
function updateShuffledOptions() {
  const current = props.questions[currentIndex.value]
  if (!current) return

  const labels = ['A', 'B', 'C', 'D']
  const shuffled = [...current.options].sort(() => Math.random() - 0.5)
  
  currentShuffledOptions.value = shuffled.map((option, index) => ({
    ...option,
    label: labels[index] || option.label
  }))

  const existingAnswer = answers.value.find(a => a.questionId === current.id)
  if (existingAnswer) {
    selectedOptionId.value = existingAnswer.selectedOptionId
    answered.value = true
  } else {
    selectedOptionId.value = null
    answered.value = false
  }
}

watch(() => currentIndex.value, updateShuffledOptions, { immediate: true })
watch(() => props.questions, updateShuffledOptions)

const selectOption = (option: any) => {
  if (answered.value) return
  
  selectedOptionId.value = option.id
  answered.value = true
  
  const answer = {
    questionId: currentQuestion.value.id,
    selectedOptionId: option.id,
    isCorrect: option.isCorrect
  }
  
  const existingIdx = answers.value.findIndex(a => a.questionId === answer.questionId)
  if (existingIdx >= 0) {
    answers.value[existingIdx] = answer
  } else {
    answers.value.push(answer)
  }

  emit('answer-submitted', answer)
}

const goPrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goNext = () => {
  if (!answered.value) return

  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
  } else {
    emit('quiz-finished', { answers: answers.value })
  }
}
</script>

<template>
  <div class="quiz-session flex flex-col gap-6 px-4 py-6 sm:py-8">
    <!-- Header / Progress (Premium UI Restored) -->
    <header class="flex flex-col gap-3">
      <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[--color-text-muted]">
        <span class="flex items-center gap-2">
          <span class="h-1 w-1 rounded-full bg-[--color-primary] shadow-[0_0_8px_var(--color-primary)]"></span>
          {{ topicLabel }}
        </span>
        <span>{{ currentIndex + 1 }} / {{ questions.length }}</span>
      </div>
      
      <div class="h-1 overflow-hidden rounded-full bg-[--glass-border]">
        <div class="h-full rounded-full bg-gradient-to-r from-[--color-primary] to-[--color-accent] shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all duration-500 ease-out"
          :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }" />
      </div>
    </header>

    <main class="flex flex-col gap-6 min-h-[60vh]">
      <!-- Question Card (Premium UI with Difficulty Badge Restored) -->
      <div class="glass relative overflow-hidden rounded-2xl p-8 shadow-2xl">
        <div class="relative z-10">
          <div class="mb-3 flex items-center gap-2">
            <span 
              class="h-1.5 w-1.5 rounded-full" 
              :class="{
                'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]': currentQuestion.difficulty === 'easy',
                'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]': currentQuestion.difficulty === 'medium',
                'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]': currentQuestion.difficulty === 'hard',
              }"
            ></span>
            <span class="text-[10px] font-black uppercase tracking-[0.15em] text-[--color-text-muted]">
              {{ currentQuestion.difficulty }} · 30s
            </span>
          </div>
          <h2 class="text-xl font-bold leading-tight tracking-tight text-[--color-text-primary] sm:text-2xl">
            <MarkdownRenderer :content="currentQuestion.text" />
          </h2>
        </div>
        <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[--color-primary] opacity-[0.05] blur-3xl"></div>
      </div>

      <!-- Options Grid (Premium UI + Functional Fix) -->
      <div class="grid gap-3">
        <button
          v-for="option in currentShuffledOptions"
          :key="option.id"
          class="option-btn touch-target btn-tactile group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all"
          :class="[
            !answered 
              ? 'is-idle' 
              : (selectedOptionId === option.id ? (option.isCorrect ? 'is-correct' : 'is-wrong') : 'is-muted')
          ]"
          :disabled="answered"
          @click="selectOption(option)"
        >
          <span class="option-index flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[--glass-border] bg-white/5 font-mono text-xs font-bold text-[--color-text-muted] transition-colors group-hover:border-[--color-primary]">
            {{ option.label }}
          </span>
          <span class="flex-1 text-sm font-semibold leading-snug">{{ option.text }}</span>
          
          <div v-if="answered && selectedOptionId === option.id" class="shrink-0">
            <svg v-if="option.isCorrect" class="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Feedback Area (Explanation Restored) -->
      <div v-if="answered" class="animate-slide-up mt-2">
        <div class="rounded-2xl border border-[--glass-border] bg-[--glass-bg] p-5 shadow-inner">
          <div class="mb-2 flex items-center gap-2">
            <span v-if="selectedOptionId === currentShuffledOptions.find(o => o.isCorrect)?.id" class="text-xs font-bold text-green-400">✅ Correcto</span>
            <span v-else class="text-xs font-bold text-red-400">❌ Incorrecto</span>
          </div>
          <div v-if="currentQuestion.explanation" class="line-clamp-2 text-xs leading-relaxed text-[--color-text-secondary]">
            <MarkdownRenderer :content="currentQuestion.explanation" />
          </div>
        </div>
      </div>
    </main>

    <!-- Navigation (Premium UI) -->
    <footer class="mt-auto flex items-center justify-between border-t border-[--glass-border] pt-6 opacity-80 hover:opacity-100 transition-opacity">
      <button
        class="nav-btn btn-tactile flex items-center gap-2 px-3 py-2 text-sm font-bold text-[--color-text-muted] transition-all hover:text-[--color-text-primary] disabled:opacity-0"
        :disabled="currentIndex === 0"
        @click="goPrev"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Anterior
      </button>

      <button
        class="nav-btn btn-tactile flex items-center gap-3 rounded-xl bg-[--color-primary] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)] transition-all hover:bg-[--color-accent] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] active:scale-95 disabled:opacity-20 disabled:grayscale"
        :disabled="!answered"
        @click="goNext"
      >
        <span>{{ currentIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente' }}</span>
        <svg v-if="currentIndex !== questions.length - 1" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.option-btn {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: var(--color-text-primary);
  min-height: 72px;
}

.option-btn.is-idle:hover {
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(6px);
}

/* Premium OKLCH Colors for feedback */
.option-btn.is-correct {
  background-color: rgba(74, 222, 128, 0.15) !important;
  border-color: #4ade80 !important;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.1);
}

.option-btn.is-wrong {
  background-color: rgba(248, 113, 113, 0.15) !important;
  border-color: #f87171 !important;
}

.option-btn.is-muted {
  opacity: 0.4;
  filter: grayscale(0.5);
}

.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .option-btn {
    min-height: 64px;
    padding: 1rem;
  }
}
</style>
