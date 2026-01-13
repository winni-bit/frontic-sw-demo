<template>
  <section id="collections" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <p class="text-amber-700 text-sm font-medium tracking-[0.2em] uppercase mb-4">
          Our Collections
        </p>
        <h2 class="font-serif text-4xl lg:text-5xl text-stone-900 mb-4">
          Explore by Room
        </h2>
        <p class="text-stone-500 max-w-xl mx-auto">
          Curated collections designed to bring harmony and style to every corner of your home.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid md:grid-cols-2 gap-8">
        <div class="aspect-[4/3] bg-stone-100 animate-pulse" />
        <div class="aspect-[4/3] bg-stone-100 animate-pulse" />
      </div>

      <!-- Categories Grid -->
      <div v-else class="grid md:grid-cols-2 gap-8">
        <!-- Living Room - Large Card -->
        <NuxtLink 
          to="/furniture/category/living-room"
          class="group relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 to-stone-100 cursor-pointer"
        >
          <!-- Background Image -->
          <img 
            v-if="livingRoomImage"
            :src="livingRoomImage"
            alt="Living Room Collection"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div class="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent z-10" />
          
          <!-- Content -->
          <div class="absolute inset-0 flex flex-col justify-end p-8 z-20">
            <div class="transform group-hover:-translate-y-2 transition-transform duration-500">
              <h3 class="font-serif text-3xl lg:text-4xl text-white mb-3">
                Living Room
              </h3>
              <p class="text-stone-200 mb-4 max-w-sm">
                Sofas, armchairs, and accent furniture for your perfect gathering space.
              </p>
              <span class="inline-flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all">
                Explore Collection
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>

        <!-- Bedroom - Large Card -->
        <NuxtLink 
          to="/furniture/category/bedroom"
          class="group relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 to-amber-50 cursor-pointer"
        >
          <!-- Background Image -->
          <img 
            v-if="bedroomImage"
            :src="bedroomImage"
            alt="Bedroom Collection"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div class="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent z-10" />
          
          <!-- Content -->
          <div class="absolute inset-0 flex flex-col justify-end p-8 z-20">
            <div class="transform group-hover:-translate-y-2 transition-transform duration-500">
              <h3 class="font-serif text-3xl lg:text-4xl text-white mb-3">
                Bedroom
              </h3>
              <p class="text-stone-200 mb-4 max-w-sm">
                Beds, nightstands, and dressers for your personal sanctuary.
              </p>
              <span class="inline-flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all">
                Explore Collection
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- View All Link -->
      <div class="text-center mt-12">
        <NuxtLink 
          to="/furniture/all"
          class="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium transition-colors"
        >
          View All Furniture
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

// Category IDs
const LIVING_ROOM_KEY = '01956079731972f4afc27084df43af9e'
const BEDROOM_KEY = '0195607c69c77dd4b42ba8f8c7fb1bfe'

const loading = ref(true)
const livingRoomImage = ref<string>('')
const bedroomImage = ref<string>('')

const fetchCategoryData = async () => {
  try {
    // Fetch Living Room products
    const livingRoomResponse = await client.listing('CategoryProducts', {
      categoryId: LIVING_ROOM_KEY
    }, {
      query: {
        limit: 4
      }
    })
    
    if (livingRoomResponse.items && livingRoomResponse.items.length > 0) {
      // Find a product with a good cover image
      const productWithImage = livingRoomResponse.items.find(p => p.cover?.src)
      if (productWithImage?.cover?.src) {
        livingRoomImage.value = productWithImage.cover.src
      }
    }

    // Fetch Bedroom products
    const bedroomResponse = await client.listing('CategoryProducts', {
      categoryId: BEDROOM_KEY
    }, {
      query: {
        limit: 4
      }
    })
    
    if (bedroomResponse.items && bedroomResponse.items.length > 0) {
      const productWithImage = bedroomResponse.items.find(p => p.cover?.src)
      if (productWithImage?.cover?.src) {
        bedroomImage.value = productWithImage.cover.src
      }
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
  } finally {
    loading.value = false
  }
}

// Fetch data on setup
fetchCategoryData()
</script>
