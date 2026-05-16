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
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  options: Option[]
  explanation?: string
  content?: string
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
const isCorrect = ref(false)
const currentShuffledOptions = ref<any[]>([])
const slideDirection = ref<'next' | 'prev'>('next')

const currentQuestion = computed(() => props.questions[currentIndex.value])

// Dynamic Colors based on JS/TS
const technology = computed(() => {
  const label = props.topicLabel.toUpperCase()
  if (label.includes('TS') || label.includes('TYPESCRIPT')) return 'TS'
  return 'JS'
})

const dynamicColors = computed(() => {
  if (technology.value === 'TS') {
    return {
      primary: 'oklch(72% 0.14 200)',
      primaryRgb: '56, 189, 248',
      glow: 'rgba(56, 189, 248, 0.2)'
    }
  }
  return {
    primary: 'oklch(78% 0.18 85)',
    primaryRgb: '251, 191, 36',
    glow: 'rgba(251, 191, 36, 0.2)'
  }
})

function updateShuffledOptions() {
  const current = props.questions[currentIndex.value]
  if (!current) return

  const labels = ['A', 'B', 'C', 'D']
  const shuffled = [...current.options].slice(0, 4).sort(() => Math.random() - 0.5)
  
  currentShuffledOptions.value = shuffled.map((option, index) => ({
    ...option,
    label: labels[index] || option.label
  }))

  const existingAnswer = answers.value.find(a => a.questionId === current.id)
  if (existingAnswer) {
    selectedOptionId.value = existingAnswer.selectedOptionId
    answered.value = true
    isCorrect.value = existingAnswer.isCorrect
  } else {
    selectedOptionId.value = null
    answered.value = false
    isCorrect.value = false
  }
}

watch(() => currentIndex.value, updateShuffledOptions, { immediate: true })

const selectOption = (option: any) => {
  if (answered.value) return
  
  selectedOptionId.value = option.id
  answered.value = true
  isCorrect.value = option.isCorrect
  
  const answer = {
    questionId: currentQuestion.value.id,
    selectedOptionId: option.id,
    isCorrect: option.isCorrect
  }
  
  answers.value.push(answer)
  emit('answer-submitted', answer)
}

const goNext = () => {
  if (!answered.value) return
  slideDirection.value = 'next'
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
  } else {
    emit('quiz-finished', { answers: answers.value })
  }
}

// Fixed viewport handling: Ensure content fits
const mainHeight = ref('auto')
onMounted(() => {
  // Mobile browser height fix
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
})
</script>

