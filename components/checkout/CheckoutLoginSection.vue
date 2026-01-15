<script setup lang="ts">
/**
 * Checkout Login Section
 * Allows users to login during checkout or continue as guest
 */

const props = defineProps<{
  isIndustryTheme: boolean
}>()

const emit = defineEmits<{
  (e: 'login-success'): void
  (e: 'continue-guest'): void
}>()

const { login, isLoggedIn } = useShopwareAuth()

const showLoginForm = ref(false)
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const isLoading = ref(false)

const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      cardBg: 'bg-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      border: 'border-slate-700',
      inputBg: 'bg-slate-800',
      inputBorder: 'border-slate-700',
      inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
      buttonSecondary: 'bg-slate-700 hover:bg-slate-600',
      accent: 'text-blue-400',
    }
  }
  return {
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    inputBg: 'bg-white',
    inputBorder: 'border-stone-200',
    inputFocus: 'focus:ring-stone-900 focus:border-stone-900',
    buttonPrimary: 'bg-stone-900 hover:bg-stone-800',
    buttonSecondary: 'bg-stone-100 hover:bg-stone-200',
    accent: 'text-stone-900',
  }
})

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Bitte E-Mail und Passwort eingeben'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await login(email.value, password.value)
    emit('login-success')
  } catch (err: any) {
    console.error('[CheckoutLogin] Error:', err)
    error.value = err.message || 'Anmeldung fehlgeschlagen'
  } finally {
    isLoading.value = false
  }
}

const handleContinueAsGuest = () => {
  emit('continue-guest')
}
</script>

<template>
  <div :class="['p-6 shadow-sm mb-6', themeColors.cardBg]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 :class="['text-lg font-medium', themeColors.text]">
        Bereits Kunde?
      </h2>
      <button
        v-if="!showLoginForm"
        @click="showLoginForm = true"
        :class="['text-sm font-medium underline', themeColors.accent]"
      >
        Jetzt anmelden
      </button>
    </div>

    <!-- Collapsed State -->
    <div v-if="!showLoginForm">
      <p :class="['text-sm mb-4', themeColors.textMuted]">
        Melden Sie sich an, um Ihre gespeicherten Adressen zu verwenden und Ihre Bestellung zu verfolgen.
      </p>
      <div class="flex gap-3">
        <button
          @click="showLoginForm = true"
          :class="['flex-1 py-3 text-sm font-medium text-white transition-colors', themeColors.buttonPrimary]"
        >
          Anmelden
        </button>
        <button
          @click="handleContinueAsGuest"
          :class="['flex-1 py-3 text-sm font-medium transition-colors', themeColors.buttonSecondary, themeColors.text]"
        >
          Als Gast fortfahren
        </button>
      </div>
    </div>

    <!-- Login Form -->
    <div v-else>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Error Message -->
        <div v-if="error" class="p-3 bg-red-900/30 border border-red-700 text-red-300 text-sm">
          {{ error }}
        </div>

        <!-- Email -->
        <div>
          <label :class="['block text-sm font-medium mb-1', themeColors.text]">
            E-Mail-Adresse
          </label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            :disabled="isLoading"
            :class="[
              'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
              themeColors.inputBg,
              themeColors.inputBorder,
              themeColors.inputFocus,
              themeColors.text,
              isLoading ? 'opacity-50' : ''
            ]"
            placeholder="ihre@email.de"
          />
        </div>

        <!-- Password -->
        <div>
          <label :class="['block text-sm font-medium mb-1', themeColors.text]">
            Passwort
          </label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            :disabled="isLoading"
            :class="[
              'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
              themeColors.inputBg,
              themeColors.inputBorder,
              themeColors.inputFocus,
              themeColors.text,
              isLoading ? 'opacity-50' : ''
            ]"
            placeholder="••••••••"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            :class="['flex-1 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50', themeColors.buttonPrimary]"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Anmelden...
            </span>
            <span v-else>Anmelden</span>
          </button>
          <button
            type="button"
            @click="showLoginForm = false"
            :disabled="isLoading"
            :class="['px-4 py-3 text-sm transition-colors', themeColors.textMuted]"
          >
            Abbrechen
          </button>
        </div>

        <!-- Links -->
        <div class="flex justify-between text-sm pt-2">
          <NuxtLink to="/account/forgot-password" :class="['underline', themeColors.textMuted]">
            Passwort vergessen?
          </NuxtLink>
          <NuxtLink to="/account/register" :class="['underline', themeColors.textMuted]">
            Neu hier? Registrieren
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
