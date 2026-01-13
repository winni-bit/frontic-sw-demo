<template>
  <div class="min-h-screen bg-white">
    <!-- Header Section -->
    <section class="pt-32 pb-12 bg-stone-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-4">
          Collections
        </h1>
        <p class="text-lg text-stone-600 max-w-2xl">
          Explore our carefully curated collections, each designed to inspire and elevate your lifestyle.
        </p>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="aspect-[4/5] bg-stone-100 animate-pulse" />
        </div>

        <!-- Categories Grid -->
        <div v-else-if="categories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink 
            v-for="category in categories" 
            :key="category.key"
            :to="`/category/${category.slug || category.key}`"
            class="group relative aspect-[4/5] overflow-hidden cursor-pointer bg-stone-100"
          >
            <!-- Category Image -->
            <div class="absolute inset-0">
              <img
                v-if="category.cover?.src"
                :src="category.cover.thumbnailSrc || category.cover.src"
                :alt="category.title"
                class="w-full h-full object-cover img-zoom"
              />
              <div 
                v-else 
                class="w-full h-full bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400"
              />
            </div>

            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

            <!-- Content -->
            <div class="absolute inset-0 flex flex-col justify-end p-8">
              <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 class="font-serif text-2xl lg:text-3xl text-white font-medium mb-2">
                  {{ category.title }}
                </h3>
                <p v-if="category.description" class="text-white/80 text-sm mb-4 line-clamp-2">
                  {{ category.description }}
                </p>
                <div class="flex items-center gap-2 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>Explore Collection</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- No Categories -->
        <div v-else class="text-center py-16">
          <p class="text-stone-500">No collections found.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import client from '../.frontstack/generated-client'

// State
const categories = ref<CategoryCard[]>([])
const loading = ref(true)

// Fetch categories
const fetchCategories = async () => {
  try {
    loading.value = true
    
    const response = await client.listing('FeaturedCategories', {}, {
      query: {
        filter: [
          {
            type: 'equals',
            field: 'level',
            value: 2
          }
        ],
        limit: 50
      }
    })
    
    categories.value = response.items || []
    console.log('Collections loaded:', categories.value.length)
  } catch (err) {
    console.error('Error fetching collections:', err)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(fetchCategories)
</script>
