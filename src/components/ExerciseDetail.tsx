import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Target, Clock, CheckCircle, XCircle, Trophy, Code, Terminal, Play, Save, Keyboard, X, Lightbulb } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Exercise } from '../types';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise, onBack }) => {
  const [currentCode, setCurrentCode] = useState(exercise.starter_code);
  const [showProblem, setShowProblem] = useState(true);
  const [lastSubmission, setLastSubmission] = useState<{
    status: 'passed' | 'failed' | 'error';
    message: string;
    executionTime?: number;
  } | null>(null);

  const handleRunCode = async (code: string, output: string, success: boolean, executionTime: number) => {
    try {
      if (!isSupabaseConfigured) {
        setLastSubmission({
          status: success ? 'passed' : 'failed',
          message: success ? 'Test passed! Great work!' : 'Test failed. Check your output.',
          executionTime
        });
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('submissions')
        .insert([
          {
            user_id: user.user.id,
            exercise_id: exercise.id,
            code,
            output,
            passed: success,
          },
        ]);

      if (error) throw error;
      
      setLastSubmission({
        status: success ? 'passed' : 'failed',
        message: success ? 'Test passed! Solution submitted.' : 'Test failed. Keep trying!',
        executionTime
      });
    } catch (error) {
      console.error('Error saving submission:', error);
      setLastSubmission({
        status: 'error',
        message: 'Failed to save submission, but your code ran locally.',
        executionTime
      });
    }
  };

  const handleSaveCode = (code: string) => {
    setCurrentCode(code);
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': 
        return { color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' };
      case 'medium': 
        return { color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'hard': 
        return { color: 'from-red-500 to-pink-600', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' };
      default: 
        return { color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const difficultyConfig = getDifficultyConfig(exercise.difficulty);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
              
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {exercise.title}
                </h1>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${difficultyConfig.bg} ${difficultyConfig.text} ${difficultyConfig.border} border`}>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${difficultyConfig.color}`} />
                  {exercise.difficulty.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastSubmission && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  lastSubmission.status === 'passed' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : lastSubmission.status === 'failed'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {lastSubmission.status === 'passed' ? (
                    <Trophy className="w-4 h-4" />
                  ) : lastSubmission.status === 'failed' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>{lastSubmission.message}</span>
                  {lastSubmission.executionTime && (
                    <span className="opacity-75">
                      ({lastSubmission.executionTime.toFixed(1)}ms)
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowProblem(!showProblem)}
                className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showProblem 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{showProblem ? 'Hide' : 'Show'} Problem</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Panel - Collapsible on Mobile */}
        <div className={`${
          showProblem ? 'block' : 'hidden'
        } lg:block lg:w-96 xl:w-[28rem] bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0`}>
          <div className="p-6 space-y-6">
            {/* Problem Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Problem Description</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {exercise.description}
                </div>
              </div>
            </div>
            
            {/* Expected Output */}
            {exercise.expected_output && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Expected Output</h2>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-200">
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {exercise.expected_output}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Tags */}
            {exercise.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.tags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hints Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Hints & Tips</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Getting Started
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Include necessary header files (#include &lt;stdio.h&gt;)</li>
                    <li>• Use proper variable declarations</li>
                    <li>• Don't forget the return statement in main()</li>
                    <li>• Check your syntax carefully</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Best Practices
                  </h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Use meaningful variable names</li>
                    <li>• Add comments to explain your logic</li>
                    <li>• Test your code with different inputs</li>
                    <li>• Follow proper indentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Code Editor - Full Height */}
        <div className={`flex-1 ${showProblem ? 'hidden lg:block' : 'block'}`}>
          <CodeEditor
            initialCode={currentCode}
            expectedOutput={exercise.expected_output}
            onRun={handleRunCode}
            onSave={handleSaveCode}
          />
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;