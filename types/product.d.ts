/**
 * Product Type Definitions
 */

// Extended product type with 3D model support
interface ProductWith3DData {
  key: string
  name?: string
  cover?: Media
  price?: Price
  images?: Media[]
  description?: string
  stock?: number
}

// Media type from Frontstack
interface Media {
  src?: string
  alt?: string
  mimeType?: string
  width?: number
  height?: number
}

// Price type from Frontstack
interface Price {
  amount?: number
  currency?: string
  precision?: number
  ref?: number
}

// Furniture Product Card type
interface FurnitureProductCard {
  key: string
  name?: string
  cover?: Media
  price?: Price
  lowestPrice?: Price
  stock?: number
  categoryIds?: string[]
}
