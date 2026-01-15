<script setup lang="ts">
/**
 * FilterCheckbox - Einzelne Checkbox-Option für Filter
 * ~30 Zeilen
 */

interface Props {
  modelValue: boolean
  label: string
  badge?: string
  badgeClass?: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  badge: '',
  badgeClass: '',
  count: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label class="flex items-center gap-3 cursor-pointer group">
    <input 
      type="checkbox"
      :checked="modelValue"
      class="w-5 h-5 border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
      @change="handleChange"
    />
    <span class="text-stone-700 group-hover:text-stone-900 flex-1">
      {{ label }}
    </span>
    <span v-if="badge" :class="['text-sm', badgeClass]">{{ badge }}</span>
    <span v-if="count !== undefined" class="text-stone-400 text-sm">{{ count }}</span>
  </label>
</template>
