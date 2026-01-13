<template>
  <section class="py-20 lg:py-24 bg-white">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Header -->
        <p class="text-stone-400 text-sm tracking-[0.3em] uppercase mb-4">
          Stay Connected
        </p>
        <h2 class="font-serif text-3xl md:text-4xl text-stone-900 font-medium mb-4">
          Join Our World
        </h2>
        <p class="text-stone-500 font-light mb-10">
          Be the first to discover new arrivals, exclusive offers, and curated content.
        </p>

        <!-- Newsletter Form -->
        <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="flex-1 px-6 py-4 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors text-sm"
            required
          />
          <button 
            type="submit"
            class="btn-luxury bg-stone-900 text-white px-8 py-4 text-sm tracking-wider uppercase font-medium hover:bg-stone-800 transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>

        <!-- Privacy Note -->
        <p class="text-stone-400 text-xs mt-6">
          By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const email = ref('')

const handleSubscribe = () => {
  console.log('Newsletter subscription:', email.value)
  // Here you would integrate with your newsletter service
  email.value = ''
}
</script>
