<template>
  <div class="bg-white min-h-screen">
    <!-- Loading -->
    <div v-if="loading" class="py-20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-pulse">
          <div class="aspect-square bg-stone-100" />
          <div class="space-y-6 py-8">
            <div class="h-8 w-3/4 bg-stone-100" />
            <div class="h-6 w-1/4 bg-stone-100" />
            <div class="h-32 w-full bg-stone-100" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-20">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="font-serif text-3xl text-stone-900 mb-4">Product Not Found</h1>
        <p class="text-stone-500 mb-8">The furniture piece you're looking for doesn't exist.</p>
        <NuxtLink to="/" class="text-amber-600 hover:text-amber-700">
          ← Back to Collection
        </NuxtLink>
      </div>
    </div>

    <!-- Product Content -->
    <template v-else-if="product">
      <div class="py-8">
        <div class="max-w-7xl mx-auto px-6">
          <!-- Breadcrumb -->
          <UiBreadcrumbNav :breadcrumbs="breadcrumbItems" />

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <!-- Image Gallery with 3D Support -->
            <div class="group">
              <ProductImageGallery 
                :cover="product.cover"
                :images="productImages"
              />
            </div>

            <!-- Info -->
            <div class="py-4 lg:py-8">
              <!-- 3D Available Badge -->
              <div 
                v-if="has3DModel" 
                class="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm px-3 py-2 mb-4"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>3D View Available</span>
              </div>

              <!-- Stock Warning Badge -->
              <div 
                v-else-if="showLowStockWarning" 
                class="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm px-3 py-2 mb-4"
              >
                <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>Only <strong>{{ productStock }}</strong> left in stock - order soon!</span>
              </div>

              <!-- Out of Stock Badge -->
              <div 
                v-else-if="isOutOfStock" 
                class="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-sm px-3 py-2 mb-4"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span>Currently out of stock</span>
              </div>

              <!-- Sale Badge -->
              <div v-else-if="hasDiscount" class="inline-block bg-rose-500 text-white text-xs font-medium px-3 py-1 mb-4">
                On Sale - Save {{ discountPercentage }}%
              </div>
              
              <!-- Name -->
              <h1 class="font-serif text-3xl lg:text-4xl text-stone-900 mb-4">
                {{ product.name }}
              </h1>

              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline gap-3">
                  <span class="text-2xl text-stone-900">{{ formattedPrice }}</span>
                  <span v-if="hasDiscount" class="text-lg text-stone-400 line-through">{{ formattedRefPrice }}</span>
                </div>
              </div>

              <!-- Description -->
              <div class="prose prose-stone mb-8">
                <p v-if="productDescription" class="text-stone-600 leading-relaxed">
                  {{ productDescription }}
                </p>
                <p v-else class="text-stone-600 leading-relaxed">
                  Elevate your living space with this beautifully crafted piece. 
                  Designed with both style and comfort in mind, it seamlessly blends 
                  into any interior while making a statement of its own.
                </p>
              </div>

              <!-- Add to Cart with Shopware Integration -->
              <div id="add-to-cart-trigger" class="mb-8">
                <div class="flex items-start gap-4">
                  <div class="flex-1">
                    <ProductAddToCartButton
                      :product-id="productId"
                      :product-name="product.name"
                      :disabled="isOutOfStock"
                      variant="secondary"
                      size="lg"
                      @added="handleAddedToCart"
                      @error="handleCartError"
                    />
                  </div>
                  
                  <!-- Like Button -->
                  <button 
                    @click="handleToggleLike"
                    class="p-4 border transition-all duration-300 shrink-0"
                    :class="[
                      productIsLiked 
                        ? 'border-rose-200 bg-rose-50 hover:bg-rose-100' 
                        : 'border-stone-200 hover:border-stone-400'
                    ]"
                    :aria-label="productIsLiked ? 'Remove from wishlist' : 'Add to wishlist'"
                  >
                    <svg 
                      class="w-5 h-5 transition-colors duration-300" 
                      :class="[
                        productIsLiked 
                          ? 'text-rose-500 fill-rose-500' 
                          : 'text-stone-600 fill-transparent'
                      ]"
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <!-- Cart Success Feedback -->
                <Transition
                  enter-active-class="transition-all duration-300"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-200"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <p v-if="showCartFeedback" class="text-sm text-green-600 mt-3 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to cart successfully
                  </p>
                </Transition>
                
                <!-- Like Feedback -->
                <Transition
                  enter-active-class="transition-all duration-300"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-200"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <p v-if="showLikeFeedback" class="text-sm text-rose-600 mt-3 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Added to your wishlist
                  </p>
                </Transition>
              </div>

              <!-- Features -->
              <div class="border-t border-stone-100 pt-8 space-y-4">
                <div v-if="has3DModel" class="flex items-center gap-3 text-sm">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span class="text-stone-600">Interactive 3D view available</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span class="text-stone-600">Free delivery on orders over $500</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="text-stone-600">30-day easy returns</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span class="text-stone-600">2-year warranty included</span>
                </div>
                <div v-if="productStock !== undefined && productStock > 0" class="flex items-center gap-3 text-sm">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-stone-600">In stock - Ready to ship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- You May Also Like -->
      <section v-if="relatedProducts.length > 0" class="py-16 bg-stone-50">
        <div class="max-w-7xl mx-auto px-6">
          <h2 class="font-serif text-2xl text-stone-900 mb-8">You May Also Like</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <FurnitureProductCard 
              v-for="relatedProduct in relatedProducts" 
              :key="relatedProduct.key" 
              :product="relatedProduct" 
            />
          </div>
        </div>
      </section>

      <!-- Sticky Add to Cart (Mobile) -->
      <ProductStickyAddToCart 
        :product="{
          key: product.key,
          name: product.name,
          cover: product.cover,
          price: product.price,
          stock: productStock
        }"
        trigger-element-id="add-to-cart-trigger"
        @added="handleAddedToCart"
      />
    </template>

    <!-- Exit Intent Popup -->
    <CartExitIntentPopup />
  </div>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

