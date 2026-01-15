<script setup lang="ts">
/**
 * SearchOverlay - Such-Overlay mit Ergebnissen
 * ~95 Zeilen
 */

interface Product {
  key: string
  name: string
  cover?: { src?: string; thumbnailSrc?: string }
  price?: { amount: number; currency: string; precision: number }
  lowestPrice?: { amount: number; currency: string; precision: number }
}

interface Props {
  open: boolean
  loading: boolean
  results: Product[]
  query: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update:query': [value: string]
  search: []
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)

const formatPrice = (price?: { amount: number; currency: string; precision: number }) => {
  if (!price) return ''
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: price.currency || 'EUR' 
  }).format(price.amount / Math.pow(10, price.precision || 2))
}

const handleClose = () => {
  emit('close')
  if (import.meta.client) document.body.style.overflow = ''
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    nextTick(() => setTimeout(() => searchInputRef.value?.focus(), 100))
    if (import.meta.client) document.body.style.overflow = 'hidden'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition-opacity duration-200" 
      enter-from-class="opacity-0" 
      enter-to-class="opacity-100" 
      leave-active-class="transition-opacity duration-150" 
      leave-from-class="opacity-100" 
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" @click.self="handleClose">
        <div class="w-full bg-white">
          <div class="max-w-7xl mx-auto px-6 py-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="font-serif text-xl text-stone-900">Produkte suchen</h2>
              <button @click="handleClose" class="p-2 text-stone-500 hover:text-stone-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <input 
                ref="searchInputRef" 
                :value="query" 
                type="text" 
                placeholder="Suche nach Möbeln..." 
                class="w-full px-6 py-4 text-lg border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none" 
                @input="emit('update:query', ($event.target as HTMLInputElement).value)"
                @keydown.enter="emit('search')" 
                @keydown.esc="handleClose" 
              />
            </div>

            <!-- Results -->
            <div v-if="query.length >= 2" class="mt-6">
              <div v-if="loading" class="py-8 text-center text-stone-500">Suche läuft...</div>
              <div v-else-if="results.length > 0">
                <p class="text-sm text-stone-500 mb-4">{{ results.length }} Ergebnisse</p>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto">
                  <NuxtLink 
                    v-for="product in results" 
                    :key="product.key" 
                    :to="`/product/${product.key}`" 
                    class="group block" 
                    @click="handleClose"
                  >
                    <div class="aspect-square bg-stone-100 overflow-hidden mb-2">
                      <img 
                        v-if="product.cover?.thumbnailSrc || product.cover?.src" 
                        :src="product.cover.thumbnailSrc || product.cover.src" 
                        :alt="product.name" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <h3 class="text-sm text-stone-900 line-clamp-2">{{ product.name }}</h3>
                    <p class="text-sm text-stone-600 mt-1">{{ formatPrice(product.lowestPrice || product.price) }}</p>
                  </NuxtLink>
                </div>
              </div>
              <div v-else class="py-8 text-center text-stone-500">Keine Produkte gefunden</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
