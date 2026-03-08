'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';



import AuthLayout from '../../homepage-component/AuthLayout';
import { useResetPasswordMutation } from '../../../redux/slices/apiSlice';
import { Button } from '../../../components/ui/Button';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        new_password: '',
    });
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await resetPassword(formData).unwrap();
            router.push('/login');
        } catch (err) {
            setError(err.data?.detail || 'Reset failed. Please verify your code.');
        }
    };

    return (
        <AuthLayout
            title="Set new password"
            subtitle="Enter the code sent to your email and your new password."
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reset Code
                        </label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            value={formData.code}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                            placeholder="Enter 6-digit code"
                        />
                    </div>

                    <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                        </label>
                        <input
                            id="new_password"
                            name="new_password"
                            type="password"
                            required
                            value={formData.new_password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? 'Resetting...' : 'Update password'}
                </Button>
            </form>
        </AuthLayout>
    );
}
