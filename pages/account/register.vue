<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
})

useHead({
  title: 'Registrieren - Furniture',
})

const router = useRouter()
const { isLoggedIn } = useShopwareAuth()

// Redirect if already logged in
watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    router.push('/account')
  }
}, { immediate: true })

const handleRegisterSuccess = (customer: ShopwareCustomer) => {
  console.log('Registration successful:', customer.email)
  router.push('/account')
}

const handleRegisterError = (message: string) => {
  console.error('Registration error:', message)
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="font-serif text-3xl text-stone-900 mb-2">Konto erstellen</h1>
          <p class="text-stone-500">Registrieren Sie sich für ein persönliches Einkaufserlebnis</p>
        </div>

        <!-- Register Form Card -->
        <div class="bg-white p-8 shadow-sm">
          <AccountRegisterForm 
            @success="handleRegisterSuccess"
            @error="handleRegisterError"
          />
        </div>

        <!-- Benefits -->
        <div class="mt-8">
          <h3 class="text-sm font-medium text-stone-900 mb-4 text-center">Ihre Vorteile mit einem Kundenkonto</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-4 shadow-sm text-center">
              <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-xs text-stone-600">Schneller Checkout</p>
            </div>
            <div class="bg-white p-4 shadow-sm text-center">
              <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p class="text-xs text-stone-600">Bestellverlauf</p>
            </div>
            <div class="bg-white p-4 shadow-sm text-center">
              <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p class="text-xs text-stone-600">Adressverwaltung</p>
            </div>
            <div class="bg-white p-4 shadow-sm text-center">
              <div class="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p class="text-xs text-stone-600">Wunschliste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
