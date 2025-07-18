import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  visible: boolean;
  onToggle: () => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  visible,
  onToggle,
}) => {
  const keyboardRows = [
    // C-specific symbols and operators
    [
      { key: '{', label: '{', type: 'symbol' },
      { key: '}', label: '}', type: 'symbol' },
      { key: '(', label: '(', type: 'symbol' },
      { key: ')', label: ')', type: 'symbol' },
      { key: '[', label: '[', type: 'symbol' },
      { key: ']', label: ']', type: 'symbol' },
    ],
    [
      { key: ';', label: ';', type: 'symbol' },
      { key: ':', label: ':', type: 'symbol' },
      { key: ',', label: ',', type: 'symbol' },
      { key: '.', label: '.', type: 'symbol' },
      { key: '?', label: '?', type: 'symbol' },
      { key: '!', label: '!', type: 'symbol' },
    ],
    [
      { key: '=', label: '=', type: 'operator' },
      { key: '+', label: '+', type: 'operator' },
      { key: '-', label: '-', type: 'operator' },
      { key: '*', label: '*', type: 'operator' },
      { key: '/', label: '/', type: 'operator' },
      { key: '%', label: '%', type: 'operator' },
    ],
    [
      { key: '<', label: '<', type: 'operator' },
      { key: '>', label: '>', type: 'operator' },
      { key: '&', label: '&', type: 'operator' },
      { key: '|', label: '|', type: 'operator' },
      { key: '^', label: '^', type: 'operator' },
      { key: '~', label: '~', type: 'operator' },
    ],
    [
      { key: '#', label: '#', type: 'special' },
      { key: '"', label: '"', type: 'special' },
      { key: "'", label: "'", type: 'special' },
      { key: '\\', label: '\\', type: 'special' },
      { key: '\t', label: 'Tab', type: 'special' },
      { key: '\n', label: 'Enter', type: 'special' },
    ],
  ];

  const commonSnippets = [
    { key: 'printf("', label: 'printf', type: 'snippet' },
    { key: 'scanf("', label: 'scanf', type: 'snippet' },
    { key: 'if (', label: 'if', type: 'snippet' },
    { key: 'for (', label: 'for', type: 'snippet' },
    { key: 'while (', label: 'while', type: 'snippet' },
    { key: 'int ', label: 'int', type: 'snippet' },
  ];

  const getKeyStyle = (type: string) => {
    switch (type) {
      case 'symbol':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'operator':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'special':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'snippet':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110 z-50"
      >
        <Keyboard className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gray-900 border-t border-gray-700 z-50 max-h-[50vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">C Programming Keyboard</h3>
            <p className="text-gray-400 text-sm">Tap symbols to insert into code</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Keyboard Content */}
      <div className="p-4 space-y-4">
        {/* Common Snippets */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Common C Snippets</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {commonSnippets.map((item) => (
              <button
                key={item.key}
                onClick={() => onKeyPress(item.key)}
                className={`px-3 py-2 rounded-lg font-mono text-sm transition-all duration-200 transform hover:scale-105 ${getKeyStyle(item.type)}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Symbol Rows */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Symbols & Operators</h4>
          <div className="space-y-2">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-2">
                {row.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onKeyPress(item.key)}
                    className={`px-3 py-3 rounded-lg font-mono text-sm transition-all duration-200 transform hover:scale-105 ${getKeyStyle(item.type)}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;