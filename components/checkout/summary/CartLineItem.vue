<script setup lang="ts">
/**
 * CartLineItem - Einzelnes Produkt im Warenkorb
 * ~75 Zeilen
 */

interface Props {
  item: ShopwareLineItem
  isUpdating: boolean
  formatPrice: (price: number) => string
  themeColors: {
    text: string
    textMuted: string
    textSecondary: string
    border: string
    itemBg: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateQuantity: [quantity: number]
  remove: []
}>()

const imageUrl = computed(() => props.item.cover?.url || null)
</script>

<template>
  <div :class="['py-4 transition-opacity', isUpdating && 'opacity-50']">
    <div class="flex gap-3">
      <!-- Image -->
      <div :class="['w-16 h-16 shrink-0 overflow-hidden', themeColors.itemBg]">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="item.label"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <svg :class="['w-6 h-6', themeColors.textSecondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <p :class="['text-sm line-clamp-2 mb-2', themeColors.text]">{{ item.label }}</p>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-2">
          <div :class="['flex items-center border rounded', themeColors.border]">
            <button
              @click="emit('updateQuantity', item.quantity - 1)"
              :disabled="item.quantity <= 1 || isUpdating"
              :class="['w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30', themeColors.textMuted]"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <span :class="['w-8 text-center text-sm', themeColors.text]">{{ item.quantity }}</span>
            <button
              @click="emit('updateQuantity', item.quantity + 1)"
              :disabled="isUpdating"
              :class="['w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30', themeColors.textMuted]"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <!-- Remove Button -->
          <button
            @click="emit('remove')"
            :disabled="isUpdating"
            class="text-red-400 hover:text-red-500 transition-colors disabled:opacity-30"
            title="Entfernen"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Price -->
      <p :class="['text-sm font-medium shrink-0', themeColors.text]">
        {{ formatPrice(item.price.totalPrice) }}
      </p>
    </div>
  </div>
</template>
