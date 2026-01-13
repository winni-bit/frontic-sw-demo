<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-b from-amber-50 to-white">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <ol class="flex items-center gap-2 text-sm text-stone-500">
            <li>
              <NuxtLink to="/" class="hover:text-stone-900 transition-colors">Home</NuxtLink>
            </li>
            <li class="flex items-center gap-2">
              <span>/</span>
              <span class="text-stone-900">My Wishlist</span>
            </li>
          </ol>
        </nav>

        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 class="font-serif text-4xl lg:text-5xl text-stone-900">
              My Wishlist
            </h1>
            <p class="text-stone-500 mt-2">
              {{ likeCount }} {{ likeCount === 1 ? 'item' : 'items' }} saved
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Empty State -->
        <div v-if="likeCount === 0" class="text-center py-20">
          <div class="w-24 h-24 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 class="font-serif text-2xl text-stone-900 mb-3">Your wishlist is empty</h2>
          <p class="text-stone-500 mb-8 max-w-md mx-auto">
            Start adding items you love by clicking the heart icon on any product.
          </p>
          <NuxtLink 
            to="/furniture/all"
            class="inline-flex items-center gap-3 bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 font-medium transition-all duration-300"
          >
            Browse Products
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Wishlist Items -->
        <div v-else>
          <!-- Actions Bar -->
          <div class="flex items-center justify-between mb-8 pb-6 border-b border-stone-100">
            <p class="text-stone-600">
              Showing all {{ likeCount }} saved items
            </p>
            <button 
              @click="confirmClearAll"
              class="text-sm text-stone-500 hover:text-rose-600 transition-colors"
            >
              Clear all
            </button>
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div 
              v-for="product in sortedLikes" 
              :key="product.key"
              class="group relative"
            >
              <NuxtLink 
                :to="`/product/${product.key}`"
                class="block cursor-pointer"
              >
                <!-- Image -->
                <div class="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-4">
                  <img
                    v-if="product.cover?.src"
                    :src="product.cover.thumbnailSrc || product.cover.src"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div 
                    v-else 
                    class="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center"
                  >
                    <svg class="w-16 h-16 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>

                <!-- Info -->
                <div>
                  <h3 class="text-stone-900 font-medium mb-1 group-hover:text-amber-700 transition-colors">
                    {{ product.name }}
                  </h3>
                  
                  <div class="flex items-baseline gap-2">
                    <span class="text-stone-900">
                      {{ formatPrice(product.lowestPrice || product.price) }}
                    </span>
                  </div>
                </div>
              </NuxtLink>

              <!-- Remove Button -->
              <button 
                class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-rose-50 z-10"
                @click.stop.prevent="removeLike(product.key)"
                aria-label="Remove from wishlist"
              >
                <svg 
                  class="w-5 h-5 text-rose-500 fill-rose-500"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="1.5" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>

              <!-- Added Date -->
              <p class="text-xs text-stone-400 mt-2">
                Added {{ formatDate(product.addedAt) }}
              </p>
            </div>
          </div>

          <!-- Continue Shopping -->
          <div class="text-center mt-16 pt-12 border-t border-stone-100">
            <p class="text-stone-500 mb-4">Looking for more?</p>
            <NuxtLink 
              to="/furniture/all"
              class="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium transition-colors"
            >
              Continue Shopping
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Confirm Clear Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showClearModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showClearModal = false"
        >
          <div class="bg-white p-8 max-w-md w-full shadow-xl">
            <h3 class="font-serif text-xl text-stone-900 mb-3">Clear Wishlist?</h3>
            <p class="text-stone-600 mb-6">
              Are you sure you want to remove all {{ likeCount }} items from your wishlist? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button 
                @click="showClearModal = false"
                class="flex-1 px-6 py-3 border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="handleClearAll"
                class="flex-1 px-6 py-3 bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'furniture'
})

const { sortedLikes, likeCount, removeLike, clearAllLikes } = useLikeList()

const showClearModal = ref(false)

const confirmClearAll = () => {
  showClearModal.value = true
}

const handleClearAll = () => {
  clearAllLikes()
  showClearModal.value = false
}

const formatPrice = (price?: { amount: number; currency: string; precision: number }) => {
  if (!price) return ''
  const amount = price.amount / Math.pow(10, price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD'
  }).format(amount)
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>
