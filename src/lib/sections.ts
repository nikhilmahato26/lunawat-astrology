// The reorderable/hideable middle sections of the homepage — everything between the fixed
// Hero (top) and Contact/Footer (bottom). Shared between the public page (render order) and
// the admin "Page Layout" builder (drag-reorder + visibility), so both always agree on the
// full set of known sections.
export const SECTION_KEYS = [
  "stats",
  "whyChoose",
  "about",
  "services",
  "certifications",
  "banners",
  "testimonials",
  "gallery",
  "videos",
  "faq",
  "cta",
] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

// Reconciles a stored order (which may be empty, stale, or missing newer keys after an app
// update) against the known section keys: keep only recognized keys in their stored order,
// then append any keys that aren't in it yet.
export function reconcileSectionOrder(stored: string[]): SectionKey[] {
  const known = new Set<string>(SECTION_KEYS)
  const kept = stored.filter((k): k is SectionKey => known.has(k))
  const missing = SECTION_KEYS.filter((k) => !stored.includes(k))
  return [...kept, ...missing]
}
