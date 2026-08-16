// Short, human-friendly reference derived from the Lead's own id — unique for free,
// no extra schema/column needed. e.g. "LAP-8F3K2Q1H"
export function getBookingRef(leadId: string) {
  return `LAP-${leadId.slice(-8).toUpperCase()}`
}
