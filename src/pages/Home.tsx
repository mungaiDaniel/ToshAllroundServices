import CtaBand from '../components/home/CtaBand'
import FounderPreview from '../components/home/FounderPreview'
import GalleryPreview from '../components/home/GalleryPreview'
import Hero from '../components/home/Hero'
import ServicesPreview from '../components/home/ServicesPreview'
import TrustBar from '../components/home/TrustBar'
import WhyChooseUs from '../components/home/WhyChooseUs'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesPreview />
      <WhyChooseUs />
      <GalleryPreview />
      <FounderPreview />
      <CtaBand />
    </>
  )
}
