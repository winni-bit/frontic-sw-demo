<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Global Error -->
    <div
      v-if="globalError"
      class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm"
    >
      <div class="flex gap-3">
        <svg class="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ globalError }}</span>
      </div>
    </div>

    <!-- Email -->
    <div>
      <label for="login-email" class="block text-sm font-medium text-stone-900 mb-1">
        E-Mail-Adresse
      </label>
      <input
        id="login-email"
        v-model="formData.email"
        type="email"
        autocomplete="email"
        required
        :disabled="isLoading"
        @blur="validateEmail"
        class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
        :class="{ 'border-red-500': errors.email }"
        placeholder="ihre@email.de"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
    </div>

    <!-- Password -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <label for="login-password" class="block text-sm font-medium text-stone-900">
          Passwort
        </label>
        <NuxtLink 
          to="/account/forgot-password" 
          class="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          Passwort vergessen?
        </NuxtLink>
      </div>
      <div class="relative">
        <input
          id="login-password"
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          required
          :disabled="isLoading"
          @blur="validatePassword"
          class="w-full px-4 py-3 pr-12 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
          :class="{ 'border-red-500': errors.password }"
          placeholder="••••••••"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
      <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full py-3 px-4 bg-stone-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isLoading" class="flex items-center justify-center gap-2">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Anmeldung läuft...
      </span>
      <span v-else>Anmelden</span>
    </button>

    <!-- Register Link -->
    <p class="text-center text-sm text-stone-500 pt-4 border-t border-stone-100">
      Noch kein Konto?
      <NuxtLink to="/account/register" class="text-stone-900 font-medium hover:underline">
        Jetzt registrieren
      </NuxtLink>
    </p>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'success', customer: ShopwareCustomer): void
  (e: 'error', message: string): void
}>()

const { login, loading } = useShopwareAuth()

const isLoading = computed(() => loading.value)

const formData = reactive({
  email: '',
  password: '',
})

const errors = reactive<Record<string, string>>({})
const globalError = ref<string | null>(null)
const showPassword = ref(false)

const validateEmail = () => {
  if (!formData.email) {
    errors.email = 'E-Mail ist erforderlich'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Ungültige E-Mail-Adresse'
  } else {
    delete errors.email
  }
}

const validatePassword = () => {
  if (!formData.password) {
    errors.password = 'Passwort ist erforderlich'
  } else {
    delete errors.password
  }
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key])
  validateEmail()
  validatePassword()
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  globalError.value = null
  
  if (!validateForm()) {
    return
  }

  try {
    const customer = await login(formData.email, formData.password)
    emit('success', customer)
  } catch (err: any) {
    globalError.value = err.message || 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.'
    emit('error', globalError.value)
  }
}
</script>
