<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-20">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <!-- 3D Icon -->
        <div class="inline-flex items-center justify-center w-20 h-20 bg-amber-500 text-white mb-8">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        
        <h1 class="font-serif text-4xl md:text-5xl text-stone-900 mb-6">
          Interactive 3D Product Viewer
        </h1>
        
        <p class="text-lg text-stone-600 mb-8 max-w-2xl mx-auto">
          Experience our products in stunning 3D. Rotate, zoom, and explore every detail 
          before you buy. Powered by Three.js with DRACO compression support.
        </p>
        
        <NuxtLink 
          to="/product/019560bbbe727c0798e5befef9665b56"
          class="inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 text-lg hover:bg-stone-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          View 3D Demo Product
        </NuxtLink>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="font-serif text-3xl text-stone-900 text-center mb-12">
          How It Works
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white p-8 text-center">
            <div class="w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-stone-900 mb-3">
              Drag to Rotate
            </h3>
            <p class="text-stone-600">
              Click and drag to rotate the 3D model in any direction. 
              Explore every angle of the product.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-white p-8 text-center">
            <div class="w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-stone-900 mb-3">
              Scroll to Zoom
            </h3>
            <p class="text-stone-600">
              Use your mouse wheel or pinch to zoom in and out. 
              Get up close to see the finest details.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white p-8 text-center">
            <div class="w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-stone-900 mb-3">
              Auto-Rotate
            </h3>
            <p class="text-stone-600">
              The model automatically rotates to showcase the product. 
              Click to pause and explore manually.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Details -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="font-serif text-3xl text-stone-900 text-center mb-12">
          Technical Features
        </h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="flex items-start gap-4 p-6 bg-stone-50">
            <div class="w-10 h-10 bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-stone-900 mb-1">DRACO Compression</h3>
              <p class="text-sm text-stone-600">
                Supports DRACO-compressed GLB/GLTF files for faster loading times.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-stone-50">
            <div class="w-10 h-10 bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-stone-900 mb-1">CORS Proxy</h3>
              <p class="text-sm text-stone-600">
                Server-side proxy handles cross-origin requests securely.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-stone-50">
            <div class="w-10 h-10 bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-stone-900 mb-1">ACES Tone Mapping</h3>
              <p class="text-sm text-stone-600">
                Professional-grade color rendering with anti-banding.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-stone-50">
            <div class="w-10 h-10 bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-stone-900 mb-1">Smart Centering</h3>
              <p class="text-sm text-stone-600">
                Automatically centers models by ignoring shadow planes.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-stone-50">
            <div class="w-10 h-10 bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-stone-900 mb-1">Environment Lighting</h3>
              <p class="text-sm text-stone-600">
                RoomEnvironment provides realistic studio lighting.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-stone-50">
            <div class="w-10 h-10 bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-stone-900 mb-1">Fullscreen Mode</h3>
              <p class="text-sm text-stone-600">
                Expand to fullscreen for an immersive viewing experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-stone-900 text-white">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="font-serif text-3xl mb-6">
          Ready to Experience 3D?
        </h2>
        <p class="text-stone-400 mb-8 max-w-xl mx-auto">
          Visit our demo product page to see the 3D viewer in action. 
          The "Chair (3D Demo)" product has a fully interactive 3D model.
        </p>
        <NuxtLink 
          to="/product/019560bbbe727c0798e5befef9665b56"
          class="inline-flex items-center gap-3 bg-amber-500 text-white px-8 py-4 text-lg hover:bg-amber-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          View 3D Demo
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'furniture'
})

useHead({
  title: '3D Product Viewer Demo | Furniture Store',
  meta: [
    { name: 'description', content: 'Experience our products in stunning 3D. Rotate, zoom, and explore every detail with our interactive Three.js viewer.' }
  ]
})
</script>
