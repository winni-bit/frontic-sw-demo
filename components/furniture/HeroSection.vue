<template>
  <section class="relative min-h-[90vh] flex items-center overflow-hidden">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50">
        <!-- Decorative shapes -->
        <div class="absolute top-20 right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div class="absolute bottom-20 left-20 w-80 h-80 bg-stone-200/40 rounded-full blur-3xl" />
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Text Content -->
        <div class="order-2 lg:order-1">
          <p class="text-amber-700 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            New Collection 2024
          </p>
          
          <h1 class="font-serif text-5xl lg:text-7xl text-stone-900 leading-[1.1] mb-6">
            Create Your
            <span class="block italic text-amber-800">Perfect Space</span>
          </h1>
          
          <p class="text-stone-600 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg">
            Discover furniture that tells your story. Thoughtfully designed pieces 
            that transform houses into homes.
          </p>
          
          <div class="flex flex-wrap gap-4">
            <NuxtLink 
              to="#collections"
              class="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 font-medium transition-all duration-300 group"
            >
              Explore Collections
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
            
            <button 
              @click="openVideoOverlay"
              class="inline-flex items-center gap-3 border border-amber-600 hover:bg-amber-600 text-amber-700 hover:text-white px-8 py-4 font-medium transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Story
            </button>
          </div>

          <!-- Trust Badges -->
          <div class="flex items-center gap-8 mt-12 pt-8 border-t border-stone-200">
            <div class="text-center">
              <p class="font-serif text-2xl text-stone-900">15+</p>
              <p class="text-stone-500 text-xs uppercase tracking-wider">Years</p>
            </div>
            <div class="text-center">
              <p class="font-serif text-2xl text-stone-900">50k+</p>
              <p class="text-stone-500 text-xs uppercase tracking-wider">Happy Homes</p>
            </div>
            <div class="text-center">
              <p class="font-serif text-2xl text-stone-900">100%</p>
              <p class="text-stone-500 text-xs uppercase tracking-wider">Sustainable</p>
            </div>
          </div>
        </div>

        <!-- Hero Image Grid -->
        <div class="order-1 lg:order-2 relative">
          <div class="relative">
            <!-- Main Image -->
            <div class="relative aspect-[4/5] bg-gradient-to-br from-amber-200 via-stone-200 to-amber-100 overflow-hidden shadow-2xl">
              <img 
                v-if="featuredProduct?.cover?.src"
                :src="featuredProduct.cover.src"
                :alt="featuredProduct.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <div class="text-center p-8">
                  <div class="w-24 h-24 mx-auto mb-4 bg-amber-300/50 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Product Tag -->
              <div 
                v-if="featuredProduct"
                class="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4"
              >
                <p class="text-stone-500 text-xs uppercase tracking-wider mb-1">Featured</p>
                <p class="font-serif text-lg text-stone-900">{{ featuredProduct.name }}</p>
                <p class="text-amber-700 font-medium">{{ formatPrice(featuredProduct.price) }}</p>
              </div>
            </div>

            <!-- Floating Card -->
            <div class="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl max-w-[200px] hidden lg:block">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-stone-900 text-sm">Handcrafted</p>
                  <p class="text-stone-500 text-xs">With love</p>
                </div>
              </div>
              <p class="text-stone-600 text-xs leading-relaxed">
                Each piece is carefully crafted by skilled artisans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400">
      <span class="text-xs uppercase tracking-wider">Scroll to explore</span>
      <div class="w-px h-8 bg-stone-300 animate-pulse" />
    </div>

    <!-- Video Overlay -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showVideoOverlay"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
          @click.self="closeVideoOverlay"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeVideoOverlay" />
          
          <!-- Video Container -->
          <div class="relative z-10 w-full max-w-5xl">
            <!-- Close Button -->
            <button 
              @click="closeVideoOverlay"
              class="absolute -top-12 right-0 md:-right-12 md:top-0 text-white hover:text-amber-400 transition-colors p-2 group"
              aria-label="Close video"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <!-- Video Wrapper with Aspect Ratio -->
            <div class="relative aspect-video bg-black shadow-2xl">
              <iframe
                :key="iframeKey"
                :src="`https://www.youtube.com/embed/e-kfzCcYruU?autoplay=1&mute=0&rel=0&enablejsapi=1`"
                title="Our Story"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              />
            </div>
            
            <!-- Video Title -->
            <p class="text-white/70 text-center mt-4 text-sm">
              Press <kbd class="px-2 py-1 bg-white/10 rounded text-white/90">ESC</kbd> or click outside to close
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
interface Product {
  key: string
  name: string
  cover?: {
    src?: string
    altText?: string
  }
  price?: {
    amount: number
    currency: string
    precision: number
  }
}

defineProps<{
  featuredProduct?: Product
}>()

// Video Overlay State
const showVideoOverlay = ref(false)
const iframeKey = ref(0)

const openVideoOverlay = () => {
  // Increment key to force iframe recreation with fresh autoplay
  iframeKey.value++
  showVideoOverlay.value = true
  // Prevent body scroll when overlay is open
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
  }
}

const closeVideoOverlay = () => {
  showVideoOverlay.value = false
  // Restore body scroll
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

// Close on ESC key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showVideoOverlay.value) {
    closeVideoOverlay()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Ensure scroll is restored if component unmounts while overlay is open
  document.body.style.overflow = ''
})

const formatPrice = (price?: Product['price']) => {
  if (!price) return ''
  const amount = price.amount / Math.pow(10, price.precision)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency
  }).format(amount)
}
</script>
