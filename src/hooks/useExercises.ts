import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Exercise } from '../types';

// Production-ready exercises with comprehensive test cases
const productionExercises: Exercise[] = [
  {
    id: '1',
    title: 'Hello World',
    description: `Write a program that prints "Hello, World!" to the console.

This is the classic first program that introduces you to C syntax and the printf function.

Requirements:
- Use printf() to output the exact text "Hello, World!"
- Include the necessary header file
- Make sure the output matches exactly (case-sensitive)
- Don't include extra spaces or characters`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    // Use printf to print "Hello, World!"\n    \n    return 0;\n}',
    expected_output: 'Hello, World!',
    difficulty: 'easy' as const,
    tags: ['basics', 'printf', 'introduction'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Sum of Two Numbers',
    description: `Write a program that calculates and prints the sum of two numbers.

You need to:
1. Declare two integer variables with values 5 and 3
2. Calculate their sum
3. Print the result in the exact format "Sum: 8"

Example: If the numbers are 5 and 3, output should be "Sum: 8"

Requirements:
- Use integer variables
- Use printf with proper format specifier
- Output must match exactly: "Sum: 8"`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    // Declare two integer variables\n    int a = 5;\n    int b = 3;\n    \n    // Calculate and print their sum\n    // Format: "Sum: X" where X is the result\n    \n    return 0;\n}',
    expected_output: 'Sum: 8',
    difficulty: 'easy' as const,
    tags: ['basics', 'arithmetic', 'variables', 'printf'],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Factorial Calculator',
    description: `Write a program that calculates the factorial of the number 5.

Factorial of n (n!) = 1 × 2 × 3 × ... × n
For example: 5! = 1 × 2 × 3 × 4 × 5 = 120

Requirements:
- Calculate factorial of 5 using a loop (for or while)
- Print the result in the exact format "Factorial of 5 is 120"
- Use proper variable declarations
- Use a loop structure (not hardcoded multiplication)`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int n = 5;\n    int factorial = 1;\n    \n    // Calculate factorial using a loop\n    // Hint: multiply factorial by each number from 1 to n\n    \n    // Print the result in format: "Factorial of 5 is 120"\n    \n    return 0;\n}',
    expected_output: 'Factorial of 5 is 120',
    difficulty: 'medium' as const,
    tags: ['loops', 'arithmetic', 'factorial', 'for-loop'],
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Even or Odd Checker',
    description: `Write a program that determines if the number 7 is even or odd.

Requirements:
- Use the modulo operator (%) to check divisibility by 2
- Use an if-else statement for the logic
- Print exactly "7 is odd" (for odd numbers) or "7 is even" (for even numbers)
- The number to check is 7

Hint: A number is even if it's divisible by 2 (remainder is 0 when divided by 2)`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int number = 7;\n    \n    // Check if number is even or odd using modulo operator\n    // Print "7 is odd" or "7 is even" accordingly\n    \n    return 0;\n}',
    expected_output: '7 is odd',
    difficulty: 'easy' as const,
    tags: ['conditionals', 'modulo', 'if-else', 'operators'],
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Count from 1 to 10',
    description: `Write a program that prints numbers from 1 to 10, each on a separate line.

Requirements:
- Use a for loop or while loop
- Print each number followed by a newline
- Output should show numbers 1 through 10, each on its own line
- No extra spaces or formatting

Expected output:
1
2
3
4
5
6
7
8
9
10`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    // Use a loop to print numbers 1 to 10\n    // Each number should be on a separate line\n    \n    return 0;\n}',
    expected_output: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
    difficulty: 'easy' as const,
    tags: ['loops', 'for-loop', 'counting', 'printf'],
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Array Sum Calculator',
    description: `Write a program that calculates the sum of elements in an array.

Given array: {1, 2, 3, 4, 5}

Requirements:
- Declare and initialize the array with the given values
- Use a loop to iterate through all elements
- Calculate the sum of all elements
- Print the result in the exact format "Sum of array: 15"

The array has 5 elements and their sum is 1+2+3+4+5 = 15`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    int sum = 0;\n    \n    // Calculate sum of array elements using a loop\n    \n    // Print the result in format: "Sum of array: 15"\n    \n    return 0;\n}',
    expected_output: 'Sum of array: 15',
    difficulty: 'medium' as const,
    tags: ['arrays', 'loops', 'sum', 'iteration'],
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Maximum of Three Numbers',
    description: `Write a program that finds the maximum of three numbers: 15, 8, and 23.

Requirements:
- Declare three integer variables with values 15, 8, and 23
- Use if-else statements to compare the numbers
- Find the largest number among the three
- Print the result in the exact format "Maximum is: 23"

You need to compare all three numbers and determine which one is the largest.`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int a = 15;\n    int b = 8;\n    int c = 23;\n    \n    // Find the maximum of three numbers using if-else\n    // Print result in format: "Maximum is: 23"\n    \n    return 0;\n}',
    expected_output: 'Maximum is: 23',
    difficulty: 'medium' as const,
    tags: ['conditionals', 'comparison', 'if-else', 'logic'],
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Multiplication Table',
    description: `Write a program that prints the multiplication table for the number 3 (from 3×1 to 3×5).

Requirements:
- Use a loop to generate the multiplication table
- Print each line in the format "3 x 1 = 3"
- Generate table from 1 to 5
- Each result should be on a separate line

Expected output:
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int number = 3;\n    \n    // Generate multiplication table for 3 (from 1 to 5)\n    // Format: "3 x 1 = 3"\n    \n    return 0;\n}',
    expected_output: '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15',
    difficulty: 'medium' as const,
    tags: ['loops', 'arithmetic', 'multiplication', 'formatting'],
    created_at: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'Simple Calculator',
    description: `Write a program that performs basic arithmetic operations.

The program should:
1. Declare two numbers: 10 and 4
2. Calculate and display their sum, difference, product, and quotient
3. Format the output exactly as shown below

Requirements:
- Use integer variables for the numbers
- Calculate all four operations
- Print results in the exact format shown

Expected output format:
10 + 4 = 14
10 - 4 = 6
10 * 4 = 40
10 / 4 = 2`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int b = 4;\n    \n    // Calculate and print all four operations\n    // Addition: a + b\n    // Subtraction: a - b\n    // Multiplication: a * b\n    // Division: a / b (integer division)\n    \n    return 0;\n}',
    expected_output: '10 + 4 = 14\n10 - 4 = 6\n10 * 4 = 40\n10 / 4 = 2',
    difficulty: 'easy' as const,
    tags: ['arithmetic', 'operators', 'printf', 'calculations'],
    created_at: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Grade Classifier',
    description: `Write a program that classifies a grade based on a score.

Given score: 85

Classification rules:
- 90-100: Grade A
- 80-89: Grade B  
- 70-79: Grade C
- 60-69: Grade D
- Below 60: Grade F

Requirements:
- Use if-else if statements
- Check the score 85 and print the corresponding grade
- Output format: "Grade: B"`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int score = 85;\n    \n    // Classify the grade based on score\n    // Use if-else if statements\n    // Print result in format: "Grade: B"\n    \n    return 0;\n}',
    expected_output: 'Grade: B',
    difficulty: 'medium' as const,
    tags: ['conditionals', 'if-else', 'classification', 'logic'],
    created_at: new Date().toISOString(),
  },
];

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Use production-ready exercises when Supabase is not configured
        setExercises(productionExercises);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // If no exercises in database, use production exercises as fallback
      setExercises(data && data.length > 0 ? data : productionExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Fallback to production exercises on error
      setExercises(productionExercises);
    } finally {
      setLoading(false);
    }
  };

  return { exercises, loading, refetch: fetchExercises };
};