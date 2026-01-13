<template>
  <div class="bg-slate-950 min-h-screen">
    <!-- Loading -->
    <div v-if="loading" class="py-20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div class="aspect-square bg-slate-800" />
          <div class="space-y-6 py-8">
            <div class="h-8 w-3/4 bg-slate-800" />
            <div class="h-6 w-1/4 bg-slate-800" />
            <div class="h-24 w-full bg-slate-800" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-20">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="text-3xl font-bold text-white mb-4">Product Not Found</h1>
        <p class="text-slate-400 mb-8">The product you're looking for doesn't exist.</p>
        <NuxtLink to="/industry" class="text-blue-400 hover:text-blue-300">
          ← Back to Products
        </NuxtLink>
      </div>
    </div>

    <!-- Product Content -->
    <template v-else-if="product">
      <div class="py-8">
        <div class="max-w-7xl mx-auto px-6">
          <!-- Breadcrumb -->
          <nav class="mb-8">
            <ol class="flex items-center gap-2 text-sm text-slate-500">
              <li><NuxtLink to="/industry" class="hover:text-white transition-colors">Products</NuxtLink></li>
              <li>/</li>
              <li class="text-slate-300">{{ product.name }}</li>
            </ol>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image -->
            <div class="aspect-square bg-slate-900 border border-slate-800">
              <img
                v-if="product.cover?.src"
                :src="product.cover.src"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
              <div 
                v-else 
                class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center"
              >
                <svg class="w-24 h-24 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="py-4">
              <!-- Name -->
              <h1 class="text-3xl lg:text-4xl font-bold text-white mb-4">
                {{ product.name }}
              </h1>

              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline gap-3">
                  <span class="text-3xl font-bold text-blue-400">{{ formattedPrice }}</span>
                  <span v-if="hasDiscount" class="text-xl text-slate-500 line-through">{{ formattedRefPrice }}</span>
                </div>
                <p class="text-slate-500 text-sm mt-1">excl. VAT</p>
              </div>

              <!-- Stock Status -->
              <div class="flex items-center gap-2 mb-8 p-4 bg-slate-900 border border-slate-800">
                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                <span class="text-green-400 font-medium">In Stock</span>
                <span class="text-slate-500 text-sm ml-2">Ready to ship</span>
              </div>

              <!-- Quantity & Add to Cart -->
              <div class="mb-8">
                <label class="block text-slate-400 text-sm mb-2">Quantity</label>
                <div class="flex items-center gap-4">
                  <div class="flex items-center border border-slate-700">
                    <button 
                      @click="quantity > 1 && quantity--"
                      class="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      −
                    </button>
                    <input 
                      v-model.number="quantity" 
                      type="number" 
                      min="1"
                      class="w-20 bg-transparent text-center text-white py-3 focus:outline-none"
                    />
                    <button 
                      @click="quantity++"
                      class="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    @click="addToCart"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>

              <!-- B2B Info -->
              <div class="border-t border-slate-800 pt-6 space-y-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-white text-sm font-medium">Volume Discounts Available</p>
                    <p class="text-slate-500 text-sm">Contact us for bulk pricing</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p class="text-white text-sm font-medium">Fast Delivery</p>
                    <p class="text-slate-500 text-sm">Ships within 1-2 business days</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p class="text-white text-sm font-medium">Technical Documentation</p>
                    <p class="text-slate-500 text-sm">Datasheets & manuals available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import client from '../../../.frontstack/generated-client'

definePageMeta({
  layout: 'industry'
})

const route = useRoute()
const productId = computed(() => route.params.id as string)

const product = ref<ProductDetail | null>(null)
const loading = ref(true)
const error = ref(false)
const quantity = ref(1)

const hasDiscount = computed(() => {
  return product.value?.price?.ref && product.value.price.ref > (product.value.price.amount || 0)
})

const formattedPrice = computed(() => {
  if (!product.value?.price) return ''
  const amount = (product.value.price.amount || 0) / Math.pow(10, product.value.price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.value.price.currency || 'USD'
  }).format(amount)
})

const formattedRefPrice = computed(() => {
  if (!product.value?.price?.ref) return ''
  const amount = product.value.price.ref / Math.pow(10, product.value.price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.value.price.currency || 'USD'
  }).format(amount)
})

const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = false
    product.value = await client.block('ProductDetail', productId.value)
  } catch (err) {
    console.error('Error fetching product:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  alert(`Added ${quantity.value}x ${product.value?.name} to cart!`)
}

onMounted(fetchProduct)
watch(productId, fetchProduct)
</script>
