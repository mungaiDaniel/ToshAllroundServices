import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Impressum from './pages/Impressum'
import Datenschutz from './pages/Datenschutz'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/ueber-uns', element: <About /> },
      { path: '/leistungen', element: <Services /> },
      { path: '/galerie', element: <Gallery /> },
      { path: '/kontakt', element: <Contact /> },
      { path: '/impressum', element: <Impressum /> },
      { path: '/datenschutz', element: <Datenschutz /> },
    ],
  },
])

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  )
}
