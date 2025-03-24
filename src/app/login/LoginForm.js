"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [rememberMe, setRememberMe] = useState(false);
    const [connectionTest, setConnectionTest] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Sign In
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            
            // Redirect to dashboard on success
            window.location.href = '/';
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
                {/* Logo/Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">CT</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">ClientTrack</h1>
                </div>

                {/* Login Form */}
                <div className="bg-white py-8 px-6 shadow-md rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                className="mt-1 w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="mt-1 w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                                               
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                                loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginForm;