import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye, FileX, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NeuCard from '../components/NeuCard'

export default function PrivacyPage() {
  const navigate = useNavigate()

  const sections = [
    {
      icon: Lock,
      title: '100% Client-Side Processing',
      description: 'All data processing happens entirely in your browser. Your CSV files are never uploaded to any server.'
    },
    {
      icon: Eye,
      title: 'No Data Collection',
      description: 'We do not collect, store, or transmit any of your usage data. Your analysis stays on your device.'
    },
    {
      icon: FileX,
      title: 'No Tracking',
      description: 'We do not use cookies, analytics, or any tracking technologies. Your privacy is our priority.'
    },
    {
      icon: Globe,
      title: 'Open Source',
      description: 'This tool is open source. You can review the code on GitHub to verify our privacy claims.'
    }
  ]

  return (
    <div className="relative min-h-screen px-6 py-8 md:px-12 bg-neu-bg">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
            <Shield className="w-6 h-6 text-coral-500" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
            Privacy <span className="text-coral-500">Policy</span>
          </h1>
        </div>
        <p className="text-text-muted text-sm">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl"
      >
        {/* Intro Card */}
        <NeuCard className="mb-6 p-6 md:p-8">
          <p className="text-text-secondary leading-relaxed mb-4">
            Your privacy is important to us. This tool is designed with privacy as a core principle.
            We believe you should have full control over your data.
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            This privacy policy explains how we handle your data when you use the AI Usage Optimizer.
          </p>
        </NeuCard>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <NeuCard className="p-6 h-full">
                  <div className="w-10 h-10 rounded-xl shadow-neu-inset-sm flex items-center justify-center mb-4 bg-neu-bg">
                    <Icon className="w-5 h-5 text-coral-500" />
                  </div>
                  <h3 className="font-display font-semibold text-text-primary mb-2">{section.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{section.description}</p>
                </NeuCard>
              </motion.div>
            )
          })}
        </div>

        {/* Detailed Policy */}
        <NeuCard className="p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold text-text-primary mb-6">Detailed Privacy Information</h2>

          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-text-primary mb-2">Data Processing</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                All CSV files you upload are processed entirely within your web browser using JavaScript.
                No data is sent to external servers. The analysis happens locally on your device.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Local Storage</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                To improve your experience, we may store your analysis results in your browser's local storage.
                This data remains on your device and can be cleared at any time through your browser settings.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Third-Party Services</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                This tool is hosted on Vercel. Vercel may collect standard web server logs (IP addresses,
                request timestamps) as part of their hosting service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Your Rights</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Since we don't collect your data, you have complete control. You can:
              </p>
              <ul className="list-disc list-inside text-text-muted text-sm mt-2 space-y-1 ml-4">
                <li>Clear your browser's local storage at any time</li>
                <li>Review the source code on GitHub</li>
                <li>Use the tool without creating an account</li>
                <li>Export and delete your analysis at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Contact</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                If you have questions about this privacy policy, please open an issue on our GitHub repository.
              </p>
            </section>
          </div>
        </NeuCard>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <motion.button
            onClick={() => navigate('/')}
            className="neu-btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Home
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
