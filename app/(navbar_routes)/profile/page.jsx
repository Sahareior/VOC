"use client"

import React, { useState, useEffect } from 'react'
import { useGetProfileQuery, useProfileUpdateMutation } from '../../../redux/slices/apiSlice'
import { useTheme } from '../../../contexts/ThemeContext'
import { User, Mail, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

function Profile() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useProfileUpdateMutation()

  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  })

  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || ''
      })
    }
  }, [profileData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    try {
      await updateProfile(formData).unwrap()
      setStatus({ type: 'success', message: 'Profile updated successfully!' })
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.data?.message || 'Failed to update profile. Please try again.'
      })
    }
  }

  if (isProfileLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const inputClasses = `w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none
    ${isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
    }`

  const labelClasses = `block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

  return (
    <div className={`max-w-2xl mx-auto px-4 py-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className={`rounded-3xl p-8 shadow-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your personal information and account settings
          </p>
        </div>

        {status.message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success'
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="full_name" className={labelClasses}>Full Name</label>
            <div className="relative group">
              <User className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="email" className={labelClasses}>Email Address</label>
            <div className="relative group">
              <Mail className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                }`}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile