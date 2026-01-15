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

    <!-- Account Section -->
    <div class="space-y-4">
      <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider">Kontodaten</h3>
      
      <!-- Email -->
      <div>
        <label for="register-email" class="block text-sm font-medium text-stone-900 mb-1">
          E-Mail-Adresse *
        </label>
        <input
          id="register-email"
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="register-password" class="block text-sm font-medium text-stone-900 mb-1">
            Passwort *
          </label>
          <div class="relative">
            <input
              id="register-password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              :disabled="isLoading"
              @blur="validatePassword"
              @input="validatePasswordConfirm"
              class="w-full px-4 py-3 pr-12 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Min. 8 Zeichen"
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

        <div>
          <label for="register-password-confirm" class="block text-sm font-medium text-stone-900 mb-1">
            Passwort bestätigen *
          </label>
          <input
            id="register-password-confirm"
            v-model="formData.passwordConfirm"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            :disabled="isLoading"
            @blur="validatePasswordConfirm"
            class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
            :class="{ 'border-red-500': errors.passwordConfirm }"
            placeholder="Passwort wiederholen"
          />
          <p v-if="errors.passwordConfirm" class="mt-1 text-sm text-red-500">{{ errors.passwordConfirm }}</p>
        </div>
      </div>
    </div>

    <!-- Personal Data Section -->
    <div class="space-y-4 pt-4 border-t border-stone-200">
      <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider">Persönliche Daten</h3>
      
      <!-- Salutation -->
      <div>
        <label for="register-salutation" class="block text-sm font-medium text-stone-900 mb-1">
          Anrede *
        </label>
        <select
          id="register-salutation"
          v-model="formData.salutationId"
          required
          :disabled="isLoading || salutationsLoading"
          @change="validateField('salutationId')"
          class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
          :class="{ 'border-red-500': errors.salutationId }"
        >
          <option value="">Bitte wählen</option>
          <option v-for="salutation in salutations" :key="salutation.id" :value="salutation.id">
            {{ salutation.translated?.displayName || salutation.displayName }}
          </option>
        </select>
        <p v-if="errors.salutationId" class="mt-1 text-sm text-red-500">{{ errors.salutationId }}</p>
      </div>

      <!-- Name -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="register-firstname" class="block text-sm font-medium text-stone-900 mb-1">
            Vorname *
          </label>
          <input
            id="register-firstname"
            v-model="formData.firstName"
            type="text"
            autocomplete="given-name"
            required
            :disabled="isLoading"
            @blur="validateField('firstName')"
            class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
            :class="{ 'border-red-500': errors.firstName }"
            placeholder="Max"
          />
          <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
        </div>

        <div>
          <label for="register-lastname" class="block text-sm font-medium text-stone-900 mb-1">
            Nachname *
          </label>
          <input
            id="register-lastname"
            v-model="formData.lastName"
            type="text"
            autocomplete="family-name"
            required
            :disabled="isLoading"
            @blur="validateField('lastName')"
            class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
            :class="{ 'border-red-500': errors.lastName }"
            placeholder="Mustermann"
          />
          <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
        </div>
      </div>
    </div>

    <!-- Address Section -->
    <div class="space-y-4 pt-4 border-t border-stone-200">
      <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider">Adresse</h3>
      
      <!-- Street -->
      <div>
        <label for="register-street" class="block text-sm font-medium text-stone-900 mb-1">
          Straße und Hausnummer *
        </label>
        <input
          id="register-street"
          v-model="formData.street"
          type="text"
          autocomplete="street-address"
          required
          :disabled="isLoading"
          @blur="validateField('street')"
          class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
          :class="{ 'border-red-500': errors.street }"
          placeholder="Musterstraße 123"
        />
        <p v-if="errors.street" class="mt-1 text-sm text-red-500">{{ errors.street }}</p>
      </div>

      <!-- City & Zipcode -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="register-zipcode" class="block text-sm font-medium text-stone-900 mb-1">
            PLZ *
          </label>
          <input
            id="register-zipcode"
            v-model="formData.zipcode"
            type="text"
            autocomplete="postal-code"
            required
            :disabled="isLoading"
            @blur="validateField('zipcode')"
            class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
            :class="{ 'border-red-500': errors.zipcode }"
            placeholder="12345"
          />
          <p v-if="errors.zipcode" class="mt-1 text-sm text-red-500">{{ errors.zipcode }}</p>
        </div>

        <div class="col-span-2">
          <label for="register-city" class="block text-sm font-medium text-stone-900 mb-1">
            Stadt *
          </label>
          <input
            id="register-city"
            v-model="formData.city"
            type="text"
            autocomplete="address-level2"
            required
            :disabled="isLoading"
            @blur="validateField('city')"
            class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
            :class="{ 'border-red-500': errors.city }"
            placeholder="Berlin"
          />
          <p v-if="errors.city" class="mt-1 text-sm text-red-500">{{ errors.city }}</p>
        </div>
      </div>

      <!-- Country -->
      <div>
        <label for="register-country" class="block text-sm font-medium text-stone-900 mb-1">
          Land *
        </label>
        <select
          id="register-country"
          v-model="formData.countryId"
          required
          :disabled="isLoading || countriesLoading"
          @change="handleCountryChange"
          class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
          :class="{ 'border-red-500': errors.countryId }"
        >
          <option value="">Land auswählen</option>
          <option v-for="country in countries" :key="country.id" :value="country.id">
            {{ country.translated?.name || country.name }}
          </option>
        </select>
        <p v-if="errors.countryId" class="mt-1 text-sm text-red-500">{{ errors.countryId }}</p>
      </div>

      <!-- Country State (if available) -->
      <div v-if="selectedCountryStates.length > 0">
        <label for="register-state" class="block text-sm font-medium text-stone-900 mb-1">
          Bundesland
        </label>
        <select
          id="register-state"
          v-model="formData.countryStateId"
          :disabled="isLoading"
          class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
        >
          <option value="">Bitte wählen (optional)</option>
          <option v-for="state in selectedCountryStates" :key="state.id" :value="state.id">
            {{ state.translated?.name || state.name }}
          </option>
        </select>
      </div>

      <!-- Phone -->
      <div>
        <label for="register-phone" class="block text-sm font-medium text-stone-900 mb-1">
          Telefon <span class="text-stone-400">(optional)</span>
        </label>
        <input
          id="register-phone"
          v-model="formData.phoneNumber"
          type="tel"
          autocomplete="tel"
          :disabled="isLoading"
          class="w-full px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors disabled:opacity-50 disabled:bg-stone-50"
          placeholder="+49 123 456789"
        />
      </div>
    </div>

    <!-- Terms Section -->
    <div class="pt-4 border-t border-stone-200">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          v-model="formData.acceptTerms"
          required
          :disabled="isLoading"
          class="mt-1 w-5 h-5 text-stone-900 border-stone-300 focus:ring-stone-900"
        />
        <span class="text-sm text-stone-600">
          Ich habe die 
          <a href="#" class="text-stone-900 underline hover:no-underline">AGB</a> und 
          <a href="#" class="text-stone-900 underline hover:no-underline">Datenschutzbestimmungen</a> 
          gelesen und akzeptiere diese. *
        </span>
      </label>
      <p v-if="errors.acceptTerms" class="mt-1 text-sm text-red-500">{{ errors.acceptTerms }}</p>
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
        Registrierung läuft...
      </span>
      <span v-else>Konto erstellen</span>
    </button>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-stone-200" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white text-stone-500">oder</span>
      </div>
    </div>

    <!-- Google Register -->
    <button
      type="button"
      @click="handleGoogleRegister"
      :disabled="isLoading"
      class="w-full py-3 px-4 bg-white border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Mit Google registrieren
    </button>

    <!-- Login Link -->
    <p class="text-center text-sm text-stone-500">
      Bereits ein Konto?
      <NuxtLink to="/account/login" class="text-stone-900 font-medium hover:underline">
        Jetzt anmelden
      </NuxtLink>
    </p>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'success', customer: ShopwareCustomer): void
  (e: 'error', message: string): void
}>()

