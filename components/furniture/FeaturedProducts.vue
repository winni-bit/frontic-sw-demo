<template>
  <section id="products" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
        <div>
          <p class="text-amber-700 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Handpicked For You
          </p>
          <h2 class="font-serif text-4xl lg:text-5xl text-stone-900">
            Featured Collection
          </h2>
        </div>
        
        <div class="flex items-center gap-4">
          <button 
            @click="scrollProducts('left')"
            class="w-12 h-12 border border-stone-200 hover:border-amber-600 hover:text-amber-600 flex items-center justify-center transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': !canScrollLeft }"
            :disabled="!canScrollLeft"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            @click="scrollProducts('right')"
            class="w-12 h-12 border border-stone-200 hover:border-amber-600 hover:text-amber-600 flex items-center justify-center transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': !canScrollRight }"
            :disabled="!canScrollRight"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Products Carousel -->
      <div 
        ref="carouselRef"
        class="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-6 px-6"
        @scroll="updateScrollState"
      >
        <div 
          v-for="product in products" 
          :key="product.key"
          class="flex-shrink-0 w-[280px] sm:w-[320px]"
        >
          <FurnitureProductCard :product="product" />
        </div>
      </div>

      <!-- View All -->
      <div class="text-center mt-12">
        <NuxtLink 
          to="/furniture/all"
          class="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 font-medium transition-all duration-300 group"
        >
          View All Products
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  products: FurnitureProductCard[]
}>()

const carouselRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const updateScrollState = () => {
  if (!carouselRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = carouselRef.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

const scrollProducts = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return
  const scrollAmount = 340
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(() => {
  updateScrollState()
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