<template>
  <div 
    class="assessment-viewport flex flex-col h-full"
    :style="{ 
      '--dynamic-primary': dynamicColors.primary,
      '--dynamic-primary-rgb': dynamicColors.primaryRgb,
      '--dynamic-glow': dynamicColors.glow
    }"
  >
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <span class="tech-indicator h-2 w-2 rounded-full animate-pulse" :style="{ backgroundColor: dynamicColors.primary }"></span>
        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[--color-text-primary]">{{ technology }}</span>
      </div>
      <div class="progress-pill glass flex items-center gap-3 px-3 py-1 rounded-full border border-white/10">
        <span class="text-[10px] font-mono font-black text-[--color-text-primary]">
          {{ currentIndex + 1 }} <span class="opacity-20">/</span> {{ questions.length }}
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative flex flex-col p-4 md:p-8 overflow-y-auto min-h-0 pb-12">
      <transition :name="slideDirection === 'next' ? 'slide-next' : 'slide-prev'" mode="out-in">
        <div :key="currentIndex" class="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full min-h-0">
          
          <!-- Challenge Card / Review Card (Transformable) -->
          <div class="flex-none transition-all duration-700 ease-in-out min-h-0">
            <div class="relative w-full perspective-1000">
              <transition name="flip" mode="out-in">
                <!-- Question Card -->
                <div v-if="!(answered && !isCorrect)" key="question" class="challenge-card glass-strong rounded-[2rem] p-8 md:p-10 flex flex-col border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                  <div class="mb-6 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="h-1 w-8 rounded-full" :style="{ backgroundColor: dynamicColors.primary }"></span>
                      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[--color-text-muted]">Escenario Técnico</span>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-[--dynamic-primary]/30 text-[--dynamic-primary] bg-[--dynamic-primary]/5">{{ currentQuestion.difficulty }}</span>
                  </div>
                  <div class="pt-4 pr-2">
                    <div class="text-xl md:text-2xl font-black leading-[1.15] tracking-tight text-[--color-text-primary] mb-2">
                      <MarkdownRenderer :content="currentQuestion.text" />
                    </div>
                  </div>
                </div>

                <!-- Review Card (Concept Reveal) -->
                <div v-else key="review" class="review-card rounded-[2rem] p-8 md:p-10 flex flex-col border border-[--dynamic-primary]/40 bg-[--dynamic-primary]/10 shadow-[0_0_60px_rgba(var(--dynamic-primary-rgb),0.15)] relative">
                   <!-- Decorative Glow -->
                   <div class="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px]" :style="{ backgroundColor: dynamicColors.primary, opacity: 0.2 }"></div>
                   
                  <div class="mb-6 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[--dynamic-primary]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[--dynamic-primary]">Fase de Nivelación</span>
                  </div>
                  <div class="flex flex-col justify-center">
                    <h3 class="text-3xl md:text-4xl font-black tracking-tighter text-[--color-text-primary] mb-4 leading-none">{{ currentQuestion.title }}</h3>
                    <div class="h-px w-12 bg-[--dynamic-primary] mb-6 opacity-50"></div>
                    <p class="text-base md:text-lg leading-relaxed text-[--color-text-secondary] font-medium">
                      {{ currentQuestion.content }}
                    </p>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Options Section -->
          <div class="flex-1 flex flex-col gap-3 min-h-0">
            <div class="grid gap-3 pb-6 px-1">
              <button
                v-for="option in currentShuffledOptions"
                :key="option.id"
                class="assessment-option group relative flex items-center gap-5 p-5 rounded-2xl border border-white/5 transition-all duration-400 cursor-pointer active:scale-[0.98]"
                :class="[
                  !answered 
                    ? 'hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]' 
                    : (selectedOptionId === option.id 
                        ? (option.isCorrect ? 'is-correct' : 'is-wrong') 
                        : (option.isCorrect ? 'is-highlighted' : 'is-muted'))
                ]"
                :disabled="answered"
                @click="selectOption(option)"
              >
                <!-- Option Label -->
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-xs font-black text-[--color-text-muted] group-hover:text-[--dynamic-primary] group-hover:border-[--dynamic-primary]/40 transition-all duration-300">
                  {{ option.label }}
                </span>
                
                <span class="text-base font-bold tracking-tight leading-snug text-[--color-text-primary] group-hover:translate-x-1 transition-transform duration-300">
                  {{ option.text }}
                </span>

                <!-- Feedback Icon -->
                <div v-if="answered && (selectedOptionId === option.id || option.isCorrect)" class="ml-auto">
                   <svg v-if="option.isCorrect" class="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                     <path d="M20 6L9 17l-5-5"/>
                   </svg>
                   <svg v-else-if="selectedOptionId === option.id" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                     <path d="M18 6L6 18M6 6l12 12"/>
                   </svg>
                </div>
              </button>
            </div>

            <!-- Feedback Strip (Success) -->
            <transition name="fade">
              <div v-if="answered && isCorrect" class="feedback-strip glass rounded-2xl p-5 border border-green-500/20 bg-green-500/5 mt-auto">
                <div class="flex items-start gap-4">
                  <div class="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Insight Técnico</span>
                    <p class="text-sm text-[--color-text-secondary] leading-relaxed">
                      {{ currentQuestion.explanation }}
                    </p>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </main>

    <!-- Footer -->
    <footer class="px-8 py-6 bg-black/60 border-t border-white/5 backdrop-blur-2xl">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <div class="hidden md:flex flex-col gap-1">
           <span class="text-[10px] font-black uppercase tracking-widest text-[--color-text-muted] opacity-50">Siguiente hito</span>
           <span class="text-xs font-bold text-[--color-text-secondary]">Validación de Concepto {{ currentIndex + 2 > questions.length ? 'Final' : currentIndex + 2 }}</span>
        </div>
        
        <button
          class="cta-assessment group relative flex items-center gap-4 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] transition-all duration-500 disabled:opacity-0 disabled:translate-y-4"
          :class="answered ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:-translate-y-1' : 'bg-white/5 text-transparent'"
          :disabled="!answered"
          @click="goNext"
        >
          <span class="relative z-10">{{ currentIndex === questions.length - 1 ? 'Finalizar' : 'Continuar' }}</span>
          <svg class="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.assessment-viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.glass-strong {
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.assessment-option.is-correct {
  border-color: #22c55e88 !important;
  background: rgba(34, 197, 94, 0.1) !important;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
}

.assessment-option.is-wrong {
  border-color: #ef444488 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

.assessment-option.is-highlighted {
  border-color: #22c55e44 !important;
  background: rgba(34, 197, 94, 0.05) !important;
}

.assessment-option.is-muted {
  opacity: 0.3;
  filter: grayscale(1) blur(1px);
  transform: scale(0.98);
}

/* ── Transitions ──────────────────────────────────────────── */
.slide-next-enter-active, .slide-next-leave-active,
.slide-prev-enter-active, .slide-prev-leave-active {
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-next-enter-from { opacity: 0; transform: translateX(80px); filter: blur(10px); }
.slide-next-leave-to { opacity: 0; transform: translateX(-80px); filter: blur(10px); }

.slide-prev-enter-from { opacity: 0; transform: translateX(-80px); filter: blur(10px); }
.slide-prev-leave-to { opacity: 0; transform: translateX(80px); filter: blur(10px); }

.flip-enter-active { 
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); 
}
.flip-enter-from { 
  transform: rotateX(-120deg) scale(0.9); 
  opacity: 0; 
  filter: blur(20px);
}

.fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-enter-from { opacity: 0; transform: translateY(20px); }

.tech-indicator {
  box-shadow: 0 0 20px var(--dynamic-primary);
}

@media (max-width: 640px) {
  .assessment-viewport { padding-top: env(safe-area-inset-top); }
  .challenge-card { padding: 2rem; }
}
</style>