definePageMeta({
  layout: 'furniture'
})

// Furniture parent category key - used to filter categories
const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

// Frontstack API base URL for direct calls
const FRONTSTACK_API_BASE = 'https://fetch-0eebd5295bfb29f41b79fe15097107.frontstack.dev'

const route = useRoute()
const productId = computed(() => route.params.id as string)

// Like list composable
const { isLiked, toggleLike } = useLikeList()

// Extended product type with images
interface ProductWith3DData {
  key: string
  name?: string
  cover?: Media
  price?: Price
  images?: Media[]
  description?: string
  stock?: number
}

const product = ref<ProductWith3DData | null>(null)
const productStock = ref<number | undefined>(undefined)
const productImages = ref<Media[]>([])
const productDescription = ref<string>('')
const relatedProducts = ref<FurnitureProductCard[]>([])
const loading = ref(true)
const error = ref(false)
const showLikeFeedback = ref(false)
const showCartFeedback = ref(false)

// Check if product has 3D model
const has3DModel = computed(() => {
  if (!productImages.value?.length) return false
  return productImages.value.some(img => 
    img.mimeType?.includes('gltf') || 
    img.mimeType?.includes('glb') ||
    img.mimeType === 'model/gltf-binary' ||
    img.src?.endsWith('.glb') ||
    img.src?.endsWith('.gltf')
  )
})

// Check if current product is liked
const productIsLiked = computed(() => {
  if (!product.value?.key) return false
  return isLiked(product.value.key)
})

// Stock checks
const isOutOfStock = computed(() => {
  return productStock.value !== undefined && productStock.value <= 0
})

const showLowStockWarning = computed(() => {
  return productStock.value !== undefined && productStock.value > 0 && productStock.value <= 5
})

const hasDiscount = computed(() => {
  return product.value?.price?.ref && product.value.price.ref > (product.value.price.amount || 0)
})

