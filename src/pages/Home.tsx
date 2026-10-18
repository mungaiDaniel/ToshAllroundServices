import { lazy, Suspense } from 'react'
import Deferred from '../components/Deferred'
import { useTestimonials } from '../data/content/hooks'
import Hero from '../components/home/Hero'
import TrustBar from '../components/home/TrustBar'

// Everything below the first screen is a separate chunk, loaded when it nears the viewport
const ServicesPreview = lazy(() => import('../components/home/ServicesPreview'))
const WhyChooseUs = lazy(() => import('../components/home/WhyChooseUs'))
const Testimonials = lazy(() => import('../components/home/Testimonials'))
const GalleryPreview = lazy(() => import('../components/home/GalleryPreview'))
const FounderPreview = lazy(() => import('../components/home/FounderPreview'))
const CtaBand = lazy(() => import('../components/home/CtaBand'))

export default function Home() {
  const { items: testimonials } = useTestimonials()
  return (
    <>
      <Hero />
      <TrustBar />
      <Deferred minHeight={1100}>
        <Suspense fallback={null}>
          <ServicesPreview />
        </Suspense>
      </Deferred>
      <Deferred minHeight={800}>
        <Suspense fallback={null}>
          <WhyChooseUs />
        </Suspense>
      </Deferred>
      {testimonials.length > 0 && (
        <Deferred minHeight={600}>
          <Suspense fallback={null}>
            <Testimonials />
          </Suspense>
        </Deferred>
      )}
      <Deferred minHeight={700}>
        <Suspense fallback={null}>
          <GalleryPreview />
        </Suspense>
      </Deferred>
      <Deferred minHeight={600}>
        <Suspense fallback={null}>
          <FounderPreview />
        </Suspense>
      </Deferred>
      <Deferred minHeight={500}>
        <Suspense fallback={null}>
          <CtaBand />
        </Suspense>
      </Deferred>
    </>
  )
}
