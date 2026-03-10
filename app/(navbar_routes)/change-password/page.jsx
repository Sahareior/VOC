'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, KeyRound, ShieldCheck } from 'lucide-react'
import { useUpdatePasswordMutation } from '../../../redux/slices/apiSlice'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

function ChangePassword() {
    const [updatePassword, { isLoading, isSuccess, isError, error }] = useUpdatePasswordMutation()

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: ''
    })

    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState('')

    // Show/hide password states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setValidationError('')
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value)
        setValidationError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.current_password || !formData.new_password || !confirmPassword) {
            setValidationError('All fields are required')
            return
        }

        if (formData.new_password !== confirmPassword) {
            setValidationError('New passwords do not match')
            return
        }

        if (formData.new_password.length < 6) {
            setValidationError('Password must be at least 6 characters long')
            return
        }

        try {
            await updatePassword(formData).unwrap()
            setFormData({
                current_password: '',
                new_password: ''
            })
            setConfirmPassword('')
        } catch (err) {
            console.error('Failed to update password:', err)
        }
    }

    return (
        <div className="min-h-[80vh] pt-20 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Secure your account by updating your password
                    </p>
                </CardHeader>

                <CardContent>
                    {isSuccess && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium">Password updated successfully!</span>
                        </div>
                    )}

                    {(isError || validationError) && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-sm font-medium">
                                {validationError || error?.data?.message || 'Failed to update password'}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="current_password"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Current Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    id="current_password"
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    placeholder="Enter current password"
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="new_password"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                            >
                                <KeyRound className="w-4 h-4" />
                                New Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="new_password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    placeholder="Enter new password"
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="confirm_password"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                            >
                                <KeyRound className="w-4 h-4" />
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm_password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    disabled={isLoading}
                                    placeholder="Confirm new password"
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full py-6 font-bold text-base shadow-lg shadow-primary-500/20"
                                isLoading={isLoading}
                            >
                                {isLoading ? 'Updating...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChangePassword
