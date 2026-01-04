import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import UploadPage from './pages/UploadPage'
import AnalyzingPage from './pages/AnalyzingPage'
import DashboardPage from './pages/DashboardPage'
import BackgroundEffects from './components/BackgroundEffects'

function App() {
  const [analysisData, setAnalysisData] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  return (
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
            path="/dashboard" 
            element={
              <DashboardPage data={analysisData} />
            } 
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
