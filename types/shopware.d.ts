/**
 * Shopware 6 Store-API Type Definitions
 */

// Price Types
interface ShopwarePrice {
  unitPrice: number
  quantity: number
  totalPrice: number
  calculatedTaxes: Array<{
    tax: number
    taxRate: number
    price: number
  }>
  taxRules: Array<{
    taxRate: number
    percentage: number
  }>
  referencePrice: null | {
    price: number
    purchaseUnit: number
    referenceUnit: number
    unitName: string
  }
  listPrice: null | {
    price: number
    discount: number
    percentage: number
  }
  regulationPrice: null | {
    price: number
  }
}

// Cart Line Item
interface ShopwareLineItem {
  id: string
  referencedId: string
  label: string
  quantity: number
  type: string
  good: boolean
  description: string | null
  removable: boolean
  stackable: boolean
  modified: boolean
  cover: {
    url: string
    thumbnailsRo?: string
  } | null
  deliveryInformation: {
    stock: number
    weight: number
    freeDelivery: boolean
    restockTime: number | null
  } | null
  children: ShopwareLineItem[]
  price: ShopwarePrice
  payload: {
    productNumber?: string
    options?: Array<{
      group: string
      option: string
    }>
  }
}

// Cart
interface ShopwareCart {
  token: string
  name: string
  price: {
    netPrice: number
    totalPrice: number
    calculatedTaxes: Array<{
      tax: number
      taxRate: number
      price: number
    }>
    taxRules: Array<{
      taxRate: number
      percentage: number
    }>
    positionPrice: number
    taxStatus: string
    rawTotal: number
  }
  lineItems: ShopwareLineItem[]
  errors: Record<string, any>
  deliveries: Array<{
    deliveryDate: {
      earliest: string
      latest: string
    }
    shippingMethod: ShopwareShippingMethod
    location: {
      country: ShopwareCountry
      state: null | any
      address: ShopwareAddress | null
    }
    shippingCosts: ShopwarePrice
  }>
  transactions: Array<{
    paymentMethod: ShopwarePaymentMethod
    amount: ShopwarePrice
  }>
  modified: boolean
  customerComment: string | null
  affiliateCode: string | null
  campaignCode: string | null
}

// Shipping Method
interface ShopwareShippingMethod {
  id: string
  name: string
  description: string | null
  active: boolean
  deliveryTime: {
    id: string
    name: string
    min: number
    max: number
    unit: string
  } | null
  translated: {
    name: string
    description: string | null
  }
  media: {
    url: string
  } | null
  prices: Array<{
    currencyId: string
    currencyPrice: Array<{
      currencyId: string
      net: number
      gross: number
      linked: boolean
    }>
  }>
}

// Payment Method
interface ShopwarePaymentMethod {
  id: string
  name: string
  description: string | null
  active: boolean
  afterOrderEnabled: boolean
  translated: {
    name: string
    description: string | null
    distinguishableName: string
  }
  media: {
    url: string
  } | null
  shortName: string | null
  technicalName: string | null
}

// Country
interface ShopwareCountry {
  id: string
  name: string
  iso: string
  iso3: string
  position: number
  active: boolean
  shippingAvailable: boolean
  translated: {
    name: string
  }
  states: ShopwareCountryState[] | null
}

// Country State
interface ShopwareCountryState {
  id: string
  countryId: string
  shortCode: string
  name: string
  position: number
  active: boolean
  translated: {
    name: string
  }
}

// Address for registration (without null values for optional fields)
interface ShopwareAddressInput {
  countryId: string
  countryStateId?: string
  salutationId: string
  firstName: string
  lastName: string
  street: string
  zipcode: string
  city: string
  company?: string
  department?: string
  title?: string
  phoneNumber?: string
  additionalAddressLine1?: string
  additionalAddressLine2?: string
}

// Address (full response type)
interface ShopwareAddress {
  id?: string
  countryId: string
  countryStateId?: string | null
  salutationId: string
  firstName: string
  lastName: string
  street: string
  zipcode: string
  city: string
  company?: string | null
  department?: string | null
  title?: string | null
  phoneNumber?: string | null
  additionalAddressLine1?: string | null
  additionalAddressLine2?: string | null
  country?: ShopwareCountry
  countryState?: ShopwareCountryState | null
}

