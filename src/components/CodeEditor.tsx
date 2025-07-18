import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Terminal, Clock, MemoryStick, CheckCircle, XCircle, Zap } from 'lucide-react';
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
    
    // Configure editor for better mobile experience
    editor.updateOptions({
      fontSize: window.innerWidth < 768 ? 12 : 14,
      lineHeight: window.innerWidth < 768 ? 18 : 21,
      minimap: { enabled: window.innerWidth >= 1024 },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
    });
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first!');
      setOutput('');
      return;
    }

    setIsRunning(true);
    setOutput('Compiling and executing...');
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Code Editor</h3>
            <p className="text-gray-400 text-sm">Write your C code here</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveCode}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          
          <button
            onClick={() => setKeyboardVisible(!keyboardVisible)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
          >
            <span className="text-lg">⌨️</span>
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
      
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
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
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
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
            }}
          />
        </div>
        
        {/* Output Panel */}
        <div className="lg:w-2/5 min-h-[300px] lg:min-h-0 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col">
          {/* Output Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-semibold">Output</h4>
              </div>
              
              {(executionTime > 0 || memoryUsed > 0) && (
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{executionTime.toFixed(1)}ms</span>
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
              <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg ${
                testPassed 
                  ? 'bg-green-900/50 text-green-300 border border-green-700' 
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}>
                {testPassed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Test Passed!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Test Failed</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Output Content */}
          <div className="flex-1 p-4 overflow-auto">
            {error ? (
              <div className="space-y-3">
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 font-medium">Compilation Error</span>
                  </div>
                  <pre className="text-red-200 text-sm font-mono whitespace-pre-wrap">
                    {error}
                  </pre>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-medium">Quick Fix Tips</span>
                  </div>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• Make sure you have #include &lt;stdio.h&gt;</li>
                    <li>• Check that your main function is properly defined</li>
                    <li>• Ensure all braces and parentheses are balanced</li>
                    <li>• Don't forget the return statement</li>
                  </ul>
                </div>
              </div>
            ) : output ? (
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 font-medium">Program Output</span>
                  </div>
                  <pre className="text-gray-100 font-mono text-sm whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
                
                {expectedOutput && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium">Expected Output</span>
                    </div>
                    <pre className="text-blue-200 font-mono text-sm whitespace-pre-wrap">
                      {expectedOutput}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Run Code" to see output</p>
                  <p className="text-sm mt-1">Your program results will appear here</p>
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