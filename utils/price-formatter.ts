export function formatPrice(price: number) {
  let EuroPrice = new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
  })
  
  return EuroPrice.format(price)
}
