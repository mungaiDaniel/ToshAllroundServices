import { useLocation, useOutlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import CustomCursor from './motion/CustomCursor'
import { useRouteMeta } from '../hooks/useRouteMeta'
import PageTransition from './motion/PageTransition'
import ScrollProgress from './motion/ScrollProgress'
import SmoothScroll from './motion/SmoothScroll'

export default function Layout() {
  const outlet = useOutlet()
  const { pathname } = useLocation()
  useRouteMeta()
  return (
    <div className="flex min-h-screen flex-col">
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main className="flex-1">
        <PageTransition routeKey={pathname}>{outlet}</PageTransition>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
