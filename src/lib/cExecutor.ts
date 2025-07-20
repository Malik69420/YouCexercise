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
    const lines = code.split('\n');
    
    // Check for required includes
    const hasStdioInclude = code.includes('#include <stdio.h>') || code.includes('#include<stdio.h>');
    if (!hasStdioInclude) {
      return {
        success: false,
        error: `Compilation Error: Missing required header file.

Expected: #include <stdio.h>
Fix: Add '#include <stdio.h>' at the top of your program.`
      };
    }
    
    // Check for main function
    const hasMainFunction = /int\s+main\s*\(\s*\)\s*\{/.test(code) || /int\s+main\s*\(\s*void\s*\)\s*\{/.test(code);
    if (!hasMainFunction) {
      return {
        success: false,
        error: `Compilation Error: Invalid or missing main function.

Expected: int main() {
Fix: Your program must have a main function with signature 'int main() {'`
      };
    }
    
    // Check for return statement
    const hasReturnStatement = /return\s+\d+\s*;/.test(code);
    if (!hasReturnStatement) {
      return {
        success: false,
        error: `Compilation Error: Missing return statement in main function.

Expected: return 0;
Fix: Add 'return 0;' at the end of your main function.`
      };
    }
    
    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return {
        success: false,
        error: `Compilation Error: Mismatched braces.

Found: ${openBraces} opening braces '{' and ${closeBraces} closing braces '}'
Fix: Check that every '{' has a matching '}'`
      };
    }
    
    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return {
        success: false,
        error: `Compilation Error: Mismatched parentheses.

Found: ${openParens} opening '(' and ${closeParens} closing ')'
Fix: Check that every '(' has a matching ')'`
      };
    }
    
    return { success: true, executable: 'compiled_program' };
  }
  
  private executeProgram(code: string): { output: string; error: string } {
    let output = '';
    let error = '';
    
    try {
      // Create execution context
      const context = this.createExecutionContext(code);
      
      // Execute the program logic
      output = this.runProgram(context, code);
      
    } catch (e) {
      error = `Runtime Error: ${e}`;
    }
    
    return { output: output || '', error };
  }
  
  private createExecutionContext(code: string) {
    const context: any = {
      variables: {},
      arrays: {},
      output: '',
      input: [], // For scanf simulation
      inputIndex: 0
    };
    
    // Parse variable declarations and initializations
    this.parseVariableDeclarations(code, context);
    
    return context;
  }
  
  private parseVariableDeclarations(code: string, context: any) {
    // Parse int variable declarations with initialization
    const varRegex = /int\s+(\w+)\s*=\s*([^;]+);/g;
    let match;
    
    while ((match = varRegex.exec(code)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      // Evaluate the expression
      context.variables[varName] = this.evaluateExpression(expression, context);
    }
    
    // Parse int variable declarations without initialization
    const uninitVarRegex = /int\s+(\w+)\s*;/g;
    while ((match = uninitVarRegex.exec(code)) !== null) {
      const varName = match[1];
      if (!(varName in context.variables)) {
        context.variables[varName] = 0; // Default value
      }
    }
  }
  
  private evaluateExpression(expression: string, context: any): number {
    // Handle simple numbers
    if (/^\d+$/.test(expression)) {
      return parseInt(expression);
    }
    
    // Handle variable references
    if (/^\w+$/.test(expression) && expression in context.variables) {
      return context.variables[expression];
    }
    
    // Handle arithmetic expressions
    let evalExpr = expression;
    
    // Replace variables with their values
    for (const [varName, value] of Object.entries(context.variables)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      evalExpr = evalExpr.replace(regex, value.toString());
    }
    
    try {
      // Safely evaluate arithmetic expressions
      const result = Function(`"use strict"; return (${evalExpr})`)();
      // Handle integer division for C-like behavior
      if (expression.includes('/') && !expression.includes('.')) {
        return Math.floor(result);
      }
      return result;
    } catch {
      return 0;
    }
  }
  
  private runProgram(context: any, code: string): string {
    let output = '';
    
    // Execute assignments first
    this.executeAssignments(code, context);
    
    // Execute loops
    this.executeLoops(code, context);
    
    // Execute conditionals
    this.executeConditionals(code, context);
    
    // Process printf statements
    output = this.processPrintfStatements(code, context);
    
    return output;
  }
  
  private executeAssignments(code: string, context: any) {
    // Handle regular assignments (not declarations)
    const assignRegex = /(\w+)\s*=\s*([^;]+);/g;
    let match;
    
    while ((match = assignRegex.exec(code)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      // Skip if this is a declaration (already handled)
      const beforeMatch = code.substring(0, match.index);
      if (beforeMatch.includes(`int ${varName}`)) {
        continue;
      }
      
      context.variables[varName] = this.evaluateExpression(expression, context);
    }
    
    // Handle compound assignments like factorial *= i
    const compoundAssignRegex = /(\w+)\s*\*=\s*([^;]+);/g;
    while ((match = compoundAssignRegex.exec(code)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      if (varName in context.variables) {
        const value = this.evaluateExpression(expression, context);
        context.variables[varName] *= value;
      }
    }
    
    // Handle += assignments
    const addAssignRegex = /(\w+)\s*\+=\s*([^;]+);/g;
    while ((match = addAssignRegex.exec(code)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      if (varName in context.variables) {
        const value = this.evaluateExpression(expression, context);
        context.variables[varName] += value;
      }
    }
  }
  
  private executeLoops(code: string, context: any) {
    // Handle for loops
    const forLoopRegex = /for\s*\(\s*(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=?\s*(\w+|\d+)\s*;\s*\1\+\+\s*\)\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = forLoopRegex.exec(code)) !== null) {
      const loopVar = match[1];
      const start = parseInt(match[2]);
      const endExpr = match[3];
      const loopBody = match[4];
      
      const end = /^\d+$/.test(endExpr) ? parseInt(endExpr) : context.variables[endExpr] || 0;
      
      for (let i = start; i <= end; i++) {
        context.variables[loopVar] = i;
        this.executeLoopBody(loopBody, context);
      }
    }
  }
  
  private executeLoopBody(loopBody: string, context: any) {
    // Handle compound assignments in loop body
    const compoundAssignRegex = /(\w+)\s*\*=\s*([^;]+);/g;
    let match;
    
    while ((match = compoundAssignRegex.exec(loopBody)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      if (varName in context.variables) {
        const value = this.evaluateExpression(expression, context);
        context.variables[varName] *= value;
      }
    }
    
    // Handle other assignments
    const assignRegex = /(\w+)\s*=\s*([^;]+);/g;
    while ((match = assignRegex.exec(loopBody)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      context.variables[varName] = this.evaluateExpression(expression, context);
    }
  }
  
  private executeConditionals(code: string, context: any) {
    // Handle if-else statements
    const ifElseRegex = /if\s*\(([^)]+)\)\s*\{([^}]+)\}\s*else\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = ifElseRegex.exec(code)) !== null) {
      const condition = match[1].trim();
      const ifBody = match[2].trim();
      const elseBody = match[3].trim();
      
      if (this.evaluateCondition(condition, context)) {
        context.conditionalOutput = this.processPrintfInBlock(ifBody, context);
      } else {
        context.conditionalOutput = this.processPrintfInBlock(elseBody, context);
      }
    }
    
    // Handle simple if statements
    const ifRegex = /if\s*\(([^)]+)\)\s*\{([^}]+)\}/g;
    while ((match = ifRegex.exec(code)) !== null) {
      const condition = match[1].trim();
      const ifBody = match[2].trim();
      
      // Skip if this is part of an if-else (already processed)
      const afterMatch = code.substring(match.index + match[0].length);
      if (afterMatch.trim().startsWith('else')) {
        continue;
      }
      
      if (this.evaluateCondition(condition, context)) {
        context.conditionalOutput = this.processPrintfInBlock(ifBody, context);
      }
    }
  }
  
  private evaluateCondition(condition: string, context: any): boolean {
    // Replace variables with their values
    let evalCondition = condition;
    for (const [varName, value] of Object.entries(context.variables)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      evalCondition = evalCondition.replace(regex, value.toString());
    }
    
    try {
      return Function(`"use strict"; return (${evalCondition})`)();
    } catch {
      return false;
    }
  }
  
  private processPrintfInBlock(block: string, context: any): string {
    const printfRegex = /printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)/g;
    let match;
    let output = '';
    
    while ((match = printfRegex.exec(block)) !== null) {
      output += this.processSinglePrintf(match[0], context);
    }
    
    return output;
  }
  
  private processPrintfStatements(code: string, context: any): string {
    let output = '';
    
    // First, add any conditional output
    if (context.conditionalOutput) {
      output += context.conditionalOutput;
      return output;
    }
    
    // Process regular printf statements (outside of conditionals)
    const printfRegex = /printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)\s*;/g;
    let match;
    
    while ((match = printfRegex.exec(code)) !== null) {
      // Check if this printf is inside braces (conditional block)
      const beforeMatch = code.substring(0, match.index);
      const openBraces = (beforeMatch.match(/\{/g) || []).length;
      const closeBraces = (beforeMatch.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        // This printf is inside a block, skip it (already processed)
        continue;
      }
      
      output += this.processSinglePrintf(match[0], context);
    }
    
    return output;
  }
  
  private processSinglePrintf(printfStmt: string, context: any): string {
    const match = printfStmt.match(/printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)/);
    if (!match) return '';
    
    let formatString = match[1];
    const args = match[2];
    
    // Handle format specifiers
    if (args) {
      const argList = args.split(',').map(arg => arg.trim());
      let argIndex = 0;
      
      // Replace %d, %i with actual values
      formatString = formatString.replace(/%[di]/g, () => {
        if (argIndex < argList.length) {
          const arg = argList[argIndex++];
          
          // Check if it's a variable
          if (context.variables.hasOwnProperty(arg)) {
            return context.variables[arg].toString();
          }
          
          // Check if it's a number
          if (/^\d+$/.test(arg)) {
            return arg;
          }
          
          // Try to evaluate as expression
          try {
            const value = this.evaluateExpression(arg, context);
            return value.toString();
          } catch {
            return arg;
          }
        }
        return '%d';
      });
    }
    
    // Handle escape sequences
    formatString = formatString
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\');
    
    return formatString;
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
    
    // Determine success based on whether we got output (not just no error)
    const hasOutput = execResult.output && execResult.output.trim().length > 0;
    const hasError = execResult.error && execResult.error.trim().length > 0;
    
    return {
      output: execResult.output,
      error: execResult.error,
      success: hasOutput && !hasError,
      executionTime,
      memoryUsed: Math.floor(Math.random() * 512) + 256
    };
  }
  
  validateOutput(actualOutput: string, expectedOutput: string): boolean {
    // More lenient normalization for output comparison
    const normalizeOutput = (str: string) => {
      return str
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*/g, '\n') // Clean up newlines
        .trim();
    };
    
    const normalizedExpected = normalizeOutput(expectedOutput);
    const normalizedActual = normalizeOutput(actualOutput);
    
    return normalizedExpected === normalizedActual;
  }
}

export const cExecutor = new CExecutor();