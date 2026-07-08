import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/ui/toaster'
import { LandingPage } from '@/pages/LandingPage'
import { EditorPage } from '@/pages/EditorPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { RequestAccessPage } from '@/pages/RequestAccessPage'
import { ImpressumPage } from '@/pages/ImpressumPage'
import { DatenschutzPage } from '@/pages/DatenschutzPage'

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/zugang" element={<RequestAccessPage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