const discountPercentage = computed(() => {
  if (!hasDiscount.value || !product.value?.price?.ref || !product.value?.price?.amount) return 0
  return Math.round(((product.value.price.ref - product.value.price.amount) / product.value.price.ref) * 100)
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

// Breadcrumb items
const breadcrumbItems = computed(() => {
  const items = [
    { 
      label: 'Furniture', 
      href: '/furniture/all',
      siblings: []
    }
  ]
  
  if (product.value?.name) {
    items.push({
      label: product.value.name,
      href: `/product/${product.value.key}`,
      siblings: []
    })
  }
  
  return items
})

// Handle like toggle with feedback
const handleToggleLike = () => {
  if (!product.value) return
  
  const wasLiked = productIsLiked.value
  
  toggleLike({
    key: product.value.key,
    name: product.value.name,
    price: product.value.price,
    cover: product.value.cover
  })
  
  // Show feedback when adding (not removing)
  if (!wasLiked) {
    showLikeFeedback.value = true
    setTimeout(() => {
      showLikeFeedback.value = false
    }, 2500)
  }
}

// Handle added to cart
const handleAddedToCart = (productIdVal: string, quantity: number) => {
  console.log('Product added to cart:', productIdVal, quantity)
  showCartFeedback.value = true
  setTimeout(() => {
    showCartFeedback.value = false
  }, 3000)
}

// Handle cart error
const handleCartError = (errorMsg: string) => {
  console.error('Cart error:', errorMsg)
}

// Fetch product with 3D data using direct API call
const fetchProductWith3D = async (): Promise<ProductWith3DData | null> => {
  try {
    // Try to fetch from ProductDetail3D block (has images with 3D models)
    const response = await $fetch(`${FRONTSTACK_API_BASE}/block/productdetail3d/${productId.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'fs-version': '269e5e26-8d28-4e7b-af9c-66974fe22146'
      },
      body: { param: {} }
    })
    
    console.log('[3D] ProductDetail3D response:', response)
    return response as ProductWith3DData
  } catch (err) {
    console.log('[3D] ProductDetail3D not available, trying ProductWith3D...')
    
    try {
      // Fallback to ProductWith3D block
      const response = await $fetch(`${FRONTSTACK_API_BASE}/block/productwith3d/${productId.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'fs-version': '269e5e26-8d28-4e7b-af9c-66974fe22146'
        },
        body: { param: {} }
      })
      
      console.log('[3D] ProductWith3D response:', response)
      return response as ProductWith3DData
    } catch (err2) {
      console.log('[3D] ProductWith3D not available either')
      return null
    }
  }
}

const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = false
    console.log('Fetching product:', productId.value)
    
    // First try to get product with 3D data
    const product3D = await fetchProductWith3D()
    
    if (product3D) {
      product.value = product3D
      productImages.value = product3D.images || []
      productStock.value = product3D.stock
      productDescription.value = product3D.description || ''
      console.log('Product with 3D loaded:', product.value)
      console.log('Product images:', productImages.value)
      console.log('Has 3D model:', has3DModel.value)
    } else {
      // Fallback to basic product detail
      const basicProduct = await client.block('ProductDetail', productId.value)
      product.value = basicProduct
      productImages.value = []
      console.log('Basic product loaded:', product.value)
    }
    
    // Try to get stock from FurnitureProductCard if not already set
    if (productStock.value === undefined) {
      try {
        const detailedProduct = await client.block('FurnitureProductCard', productId.value)
        productStock.value = detailedProduct.stock
        console.log('Product stock:', productStock.value)
      } catch (stockErr) {
        console.log('Could not fetch stock info')
        productStock.value = undefined
      }
    }
  } catch (err) {
    console.error('Error fetching product:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const fetchRelatedProducts = async () => {
  try {
    const response = await client.listing('FurnitureProducts', {
      categoryId: FURNITURE_KEY
    }, {
      query: { limit: 5 }
    })
    // Filter out current product and take 4
    relatedProducts.value = (response.items || [])
      .filter((p: FurnitureProductCard) => p.key !== productId.value)
      .slice(0, 4)
  } catch (err) {
    console.error('Error fetching related products:', err)
  }
}

// Initialize
const init = async () => {
  await fetchProduct()
  if (!error.value) {
    await fetchRelatedProducts()
  }
}

// Fetch on setup
init()

// Watch for route changes
watch(productId, () => {
  showLikeFeedback.value = false
  showCartFeedback.value = false
  init()
})
</script>
