'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../homepage-component/AuthLayout';
import { Button } from '../../components/ui/Button';
import { useForgotPasswordMutation } from '../../redux/slices/apiSlice';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await forgotPassword({ email }).unwrap();
        } catch (err) {
            setError(err.data?.detail || 'Something went wrong. Please try again.');
        }
    };

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="No worries, we'll send you reset instructions."
        >
            {isSuccess ? (
                <div className="text-center space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-lg border border-green-200 dark:border-green-800">
                        Check your email for reset instructions.
                    </div>
                    <Link href="/login" className="text-sm font-medium text-red-600 hover:text-red-500">
                        Back to login
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Reset password'}
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            Back to login
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
