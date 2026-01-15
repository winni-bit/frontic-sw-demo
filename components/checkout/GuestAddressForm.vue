<script setup lang="ts">
/**
 * Guest Address Form
 * 
 * Address form for guest checkout with inline validation
 */

interface Props {
  isIndustryTheme?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false,
  disabled: false,
})

const {
  formData,
  errors,
  countries,
  salutations,
  validateEmail,
  validateField,
} = useCheckout()

// Theme colors
const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      text: 'text-white',
      textMuted: 'text-slate-400',
      textSecondary: 'text-slate-500',
      inputBg: 'bg-slate-800',
      inputBorder: 'border-slate-700',
      inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
      success: 'text-green-400',
    }
  }
  return {
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    textSecondary: 'text-stone-400',
    inputBg: 'bg-white',
    inputBorder: 'border-stone-200',
    inputFocus: 'focus:ring-stone-900 focus:border-stone-900',
    success: 'text-green-600',
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Email with inline validation -->
    <div>
      <label for="email" :class="['block text-sm font-medium mb-1', themeColors.text]">
        E-Mail-Adresse *
      </label>
      <div class="relative">
        <input
          id="email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          :disabled="disabled"
          @blur="validateEmail"
          :class="[
            'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 pr-10',
            themeColors.inputBg,
            errors.email ? 'border-red-500' : themeColors.inputBorder,
            themeColors.inputFocus,
            themeColors.text,
            disabled ? 'opacity-50' : ''
          ]"
          placeholder="ihre@email.de"
        />
        <!-- Validation indicator -->
        <div v-if="formData.email && !errors.email" class="absolute right-3 top-1/2 -translate-y-1/2">
          <svg :class="['w-5 h-5', themeColors.success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
    </div>

    <!-- Name -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="firstName" :class="['block text-sm font-medium mb-1', themeColors.text]">
          Vorname *
        </label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          autocomplete="given-name"
          :disabled="disabled"
          @blur="validateField('firstName')"
          :class="[
            'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
            themeColors.inputBg,
            errors.firstName ? 'border-red-500' : themeColors.inputBorder,
            themeColors.inputFocus,
            themeColors.text,
            disabled ? 'opacity-50' : ''
          ]"
          placeholder="Max"
        />
        <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
      </div>
      <div>
        <label for="lastName" :class="['block text-sm font-medium mb-1', themeColors.text]">
          Nachname *
        </label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          autocomplete="family-name"
          :disabled="disabled"
          @blur="validateField('lastName')"
          :class="[
            'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
            themeColors.inputBg,
            errors.lastName ? 'border-red-500' : themeColors.inputBorder,
            themeColors.inputFocus,
            themeColors.text,
            disabled ? 'opacity-50' : ''
          ]"
          placeholder="Mustermann"
        />
        <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
      </div>
    </div>

    <!-- Street -->
    <div>
      <label for="street" :class="['block text-sm font-medium mb-1', themeColors.text]">
        Straße und Hausnummer *
      </label>
      <input
        id="street"
        v-model="formData.street"
        type="text"
        autocomplete="street-address"
        :disabled="disabled"
        @blur="validateField('street')"
        :class="[
          'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
          themeColors.inputBg,
          errors.street ? 'border-red-500' : themeColors.inputBorder,
          themeColors.inputFocus,
          themeColors.text,
          disabled ? 'opacity-50' : ''
        ]"
        placeholder="Musterstraße 123"
      />
      <p v-if="errors.street" class="mt-1 text-sm text-red-500">{{ errors.street }}</p>
    </div>

    <!-- City & Zipcode -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <label for="zipcode" :class="['block text-sm font-medium mb-1', themeColors.text]">
          PLZ *
        </label>
        <input
          id="zipcode"
          v-model="formData.zipcode"
          type="text"
          autocomplete="postal-code"
          :disabled="disabled"
          @blur="validateField('zipcode')"
          :class="[
            'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
            themeColors.inputBg,
            errors.zipcode ? 'border-red-500' : themeColors.inputBorder,
            themeColors.inputFocus,
            themeColors.text,
            disabled ? 'opacity-50' : ''
          ]"
          placeholder="12345"
        />
        <p v-if="errors.zipcode" class="mt-1 text-sm text-red-500">{{ errors.zipcode }}</p>
      </div>
      <div class="col-span-2">
        <label for="city" :class="['block text-sm font-medium mb-1', themeColors.text]">
          Stadt *
        </label>
        <input
          id="city"
          v-model="formData.city"
          type="text"
          autocomplete="address-level2"
          :disabled="disabled"
          @blur="validateField('city')"
          :class="[
            'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
            themeColors.inputBg,
            errors.city ? 'border-red-500' : themeColors.inputBorder,
            themeColors.inputFocus,
            themeColors.text,
            disabled ? 'opacity-50' : ''
          ]"
          placeholder="Berlin"
        />
        <p v-if="errors.city" class="mt-1 text-sm text-red-500">{{ errors.city }}</p>
      </div>
    </div>

    <!-- Country -->
    <div>
      <label for="country" :class="['block text-sm font-medium mb-1', themeColors.text]">
        Land *
      </label>
      <select
        id="country"
        v-model="formData.countryId"
        :disabled="disabled"
        @change="validateField('countryId')"
        :class="[
          'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
          themeColors.inputBg,
          errors.countryId ? 'border-red-500' : themeColors.inputBorder,
          themeColors.inputFocus,
          themeColors.text,
          disabled ? 'opacity-50' : ''
        ]"
      >
        <option value="">Land auswählen</option>
        <option v-for="country in countries" :key="country.id" :value="country.id">
          {{ country.translated?.name || country.name }}
        </option>
      </select>
      <p v-if="errors.countryId" class="mt-1 text-sm text-red-500">{{ errors.countryId }}</p>
    </div>

    <!-- Phone -->
    <div>
      <label for="phone" :class="['block text-sm font-medium mb-1', themeColors.text]">
        Telefon <span :class="themeColors.textSecondary">(optional)</span>
      </label>
      <input
        id="phone"
        v-model="formData.phoneNumber"
        type="tel"
        autocomplete="tel"
        :disabled="disabled"
        :class="[
          'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
          themeColors.inputBg,
          themeColors.inputBorder,
          themeColors.inputFocus,
          themeColors.text,
          disabled ? 'opacity-50' : ''
        ]"
        placeholder="+49 123 456789"
      />
    </div>
  </div>
</template>
