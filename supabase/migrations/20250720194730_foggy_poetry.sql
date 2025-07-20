/*
  # Initial Schema for CodeLab C Programming Platform

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `starter_code` (text)
      - `expected_output` (text)
      - `difficulty` (text)
      - `tags` (text array)
      - `created_at` (timestamp)
    - `submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `exercise_id` (uuid, foreign key to exercises)
      - `code` (text)
      - `output` (text)
      - `passed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public exercise access
    - Add policies for user-specific submissions
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  starter_code text,
  expected_output text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  code text NOT NULL,
  output text,
  passed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for exercises (public read access)
CREATE POLICY "Anyone can read exercises"
  ON exercises
  FOR SELECT
  USING (true);

-- Create policies for submissions (users can only access their own)
CREATE POLICY "Users can insert their own submissions"
  ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own submissions"
  ON submissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON submissions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert sample exercises
INSERT INTO exercises (title, description, starter_code, expected_output, difficulty, tags) VALUES
('Hello World', 'Write a program that prints "Hello, World!" to the console.

This is the classic first program that introduces you to C syntax and the printf function.

Requirements:
- Use printf() to output the exact text "Hello, World!"
- Include the necessary header file
- Make sure the output matches exactly (case-sensitive)', 
'#include <stdio.h>

int main() {
    // Write your code here
    // Use printf to print "Hello, World!"
    
    return 0;
}', 
'Hello, World!', 
'easy', 
'{"basics", "printf", "introduction"}'),

('Sum of Two Numbers', 'Write a program that calculates and prints the sum of two numbers.

Requirements:
- Declare two integer variables with values 5 and 3
- Calculate their sum
- Print the result in the exact format "Sum: 8"', 
'#include <stdio.h>

int main() {
    int a = 5;
    int b = 3;
    
    // Calculate and print their sum
    // Format: "Sum: X" where X is the result
    
    return 0;
}', 
'Sum: 8', 
'easy', 
'{"basics", "arithmetic", "variables", "printf"}'),

('Factorial Calculator', 'Write a program that calculates the factorial of the number 5.

Factorial of n (n!) = 1 × 2 × 3 × ... × n
For example: 5! = 1 × 2 × 3 × 4 × 5 = 120

Requirements:
- Calculate factorial of 5 using a loop
- Print result in exact format "Factorial of 5 is 120"', 
'#include <stdio.h>

int main() {
    int n = 5;
    int factorial = 1;
    
    // Calculate factorial using a loop
    
    // Print the result
    
    return 0;
}', 
'Factorial of 5 is 120', 
'medium', 
'{"loops", "arithmetic", "factorial", "for-loop"}');