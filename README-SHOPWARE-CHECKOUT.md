# Shopware 6 Guest Checkout Integration

Diese Integration ermöglicht einen vollständigen Guest Checkout mit der Shopware 6 Store-API.

## Architektur

### 1. Server-Side Proxy (`/api/shopware/[...path]`)

Der Proxy schützt den Sales Channel Access Key und leitet alle Anfragen an die Shopware Store-API weiter.

**Features:**
- Access Key wird serverseitig geschützt
- `sw-context-token` Header wird in beide Richtungen durchgereicht
- Unterstützt alle HTTP-Methoden (GET, POST, PATCH, DELETE)

**Beispiel-Aufruf:**
```typescript
// Intern im Composable
const response = await $fetch('/api/shopware/checkout/cart', {
  method: 'GET',
  headers: {
    'sw-context-token': contextToken
  }
})
```

### 2. Cart Composable (`useShopwareCart`)

Das Composable verwaltet den gesamten Cart-State und die Kommunikation mit Shopware.

**State:**
- `cart` - Aktueller Warenkorb
- `loading` - Ladezustand
- `error` - Fehlermeldungen
- `contextToken` - Session-Token (wird im Cookie gespeichert)
- `shippingMethods` - Verfügbare Versandarten
- `paymentMethods` - Verfügbare Zahlungsarten
- `countries` - Verfügbare Länder
- `salutations` - Verfügbare Anreden

**Methoden:**
```typescript
const {
  // State
  cart,
  loading,
  error,
  itemCount,
  totalPrice,
  
  // Cart Operations
  initCart,
  fetchCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  
  // Checkout Data
  fetchShippingMethods,
  fetchPaymentMethods,
  fetchCountries,
  fetchSalutations,
  
  // Checkout Actions
  setShippingMethod,
  setPaymentMethod,
  registerGuest,
  placeOrder,
} = useShopwareCart()
```

### 3. Guest Checkout Flow

Der Checkout-Prozess folgt diesem Ablauf:

```
1. POST /account/register (guest: true)
   → Registriert Gast-Kunde
   → Gibt neuen Context-Token zurück

2. GET /checkout/cart (mit neuem Token)
   → Lädt Warenkorb mit Kundenkontext

3. PATCH /context (shippingMethodId)
   → Setzt Versandart

4. PATCH /context (paymentMethodId)
   → Setzt Zahlungsart

5. POST /checkout/order
   → Erstellt Bestellung
```

## Komponenten

### AddressForm
Sammelt Kundendaten für den Guest Checkout:
- E-Mail, Name, Adresse
- Land-Dropdown mit Bundesländern
- Validierung

### ShippingMethods
Zeigt verfügbare Versandarten:
- Radio-Auswahl
- Lieferzeiten
- Versandkosten

### PaymentMethods
Zeigt verfügbare Zahlungsarten:
- Radio-Auswahl
- Payment-Icons
- Beschreibungen

### OrderSummary
Zeigt Bestellübersicht:
- Artikel mit Bildern
- Zwischensumme, Versand, Gesamt
- "Kaufen"-Button

### CartSidebar
Slide-in Warenkorb:
- Artikel verwalten
- Mengen ändern
- "Zur Kasse"-Button

### OrderConfirmation
Bestellbestätigung:
- Bestellnummer und Details
- Adressen
- Bestellte Artikel

## Wichtige Hinweise

### storefrontUrl
Die `storefrontUrl` bei der Gast-Registrierung **MUSS** eine in Shopware konfigurierte Domain sein (nicht localhost).

```typescript
const STOREFRONT_URL = 'https://fulltestsw-whering.eu-core-1.shopdev.de'
```

### Context-Token Handling
- Token wird im Cookie `sw-context-token` gespeichert (30 Tage)
- Bei jedem API-Aufruf wird der Token aus dem Cookie geladen
- Neuer Token aus Response-Header wird immer gespeichert

### Bestelldaten vor Redirect
Nach erfolgreicher Bestellung wird der Warenkorb geleert. Daher müssen die Bestelldaten **VOR** dem Redirect zur Bestätigungsseite in sessionStorage gespeichert werden.

```typescript
// Vor dem Redirect
sessionStorage.setItem('lastOrder', JSON.stringify({
  order,
  timestamp: Date.now()
}))
```

## API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/context` | GET/PATCH | Kontext abrufen/ändern |
| `/checkout/cart` | GET | Warenkorb abrufen |
| `/checkout/cart/line-item` | POST/PATCH/DELETE | Artikel verwalten |
| `/shipping-method?onlyAvailable=1` | POST | Versandarten abrufen |
| `/payment-method?onlyAvailable=1` | POST | Zahlungsarten abrufen |
| `/country` | POST | Länder abrufen |
| `/account/register` | POST | Gast registrieren |
| `/checkout/order` | POST | Bestellung aufgeben |

## Konfiguration

Die Shopware-Konfiguration befindet sich in:
- `server/api/shopware/[...path].ts` - API URL & Access Key
- `composables/useShopwareCart.ts` - Storefront URL

```typescript
// server/api/shopware/[...path].ts
const SHOPWARE_API_URL = 'https://fulltestsw-whering.eu-core-1.shopdev.de/store-api'
const SHOPWARE_ACCESS_KEY = 'SWSCSERRTVR5EHDCQ3VWMEZNQW'

// composables/useShopwareCart.ts
const STOREFRONT_URL = 'https://fulltestsw-whering.eu-core-1.shopdev.de'
```
