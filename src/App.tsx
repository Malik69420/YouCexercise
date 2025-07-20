import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import AuthForm from './components/AuthForm';
import ExercisesList from './components/ExercisesList';
import ExerciseDetail from './components/ExerciseDetail';
import { LogOut, User, Code2, Settings } from 'lucide-react';
import type { Exercise } from './types';

function App() {
  const { user, loading, signOut } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setSelectedExercise(null);
    if (!isSupabaseConfigured) {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/20 border-t-white mx-auto"></div>
            <Code2 className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Loading CodeLab</h2>
          <p className="text-blue-100 text-lg">Preparing your coding environment...</p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if ((!user && isSupabaseConfigured) || showAuth) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  CodeLab
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  C Programming Platform {!isSupabaseConfigured && '✨ Demo Mode'}
                </p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                <div className="bg-blue-100 p-1 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {user?.email?.split('@')[0] || 'Demo User'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {isSupabaseConfigured ? '🔐 Authenticated' : '✨ Demo Mode'}
                  </p>
                </div>
              </div>
              
              {/* Mobile User Icon */}
              <div className="sm:hidden bg-gray-50 p-2 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">
                  {isSupabaseConfigured ? 'Sign Out' : 'Exit Demo'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {selectedExercise ? (
          <ExerciseDetail
            exercise={selectedExercise}
            onBack={() => setSelectedExercise(null)}
          />
        ) : (
          <ExercisesList onSelectExercise={setSelectedExercise} />
        )}
      </main>
      
      {/* Footer */}
      {!selectedExercise && (
        <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">CodeLab</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Master C programming through hands-on practice
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span>Built with React + Vite</span>
                <span>•</span>
                <span>Powered by Supabase</span>
                <span>•</span>
                <span>Mobile Optimized</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;