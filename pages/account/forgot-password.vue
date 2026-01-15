<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
})

useHead({
  title: 'Passwort vergessen - Furniture',
})

const email = ref('')
const submitted = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  if (!email.value) {
    error.value = 'Bitte geben Sie Ihre E-Mail-Adresse ein'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Placeholder - In production, this would call the Shopware API
    // POST /account/recovery-password
    await new Promise(resolve => setTimeout(resolve, 1000))
    submitted.value = true
  } catch (err: any) {
    error.value = err.message || 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-md mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="font-serif text-3xl text-stone-900 mb-2">Passwort vergessen?</h1>
          <p class="text-stone-500">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        <!-- Success Message -->
        <div v-if="submitted" class="bg-white p-8 shadow-sm text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-lg font-medium text-stone-900 mb-2">E-Mail gesendet</h2>
          <p class="text-stone-500 mb-6">
            Falls ein Konto mit der E-Mail-Adresse <strong>{{ email }}</strong> existiert, 
            haben wir Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet.
          </p>
          <NuxtLink
            to="/account/login"
            class="inline-block px-6 py-3 bg-stone-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors"
          >
            Zurück zur Anmeldung
          </NuxtLink>
        </div>

        <!-- Form -->
        <div v-else class="bg-white p-8 shadow-sm">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Error -->
            <div
              v-if="error"
              class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {{ error }}
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-stone-900 mb-1">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                :disabled="loading"
                class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
                placeholder="ihre@email.de"
              />
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 px-4 bg-stone-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Wird gesendet...
              </span>
              <span v-else>Link senden</span>
            </button>

            <!-- Back Link -->
            <p class="text-center text-sm text-stone-500">
              <NuxtLink to="/account/login" class="text-stone-900 font-medium hover:underline">
                ← Zurück zur Anmeldung
              </NuxtLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
