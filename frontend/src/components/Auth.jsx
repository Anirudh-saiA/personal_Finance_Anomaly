import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock } from 'lucide-react';

// An SVG illustration component to make the page more visually interesting
const AuthIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(79, 70, 229, 0.8)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(56, 189, 248, 0.8)', stopOpacity: 1}} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g opacity="0.4" filter="url(#glow)">
            <circle cx="200" cy="200" r="150" fill="url(#grad1)" />
            <rect x="450" y="400" width="250" height="250" rx="50" fill="rgba(56, 189, 248, 0.7)" />
            <path d="M 500 150 Q 650 50 700 200 T 500 350 Z" fill="rgba(79, 70, 229, 0.7)" />
        </g>
    </svg>
);


export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(isLogin ? 'Invalid email or password.' : 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full h-full flex">
            {/* Left side: Illustration (visible on large screens) */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50 relative overflow-hidden">
                <AuthIllustration />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-800 px-10">
                    <h1 className="text-4xl font-bold">Secure Your Finances</h1>
                    <p className="mt-4 text-lg">Detect anomalies and gain insights with the power of machine learning.</p>
                </div>
            </div>

            {/* Right side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                         <svg className="w-16 h-16 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 4h6m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="mt-4 text-3xl font-bold text-gray-900">
                        {isLogin ? 'Welcome Back!' : 'Create a New Account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isLogin ? 'Sign in to access your dashboard.' : 'Join us to start analyzing your finances.'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full py-3 pl-10 pr-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Email address"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full py-3 pl-10 pr-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Password"
                            />
                        </div>

                        {error && <p className="text-sm text-center text-red-500">{error}</p>}
                        
                        <button
                            type="submit"
                            className="w-full px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-transform duration-150 hover:scale-105"
                        >
                            {isLogin ? 'Sign In' : 'Register'}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-center text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={toggleAuthMode} className="font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none">
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