const { register, loading } = useShopwareAuth()
const { fetchCountries, fetchSalutations, countries: cartCountries, salutations: cartSalutations } = useShopwareCart()

const isLoading = computed(() => loading.value)

// Local state for countries and salutations
const countries = ref<ShopwareCountry[]>([])
const salutations = ref<ShopwareSalutation[]>([])
const countriesLoading = ref(true)
const salutationsLoading = ref(true)

const formData = reactive<RegistrationFormData>({
  email: '',
  password: '',
  passwordConfirm: '',
  salutationId: '',
  firstName: '',
  lastName: '',
  street: '',
  zipcode: '',
  city: '',
  countryId: '',
  countryStateId: '',
  phoneNumber: '',
  acceptTerms: false,
})

const errors = reactive<Record<string, string>>({})
const globalError = ref<string | null>(null)
const showPassword = ref(false)

// Get states for selected country
const selectedCountryStates = computed(() => {
  if (!formData.countryId) return []
  const country = countries.value.find(c => c.id === formData.countryId)
  return country?.states?.filter(s => s.active) || []
})

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
  } else if (formData.password.length < 8) {
    errors.password = 'Passwort muss mindestens 8 Zeichen lang sein'
  } else {
    delete errors.password
  }
}

const validatePasswordConfirm = () => {
  if (formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Passwörter stimmen nicht überein'
  } else {
    delete errors.passwordConfirm
  }
}

