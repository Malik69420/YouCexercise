import React, { useState } from 'react';
import { Mail, Lock, Code2, Eye, EyeOff, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isSupabaseConfigured) {
        // Demo mode - simulate successful login
        setSuccess('Welcome to CodeLab Demo!');
        setTimeout(() => {
          onSuccess();
          setLoading(false);
        }, 1500);
        return;
      }

      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else if (error.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (!isLogin) {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
        }, 3000);
      } else {
        setSuccess('Welcome back to CodeLab!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    setLoading(true);
    setSuccess('Starting demo mode...');
    setTimeout(() => {
      onSuccess();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back!' : 'Join CodeLab'}
          </h1>
          <p className="text-blue-100 text-lg">
            {isLogin ? 'Continue your C programming journey' : 'Start mastering C programming today'}
          </p>
        </div>

        {/* Demo Mode Banner */}
        {!isSupabaseConfigured && (
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-500 p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-yellow-100 text-lg">Try Demo Mode</h3>
            </div>
            <p className="text-yellow-200 text-sm mb-4 leading-relaxed">
              Experience the full platform instantly! No signup required - perfect for exploring all features and solving coding challenges.
            </p>
            <button 
              onClick={handleDemoMode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Starting Demo...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <span>Continue in Demo Mode</span>
                </div>
              )}
            </button>
            
            <div className="mt-6 pt-4 border-t border-yellow-400/20">
              <p className="text-yellow-300 text-xs text-center">
                Or create a real account below for persistent data
              </p>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-100 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-white placeholder-blue-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                  required={isSupabaseConfigured}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-100 mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-white placeholder-blue-200 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required={isSupabaseConfigured}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-200 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-200 text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Sign In/Sign Up Button - ALWAYS SHOW */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin w-5 h-5" />
                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Code2 className="w-5 h-5" />
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </div>
            )}
          </button>
        </form>

        {/* Toggle Auth Mode - ALWAYS SHOW */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-blue-300 hover:text-blue-100 text-sm font-semibold transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
        
        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <h3 className="text-sm font-semibold text-blue-100 mb-4 text-center">What you'll get:</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Interactive C Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Real-time Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Progress Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Mobile Optimized</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthForm;