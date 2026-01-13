<template>
  <div>
    <!-- Hero Section -->
    <FurnitureHeroSection :featured-product="featuredProduct" />

    <!-- Value Proposition -->
    <FurnitureValueProposition />

    <!-- Category Showcase -->
    <FurnitureCategoryShowcase />

    <!-- Featured Products -->
    <FurnitureFeaturedProducts :products="featuredProducts" />

    <!-- Inspiration Grid -->
    <FurnitureInspirationGrid />

    <!-- Newsletter -->
    <FurnitureNewsletterSection />
  </div>
</template>

<script setup lang="ts">
import client from '../.frontstack/generated-client'

definePageMeta({
  layout: 'furniture'
})

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

// State
const featuredProduct = ref<any>(null)
const featuredProducts = ref<any[]>([])

// Fetch featured products
const fetchFeaturedProducts = async () => {
  try {
    console.log('Fetching featured products for homepage...')
    
    const response = await client.listing('CategoryProducts', {
      categoryId: FURNITURE_KEY
    }, {
      query: {
        limit: 8
      }
    })
    
    console.log('Featured products response:', response)
    
    featuredProducts.value = response.items || []
    
    // Set first product with image as featured
    featuredProduct.value = response.items?.find((p: any) => p.cover?.src) || response.items?.[0]
  } catch (error) {
    console.error('Error fetching featured products:', error)
  }
}

// Initial fetch - call directly in setup instead of onMounted
fetchFeaturedProducts()
</script>