const validateField = (fieldName: string) => {
  const value = formData[fieldName as keyof typeof formData]
  if (!value || (typeof value === 'string' && !value.trim())) {
    const fieldLabels: Record<string, string> = {
      salutationId: 'Anrede',
      firstName: 'Vorname',
      lastName: 'Nachname',
      street: 'Straße',
      zipcode: 'PLZ',
      city: 'Stadt',
      countryId: 'Land',
    }
    errors[fieldName] = `${fieldLabels[fieldName] || fieldName} ist erforderlich`
  } else {
    delete errors[fieldName]
  }
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  validateEmail()
  validatePassword()
  validatePasswordConfirm()
  validateField('salutationId')
  validateField('firstName')
  validateField('lastName')
  validateField('street')
  validateField('zipcode')
  validateField('city')
  validateField('countryId')
  
  if (!formData.acceptTerms) {
    errors.acceptTerms = 'Sie müssen die AGB und Datenschutzbestimmungen akzeptieren'
  }

  return Object.keys(errors).length === 0
}

const handleCountryChange = () => {
  validateField('countryId')
  formData.countryStateId = ''
}

const handleSubmit = async () => {
  globalError.value = null
  
  if (!validateForm()) {
    // Scroll to first error
    const firstErrorKey = Object.keys(errors)[0]
    const errorElement = document.getElementById(`register-${firstErrorKey}`)
    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  try {
    const customer = await register(formData)
    emit('success', customer)
  } catch (err: any) {
    globalError.value = err.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
    emit('error', globalError.value)
  }
}

const handleGoogleRegister = () => {
  // Placeholder for Google OAuth
  alert('Google-Registrierung erfordert ein OAuth-Plugin in Shopware. Diese Funktion ist derzeit nicht verfügbar.')
}

// Load countries and salutations
onMounted(async () => {
  try {
    // Try to use cached data from cart composable first
    if (cartCountries.value.length > 0) {
      countries.value = cartCountries.value
    } else {
      await fetchCountries()
      countries.value = cartCountries.value
    }
    
    // Set Germany as default
    const germany = countries.value.find(c => c.iso === 'DE')
    if (germany) {
      formData.countryId = germany.id
    }
  } catch (err) {
    console.error('Error loading countries:', err)
  } finally {
    countriesLoading.value = false
  }

  try {
    if (cartSalutations.value.length > 0) {
      salutations.value = cartSalutations.value
    } else {
      await fetchSalutations()
      salutations.value = cartSalutations.value
    }
  } catch (err) {
    console.error('Error loading salutations:', err)
  } finally {
    salutationsLoading.value = false
  }
})
</script>
