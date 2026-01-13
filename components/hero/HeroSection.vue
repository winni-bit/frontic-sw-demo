<template>
  <section class="relative h-[90vh] min-h-[600px] overflow-hidden bg-stone-100">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0">
      <div 
        v-if="featuredProduct?.cover?.src"
        class="absolute inset-0 bg-cover bg-center img-zoom"
        :style="{ backgroundImage: `url(${featuredProduct.cover.src})` }"
      />
      <div 
        v-else 
        class="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400"
      />
      <!-- Elegant overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
    </div>

    <!-- Content -->
    <div class="relative h-full flex items-center">
      <div class="container mx-auto px-6 lg:px-12">
        <div class="max-w-2xl">
          <!-- Eyebrow text -->
          <p 
            class="text-stone-300 text-sm tracking-[0.3em] uppercase mb-6 opacity-0 animate-fade-in-up"
          >
            New Collection
          </p>
          
          <!-- Main headline -->
          <h1 
            class="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-medium leading-tight mb-6 opacity-0 animate-fade-in-up animation-delay-200"
          >
            Discover<br />
            <span class="italic">Timeless</span> Elegance
          </h1>
          
          <!-- Subheadline -->
          <p 
            class="text-stone-200 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-lg opacity-0 animate-fade-in-up animation-delay-400"
          >
            Curated pieces that blend craftsmanship with contemporary design. 
            Explore our latest arrivals.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-wrap gap-4 opacity-0 animate-fade-in-up animation-delay-600">
            <button 
              class="btn-luxury bg-white text-stone-900 px-8 py-4 text-sm tracking-wider uppercase font-medium hover:bg-stone-100 transition-colors"
            >
              Shop Now
            </button>
            <button 
              class="border border-white/50 text-white px-8 py-4 text-sm tracking-wider uppercase font-medium hover:bg-white/10 transition-colors"
            >
              View Lookbook
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-2">
      <span class="text-xs tracking-widest uppercase">Scroll</span>
      <div class="w-px h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  featuredProduct?: ProductCard | null
}>()
</script>
