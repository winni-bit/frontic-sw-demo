<script setup lang="ts">
/**
 * FormInput - Wiederverwendbares Input-Feld mit Validation
 * ~55 Zeilen
 */

interface Props {
  id: string
  modelValue: string
  label: string
  type?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  disabled?: boolean
  error?: string
  showSuccess?: boolean
  themeColors: {
    text: string
    textSecondary?: string
    inputBg: string
    inputBorder: string
    inputFocus: string
    success: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  autocomplete: '',
  required: true,
  disabled: false,
  error: '',
  showSuccess: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()
</script>

<template>
  <div>
    <label :for="id" :class="['block text-sm font-medium mb-1', themeColors.text]">
      {{ label }} <span v-if="required">*</span>
      <span v-if="!required && themeColors.textSecondary" :class="themeColors.textSecondary">(optional)</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="type"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :placeholder="placeholder"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
        :class="[
          'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
          themeColors.inputBg,
          error ? 'border-red-500' : themeColors.inputBorder,
          themeColors.inputFocus,
          themeColors.text,
          disabled ? 'opacity-50' : '',
          showSuccess ? 'pr-10' : ''
        ]"
      />
      <!-- Success indicator -->
      <div v-if="showSuccess && modelValue && !error" class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg :class="['w-5 h-5', themeColors.success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
