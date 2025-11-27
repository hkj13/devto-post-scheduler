'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [config, setConfig] = useState({
    openaiApiKey: '',
    devtoApiKey: '',
    mediumApiKey: '',
    twitterBearerToken: '',
    devtoEnabled: true,
    mediumEnabled: false,
    twitterEnabled: false,
    contentTopics: 'AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML',
    postSchedule: '0 9 * * *',
  })
  const [status, setStatus] = useState('pending') // pending, deploying, active
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadConfig()
  }, [router])

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/config/get', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig({
            openaiApiKey: data.config.openai_api_key || '',
            devtoApiKey: data.config.devto_api_key || '',
            mediumApiKey: data.config.medium_api_key || '',
            twitterBearerToken: data.config.twitter_bearer_token || '',
            devtoEnabled: data.config.platforms_enabled?.devto || true,
            mediumEnabled: data.config.platforms_enabled?.medium || false,
            twitterEnabled: data.config.platforms_enabled?.twitter || false,
            contentTopics: data.config.content_topics?.join(',') || 'AgenticAI,GenerativeAI,LLM',
            postSchedule: data.config.post_schedule || '0 9 * * *',
          })
          setStatus(data.config.automation_status || 'pending')
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const handleSaveAndDeploy = async () => {
    setMessage('')
    setIsLoading(true)

    // Validation
    if (!config.openaiApiKey) {
      setMessage('❌ OpenAI API Key is required')
      setIsLoading(false)
      return
    }

    if (!config.devtoApiKey && config.devtoEnabled) {
      setMessage('❌ Dev.to API Key is required when Dev.to is enabled')
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      
      // Save configuration
      const saveResponse = await fetch('/api/config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save configuration')
      }

      setMessage('✅ Configuration saved! Deploying automation...')
      setStatus('deploying')

      // Deploy to Railway
      const deployResponse = await fetch('/api/config/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      if (!deployResponse.ok) {
        throw new Error('Failed to deploy automation')
      }

      const deployData = await deployResponse.json()
      setStatus('active')
      setMessage(`🎉 Success! Your automation is now live. First post will be at ${config.postSchedule} UTC.`)
      
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
      setStatus('pending')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ⚡ AutoContent Studio
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-lg ${
          status === 'active' ? 'bg-green-50 border border-green-200' :
          status === 'deploying' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              status === 'active' ? 'bg-green-500' :
              status === 'deploying' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-400'
            }`}></div>
            <span className="font-semibold">
              {status === 'active' ? '🟢 Automation Active' :
               status === 'deploying' ? '🟡 Deploying...' :
               '⚪ Setup Required'}
            </span>
          </div>
          {status === 'active' && (
            <p className="text-sm text-gray-600 mt-2">
              Your automation is running! Posts will be published daily at {config.postSchedule} UTC.
            </p>
          )}
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration</h2>
            <p className="text-gray-600">Configure your platforms and content preferences</p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              OpenAI API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={config.openaiApiKey}
              onChange={(e) => setConfig({...config, openaiApiKey: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="sk-proj-..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Get yours at: <a href="https://platform.openai.com/api-keys" target="_blank" className="text-purple-600 hover:underline">platform.openai.com/api-keys</a>
            </p>
          </div>

          {/* Platforms Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platforms</h3>
            
            {/* Dev.to */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="devto"
                  checked={config.devtoEnabled}
                  onChange={(e) => setConfig({...config, devtoEnabled: e.target.checked})}
                  className="w-5 h-5 text-purple-600"
                />
                <label htmlFor="devto" className="font-medium text-gray-900">
                  📝 Dev.to
                </label>
              </div>
              {config.devtoEnabled && (
                <div className="ml-8">
                  <input
                    type="password"
                    value={config.devtoApiKey}
                    onChange={(e) => setConfig({...config, devtoApiKey: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Dev.to API Key"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get yours at: <a href="https://dev.to/settings/extensions" target="_blank" className="text-purple-600 hover:underline">dev.to/settings/extensions</a>
                  </p>
                </div>
              )}
            </div>

            {/* Medium */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="medium"
                  checked={config.mediumEnabled}
                  onChange={(e) => setConfig({...config, mediumEnabled: e.target.checked})}
                  className="w-5 h-5 text-purple-600"
                />
                <label htmlFor="medium" className="font-medium text-gray-900">
                  💰 Medium <span className="text-xs text-gray-500">(Optional)</span>
                </label>
              </div>
              {config.mediumEnabled && (
                <div className="ml-8">
                  <input
                    type="password"
                    value={config.mediumApiKey}
                    onChange={(e) => setConfig({...config, mediumApiKey: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Medium Integration Token"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get yours at: <a href="https://medium.com/me/settings/security" target="_blank" className="text-purple-600 hover:underline">medium.com/me/settings/security</a>
                  </p>
                </div>
              )}
            </div>

            {/* Twitter */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="twitter"
                  checked={config.twitterEnabled}
                  onChange={(e) => setConfig({...config, twitterEnabled: e.target.checked})}
                  className="w-5 h-5 text-purple-600"
                />
                <label htmlFor="twitter" className="font-medium text-gray-900">
                  🐦 Twitter/X <span className="text-xs text-gray-500">(Optional)</span>
                </label>
              </div>
              {config.twitterEnabled && (
                <div className="ml-8">
                  <input
                    type="password"
                    value={config.twitterBearerToken}
                    onChange={(e) => setConfig({...config, twitterBearerToken: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Twitter Bearer Token"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get yours at: <a href="https://developer.twitter.com/" target="_blank" className="text-purple-600 hover:underline">developer.twitter.com</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Content Topics */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Topics
            </label>
            <input
              type="text"
              value={config.contentTopics}
              onChange={(e) => setConfig({...config, contentTopics: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="AgenticAI,GenerativeAI,LLM,CloudAI"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated topics (e.g., AgenticAI, GenerativeAI, LLM, DataScience)
            </p>
          </div>

          {/* Post Schedule */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Posting Schedule (Cron)
            </label>
            <input
              type="text"
              value={config.postSchedule}
              onChange={(e) => setConfig({...config, postSchedule: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0 9 * * *"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: "0 9 * * *" (Daily at 9 AM UTC). <a href="https://crontab.guru/" target="_blank" className="text-purple-600 hover:underline">Learn cron syntax</a>
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
              message.includes('✅') || message.includes('🎉') ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSaveAndDeploy}
            disabled={isLoading || status === 'deploying'}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Deploying...' : status === 'active' ? '🔄 Update Configuration' : '🚀 Start Automation'}
          </button>

          {status === 'active' && (
            <p className="text-center text-sm text-gray-500">
              Your automation is running. Changes will be applied on next deployment.
            </p>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-2">
            Contact us at: <a href="mailto:contact@grolytix.com" className="text-purple-600 hover:underline">contact@grolytix.com</a>
          </p>
          <p className="text-sm text-gray-600">
            Documentation: <a href="https://github.com/hkj13/automated-post-scheduler" target="_blank" className="text-purple-600 hover:underline">GitHub Repository</a>
          </p>
        </div>
      </div>
    </div>
  )
}
