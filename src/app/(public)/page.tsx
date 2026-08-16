import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import {
  MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle2,
  Users, Calendar, ShieldCheck, Heart, Award, Star,
  MessageCircle, ChevronDown,
  GraduationCap, Quote, Sparkles
} from "lucide-react"
import { FadeIn } from "@/components/public/FadeIn"
import { LiteYouTube } from "@/components/public/LiteYouTube"
import { GalleryGrid } from "@/components/public/GalleryGrid"
import { BannerGrid } from "@/components/public/BannerGrid"
import { CelestialBg } from "@/components/public/CelestialBg"
import { FacebookIcon, InstagramIcon } from "@/components/public/SocialIcons"
import { getDiscountLabel, type DiscountBadgeFormat } from "@/lib/pricing"
import { formatDuration } from "@/lib/duration"
import { reconcileSectionOrder, type SectionKey } from "@/lib/sections"
import { Fragment, type ReactNode } from "react"

const getSettings = unstable_cache(
  async () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ['site-settings'],
  { tags: ['site-data'] }
)

const getServices = unstable_cache(
  async () => prisma.service.findMany({ orderBy: { order: 'asc' } }),
  ['services'],
  { tags: ['site-data'] }
)

const getStats = unstable_cache(
  async () => prisma.stat.findMany({ orderBy: { order: 'asc' } }),
  ['stats'],
  { tags: ['site-data'] }
)

const getCertifications = unstable_cache(
  async () => prisma.certification.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  ['certifications'],
  { tags: ['site-data'] }
)

const getGallery = unstable_cache(
  async () => prisma.galleryItem.findMany({ orderBy: { order: 'asc' } }),
  ['gallery'],
  { tags: ['site-data'] }
)

const getVideos = unstable_cache(
  async () => prisma.video.findMany({ orderBy: { order: 'asc' } }),
  ['videos'],
  { tags: ['site-data'] }
)

const getBanners = unstable_cache(
  async () => prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  ['banners'],
  { tags: ['site-data'] }
)

const getTestimonials = unstable_cache(
  async () => prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  ['testimonials'],
  { tags: ['site-data'] }
)

