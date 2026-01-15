<script setup lang="ts">
/**
 * FreeShippingProgress - Fortschrittsanzeige für kostenlosen Versand
 * ~40 Zeilen
 */

interface Props {
  amount: number
  progress: number
  formatPrice: (price: number) => string
  themeColors: {
    progressBg: string
    progressBarBg: string
    progressBar: string
    progressText: string
  }
}

defineProps<Props>()
</script>

<template>
  <div :class="['mb-6 p-3 rounded-lg', themeColors.progressBg]">
    <div class="flex items-center gap-2 mb-2">
      <svg :class="['w-5 h-5', themeColors.progressText]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      <span :class="['text-sm font-medium', themeColors.progressText]">
        Noch {{ formatPrice(amount) }} bis kostenloser Versand!
      </span>
    </div>
    <div :class="['h-2 rounded-full', themeColors.progressBarBg]">
      <div 
        :class="['h-full rounded-full transition-all duration-500', themeColors.progressBar]"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
