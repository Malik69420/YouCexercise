interface ExecutionResult {
  output: string;
  error: string;
  success: boolean;
  executionTime: number;
  memoryUsed: number;
}

class CExecutor {
  private compileC(code: string): { success: boolean; error?: string; executable?: string } {
    // Basic C syntax validation
    const requiredIncludes = ['#include <stdio.h>'];
    const hasMainFunction = /int\s+main\s*\([^)]*\)\s*\{/.test(code);
    const hasReturnStatement = /return\s+\d+\s*;/.test(code);
    
    // Check for required includes
    const missingIncludes = requiredIncludes.filter(include => !code.includes(include));
    if (missingIncludes.length > 0) {
      return {
        success: false,
        error: `Compilation Error: Missing required includes: ${missingIncludes.join(', ')}`
      };
    }
    
    // Check for main function
    if (!hasMainFunction) {
      return {
        success: false,
        error: 'Compilation Error: Missing main function. Expected: int main() { ... }'
      };
    }
    
    // Check for return statement
    if (!hasReturnStatement) {
      return {
        success: false,
        error: 'Compilation Error: Missing return statement in main function'
      };
    }
    
    // Check for basic syntax errors
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return {
        success: false,
        error: `Compilation Error: Mismatched braces. Found ${openBraces} '{' and ${closeBraces} '}'`
      };
    }
    
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return {
        success: false,
        error: `Compilation Error: Mismatched parentheses. Found ${openParens} '(' and ${closeParens} ')'`
      };
    }
    
    return { success: true, executable: 'compiled_program' };
  }
  
  private executeProgram(code: string): { output: string; error: string } {
    let output = '';
    let error = '';
    
    try {
      // Extract printf statements and their arguments
      const printfRegex = /printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)/g;
      let match;
      
      while ((match = printfRegex.exec(code)) !== null) {
        let formatString = match[1];
        const args = match[2];
        
        // Handle format specifiers
        if (args) {
          const argList = args.split(',').map(arg => arg.trim());
          let argIndex = 0;
          
          formatString = formatString.replace(/%[dioxX]/g, () => {
            if (argIndex < argList.length) {
              const arg = argList[argIndex++];
              // Try to evaluate simple expressions
              if (/^\d+$/.test(arg)) {
                return arg;
              } else if (/^[a-zA-Z_]\w*$/.test(arg)) {
                // Variable - try to find its value in the code
                const varMatch = new RegExp(`int\\s+${arg}\\s*=\\s*(\\d+)`).exec(code);
                if (varMatch) {
                  return varMatch[1];
                }
                return arg; // Return variable name if value not found
              } else {
                // Try to evaluate simple arithmetic
                try {
                  const result = Function(`"use strict"; return (${arg})`)();
                  return result.toString();
                } catch {
                  return arg;
                }
              }
            }
            return '%d';
          });
          
          formatString = formatString.replace(/%[sc]/g, () => {
            if (argIndex < argList.length) {
              return argList[argIndex++].replace(/"/g, '');
            }
            return '%s';
          });
        }
        
        // Handle escape sequences
        formatString = formatString
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')
          .replace(/\\\\/g, '\\');
        
        output += formatString;
      }
      
      // Handle scanf and basic input simulation
      const scanfRegex = /scanf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)/g;
      let scanfMatch;
      while ((scanfMatch = scanfRegex.exec(code)) !== null) {
        // For demo purposes, simulate some input
        output += 'Enter values: ';
      }
      
      // Handle simple arithmetic operations
      const arithmeticRegex = /int\s+(\w+)\s*=\s*([^;]+);/g;
      let arithMatch;
      const variables: { [key: string]: number } = {};
      
      while ((arithMatch = arithmeticRegex.exec(code)) !== null) {
        const varName = arithMatch[1];
        const expression = arithMatch[2].trim();
        
        try {
          // Simple expression evaluation
          if (/^\d+$/.test(expression)) {
            variables[varName] = parseInt(expression);
          } else if (/^\d+\s*[+\-*/]\s*\d+$/.test(expression)) {
            const result = Function(`"use strict"; return (${expression})`)();
            variables[varName] = result;
          }
        } catch (e) {
          // Ignore evaluation errors
        }
      }
      
      // If no printf found but code seems valid, provide default output
      if (!output && code.includes('main')) {
        output = 'Program executed successfully.';
      }
      
    } catch (e) {
      error = `Runtime Error: ${e}`;
    }
    
    return { output: output || 'No output generated', error };
  }
  
  async executeC(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    
    // Compile the code
    const compileResult = this.compileC(code);
    if (!compileResult.success) {
      return {
        output: '',
        error: compileResult.error || 'Compilation failed',
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsed: 0
      };
    }
    
    // Execute the program
    const execResult = this.executeProgram(code);
    const executionTime = performance.now() - startTime;
    
    return {
      output: execResult.output,
      error: execResult.error,
      success: !execResult.error,
      executionTime,
      memoryUsed: Math.floor(Math.random() * 1024) + 512 // Simulated memory usage
    };
  }
  
  validateOutput(actualOutput: string, expectedOutput: string): boolean {
    // Normalize whitespace and compare
    const normalize = (str: string) => str.trim().replace(/\s+/g, ' ');
    return normalize(actualOutput) === normalize(expectedOutput);
  }
}

export const cExecutor = new CExecutor();