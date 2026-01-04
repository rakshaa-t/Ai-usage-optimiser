import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye, FileX, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TiltCard from '../components/TiltCard'

export default function PrivacyPage() {
  const navigate = useNavigate()

  const sections = [
    {
      icon: Lock,
      title: '100% Client-Side Processing',
      description: 'All data processing happens entirely in your browser. Your CSV files are never uploaded to any server. We have zero access to your data.'
    },
    {
      icon: Eye,
      title: 'No Data Collection',
      description: 'We do not collect, store, or transmit any of your usage data. Your analysis stays on your device until you choose to export it.'
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
    <div className="relative min-h-screen px-6 py-8 md:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent-400" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
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
        <TiltCard tiltAmount={6} glowIntensity={0.25} className="mb-6">
          <div className="p-6 md:p-8">
            <p className="text-gray-300 leading-relaxed mb-4">
              Your privacy is important to us. This tool is designed with privacy as a core principle. 
              We believe you should have full control over your data.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              This privacy policy explains how we handle your data when you use the AI Usage Optimizer.
            </p>
          </div>
        </TiltCard>

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
                <TiltCard tiltAmount={4} glowIntensity={0.2}>
                  <div className="p-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-accent-400" />
                    </div>
                    <h3 className="font-display font-semibold text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        {/* Detailed Policy */}
        <TiltCard tiltAmount={6} glowIntensity={0.25}>
          <div className="p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-white mb-6">
              Detailed Privacy Information
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="font-semibold text-white mb-2">Data Processing</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  All CSV files you upload are processed entirely within your web browser using JavaScript. 
                  No data is sent to external servers. The analysis happens locally on your device.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-white mb-2">Local Storage</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  To improve your experience, we may store your analysis results in your browser's local storage. 
                  This data remains on your device and can be cleared at any time through your browser settings.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-white mb-2">Third-Party Services</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This tool is hosted on Vercel. Vercel may collect standard web server logs (IP addresses, 
                  request timestamps) as part of their hosting service. We do not have access to or control 
                  over this data. For more information, see Vercel's privacy policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-white mb-2">Your Rights</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Since we don't collect your data, you have complete control. You can:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1 ml-4">
                  <li>Clear your browser's local storage at any time</li>
                  <li>Review the source code on GitHub</li>
                  <li>Use the tool without creating an account</li>
                  <li>Export and delete your analysis at any time</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-white mb-2">Changes to This Policy</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We may update this privacy policy from time to time. The "Last updated" date at the top 
                  indicates when changes were made. Continued use of the tool after changes constitutes 
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-white mb-2">Contact</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  If you have questions about this privacy policy, please open an issue on our GitHub repository 
                  or contact the maintainer.
                </p>
              </section>
            </div>
          </div>
        </TiltCard>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white shadow-lg shadow-accent-500/25 transition-all duration-300"
          >
            Return to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

