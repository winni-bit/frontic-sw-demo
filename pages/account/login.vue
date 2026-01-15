<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
})

useHead({
  title: 'Anmelden - Furniture',
})

const router = useRouter()
const route = useRoute()
const { isLoggedIn } = useShopwareAuth()

// Redirect if already logged in
watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    const redirect = route.query.redirect as string || '/account'
    router.push(redirect)
  }
}, { immediate: true })

const handleLoginSuccess = (customer: ShopwareCustomer) => {
  console.log('Login successful:', customer.email)
  const redirect = route.query.redirect as string || '/account'
  router.push(redirect)
}

const handleLoginError = (message: string) => {
  console.error('Login error:', message)
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-md mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="font-serif text-3xl text-stone-900 mb-2">Willkommen zurück</h1>
          <p class="text-stone-500">Melden Sie sich in Ihrem Konto an</p>
        </div>

        <!-- Login Form Card -->
        <div class="bg-white p-8 shadow-sm">
          <AccountLoginForm 
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>

        <!-- Benefits -->
        <div class="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-xs text-stone-500">Schneller Checkout</p>
          </div>
          <div>
            <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-xs text-stone-500">Bestellverlauf</p>
          </div>
          <div>
            <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p class="text-xs text-stone-500">Wunschliste</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
