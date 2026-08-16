// Service.durationMin holds the raw number in whatever unit durationUnit says — "MIN" or "HR".
export function formatDuration(value: number | null, unit: string): string {
  if (value == null) return ""
  if (unit === "HR") return `${value} ${value === 1 ? "hr" : "hrs"}`
  return `${value} mins`
}
