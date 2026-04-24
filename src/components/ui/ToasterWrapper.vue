<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { useTheme } from '../../composables/useTheme'

const { theme, init } = useTheme()
onMounted(init)
</script>

<template>
  <Toaster position="bottom-right" :theme="theme" rich-colors />
</template>
