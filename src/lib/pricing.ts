type DiscountService = {
  price: number
  originalPrice: number | null
}

export type DiscountBadgeFormat = "FLAT" | "PERCENT"

// Discount badge is derived entirely from the service's own price vs originalPrice — no
// separate offer fields to keep in sync. `format` controls how it's displayed; the admin
// picks that globally, the underlying numbers are always computed the same way.
export function getDiscountLabel(service: DiscountService, format: DiscountBadgeFormat): string | null {
  if (service.originalPrice == null || service.originalPrice <= service.price) return null

  if (format === "FLAT") {
    return `₹${service.originalPrice - service.price} OFF`
  }

  const pct = Math.round((1 - service.price / service.originalPrice) * 100)
  return `${pct}% OFF`
}