export default async function HomePage() {
  const settings = await getSettings()
  const services = await getServices()
  const stats = await getStats()
  const certifications = await getCertifications()
  const gallery = await getGallery()
  const videos = await getVideos()
  const banners = await getBanners()
  const testimonials = await getTestimonials()

  if (!settings) return null

  // Helper for whatsapp link
  const waLink = `https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`

  const sectionOrder = reconcileSectionOrder(settings.sectionOrder ?? [])
  const sectionVisible: Record<SectionKey, boolean> = {
    stats: settings.showStats,
    whyChoose: settings.showWhyChoose,
    about: settings.showAbout,
    services: settings.showServices,
    certifications: settings.showCertifications,
    banners: settings.showBanners,
    testimonials: settings.showTestimonials,
    media: settings.showMedia,
    faq: settings.showFaq,
    cta: settings.showCta,
  }

  const discountBadgeFormat = (settings.discountBadgeFormat as DiscountBadgeFormat) || "PERCENT"

  // ── Each reorderable middle section, as a standalone node ──
  const statsSection: ReactNode = (
    <section className="py-16 bg-brand-cream border-y border-brand-orange/15 relative">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32">
          <FadeIn delay={0.1}>
            <div className="text-center">
              <Users size={32} className="mx-auto text-brand-orange mb-4 opacity-80" />
              <div className="text-4xl md:text-5xl font-black mb-2 text-brand-brown">
                {stats.find(s => s.label.toLowerCase().includes('client'))?.value || '1,000+'}
              </div>
              <div className="text-sm font-bold text-brand-brown/60 uppercase tracking-widest">
                Happy Clients
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="text-center">
              <Calendar size={32} className="mx-auto text-brand-orange mb-4 opacity-80" />
              <div className="text-4xl md:text-5xl font-black mb-2 text-brand-brown">
                {stats.find(s => s.label.toLowerCase().includes('consultation'))?.value || '2,000+'}
              </div>
              <div className="text-sm font-bold text-brand-brown/60 uppercase tracking-widest">
                Consultations Done
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )

  const whyChooseSection: ReactNode = (
    <section className="py-24 bg-white/50">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4">Why Choose Me</h3>
          <h2 className="font-serif text-4xl font-bold text-brand-brown">Guidance You Can Trust</h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto mt-6 rounded-full" />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "100% Confidential", desc: "Your privacy is our utmost priority in every session." },
            { icon: Heart, title: "Honest Predictions", desc: "No sugarcoating, just the truth and actionable remedies." },
            { icon: CheckCircle2, title: "Proven Remedies", desc: "Simple, effective, and practical astrological solutions." }
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-brand-brown/5 border border-brand-orange/10 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-orange mb-6">
                  <item.icon size={32} />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-brand-brown/70 leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )

  const aboutSection: ReactNode = (
    <section id="about" className="relative py-24 bg-brand-peach overflow-hidden scroll-mt-20">
      <CelestialBg tone="light" className="absolute -bottom-40 -left-40 w-[480px] h-[480px] opacity-60" />
      <div className="relative max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn className="space-y-6">
            <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase">About The Astrologer</h3>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown leading-tight">
              {settings.aboutTitle || "Guiding Lives with Vedic Wisdom"}
            </h2>
            <div className="w-16 h-1 bg-brand-orange rounded-full" />
            <div className="prose prose-lg text-brand-brown/80">
              {settings.aboutBody?.split('\n').map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <a href="#services" className="inline-flex items-center text-brand-orange font-bold hover:gap-3 transition-all gap-2 mt-4">
              Explore Services <ArrowRight size={20} />
            </a>
          </FadeIn>

          <FadeIn direction="up">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                {settings.aboutImageUrl ? (
                  <img src={settings.aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-cream flex items-center justify-center border-4 border-white">
                    <div className="text-brand-brown/30 text-center font-bold text-xl">Image Placeholder</div>
                  </div>
                )}
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal rounded-full flex items-center justify-center text-brand-peach">
                  <Award size={24} />
                </div>
                <div>
                  <div className="font-serif font-bold text-xl">{settings.experience ?? 23}+ Years</div>
                  <div className="text-sm font-bold text-brand-brown/60 uppercase">Experience</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )

  const servicesSection: ReactNode = (
    <section id="services" className="bg-white scroll-mt-20">
      {/* Celestial pricing header band */}
      <div className="relative overflow-hidden bg-brand-brown">
        <CelestialBg tone="dark" className="absolute left-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] opacity-40" />
        <CelestialBg tone="dark" className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] opacity-40" />

        <FadeIn className="relative text-center py-20 px-4">
          <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4">Consultations</h3>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-brand-peach">Pricing</h2>
          <a href="#contact" className="inline-block mt-8 px-8 py-3 rounded-full bg-brand-orange text-white font-bold text-sm uppercase tracking-wider hover:bg-gold-600 transition-colors shadow-lg shadow-brand-orange/20">
            Contact Us
          </a>
        </FadeIn>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
          {services.map((service: (typeof services)[number], i: number) => {
            const discountLabel = getDiscountLabel(service, discountBadgeFormat)
            return (
            <FadeIn key={service.id} delay={i * 0.1}>
              <div
                className={`relative flex flex-col p-8 rounded-[2rem] h-full transition-transform hover:-translate-y-1 ${
                  service.isPopular
                    ? 'bg-white border border-brand-orange/15 shadow-2xl shadow-brand-brown/15 lg:scale-105 z-10'
                    : 'bg-brand-brown border border-white/10 shadow-xl shadow-brand-brown/20 text-brand-peach'
                }`}
              >
                {service.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                    Most Popular
                  </div>
                )}
                {discountLabel && (
                  <div className="absolute -top-3 -right-3 bg-brand-teal text-brand-peach px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                    <Sparkles size={12} /> {discountLabel}
                  </div>
                )}

                <h3 className={`font-serif text-2xl font-bold mb-3 ${service.isPopular ? 'text-brand-brown' : 'text-brand-peach'}`}>{service.title}</h3>
                <div className={`text-sm font-medium mb-4 flex items-center gap-2 ${service.isPopular ? 'text-brand-brown/60' : 'text-brand-peach/60'}`}>
                  <Clock size={16} className="text-brand-orange" />
                  {formatDuration(service.durationMin, service.durationUnit)} · <span>{service.mode}</span>
                </div>

                {service.description && (
                  <p className={`text-sm mb-6 leading-relaxed line-clamp-3 ${service.isPopular ? 'text-brand-brown/70' : 'text-brand-peach/70'}`}>
                    {service.description}
                  </p>
                )}

                <div className="mb-8">
                  <div className="flex items-end gap-3">
                    <span className={`font-serif text-5xl font-bold ${service.isPopular ? 'text-brand-orange' : 'text-brand-peach'}`}>₹{service.price}</span>
                    {service.originalPrice && (
                      <span className={`text-xl line-through font-bold mb-1 ${service.isPopular ? 'text-brand-brown/40' : 'text-brand-peach/40'}`}>₹{service.originalPrice}</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <a
                    href={`/book/${service.id}`}
                    className={`w-full flex items-center justify-center h-14 rounded-xl font-bold transition-all ${
                      service.isPopular
                        ? 'bg-brand-orange text-white hover:bg-gold-600 shadow-lg shadow-brand-orange/20'
                        : 'border-2 border-brand-orange/40 text-brand-peach hover:bg-brand-orange hover:border-brand-orange hover:text-white'
                    }`}
                  >
                    Book Session
                  </a>
                </div>
              </div>
            </FadeIn>
            )
          })}

        </div>
      </div>
    </section>
  )

  const certificationsSection: ReactNode = certifications.length === 0 ? null : (
    <section className="py-24 bg-brand-cream">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center">
        <FadeIn>
          <GraduationCap size={48} className="mx-auto text-brand-orange mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-brown mb-12">Certified & Recognized</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {certifications.map((cert: (typeof certifications)[number], i: number) => (
               <FadeIn key={cert.id} delay={i * 0.1}>
                 <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-brand-brown/5 border border-brand-orange/10 h-full flex flex-col hover:-translate-y-1 transition-transform">
                   {cert.imageUrl ? (
                     <div className="aspect-[4/3] w-full bg-brand-cream relative">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={cert.imageUrl} alt={cert.title} className="object-cover w-full h-full" />
                     </div>
                   ) : (
                     <div className="aspect-[4/3] w-full bg-brand-cream flex items-center justify-center text-brand-orange/20">
                       <Award size={64} />
                     </div>
                   )}
                   <div className="p-6 flex flex-col items-center text-center flex-1">
                     <h3 className="font-serif font-bold text-lg text-brand-brown mb-2">{cert.title}</h3>
                     {(cert.issuer || cert.year) && (
                       <div className="text-sm text-brand-brown/60 font-medium mt-auto">
                         {cert.issuer} {cert.year && `(${cert.year})`}
                       </div>
                     )}
                   </div>
                 </div>
               </FadeIn>
             ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )

  const bannersSection: ReactNode = banners.length === 0 ? null : (
    <section className="px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <BannerGrid banners={banners} />
        </FadeIn>
      </div>
    </section>
  )

  const testimonialsSection: ReactNode = testimonials.length === 0 ? null : (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <FadeIn className="text-center mb-16">
           <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4">Testimonials</h3>
           <h2 className="font-serif text-4xl font-bold text-brand-brown">What Clients Say</h2>
           <div className="w-16 h-1 bg-brand-orange mx-auto mt-6 rounded-full" />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t: (typeof testimonials)[number], i: number) => (
            <FadeIn key={t.id} delay={i * 0.1}>
              <div className="bg-brand-peach p-8 rounded-3xl relative h-full flex flex-col">
                <Quote size={40} className="absolute top-6 right-6 text-brand-orange/20" />
                <div className="flex gap-1 mb-4 text-brand-orange">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={16} className={s < t.rating ? "fill-current" : "text-brand-orange/20"} />
                  ))}
                </div>
                <p className="text-brand-brown font-medium italic leading-relaxed mb-6 flex-1">
                  &ldquo;{t.message}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {t.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <div className="font-serif font-bold">{t.name}</div>
                    {t.location && <div className="text-xs text-brand-brown/50">{t.location}</div>}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )

  const mediaSection: ReactNode = (gallery.length === 0 && videos.length === 0) ? null : (
    <section className="py-24 bg-brand-peach">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4">Media</h3>
          <h2 className="font-serif text-4xl font-bold text-brand-brown">Gallery & Videos</h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto mt-6 rounded-full" />
        </FadeIn>

        <div className="space-y-20">
          {videos.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-brand-brown mb-8 text-center md:text-left">Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid: (typeof videos)[number], i: number) => (
                  <FadeIn key={vid.id} delay={i * 0.1}>
                    <div className="rounded-3xl overflow-hidden shadow-xl shadow-brand-brown/5">
                      <LiteYouTube videoId={vid.videoId} title={vid.title || "YouTube Video"} />
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}

          {gallery.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-brand-brown mb-8 text-center md:text-left">Gallery</h3>
              <GalleryGrid gallery={gallery} />
            </div>
          )}
        </div>
      </div>
    </section>
  )

  const faqSection: ReactNode = (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <FadeIn className="mb-16">
          <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4">FAQ</h3>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown">Frequently Asked</h2>
        </FadeIn>

        <div className="space-y-3">
          {[
            { q: "What details are required for a consultation?", a: "You need to provide your exact Date of Birth, Time of Birth, and Place of Birth for an accurate horoscope reading." },
            { q: "How are the consultations conducted?", a: "Consultations are primarily done via Phone Call or WhatsApp Chat, depending on the service you choose." },
            { q: "Are my details kept confidential?", a: "Yes, 100%. All personal details, charts, and discussion topics are strictly confidential and never shared." }
          ].map((faq, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <details className="group bg-brand-cream rounded-xl overflow-hidden cursor-pointer border border-brand-orange/10">
                <summary className="font-bold p-6 flex items-center gap-4 list-none outline-none">
                  <span className="w-2 h-2 shrink-0 bg-brand-orange" />
                  <span className="flex-1 uppercase tracking-wide text-sm">{faq.q}</span>
                  <ChevronDown size={18} className="text-brand-orange transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <div className="px-6 pb-6 pl-12 text-brand-brown/80 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )

  const ctaSection: ReactNode = (
    <section className="py-20 bg-brand-brown relative overflow-hidden px-4 md:px-8">
      <CelestialBg tone="dark" className="absolute -top-32 -left-32 w-[420px] h-[420px] opacity-40" />
      <CelestialBg tone="dark" className="absolute -bottom-32 -right-32 w-[420px] h-[420px] opacity-40" />

      <div className="max-w-4xl mx-auto relative z-10">
        <FadeIn>
          <div className="bg-brand-peach rounded-[2rem] px-8 py-16 md:px-16 md:py-20 text-center shadow-2xl">
            <h3 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-4">Get Started</h3>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-brown mb-6 leading-tight">
              Book an Appointment
            </h2>
            <p className="text-brand-brown/70 text-lg mb-10 max-w-xl mx-auto">
              Don&apos;t leave your life decisions to chance. Get precise astrological guidance today.
            </p>
            <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex bg-brand-orange text-white px-8 py-4 rounded-full font-bold text-lg items-center gap-2 hover:bg-gold-600 transition-colors shadow-xl shadow-brand-orange/20">
               Book Your Session Now <ArrowRight size={20} />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )

  const sectionsMap: Record<SectionKey, ReactNode> = {
    stats: statsSection,
    whyChoose: whyChooseSection,
    about: aboutSection,
    services: servicesSection,
    certifications: certificationsSection,
    banners: bannersSection,
    testimonials: testimonialsSection,
    media: mediaSection,
    faq: faqSection,
    cta: ctaSection,
  }

  return (
    <div className="bg-gradient-to-b from-brand-peach to-[#FCF6EC] min-h-screen text-brand-brown font-sans selection:bg-brand-orange selection:text-white">

      {/* 1. Hero Section — fixed */}
      <section className="relative pt-12 pb-16 px-4 md:px-8 overflow-hidden">
        <CelestialBg tone="light" className="absolute -top-40 -right-40 w-[560px] h-[560px] opacity-70" />
        <FadeIn>
          <div className="relative max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-brand-brown/5 border border-brand-orange/10 p-8 md:p-14 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
              {/* Profile Image / Icon */}
              {settings.heroImageUrl ? (
                <img
                  src={settings.heroImageUrl}
                  alt={settings.personName || "Profile"}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover shadow-lg shrink-0"
                  style={{ objectPosition: settings.heroImagePosition || "50% 50%" }}
                />
              ) : (
                <div className="w-48 h-48 md:w-64 md:h-64 bg-brand-teal rounded-3xl flex items-center justify-center text-brand-peach text-8xl md:text-9xl font-serif font-medium shrink-0 shadow-lg">
                  {settings.personName?.[0] || 'D'}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {settings.tagline && (
                  <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase border border-brand-orange/20">
                    <Star size={14} className="fill-brand-orange" /> {settings.tagline}
                  </div>
                )}

                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-[1.1] tracking-tight">
                  {settings.heroHeadline || "Find the Right Path in Career, Marriage & Health"}
                </h1>

                <p className="text-lg md:text-xl text-brand-brown/70 mb-8 font-medium">
                  {settings.heroSubtext || "Confidential consultations with accurate, honest predictions."}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                  <a href={waLink} target="_blank" rel="noreferrer" className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-orange/20">
                    <MessageCircle size={20} /> Book on WhatsApp
                  </a>
                  {settings.phone && (
                    <a href={`tel:${settings.phone}`} className="bg-white text-brand-brown border-2 border-brand-orange/15 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-orange/5 transition-colors">
                      <Phone size={20} className="text-brand-orange" /> {settings.phone}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-brand-brown/50 font-bold uppercase tracking-wider">
                  {settings.languages.length > 0 && (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-brand-orange/15 flex items-center justify-center text-[10px]">🌐</span>
                      {settings.languages.join(', ')}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-brand-orange" />
                    {settings.address || 'Parola'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Reorderable / hideable middle sections, admin-controlled */}
      {sectionOrder.map((key) =>
        sectionVisible[key] ? <Fragment key={key}>{sectionsMap[key]}</Fragment> : null
      )}

      {/* Contact & Footer band — fixed */}
      <footer id="contact" className="relative py-16 bg-brand-brown text-brand-peach overflow-hidden scroll-mt-20">
        <CelestialBg tone="dark" className="absolute -top-24 right-0 w-[380px] h-[380px] opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-brand-peach/70 mb-8 max-w-sm">
                Have questions before booking? Reach out to us through any of the channels below.
              </p>

              <div className="space-y-4">
                {settings.phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Phone className="text-brand-orange" /></div>
                    <div>
                      <div className="text-sm text-brand-peach/50 font-bold uppercase tracking-wider">Phone</div>
                      <a href={`tel:${settings.phone}`} className="font-bold text-lg hover:text-brand-orange transition-colors">{settings.phone}</a>
                    </div>
                  </div>
                )}
                {settings.email && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Mail className="text-brand-orange" /></div>
                    <div>
                      <div className="text-sm text-brand-peach/50 font-bold uppercase tracking-wider">Email</div>
                      <a href={`mailto:${settings.email}`} className="font-bold text-lg hover:text-brand-orange transition-colors">{settings.email}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
               <h3 className="font-serif text-2xl font-bold text-white mb-6">Quick Links</h3>
               <ul className="space-y-4 font-medium text-brand-peach/80">
                 <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                 <li><a href="#services" className="hover:text-white transition-colors">Consultations</a></li>
                 <li><a href={waLink} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp Booking</a></li>
               </ul>
               {(settings.facebookUrl || settings.instagramUrl) && (
                 <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
                   {settings.facebookUrl && (
                     <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors text-white">
                       <FacebookIcon size={18} />
                     </a>
                   )}
                   {settings.instagramUrl && (
                     <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors text-white">
                       <InstagramIcon size={18} />
                     </a>
                   )}
                 </div>
               )}
            </div>
          </div>

          {settings.mapEmbedUrl && (
            <div className="mt-12 rounded-3xl overflow-hidden border border-white/10 h-80">
              <iframe
                src={settings.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                title="Location Map"
              />
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-white/10 text-center text-brand-peach/40 font-medium text-sm">
            © {new Date().getFullYear()} {settings.personName}. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
