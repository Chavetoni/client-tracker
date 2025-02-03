"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const LoginForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [connectionTest, setConnectionTest] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testConnection = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            setConnectionTest('Database Connected');
        } catch (error) {
            setConnectionTest('Database Connection Failed: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            if (isLogin) {
                // Sign In
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Redirect to dashboard on success
                window.location.href = '/';
            } else {
                // Sign Up
                const { error } = await supabase.auth.signUp({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Show success message
                alert('Check your email for the confirmation link!');
            }
        } catch (error) {
            set(error.message);
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
                    <p className="text-gray-600 mt-2">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
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
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
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
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="text-orange-600 hover:text-orange-500">
                                    Forgot password?
                                </a>
                            </div>
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
                            {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Sign up')}
                        </button>

                        {/* Test Connection Button */}
                        <button
                            type="button"
                            onClick={testConnection}
                            className="mt-4 w-full text-sm text-orange-600 hover:text-orange-500"
                        >
                            Test Supabase Connection
                        </button>

                        {/* Connection Test Result */}
                        {connectionTest && (
                            <div className="mt-2 text-sm text-gray-600">
                                {connectionTest}
                            </div>
                        )}
                    </form>

                    {/* Toggle between login and signup */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-orange-600 hover:text-orange-500"
                        >
                            {isLogin 
                                ? "Don't have an account? Sign up" 
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;