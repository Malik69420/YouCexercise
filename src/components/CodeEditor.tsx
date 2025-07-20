import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Terminal, Clock, MemoryStick, CheckCircle, XCircle, Zap, Keyboard, X, Code } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import { cExecutor } from '../lib/cExecutor';

interface CodeEditorProps {
  initialCode: string;
  expectedOutput?: string;
  onRun: (code: string, output: string, success: boolean, executionTime: number) => void;
  onSave: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode, 
  expectedOutput, 
  onRun, 
  onSave 
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsed, setMemoryUsed] = useState(0);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor for better experience
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 21,
      minimap: { enabled: window.innerWidth >= 1200 },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'gutter',
      selectOnLineNumbers: true,
      tabSize: 4,
      insertSpaces: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first!');
      setOutput('');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');
    setTestPassed(null);
    
    try {
      const result = await cExecutor.executeC(code);
      
      setExecutionTime(result.executionTime);
      setMemoryUsed(result.memoryUsed);
      
      if (!result.success) {
        setError(result.error);
        setOutput('');
        setTestPassed(false);
        onRun(code, '', false, result.executionTime);
      } else {
        setOutput(result.output);
        setError('');
        
        // Check if output matches expected output
        let passed = true;
        if (expectedOutput) {
          passed = cExecutor.validateOutput(result.output, expectedOutput);
          setTestPassed(passed);
        }
        
        onRun(code, result.output, passed, result.executionTime);
      }
    } catch (error) {
      const errorMsg = `Execution Error: ${error}`;
      setError(errorMsg);
      setOutput('');
      setTestPassed(false);
      onRun(code, '', false, 0);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = () => {
    onSave(code);
  };

  const handleKeyPress = (key: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn,
      };
      
      editorRef.current.executeEdits('keyboard', [
        {
          range,
          text: key,
        },
      ]);
      
      editorRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Code Editor</h3>
            <p className="text-gray-400 text-sm">Write your C solution here</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveCode}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          
          <button
            onClick={() => setKeyboardVisible(!keyboardVisible)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col xl:flex-row min-h-0">
        {/* Code Editor */}
        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            language="c"
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
              fontWeight: '400',
              lineHeight: 21,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
              renderLineHighlight: 'gutter',
              selectOnLineNumbers: true,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderWhitespace: 'selection',
              showFoldingControls: 'mouseover',
            }}
          />
        </div>
        
        {/* Output Terminal */}
        <div className="xl:w-96 min-h-[300px] xl:min-h-0 bg-gray-900 border-t xl:border-t-0 xl:border-l border-gray-700 flex flex-col">
          {/* Terminal Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-semibold">Terminal Output</h4>
              </div>
              
              {(executionTime > 0 || memoryUsed > 0) && (
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <Terminal className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <MemoryStick className="w-4 h-4" />
                    <span>{memoryUsed}KB</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Test Status */}
            {testPassed !== null && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                testPassed 
                  ? 'bg-green-900/30 text-green-300 border-green-500/50 shadow-green-500/20 shadow-lg' 
                  : 'bg-red-900/30 text-red-300 border-red-500/50 shadow-red-500/20 shadow-lg'
              }`}>
                {testPassed ? (
                  <>
                    <CheckCircle className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-lg">🎉 All Tests Passed!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-lg">❌ Tests Failed</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Terminal Content */}
          <div className="flex-1 p-4 overflow-auto font-mono text-sm">
            {error ? (
              <div className="space-y-4">
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-semibold">Compilation Error</span>
                  </div>
                  <pre className="text-red-200 whitespace-pre-wrap leading-relaxed">
                    {error}
                  </pre>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-semibold">Quick Fix Tips</span>
                  </div>
                  <div className="text-yellow-200 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Make sure you have <code className="bg-yellow-800/30 px-1 rounded">#include &lt;stdio.h&gt;</code></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Check that your main function is properly defined</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Ensure all braces <code className="bg-yellow-800/30 px-1 rounded">{ }</code> and parentheses <code className="bg-yellow-800/30 px-1 rounded">( )</code> are balanced</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Don't forget the <code className="bg-yellow-800/30 px-1 rounded">return 0;</code> statement</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : output ? (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-semibold">Program Output</span>
                  </div>
                  <pre className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {output}
                  </pre>
                </div>
                
                {expectedOutput && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300 font-semibold">Expected Output</span>
                    </div>
                    <pre className="text-blue-200 whitespace-pre-wrap leading-relaxed">
                      {expectedOutput}
                    </pre>
                  </div>
                )}
                
                {testPassed !== null && (
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    testPassed 
                      ? 'bg-green-900/20 border-green-500/50 shadow-green-500/20 shadow-xl' 
                      : 'bg-red-900/20 border-red-500/50 shadow-red-500/20 shadow-xl'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {testPassed ? (
                        <>
                          <div className="bg-green-500 p-2 rounded-full">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-green-300 font-bold text-xl">Test Result: PASSED ✅</span>
                        </>
                      ) : (
                        <>
                          <div className="bg-red-500 p-2 rounded-full">
                            <XCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-red-300 font-bold text-xl">Test Result: FAILED ❌</span>
                        </>
                      )}
                    </div>
                    <p className={`text-base leading-relaxed ${testPassed ? 'text-green-200' : 'text-red-200'}`}>
                      {testPassed 
                        ? '🎉 Congratulations! Your solution produces the correct output. Great job!' 
                        : '🔍 Your output doesn\'t match the expected result. Check your logic and try again.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Ready to Run</p>
                  <p className="text-sm">Click "Run Code" to execute your program</p>
                  <p className="text-xs mt-2 opacity-75">Your program results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        visible={keyboardVisible}
        onToggle={() => setKeyboardVisible(!keyboardVisible)}
      />
    </div>
  );
};

export default CodeEditor;