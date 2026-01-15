<template>
  <div class="bg-white min-h-screen">
    <!-- Loading -->
    <ProductDetailLoadingState v-if="loading" />

    <!-- Error -->
    <ProductDetailErrorState v-else-if="error" />

    <!-- Product Content -->
    <template v-else-if="product">
      <div class="py-8">
        <div class="max-w-7xl mx-auto px-6">
          <!-- Breadcrumb -->
          <UiBreadcrumbNav :breadcrumbs="breadcrumbItems" />

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <!-- Image Gallery -->
            <div class="group">
              <ProductImageGallery 
                :cover="product.cover"
                :images="productImages"
              />
            </div>

            <!-- Info -->
            <div class="py-4 lg:py-8">
              <!-- Stock/Sale Badge -->
              <ProductDetailStockBadge
                :stock="productStock"
                :has3-d-model="has3DModel"
                :has-discount="hasDiscount"
                :discount-percentage="discountPercentage"
              />
              
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
                <p class="text-stone-600 leading-relaxed">
                  {{ productDescription || defaultDescription }}
                </p>
              </div>

              <!-- Add to Cart -->
              <ProductDetailAddToCartSection
                :product-id="productId"
                :product-name="product.name || ''"
                :is-out-of-stock="isOutOfStock"
                :is-liked="productIsLiked"
                @added="handleAddedToCart"
                @error="handleCartError"
                @toggle-like="handleToggleLike"
              />

              <!-- Features -->
              <ProductDetailProductFeatures 
                :has3-d-model="has3DModel"
                :stock="productStock"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <ProductDetailRelatedProducts :products="relatedProducts" />

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

definePageMeta({ layout: 'furniture' })

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'
const FRONTSTACK_API_BASE = 'https://fetch-0eebd5295bfb29f41b79fe15097107.frontstack.dev'
const defaultDescription = 'Elevate your living space with this beautifully crafted piece. Designed with both style and comfort in mind, it seamlessly blends into any interior while making a statement of its own.'

const route = useRoute()
const productId = computed(() => route.params.id as string)

// Like list composable
const { isLiked, toggleLike } = useLikeList()

// State
const product = ref<ProductWith3DData | null>(null)
const productStock = ref<number | undefined>(undefined)
const productImages = ref<Media[]>([])
const productDescription = ref<string>('')
const relatedProducts = ref<FurnitureProductCard[]>([])
const loading = ref(true)
const error = ref(false)

// Computed values
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

const productIsLiked = computed(() => product.value?.key ? isLiked(product.value.key) : false)
const isOutOfStock = computed(() => productStock.value !== undefined && productStock.value <= 0)

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: product.value.price.currency || 'USD' }).format(amount)
})

const formattedRefPrice = computed(() => {
  if (!product.value?.price?.ref) return ''
  const amount = product.value.price.ref / Math.pow(10, product.value.price.precision || 2)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: product.value.price.currency || 'USD' }).format(amount)
})

const breadcrumbItems = computed(() => {
  const items = [{ label: 'Furniture', href: '/furniture/all', siblings: [] }]
  if (product.value?.name) {
    items.push({ label: product.value.name, href: `/product/${product.value.key}`, siblings: [] })
  }
  return items
})

// Event handlers
const handleToggleLike = () => {
  if (!product.value) return
  toggleLike({ key: product.value.key, name: product.value.name, price: product.value.price, cover: product.value.cover })
}

const handleAddedToCart = (productIdVal: string, quantity: number) => {
  console.log('Product added to cart:', productIdVal, quantity)
}

const handleCartError = (errorMsg: string) => {
  console.error('Cart error:', errorMsg)
}

// Data fetching
const fetchProductWith3D = async (): Promise<ProductWith3DData | null> => {
  try {
    return await $fetch(`${FRONTSTACK_API_BASE}/block/productdetail3d/${productId.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'fs-version': '269e5e26-8d28-4e7b-af9c-66974fe22146' },
      body: { param: {} }
    }) as ProductWith3DData
  } catch {
    try {
      return await $fetch(`${FRONTSTACK_API_BASE}/block/productwith3d/${productId.value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'fs-version': '269e5e26-8d28-4e7b-af9c-66974fe22146' },
        body: { param: {} }
      }) as ProductWith3DData
    } catch {
      return null
    }
  }
}

const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = false
    
    const product3D = await fetchProductWith3D()
    
    if (product3D) {
      product.value = product3D
      productImages.value = product3D.images || []
      productStock.value = product3D.stock
      productDescription.value = product3D.description || ''
    } else {
      const basicProduct = await client.block('ProductDetail', productId.value)
      product.value = basicProduct
      productImages.value = []
    }
    
    if (productStock.value === undefined) {
      try {
        const detailedProduct = await client.block('FurnitureProductCard', productId.value)
        productStock.value = detailedProduct.stock
      } catch { productStock.value = undefined }
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
    const response = await client.listing('FurnitureProducts', { categoryId: FURNITURE_KEY }, { query: { limit: 5 } })
    relatedProducts.value = (response.items || []).filter((p: FurnitureProductCard) => p.key !== productId.value).slice(0, 4)
  } catch (err) {
    console.error('Error fetching related products:', err)
  }
}

const init = async () => {
  await fetchProduct()
  if (!error.value) await fetchRelatedProducts()
}

init()
watch(productId, () => init())
</script>
