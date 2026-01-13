<template>
  <div class="relative">
    <!-- Main Image Container -->
    <div 
      ref="mainImageRef"
      class="relative aspect-square bg-stone-50 overflow-hidden cursor-zoom-in"
      @mouseenter="enableZoom"
      @mouseleave="disableZoom"
      @mousemove="handleMouseMove"
      @click="openLightbox"
    >
      <!-- Main Image -->
      <img
        v-if="currentImage?.src"
        :src="currentImage.src"
        :alt="currentImage.altText || 'Product image'"
        class="w-full h-full object-cover transition-transform duration-200"
        :style="zoomStyle"
      />
      <div 
        v-else 
        class="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center"
      >
        <svg class="w-32 h-32 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      <!-- Zoom Indicator -->
      <div 
        v-if="!isZooming && currentImage?.src"
        class="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs text-stone-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        Hover to zoom
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="allImages.length > 1"
        @click.stop="previousImage"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="allImages.length > 1"
        @click.stop="nextImage"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Image Counter -->
      <div 
        v-if="allImages.length > 1"
        class="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 text-xs text-stone-600"
      >
        {{ currentIndex + 1 }} / {{ allImages.length }}
      </div>
    </div>

    <!-- Thumbnail Strip -->
    <div 
      v-if="allImages.length > 1"
      class="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
    >
      <button
        v-for="(image, index) in allImages"
        :key="image.key || index"
        @click="selectImage(index)"
        class="relative flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-200"
        :class="[
          currentIndex === index 
            ? 'ring-2 ring-stone-900' 
            : 'ring-1 ring-stone-200 hover:ring-stone-400 opacity-70 hover:opacity-100'
        ]"
      >
        <img
          v-if="image.src && isImageFile(image)"
          :src="image.thumbnailSrc || image.src"
          :alt="image.altText || `Product image ${index + 1}`"
          class="w-full h-full object-cover"
        />
        <!-- 3D Model Indicator -->
        <div 
          v-else-if="is3DModel(image)"
          class="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"
        >
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div 
          v-else
          class="w-full h-full bg-stone-100 flex items-center justify-center"
        >
          <svg class="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="lightboxOpen"
          class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          @click.self="closeLightbox"
        >
          <!-- Close Button -->
          <button
            @click="closeLightbox"
            class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Lightbox Image -->
          <div class="relative max-w-[90vw] max-h-[90vh]">
            <img
              v-if="currentImage?.src"
              :src="currentImage.src"
              :alt="currentImage.altText || 'Product image'"
              class="max-w-full max-h-[90vh] object-contain"
            />

            <!-- Navigation -->
            <button
              v-if="allImages.length > 1"
              @click.stop="previousImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-if="allImages.length > 1"
              @click.stop="nextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Thumbnail Strip in Lightbox -->
          <div 
            v-if="allImages.length > 1"
            class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
          >
            <button
              v-for="(image, index) in allImages"
              :key="image.key || index"
              @click="selectImage(index)"
              class="w-16 h-16 overflow-hidden transition-all"
              :class="[
                currentIndex === index 
                  ? 'ring-2 ring-white' 
                  : 'ring-1 ring-white/30 opacity-50 hover:opacity-100'
              ]"
            >
              <img
                v-if="image.src && isImageFile(image)"
                :src="image.thumbnailSrc || image.src"
                :alt="image.altText || `Product image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>

          <!-- Counter -->
          <div class="absolute top-6 left-6 text-white/70 text-sm">
            {{ currentIndex + 1 }} / {{ allImages.length }}
          </div>

          <!-- Keyboard hint -->
          <div class="absolute bottom-6 right-6 text-white/50 text-xs">
            Press ESC to close • ← → to navigate
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface MediaImage {
  key?: string
  src?: string
  thumbnailSrc?: string
  altText?: string
  mimeType?: string
  position?: number
  type?: string
}

const props = defineProps<{
  cover?: MediaImage
  images?: MediaImage[]
}>()

// State
const currentIndex = ref(0)
const isZooming = ref(false)
const zoomPosition = ref({ x: 50, y: 50 })
const lightboxOpen = ref(false)
const mainImageRef = ref<HTMLElement | null>(null)

// Combine cover and images, filter out non-image files for display
const allImages = computed(() => {
  const imgs: MediaImage[] = []
  
  // Add cover first if it exists
  if (props.cover?.src) {
    imgs.push(props.cover)
  }
  
  // Add other images, avoiding duplicates
  if (props.images?.length) {
    for (const img of props.images) {
      // Skip if it's the same as cover or if it's a 3D model
      if (img.src && img.src !== props.cover?.src && isImageFile(img)) {
        imgs.push(img)
      }
    }
  }
  
  return imgs.length > 0 ? imgs : [{ src: '', altText: 'No image' }]
})

const currentImage = computed(() => allImages.value[currentIndex.value])

// Check if file is an image (not 3D model)
const isImageFile = (image: MediaImage) => {
  if (!image.mimeType) return true // Assume image if no mimeType
  return image.mimeType.startsWith('image/')
}

const is3DModel = (image: MediaImage) => {
  return image.mimeType?.includes('gltf') || image.mimeType?.includes('glb') || image.src?.endsWith('.glb')
}

// Zoom functionality
const zoomStyle = computed(() => {
  if (!isZooming.value) return {}
  return {
    transform: 'scale(2)',
    transformOrigin: `${zoomPosition.value.x}% ${zoomPosition.value.y}%`
  }
})

const enableZoom = () => {
  if (currentImage.value?.src) {
    isZooming.value = true
  }
}

const disableZoom = () => {
  isZooming.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (!mainImageRef.value || !isZooming.value) return
  
  const rect = mainImageRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  zoomPosition.value = { x, y }
}

// Navigation
const selectImage = (index: number) => {
  currentIndex.value = index
}

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % allImages.value.length
}

const previousImage = () => {
  currentIndex.value = (currentIndex.value - 1 + allImages.value.length) % allImages.value.length
}

// Lightbox
const openLightbox = () => {
  if (currentImage.value?.src) {
    lightboxOpen.value = true
    document.body.style.overflow = 'hidden'
  }
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (lightboxOpen.value) {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') previousImage()
    if (e.key === 'ArrowRight') nextImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
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
