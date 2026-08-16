import { prisma } from "@/lib/prisma"
import { TestimonialsForm } from "./TestimonialsForm"

export default async function TestimonialsTab() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Testimonials</h2>
      <TestimonialsForm initialTestimonials={testimonials} />
    </div>
  )
}
