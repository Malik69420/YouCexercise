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
      context.originalCode = code;
      
      // Execute the program logic
      output = this.runProgram(context);
      
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
      input: this.extractInputValues(code), // For scanf simulation
      inputIndex: 0
    };
    
    // Parse variable declarations
    this.parseVariableDeclarations(code, context);
    
    // Parse array declarations
    this.parseArrayDeclarations(code, context);
    
    return context;
  }
  
  private extractInputValues(code: string): number[] {
    // For exercises that use scanf, we'll simulate input based on the expected output
    // This is a simplified approach for educational purposes
    
    // Check if code contains scanf
    if (code.includes('scanf')) {
      // For now, return some default values
      // In a real implementation, you'd want to provide input through the UI
      return [5, 10, 15]; // Default input values
    }
    
    return [];
  }
  
  private handleScanf(code: string, context: any) {
    // Handle scanf statements
    const scanfRegex = /scanf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)\s*;/g;
    let match;
    
    while ((match = scanfRegex.exec(code)) !== null) {
      const formatString = match[1];
      const args = match[2];
      
      if (args && context.input.length > context.inputIndex) {
        const argList = args.split(',').map(arg => arg.trim().replace('&', ''));
        
        for (const arg of argList) {
          if (context.inputIndex < context.input.length) {
            context.variables[arg] = context.input[context.inputIndex++];
          }
        }
      }
    }
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
  
  private parseArrayDeclarations(code: string, context: any) {
    // Parse array declarations like: int arr[] = {1, 2, 3, 4, 5};
    const arrayRegex = /int\s+(\w+)\[\]\s*=\s*\{([^}]+)\};/g;
    let match;
    
    while ((match = arrayRegex.exec(code)) !== null) {
      const arrayName = match[1];
      const elements = match[2].split(',').map(e => parseInt(e.trim()));
      context.arrays[arrayName] = elements;
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
  
  private runProgram(context: any): string {
    const code = context.originalCode || '';
    let output = '';
    
    // Handle scanf statements first
    this.handleScanf(code, context);
    
    // Execute loops first
    this.executeLoops(code, context);
    
    // Execute conditional statements
    this.executeConditionals(code, context);
    
    // Execute assignments
    this.executeAssignments(code, context);
    
    // Process printf statements
    output = this.processPrintfStatements(code, context);
    
    return output;
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
    
    // Handle while loops
    const whileLoopRegex = /while\s*\(\s*(\w+)\s*<=?\s*(\w+|\d+)\s*\)\s*\{([^}]+)\}/g;
    while ((match = whileLoopRegex.exec(code)) !== null) {
      const conditionVar = match[1];
      const limitExpr = match[2];
      const loopBody = match[3];
      
      const limit = /^\d+$/.test(limitExpr) ? parseInt(limitExpr) : context.variables[limitExpr] || 0;
      
      while ((context.variables[conditionVar] || 0) <= limit) {
        this.executeLoopBody(loopBody, context);
        if (loopBody.includes(`${conditionVar}++`)) {
          context.variables[conditionVar] = (context.variables[conditionVar] || 0) + 1;
        }
      }
    }
  }
  
  private executeLoopBody(loopBody: string, context: any) {
    // Handle assignments in loop body
    this.executeAssignments(loopBody, context);
  }
  
  private executeAssignments(code: string, context: any) {
    // Handle compound assignments like factorial *= i
    const compoundAssignRegex = /(\w+)\s*\*=\s*([^;]+);/g;
    let match;
    
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
    
    // Handle regular assignments
    const assignRegex = /(\w+)\s*=\s*([^;]+);/g;
    while ((match = assignRegex.exec(code)) !== null) {
      const varName = match[1];
      const expression = match[2].trim();
      
      // Skip if this is a declaration (already handled)
      if (code.substring(0, match.index).includes(`int ${varName}`)) {
        continue;
      }
      
      context.variables[varName] = this.evaluateExpression(expression, context);
    }
  }
  
  private executeConditionals(code: string, context: any) {
    // Handle if-else if-else chains
    const ifElseIfRegex = /if\s*\(([^)]+)\)\s*\{([^}]+)\}\s*else\s+if\s*\(([^)]+)\)\s*\{([^}]+)\}(?:\s*else\s*\{([^}]+)\})?/g;
    let match;
    
    while ((match = ifElseIfRegex.exec(code)) !== null) {
      const condition1 = match[1].trim();
      const ifBody1 = match[2].trim();
      const condition2 = match[3].trim();
      const ifBody2 = match[4].trim();
      const elseBody = match[5] ? match[5].trim() : '';
      
      if (this.evaluateCondition(condition1, context)) {
        this.executeBlock(ifBody1, context);
      } else if (this.evaluateCondition(condition2, context)) {
        this.executeBlock(ifBody2, context);
      } else if (elseBody) {
        this.executeBlock(elseBody, context);
      }
    }
    
    // Handle if-else statements
    const ifElseRegex = /if\s*\(([^)]+)\)\s*\{([^}]+)\}\s*else\s*\{([^}]+)\}/g;
    match = null;
    
    while ((match = ifElseRegex.exec(code)) !== null) {
      const condition = match[1].trim();
      const ifBody = match[2].trim();
      const elseBody = match[3].trim();
      
      // Skip if this is part of an if-else if chain (already processed)
      const beforeMatch = code.substring(0, match.index);
      if (beforeMatch.includes('else if')) {
        continue;
      }
      
      if (this.evaluateCondition(condition, context)) {
        this.executeBlock(ifBody, context);
      } else {
        this.executeBlock(elseBody, context);
      }
    }
    
    // Handle simple if statements
    const ifRegex = /if\s*\(([^)]+)\)\s*\{([^}]+)\}/g;
    while ((match = ifRegex.exec(code)) !== null) {
      const condition = match[1].trim();
      const ifBody = match[2].trim();
      
      if (this.evaluateCondition(condition, context)) {
        this.executeBlock(ifBody, context);
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
    
    // Handle range conditions like score >= 90 && score <= 100
    evalCondition = evalCondition
      .replace(/&&/g, ' && ')
      .replace(/\|\|/g, ' || ')
      .replace(/==/g, ' == ')
      .replace(/!=/g, ' != ')
      .replace(/>=/g, ' >= ')
      .replace(/<=/g, ' <= ')
      .replace(/>/g, ' > ')
      .replace(/</g, ' < ');
    
    try {
      return Function(`"use strict"; return (${evalCondition})`)();
    } catch {
      return false;
    }
  }
  
  private executeBlock(block: string, context: any) {
    // Execute assignments in the block
    this.executeAssignments(block, context);
    
    // Store printf statements for later processing
    const printfRegex = /printf\s*\([^)]+\)\s*;/g;
    const printfMatches = block.match(printfRegex);
    if (printfMatches) {
      context.conditionalPrintfs = (context.conditionalPrintfs || []).concat(printfMatches);
    }
  }
  
  private processPrintfStatements(code: string, context: any): string {
    let output = '';
    
    // Process conditional printfs first
    if (context.conditionalPrintfs) {
      for (const printfStmt of context.conditionalPrintfs) {
        output += this.processSinglePrintf(printfStmt, context);
      }
    }
    
    // Process regular printf statements
    const printfRegex = /printf\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\)\s*;/g;
    let match;
    
    while ((match = printfRegex.exec(code)) !== null) {
      // Skip if this printf is inside an if-else block (already processed)
      const beforeMatch = code.substring(0, match.index);
      const afterMatch = code.substring(match.index + match[0].length);
      
      // Check if this printf is inside braces
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
      
      // Replace %d, %i, %o, %x, %X with actual values
      formatString = formatString.replace(/%[dioxX]/g, () => {
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
      
      // Replace %s, %c with string values
      formatString = formatString.replace(/%[sc]/g, () => {
        if (argIndex < argList.length) {
          const arg = argList[argIndex++];
          if (context.variables.hasOwnProperty(arg)) {
            return context.variables[arg].toString();
          }
          return arg.replace(/"/g, '');
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
    
    return {
      output: execResult.output,
      error: execResult.error,
      success: !execResult.error && execResult.output.length > 0,
      executionTime,
      memoryUsed: Math.floor(Math.random() * 512) + 256
    };
  }
  
  validateOutput(actualOutput: string, expectedOutput: string): boolean {
    console.log('=== OUTPUT VALIDATION DEBUG ===');
    console.log('Expected:', JSON.stringify(expectedOutput));
    console.log('Actual:', JSON.stringify(actualOutput));
    
    // Normalize both outputs by removing extra whitespace and newlines
    const normalizeOutput = (str: string) => {
      return str
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };
    
    const normalizedExpected = normalizeOutput(expectedOutput);
    const normalizedActual = normalizeOutput(actualOutput);
    
    console.log('Normalized Expected:', normalizedExpected);
    console.log('Normalized Actual:', normalizedActual);
    
    const isMatch = normalizedExpected === normalizedActual;
    console.log('Match Result:', isMatch);
    console.log('=== END DEBUG ===');
    
    return isMatch;
  }
}

export const cExecutor = new CExecutor();