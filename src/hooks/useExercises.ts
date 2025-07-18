import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Exercise } from '../types';

// Enhanced mock exercises with better descriptions and test cases
const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Hello World',
    description: `Write a program that prints "Hello, World!" to the console.

This is the classic first program that introduces you to C syntax and the printf function.

Requirements:
- Use printf() to output the text
- Include the newline character
- Make sure the output matches exactly`,
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
1. Declare two integer variables
2. Assign them values (you can hardcode 5 and 3)
3. Calculate their sum
4. Print the result in the format "Sum: X"

Example: If the numbers are 5 and 3, output should be "Sum: 8"`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    // Declare two integer variables\n    int a = 5;\n    int b = 3;\n    \n    // Calculate and print their sum\n    \n    return 0;\n}',
    expected_output: 'Sum: 8',
    difficulty: 'easy' as const,
    tags: ['basics', 'arithmetic', 'variables'],
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
- Print the result in the format "Factorial of 5 is 120"
- Use proper variable declarations`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int n = 5;\n    int factorial = 1;\n    \n    // Calculate factorial using a loop\n    \n    // Print the result\n    \n    return 0;\n}',
    expected_output: 'Factorial of 5 is 120',
    difficulty: 'medium' as const,
    tags: ['loops', 'arithmetic', 'factorial'],
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Even or Odd',
    description: `Write a program that determines if the number 7 is even or odd.

Requirements:
- Use the modulo operator (%) to check divisibility
- Use an if-else statement for the logic
- Print "7 is odd" or "7 is even" accordingly

Hint: A number is even if it's divisible by 2 (remainder is 0)`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int number = 7;\n    \n    // Check if number is even or odd\n    \n    return 0;\n}',
    expected_output: '7 is odd',
    difficulty: 'easy' as const,
    tags: ['conditionals', 'modulo', 'if-else'],
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Count to 10',
    description: `Write a program that prints numbers from 1 to 10, each on a new line.

Requirements:
- Use a for loop or while loop
- Print each number followed by a newline
- Output should show: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (each on separate lines)`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    // Use a loop to print numbers 1 to 10\n    \n    return 0;\n}',
    expected_output: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
    difficulty: 'easy' as const,
    tags: ['loops', 'for-loop', 'counting'],
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Array Sum',
    description: `Write a program that calculates the sum of elements in an array.

Given array: {1, 2, 3, 4, 5}

Requirements:
- Declare and initialize the array with the given values
- Use a loop to calculate the sum
- Print the result in the format "Sum of array: 15"`,
    starter_code: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    int sum = 0;\n    \n    // Calculate sum of array elements\n    \n    // Print the result\n    \n    return 0;\n}',
    expected_output: 'Sum of array: 15',
    difficulty: 'medium' as const,
    tags: ['arrays', 'loops', 'sum'],
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
        // Use enhanced mock data when Supabase is not configured
        setExercises(mockExercises);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Fallback to mock data on error
      setExercises(mockExercises);
    } finally {
      setLoading(false);
    }
  };

  return { exercises, loading, refetch: fetchExercises };
};