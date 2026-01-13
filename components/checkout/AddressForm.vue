<script setup lang="ts">
/**
 * Guest Checkout Address Form
 * 
 * Collects customer information for guest checkout:
 * - Email, Name, Address
 * - Country dropdown with states
 * - Form validation
 */

interface Props {
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  submit: [data: CheckoutFormData]
}>()

const {
  countries,
  salutations,
  fetchCountries,
  fetchSalutations,
} = useShopwareCart()

// Form data
const formData = reactive<CheckoutFormData>({
  email: '',
  salutationId: '',
  firstName: '',
  lastName: '',
  street: '',
  zipcode: '',
  city: '',
  countryId: '',
  countryStateId: '',
  phoneNumber: '',
})

// Validation errors
const errors = reactive<Record<string, string>>({})

// Loading state for initial data
const initialLoading = ref(true)

// Get states for selected country
const countryStates = computed(() => {
  if (!formData.countryId) return []
  const country = countries.value.find(c => c.id === formData.countryId)
  return country?.states?.filter(s => s.active) || []
})

// Validate form
const validate = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])

  // Email validation
  if (!formData.email) {
    errors.email = 'E-Mail ist erforderlich'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Ungültige E-Mail-Adresse'
  }

  // Name validation
  if (!formData.firstName?.trim()) {
    errors.firstName = 'Vorname ist erforderlich'
  }
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Nachname ist erforderlich'
  }

  // Address validation
  if (!formData.street?.trim()) {
    errors.street = 'Straße ist erforderlich'
  }
  if (!formData.zipcode?.trim()) {
    errors.zipcode = 'PLZ ist erforderlich'
  }
  if (!formData.city?.trim()) {
    errors.city = 'Stadt ist erforderlich'
  }
  if (!formData.countryId) {
    errors.countryId = 'Land ist erforderlich'
  }

  // State validation (if country has states)
  if (countryStates.value.length > 0 && !formData.countryStateId) {
    errors.countryStateId = 'Bundesland ist erforderlich'
  }

  return Object.keys(errors).length === 0
}

// Handle form submission
const handleSubmit = () => {
  if (validate()) {
    emit('submit', { ...formData })
  }
}

// Reset state when country changes
watch(() => formData.countryId, () => {
  formData.countryStateId = ''
})

