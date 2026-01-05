import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import UploadPage from './pages/UploadPage'
import AnalyzingPage from './pages/AnalyzingPage'
import StoryDashboard from './pages/StoryDashboard'
import DashboardPage from './pages/DashboardPage'
import PrivacyPage from './pages/PrivacyPage'
import BackgroundEffects from './components/BackgroundEffects'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [analysisData, setAnalysisData] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-usage-optimizer-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        setAnalysisData(parsed.analysisData)
        // Note: File objects can't be serialized, so we skip uploadedFile
      }
    } catch (e) {
      console.error('Failed to load saved data:', e)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (analysisData) {
      try {
        localStorage.setItem('ai-usage-optimizer-data', JSON.stringify({
          analysisData,
          savedAt: new Date().toISOString()
        }))
      } catch (e) {
        console.error('Failed to save data:', e)
      }
    }
  }, [analysisData])

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-hidden">
        {/* Global background effects */}
        <BackgroundEffects />
        
        {/* Main content */}
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <UploadPage 
                  onFileUpload={setUploadedFile}
                  onAnalysisComplete={setAnalysisData}
                />
              } 
            />
            <Route
              path="/analyzing"
              element={
                <AnalyzingPage
                  file={uploadedFile}
                  onAnalysisComplete={setAnalysisData}
                />
              }
            />
            <Route
              path="/story"
              element={
                <StoryDashboard data={analysisData} />
              }
            />
            <Route
              path="/dashboard"
              element={
                <DashboardPage data={analysisData} />
              }
            />
            <Route 
              path="/privacy" 
              element={<PrivacyPage />} 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
