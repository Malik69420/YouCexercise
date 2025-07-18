import React from 'react';
import { Clock, Code, Tag, Star, TrendingUp, Zap } from 'lucide-react';
import type { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': 
        return {
          color: 'from-green-500 to-emerald-600',
          bg: 'bg-green-50',
          text: 'text-green-800',
          icon: Star
        };
      case 'medium': 
        return {
          color: 'from-yellow-500 to-orange-600',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          icon: TrendingUp
        };
      case 'hard': 
        return {
          color: 'from-red-500 to-pink-600',
          bg: 'bg-red-50',
          text: 'text-red-800',
          icon: Zap
        };
      default: 
        return {
          color: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          icon: Code
        };
    }
  };

  const difficultyConfig = getDifficultyConfig(exercise.difficulty);
  const DifficultyIcon = difficultyConfig.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${difficultyConfig.color}`} />
      
      <div className="p-6">
        {/* Title and Difficulty */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-4 leading-tight">
            {exercise.title}
          </h3>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${difficultyConfig.bg} ${difficultyConfig.text} shrink-0`}>
            <DifficultyIcon className="w-3 h-3" />
            {exercise.difficulty.toUpperCase()}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {exercise.description.split('\n')[0]}
        </p>
        
        {/* Tags */}
        {exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {exercise.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                +{exercise.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              <span className="font-medium">C</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(exercise.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
            <span>Start Coding</span>
            <div className="w-5 h-5 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;