// Load initial data
onMounted(async () => {
  try {
    await Promise.all([
      fetchCountries(),
      fetchSalutations(),
    ])

    // Set default salutation
    if (salutations.value.length > 0) {
      formData.salutationId = salutations.value[0].id
    }

    // Set default country (Germany if available)
    const germany = countries.value.find(c => c.iso === 'DE')
    if (germany) {
      formData.countryId = germany.id
    } else if (countries.value.length > 0) {
      formData.countryId = countries.value[0].id
    }
  } catch (error) {
    console.error('Error loading form data:', error)
  } finally {
    initialLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-medium text-stone-900">Lieferadresse</h2>

    <!-- Loading State -->
    <div v-if="initialLoading" class="space-y-4">
      <div class="h-12 bg-stone-100 animate-pulse rounded" />
      <div class="grid grid-cols-2 gap-4">
        <div class="h-12 bg-stone-100 animate-pulse rounded" />
        <div class="h-12 bg-stone-100 animate-pulse rounded" />
      </div>
      <div class="h-12 bg-stone-100 animate-pulse rounded" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-stone-700 mb-1">
          E-Mail-Adresse *
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 border rounded-none transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
            errors.email ? 'border-red-500' : 'border-stone-200',
            disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
          ]"
          placeholder="ihre@email.de"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
      </div>

      <!-- Salutation -->
      <div v-if="salutations.length > 1">
        <label for="salutation" class="block text-sm font-medium text-stone-700 mb-1">
          Anrede
        </label>
        <select
          id="salutation"
          v-model="formData.salutationId"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 border rounded-none transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
            'border-stone-200',
            disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
          ]"
        >
          <option v-for="salutation in salutations" :key="salutation.id" :value="salutation.id">
            {{ salutation.translated?.displayName || salutation.displayName }}
          </option>
        </select>
      </div>

      <!-- Name -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-stone-700 mb-1">
            Vorname *
          </label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            autocomplete="given-name"
            :disabled="disabled"
            :class="[
              'w-full px-4 py-3 border rounded-none transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
              errors.firstName ? 'border-red-500' : 'border-stone-200',
              disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
            ]"
            placeholder="Max"
          />
          <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
        </div>
        <div>
          <label for="lastName" class="block text-sm font-medium text-stone-700 mb-1">
            Nachname *
          </label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            autocomplete="family-name"
            :disabled="disabled"
            :class="[
              'w-full px-4 py-3 border rounded-none transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
              errors.lastName ? 'border-red-500' : 'border-stone-200',
              disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
            ]"
            placeholder="Mustermann"
          />
          <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
        </div>
      </div>

      <!-- Street -->
      <div>
        <label for="street" class="block text-sm font-medium text-stone-700 mb-1">
          Straße und Hausnummer *
        </label>
        <input
          id="street"
          v-model="formData.street"
          type="text"
          autocomplete="street-address"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 border rounded-none transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
            errors.street ? 'border-red-500' : 'border-stone-200',
            disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
          ]"
          placeholder="Musterstraße 123"
        />
        <p v-if="errors.street" class="mt-1 text-sm text-red-500">{{ errors.street }}</p>
      </div>

      <!-- City & Zipcode -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="zipcode" class="block text-sm font-medium text-stone-700 mb-1">
            PLZ *
          </label>
          <input
            id="zipcode"
            v-model="formData.zipcode"
            type="text"
            autocomplete="postal-code"
            :disabled="disabled"
            :class="[
              'w-full px-4 py-3 border rounded-none transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
              errors.zipcode ? 'border-red-500' : 'border-stone-200',
              disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
            ]"
            placeholder="12345"
          />
          <p v-if="errors.zipcode" class="mt-1 text-sm text-red-500">{{ errors.zipcode }}</p>
        </div>
        <div class="col-span-2">
          <label for="city" class="block text-sm font-medium text-stone-700 mb-1">
            Stadt *
          </label>
          <input
            id="city"
            v-model="formData.city"
            type="text"
            autocomplete="address-level2"
            :disabled="disabled"
            :class="[
              'w-full px-4 py-3 border rounded-none transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
              errors.city ? 'border-red-500' : 'border-stone-200',
              disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
            ]"
            placeholder="Berlin"
          />
          <p v-if="errors.city" class="mt-1 text-sm text-red-500">{{ errors.city }}</p>
        </div>
      </div>

      <!-- Country -->
      <div>
        <label for="country" class="block text-sm font-medium text-stone-700 mb-1">
          Land *
        </label>
        <select
          id="country"
          v-model="formData.countryId"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 border rounded-none transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
            errors.countryId ? 'border-red-500' : 'border-stone-200',
            disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
          ]"
        >
          <option value="">Land auswählen</option>
          <option v-for="country in countries" :key="country.id" :value="country.id">
            {{ country.translated?.name || country.name }}
          </option>
        </select>
        <p v-if="errors.countryId" class="mt-1 text-sm text-red-500">{{ errors.countryId }}</p>
      </div>

      <!-- Country State (if available) -->
      <div v-if="countryStates.length > 0">
        <label for="countryState" class="block text-sm font-medium text-stone-700 mb-1">
          Bundesland *
        </label>
        <select
          id="countryState"
          v-model="formData.countryStateId"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 border rounded-none transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
            errors.countryStateId ? 'border-red-500' : 'border-stone-200',
            disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
          ]"
        >
          <option value="">Bundesland auswählen</option>
          <option v-for="state in countryStates" :key="state.id" :value="state.id">
            {{ state.translated?.name || state.name }}
          </option>
        </select>
        <p v-if="errors.countryStateId" class="mt-1 text-sm text-red-500">{{ errors.countryStateId }}</p>
      </div>

      <!-- Phone (optional) -->
      <div>
        <label for="phone" class="block text-sm font-medium text-stone-700 mb-1">
          Telefon <span class="text-stone-400">(optional)</span>
        </label>
        <input
          id="phone"
          v-model="formData.phoneNumber"
          type="tel"
          autocomplete="tel"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 border rounded-none transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900',
            'border-stone-200',
            disabled ? 'bg-stone-50 text-stone-500' : 'bg-white'
          ]"
          placeholder="+49 123 456789"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || disabled"
        :class="[
          'w-full py-4 text-sm font-medium uppercase tracking-wider transition-all',
          loading || disabled
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
            : 'bg-stone-900 text-white hover:bg-stone-800'
        ]"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Wird gespeichert...
        </span>
        <span v-else>Weiter zur Versandart</span>
      </button>
    </form>
  </div>
</template>
