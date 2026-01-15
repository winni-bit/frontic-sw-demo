<script setup lang="ts">
/**
 * FormSelect - Wiederverwendbares Select-Feld
 * ~50 Zeilen
 */

interface Option {
  id: string
  name?: string
  translated?: { name?: string }
}

interface Props {
  id: string
  modelValue: string
  label: string
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  themeColors: {
    text: string
    inputBg: string
    inputBorder: string
    inputFocus: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Bitte auswählen',
  required: true,
  disabled: false,
  error: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: []
}>()

const getOptionLabel = (option: Option) => {
  return option.translated?.name || option.name || option.id
}
</script>

<template>
  <div>
    <label :for="id" :class="['block text-sm font-medium mb-1', themeColors.text]">
      {{ label }} <span v-if="required">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value); emit('change')"
      :class="[
        'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
        themeColors.inputBg,
        error ? 'border-red-500' : themeColors.inputBorder,
        themeColors.inputFocus,
        themeColors.text,
        disabled ? 'opacity-50' : ''
      ]"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ getOptionLabel(option) }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