// Customer Registration
interface ShopwareGuestRegistration {
  guest: boolean
  email: string
  salutationId: string
  firstName: string
  lastName: string
  storefrontUrl: string
  billingAddress: ShopwareAddressInput
  shippingAddress?: ShopwareAddressInput
  acceptedDataProtection?: boolean
}

// Customer
interface ShopwareCustomer {
  id: string
  email: string
  guest: boolean
  firstName: string
  lastName: string
  salutation: {
    id: string
    displayName: string
    letterName: string
  }
  defaultBillingAddress: ShopwareAddress
  defaultBillingAddressId: string
  defaultShippingAddress: ShopwareAddress
  defaultShippingAddressId: string
  activeBillingAddress: ShopwareAddress
  activeShippingAddress: ShopwareAddress
}

// Context
interface ShopwareContext {
  token: string
  currentCustomerGroup: {
    id: string
    name: string
  }
  fallbackCustomerGroup: {
    id: string
    name: string
  }
  currency: {
    id: string
    isoCode: string
    factor: number
    symbol: string
    shortName: string
    name: string
  }
  salesChannel: {
    id: string
    name: string
  }
  taxRules: Array<{
    taxRate: number
    name: string
  }>
  customer: ShopwareCustomer | null
  paymentMethod: ShopwarePaymentMethod
  shippingMethod: ShopwareShippingMethod
  shippingLocation: {
    country: ShopwareCountry
    state: ShopwareCountryState | null
    address: ShopwareAddress | null
  }
}

// Order
interface ShopwareOrder {
  id: string
  orderNumber: string
  orderDateTime: string
  amountTotal: number
  amountNet: number
  shippingTotal: number
  currencyFactor: number
  currencyId: string
  languageId: string
  salesChannelId: string
  billingAddressId: string
  itemRounding: {
    decimals: number
    interval: number
    roundForNet: boolean
  }
  totalRounding: {
    decimals: number
    interval: number
    roundForNet: boolean
  }
  orderCustomer: {
    id: string
    email: string
    firstName: string
    lastName: string
    salutationId: string
    customerId: string
  }
  currency: {
    id: string
    isoCode: string
    symbol: string
    shortName: string
  }
  lineItems: Array<{
    id: string
    productId: string
    referencedId: string
    label: string
    quantity: number
    unitPrice: number
    totalPrice: number
    cover: {
      url: string
    } | null
  }>
  deliveries: Array<{
    id: string
    shippingCosts: ShopwarePrice
    shippingMethod: ShopwareShippingMethod
    shippingOrderAddress: ShopwareAddress
    trackingCodes: string[]
    stateMachineState: {
      name: string
      technicalName: string
    }
  }>
  transactions: Array<{
    id: string
    paymentMethod: ShopwarePaymentMethod
    amount: ShopwarePrice
    stateMachineState: {
      name: string
      technicalName: string
    }
  }>
  stateMachineState: {
    name: string
    technicalName: string
  }
  billingAddress: ShopwareAddress
  addresses: ShopwareAddress[]
}

// Salutation
interface ShopwareSalutation {
  id: string
  salutationKey: string
  displayName: string
  letterName: string
  translated: {
    displayName: string
    letterName: string
  }
}

// API Response Types
interface ShopwareListResponse<T> {
  elements: T[]
  total: number
  aggregations: Record<string, any>
}

// Cart State for Composable
interface CartState {
  cart: ShopwareCart | null
  loading: boolean
  error: string | null
  contextToken: string | null
  shippingMethods: ShopwareShippingMethod[]
  paymentMethods: ShopwarePaymentMethod[]
  countries: ShopwareCountry[]
  salutations: ShopwareSalutation[]
}

// Checkout Form Data
interface CheckoutFormData {
  email: string
  salutationId: string
  firstName: string
  lastName: string
  street: string
  zipcode: string
  city: string
  countryId: string
  countryStateId?: string
  phoneNumber?: string
}

// Order Confirmation Data (stored in sessionStorage)
interface OrderConfirmationData {
  order: ShopwareOrder
  timestamp: number
}
