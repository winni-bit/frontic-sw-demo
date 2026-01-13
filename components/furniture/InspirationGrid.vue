<template>
  <section class="py-24 bg-stone-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
        <div>
          <p class="text-amber-700 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Get Inspired
          </p>
          <h2 class="font-serif text-4xl lg:text-5xl text-stone-900">
            Room Inspirations
          </h2>
        </div>
        <p class="text-stone-500 max-w-md lg:text-right">
          Discover how our furniture pieces can transform your spaces into beautiful, functional rooms.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="col-span-2 row-span-2 aspect-square bg-stone-200 animate-pulse" />
        <div class="aspect-square bg-stone-200 animate-pulse" />
        <div class="aspect-square bg-stone-200 animate-pulse" />
        <div class="aspect-square bg-stone-200 animate-pulse" />
        <div class="aspect-square bg-stone-200 animate-pulse" />
      </div>

      <!-- Inspiration Grid -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Large Image 1 - Featured Living Room -->
        <NuxtLink 
          v-if="inspirationItems[0]"
          :to="`/product/${inspirationItems[0].key}`"
          class="col-span-2 row-span-2 group relative overflow-hidden cursor-pointer"
        >
          <div class="aspect-square bg-gradient-to-br from-amber-200 via-amber-100 to-stone-100">
            <img 
              v-if="inspirationItems[0].cover?.src"
              :src="inspirationItems[0].cover.src"
              :alt="inspirationItems[0].name"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
            <div class="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <p class="font-serif text-xl mb-1">{{ inspirationItems[0].name }}</p>
              <p class="text-white/80 text-sm">{{ formatPrice(inspirationItems[0].lowestPrice || inspirationItems[0].price) }}</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Small Image 1 -->
        <NuxtLink 
          v-if="inspirationItems[1]"
          :to="`/product/${inspirationItems[1].key}`"
          class="group relative overflow-hidden cursor-pointer"
        >
          <div class="aspect-square bg-gradient-to-br from-stone-200 to-stone-100">
            <img 
              v-if="inspirationItems[1].cover?.src"
              :src="inspirationItems[1].cover.thumbnailSrc || inspirationItems[1].cover.src"
              :alt="inspirationItems[1].name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div class="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/50 transition-all duration-500 flex items-end p-4">
            <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="text-sm font-medium">{{ inspirationItems[1].name }}</p>
              <p class="text-white/70 text-xs">{{ formatPrice(inspirationItems[1].lowestPrice || inspirationItems[1].price) }}</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Small Image 2 -->
        <NuxtLink 
          v-if="inspirationItems[2]"
          :to="`/product/${inspirationItems[2].key}`"
          class="group relative overflow-hidden cursor-pointer"
        >
          <div class="aspect-square bg-gradient-to-br from-amber-100 to-amber-50">
            <img 
              v-if="inspirationItems[2].cover?.src"
              :src="inspirationItems[2].cover.thumbnailSrc || inspirationItems[2].cover.src"
              :alt="inspirationItems[2].name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div class="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/50 transition-all duration-500 flex items-end p-4">
            <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="text-sm font-medium">{{ inspirationItems[2].name }}</p>
              <p class="text-white/70 text-xs">{{ formatPrice(inspirationItems[2].lowestPrice || inspirationItems[2].price) }}</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Small Image 3 -->
        <NuxtLink 
          v-if="inspirationItems[3]"
          :to="`/product/${inspirationItems[3].key}`"
          class="group relative overflow-hidden cursor-pointer"
        >
          <div class="aspect-square bg-gradient-to-br from-stone-300 to-stone-200">
            <img 
              v-if="inspirationItems[3].cover?.src"
              :src="inspirationItems[3].cover.thumbnailSrc || inspirationItems[3].cover.src"
              :alt="inspirationItems[3].name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div class="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/50 transition-all duration-500 flex items-end p-4">
            <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="text-sm font-medium">{{ inspirationItems[3].name }}</p>
              <p class="text-white/70 text-xs">{{ formatPrice(inspirationItems[3].lowestPrice || inspirationItems[3].price) }}</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Small Image 4 -->
        <NuxtLink 
          v-if="inspirationItems[4]"
          :to="`/product/${inspirationItems[4].key}`"
          class="group relative overflow-hidden cursor-pointer"
        >
          <div class="aspect-square bg-gradient-to-br from-amber-200 to-amber-100">
            <img 
              v-if="inspirationItems[4].cover?.src"
              :src="inspirationItems[4].cover.thumbnailSrc || inspirationItems[4].cover.src"
              :alt="inspirationItems[4].name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div class="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/50 transition-all duration-500 flex items-end p-4">
            <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="text-sm font-medium">{{ inspirationItems[4].name }}</p>
              <p class="text-white/70 text-xs">{{ formatPrice(inspirationItems[4].lowestPrice || inspirationItems[4].price) }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Shop All CTA -->
      <div class="mt-12 text-center">
        <NuxtLink 
          to="/furniture/all"
          class="inline-flex items-center gap-3 bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 font-medium transition-all duration-300 group"
        >
          Shop All Products
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

interface Product {
  key: string
  name: string
  cover?: {
    src?: string
    thumbnailSrc?: string
    altText?: string
  }
  price?: {
    amount: number
    currency: string
    precision: number
  }
  lowestPrice?: {
    amount: number
    currency: string
    precision: number
  }
}

// Furniture root category
const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

const loading = ref(true)
const inspirationItems = ref<Product[]>([])

const formatPrice = (price?: Product['price']) => {
  if (!price) return ''
  const amount = price.amount / Math.pow(10, price.precision)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency
  }).format(amount)
}

const fetchInspirationProducts = async () => {
  try {
    // Fetch a mix of products for inspiration
    const response = await client.listing('CategoryProducts', {
      categoryId: FURNITURE_KEY
    }, {
      query: {
        limit: 6
      }
    })
    
    if (response.items) {
      // Filter to only products with images
      inspirationItems.value = response.items.filter(item => item.cover?.src).slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching inspiration products:', error)
  } finally {
    loading.value = false
  }
}

// Fetch data on setup
fetchInspirationProducts()
</script>
