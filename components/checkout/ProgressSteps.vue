<script setup lang="ts">
/**
 * Checkout Progress Steps
 * 
 * Visual indicator showing checkout progress:
 * - Step 1: Address
 * - Step 2: Shipping
 * - Step 3: Payment
 */

interface Props {
  completedSteps: number
  isIndustryTheme?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false,
})

const steps = [
  { number: 1, label: 'Adresse' },
  { number: 2, label: 'Versand' },
  { number: 3, label: 'Zahlung' },
]
</script>

<template>
  <div class="max-w-3xl mx-auto mb-8">
    <div class="flex items-center justify-between">
      <template v-for="(step, index) in steps" :key="step.number">
        <!-- Step -->
        <div class="flex items-center">
          <div 
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              completedSteps >= step.number 
                ? (isIndustryTheme ? 'bg-blue-600 text-white' : 'bg-stone-900 text-white')
                : (isIndustryTheme ? 'bg-slate-700 text-slate-400' : 'bg-stone-200 text-stone-500')
            ]"
          >
            <svg v-if="completedSteps >= step.number" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>{{ step.number }}</span>
          </div>
          <span 
            :class="[
              'ml-2 text-sm hidden sm:inline',
              completedSteps >= step.number 
                ? (isIndustryTheme ? 'text-white' : 'text-stone-900')
                : (isIndustryTheme ? 'text-slate-400' : 'text-stone-500')
            ]"
          >
            {{ step.label }}
          </span>
        </div>

        <!-- Connector (not after last step) -->
        <div 
          v-if="index < steps.length - 1"
          :class="[
            'flex-1 h-0.5 mx-4',
            completedSteps >= step.number + 1 
              ? (isIndustryTheme ? 'bg-blue-600' : 'bg-stone-900')
              : (isIndustryTheme ? 'bg-slate-700' : 'bg-stone-200')
          ]"
        />
      </template>
    </div>
  </div>
</template>
