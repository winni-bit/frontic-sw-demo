<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="pt-32 pb-20 bg-stone-50">
      <div class="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6">
          Our Story
        </h1>
        <p class="text-xl text-stone-600 font-light leading-relaxed">
          We believe in the power of exceptional design and quality craftsmanship 
          to transform everyday moments into extraordinary experiences.
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="font-serif text-3xl md:text-4xl text-stone-900 mb-6">
              Crafted with Purpose
            </h2>
            <p class="text-stone-600 font-light leading-relaxed mb-6">
              Since our founding, we have been committed to creating products that 
              stand the test of time. Every piece in our collection is thoughtfully 
              designed and meticulously crafted using only the finest materials.
            </p>
            <p class="text-stone-600 font-light leading-relaxed">
              We work with skilled artisans and ethical suppliers who share our 
              passion for quality and sustainability. Our goal is to offer you 
              products that not only look beautiful but also make a positive 
              impact on the world.
            </p>
          </div>
          <div class="aspect-[4/5] bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400" />
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 bg-stone-900 text-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 class="font-serif text-3xl md:text-4xl text-center mb-16">
          Our Values
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 border border-white/30 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 class="font-serif text-xl mb-3">Quality</h3>
            <p class="text-white/70 font-light text-sm">
              We never compromise on quality. Every product meets our rigorous standards for materials and craftsmanship.
            </p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 border border-white/30 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-serif text-xl mb-3">Sustainability</h3>
            <p class="text-white/70 font-light text-sm">
              We're committed to reducing our environmental footprint through responsible sourcing and production.
            </p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 border border-white/30 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="font-serif text-xl mb-3">Community</h3>
            <p class="text-white/70 font-light text-sm">
              We believe in giving back and supporting the communities where we live and work.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <h2 class="font-serif text-3xl md:text-4xl text-stone-900 mb-6">
          Join Our Journey
        </h2>
        <p class="text-stone-600 font-light mb-8">
          Discover our collection and become part of a community that values 
          quality, sustainability, and timeless design.
        </p>
        <NuxtLink 
          to="/products" 
          class="btn-luxury inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors"
        >
          Shop Now
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
