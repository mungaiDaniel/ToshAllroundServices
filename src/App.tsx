import { domAnimation, LazyMotion } from 'framer-motion'
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'

/** Every page except Home is loaded on demand, so the first visit downloads less JavaScript. */
const page = (load: () => Promise<{ default: React.ComponentType }>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
})

// When adding a page, also update: src/hooks/useRouteMeta.ts (seoRoutes), src/i18n/seo.json,
// public/sitemap.xml and scripts/prerender.mjs.
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/ueber-uns', ...page(() => import('./pages/About')) },
      { path: '/leistungen', ...page(() => import('./pages/Services')) },
      { path: '/galerie', ...page(() => import('./pages/Gallery')) },
      { path: '/kontakt', ...page(() => import('./pages/Contact')) },
      { path: '/impressum', ...page(() => import('./pages/Impressum')) },
      { path: '/datenschutz', ...page(() => import('./pages/Datenschutz')) },
      { path: '*', ...page(() => import('./pages/NotFound')) },
    ],
  },
])

export default function App() {
  return (
    <LanguageProvider>
      {/* `m` components + the small feature set; the Gallery page adds layout/drag on its own */}
      <LazyMotion features={domAnimation} strict>
        <RouterProvider router={router} />
      </LazyMotion>
    </LanguageProvider>
  )
}
