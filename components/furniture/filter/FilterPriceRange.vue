<script setup lang="ts">
/**
 * FilterPriceRange - Preis-Filter mit Min/Max Inputs
 * ~55 Zeilen
 */

interface Props {
  minPlaceholder?: number
  maxPlaceholder?: number
}

const props = withDefaults(defineProps<Props>(), {
  minPlaceholder: 0,
  maxPlaceholder: 1000
})

const emit = defineEmits<{
  change: [min: number | null, max: number | null]
}>()

const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)

const formatPriceDollars = (cents: number) => {
  return Math.round(cents / 100).toString()
}

const handleChange = () => {
  emit('change', priceMin.value, priceMax.value)
}

// Expose für Parent-Komponente
defineExpose({
  clear: () => {
    priceMin.value = null
    priceMax.value = null
  },
  getValues: () => ({
    min: priceMin.value ? priceMin.value * 100 : null,
    max: priceMax.value ? priceMax.value * 100 : null
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <label class="text-xs text-stone-500 mb-1 block">Min</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
          <input 
            v-model.number="priceMin"
            type="number"
            :placeholder="formatPriceDollars(minPlaceholder)"
            class="w-full pl-7 pr-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
            @change="handleChange"
          />
        </div>
      </div>
      <span class="text-stone-300 mt-5">—</span>
      <div class="flex-1">
        <label class="text-xs text-stone-500 mb-1 block">Max</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
          <input 
            v-model.number="priceMax"
            type="number"
            :placeholder="formatPriceDollars(maxPlaceholder)"
            class="w-full pl-7 pr-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
            @change="handleChange"
          />
        </div>
      </div>
    </div>
    
    <p class="text-xs text-stone-400">
      Range: ${{ formatPriceDollars(minPlaceholder) }} - ${{ formatPriceDollars(maxPlaceholder) }}
    </p>
  </div>
</template>
