type OfferService = {
  price: number
  offerType: string | null
  offerValue: number | null
}

// Single source of truth for turning a service's offer fields into an actual discounted
// price. Used both for display (Offers section, booking page) and for the real amount
// charged/saved on booking, so an advertised discount is never just cosmetic.
export function getOfferPrice(service: OfferService): number | null {
  if (!service.offerType || service.offerValue == null || service.offerValue <= 0) return null

  if (service.offerType === "FLAT") {
    return Math.max(0, service.price - service.offerValue)
  }

  if (service.offerType === "PERCENT") {
    const pct = Math.min(100, Math.max(0, service.offerValue))
    return Math.round(service.price * (1 - pct / 100))
  }

  return null
}

export function getOfferLabel(service: OfferService): string | null {
  if (!service.offerType || service.offerValue == null || service.offerValue <= 0) return null
  if (service.offerType === "FLAT") return `₹${service.offerValue} OFF`
  if (service.offerType === "PERCENT") return `${service.offerValue}% OFF`
  return null
}
