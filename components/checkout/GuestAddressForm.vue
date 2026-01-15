<script setup lang="ts">
/**
 * GuestAddressForm - Adressformular für Gast-Checkout
 * Verwendet wiederverwendbare Form-Komponenten
 * ~85 Zeilen
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
    <!-- Email -->
    <CheckoutFormInput
      id="email"
      v-model="formData.email"
      label="E-Mail-Adresse"
      type="email"
      autocomplete="email"
      placeholder="ihre@email.de"
      :disabled="disabled"
      :error="errors.email"
      :show-success="true"
      :theme-colors="themeColors"
      @blur="validateEmail"
    />

    <!-- Name Row -->
    <div class="grid grid-cols-2 gap-4">
      <CheckoutFormInput
        id="firstName"
        v-model="formData.firstName"
        label="Vorname"
        autocomplete="given-name"
        placeholder="Max"
        :disabled="disabled"
        :error="errors.firstName"
        :theme-colors="themeColors"
        @blur="validateField('firstName')"
      />
      <CheckoutFormInput
        id="lastName"
        v-model="formData.lastName"
        label="Nachname"
        autocomplete="family-name"
        placeholder="Mustermann"
        :disabled="disabled"
        :error="errors.lastName"
        :theme-colors="themeColors"
        @blur="validateField('lastName')"
      />
    </div>

    <!-- Street -->
    <CheckoutFormInput
      id="street"
      v-model="formData.street"
      label="Straße und Hausnummer"
      autocomplete="street-address"
      placeholder="Musterstraße 123"
      :disabled="disabled"
      :error="errors.street"
      :theme-colors="themeColors"
      @blur="validateField('street')"
    />

    <!-- City & Zipcode Row -->
    <div class="grid grid-cols-3 gap-4">
      <CheckoutFormInput
        id="zipcode"
        v-model="formData.zipcode"
        label="PLZ"
        autocomplete="postal-code"
        placeholder="12345"
        :disabled="disabled"
        :error="errors.zipcode"
        :theme-colors="themeColors"
        @blur="validateField('zipcode')"
      />
      <div class="col-span-2">
        <CheckoutFormInput
          id="city"
          v-model="formData.city"
          label="Stadt"
          autocomplete="address-level2"
          placeholder="Berlin"
          :disabled="disabled"
          :error="errors.city"
          :theme-colors="themeColors"
          @blur="validateField('city')"
        />
      </div>
    </div>

    <!-- Country -->
    <CheckoutFormSelect
      id="country"
      v-model="formData.countryId"
      label="Land"
      :options="countries"
      placeholder="Land auswählen"
      :disabled="disabled"
      :error="errors.countryId"
      :theme-colors="themeColors"
      @change="validateField('countryId')"
    />

    <!-- Phone (optional) -->
    <CheckoutFormInput
      id="phone"
      v-model="formData.phoneNumber"
      label="Telefon"
      type="tel"
      autocomplete="tel"
      placeholder="+49 123 456789"
      :required="false"
      :disabled="disabled"
      :theme-colors="themeColors"
    />
  </div>
</template>
